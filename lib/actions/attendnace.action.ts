"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";

export async function getTeacherAssignedClasses(teacherId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // For teachers, only return their own data
  if (user.role === "TEACHER" && user.id !== teacherId) {
    throw new Error("Unauthorized");
  }

  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId },
    select: {
      standardNo: true,
      standardName: true,
      className: true,
    },
    distinct: ["standardNo", "className"],
    orderBy: [{ standardNo: "asc" }, { className: "asc" }],
  });

  // Transform to the format needed by the UI
  return assignments.map((assignment) => ({
    id: `${assignment.standardName}-${assignment.className}`,
    name: `Standard ${assignment.standardName} - ${assignment.className}`,
    standard: assignment.standardName,
    class: assignment.className,
    standardNo: assignment.standardNo,
  }));
}

export async function getStudentsByClass(standard: string, className: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const students = await prisma.student.findMany({
    where: {
      standard,
      class: className,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      rollNo: true,
    },
    orderBy: { rollNo: "asc" },
  });

  return students;
}

export async function markAttendance(
  standard: string,
  className: string,
  date: string,
  attendanceData: { studentId: string; isPresent: boolean }[]
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const standardNo =
      standard === "KG1" ? "0" : standard === "KG2" ? "1" : standard;

    await prisma.$transaction(async (tx) => {
      // Create or update attendance record
      const attendance = await tx.attendance.upsert({
        where: {
          date_standard_class: {
            date: new Date(date),
            standard: standardNo,
            class: className,
          },
        },
        create: {
          date: new Date(date),
          standard: standardNo,
          class: className,
        },
        update: {},
      });

      // Delete existing records for this attendance
      await tx.attendanceRecord.deleteMany({
        where: { attendanceId: attendance.id },
      });

      // Create new attendance records
      const records = attendanceData.map(({ studentId, isPresent }) => ({
        attendanceId: attendance.id,
        studentId,
        isPresent,
      }));

      await tx.attendanceRecord.createMany({
        data: records,
        skipDuplicates: true,
      });
    });

    revalidatePath("/attendance");
    return { success: true };
  } catch (error) {
    console.error("Error saving attendance:", error);
    return { error: "Failed to save attendance" };
  }
}

export async function getAttendanceByClass(
  standard: string,
  className: string,
  date: string
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const standardNo = standard === "KG1" ? 0 : standard === "KG2" ? 1 : standard;

  const attendance = await prisma.attendance.findUnique({
    where: {
      date_standard_class: {
        date: new Date(date),
        standard: String(standardNo),
        class: className,
      },
    },
    include: {
      records: {
        include: {
          student: {
            select: {
              id: true,
              name: true,
              rollNo: true,
            },
          },
        },
      },
    },
  });

  return attendance;
}

// export async function getAttendanceHistory(teacherId: string, limit = 10) {
//   const user = await getUser();
//   if (!user) throw new Error("Unauthorized");

//   // For teachers, only return their own data
//   if (user.role === "TEACHER" && user.id !== teacherId) {
//     throw new Error("Unauthorized");
//   }

//   const attendanceHistory = await prisma.attendance.findMany({
//     where: { teacherId },
//     include: {
//       records: {
//         select: {
//           isPresent: true,
//         },
//       },
//     },
//     orderBy: { date: "desc" },
//     take: limit,
//   });

//   return attendanceHistory.map((attendance) => ({
//     id: attendance.id,
//     date: attendance.date,
//     standard: attendance.standard,
//     class: attendance.class,
//     totalStudents: attendance.records.length,
//     presentCount: attendance.records.filter((r) => r.isPresent).length,
//     absentCount: attendance.records.filter((r) => !r.isPresent).length,
//     attendancePercentage:
//       attendance.records.length > 0
//         ? Math.round(
//             (attendance.records.filter((r) => r.isPresent).length /
//               attendance.records.length) *
//               100
//           )
//         : 0,
//   }));
// }
