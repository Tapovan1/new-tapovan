"use server"
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

    // Get attendance records for the month
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        standard,
        class: className,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        records: true,
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

      // Fill in actual attendance data
      attendanceRecords.forEach((attendance) => {
        const day = attendance.date.getDate();
        const studentRecord = attendance.records.find(
          (record) => record.studentId === student.id
        );

        if (studentRecord) {
          studentAttendance[day.toString()] = studentRecord.isPresent
            ? "P"
            : "A";
          totalDays++;
          if (studentRecord.isPresent) {
            totalPresent++;
          }
        }
      });

      const percentage =
        totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

      return {
        studentId: student.id,
        rollNo: student.rollNo,
        name: student.name,
        grNo: student.grNo,
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
