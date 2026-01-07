"use server";
import prisma from "@/lib/prisma";

export async function getAttendanceReport(
  standard: string,
  className: string,
  month: string,
  year: string
) {
  try {
    // Get the start and end dates for the month
    const startDate = new Date(
      Number.parseInt(year),
      Number.parseInt(month) - 1,
      1
    );
    const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0);

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: {
        standard,
        class: className,
      },
      orderBy: {
        rollNo: "asc",
      },
    });

    // Get student IDs for the query
    const studentIds = students.map((student) => student.id);

    // Get attendance records for the month - fetch by student IDs to include historical records
    // even if the student was in a different class when attendance was marked
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        records: {
          some: {
            studentId: {
              in: studentIds,
            },
          },
        },
      },
      include: {
        records: {
          where: {
            studentId: {
              in: studentIds,
            },
          },
        },
      },
    });

    // Get holidays for the month
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Process the data
    const attendanceData = students.map((student) => {
      const studentAttendance: { [key: string]: "P" | "A" | "H" | "-" } = {};
      let totalPresent = 0;
      let totalDays = 0;

      // Initialize all days as no data
      const daysInMonth = endDate.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        studentAttendance[day.toString()] = "-";
      }

      // First, mark all holidays
      holidays.forEach((holiday) => {
        const holidayDay = holiday.date.getDate();
        studentAttendance[holidayDay.toString()] = "H";
      });

      // Then, fill in actual attendance data (this will override holidays if there's actual attendance)
      attendanceRecords.forEach((attendance) => {
        const day = attendance.date.getDate();
        const studentRecord = attendance.records.find(
          (record) => record.studentId === student.id
        );

        if (studentRecord) {
          // Only override holiday if there's actual attendance data
          studentAttendance[day.toString()] = studentRecord.isPresent
            ? "P"
            : "A";
          totalDays++;
          if (studentRecord.isPresent) {
            totalPresent++;
          }
        }
      });

      // Calculate percentage (holidays don't count towards total days)
      const percentage =
        totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

      return {
        studentId: student.id,
        rollNo: student.rollNo,
        name: student.name,
        attendanceData: studentAttendance,
        totalPresent,
        totalDays,
        percentage,
      };
    });

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance report:", error);
    throw new Error("Failed to fetch attendance report");
  }
}
