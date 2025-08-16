"use server";

import prisma from "@/lib/prisma";
import { getUser } from "./getUser";

export async function getTeacherDashboardData() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const [teacherAssignments, allTests, allStudents, testsCount] =
      await Promise.all([
        // Get teacher's assignments with better ordering
        prisma.teacherAssignment.findMany({
          where: { teacherId: user.id },
          orderBy: [
            { standardNo: "asc" },
            { className: "asc" },
            { subject: "asc" },
          ],
        }),

        prisma.test.findMany({
          where: { teacherId: user.id },
          include: {
            marks: {
              select: {
                marks: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),

        prisma.student.findMany({
          where: {
            status: "ACTIVE",
            OR: Array.from(
              new Set(
                await prisma.teacherAssignment
                  .findMany({
                    where: { teacherId: user.id },
                    select: { standardName: true, className: true },
                  })
                  .then((assignments) =>
                    assignments.map((a) => ({
                      standard: a.standardName,
                      class: a.className,
                    }))
                  )
              ).values()
            ),
          },
          select: {
            id: true,
            standard: true,
            class: true,
          },
        }),

        prisma.test.count({
          where: { teacherId: user.id },
        }),
      ]);

    const uniqueClassesMap = teacherAssignments.reduce((acc, assignment) => {
      const classKey = `${assignment.standardName}-${assignment.className}`;

      if (!acc.has(classKey)) {
        acc.set(classKey, {
          id: classKey,
          name: classKey,
          standard: assignment.standardName,
          class: assignment.className,
          subjects: new Set([assignment.subject]),
        });
      } else {
        acc.get(classKey)!.subjects.add(assignment.subject);
      }

      return acc;
    }, new Map());

    const studentsByClass = allStudents.reduce((acc, student) => {
      const classKey = `${student.standard}-${student.class}`;
      if (!acc[classKey]) acc[classKey] = [];
      acc[classKey].push(student);
      return acc;
    }, {} as Record<string, typeof allStudents>);

    const testsByClass = allTests.reduce((acc, test) => {
      const classKey = `${test.standard}-${test.class}`;
      if (!acc[classKey]) acc[classKey] = [];
      acc[classKey].push(test);
      return acc;
    }, {} as Record<string, typeof allTests>);

    const myClasses = Array.from(uniqueClassesMap.entries()).map(
      ([classKey, classData]) => {
        const students = studentsByClass[classKey] || [];
        const classTests = testsByClass[classKey] || [];

        const { totalMarks, totalMaxMarks } = classTests.reduce(
          (acc, test) => {
            const testMarksSum = test.marks.reduce(
              (sum, mark) => sum + mark.marks,
              0
            );
            return {
              totalMarks: acc.totalMarks + testMarksSum,
              totalMaxMarks:
                acc.totalMaxMarks + test.maxMarks * test.marks.length,
            };
          },
          { totalMarks: 0, totalMaxMarks: 0 }
        );

        const avgMarks =
          totalMaxMarks > 0
            ? Math.round((totalMarks / totalMaxMarks) * 100)
            : 0;
        const avgAttendance = 85; // Mock attendance - replace with actual calculation

        return {
          ...classData,
          subjects: Array.from(classData.subjects),
          students: students.length,
          avgMarks,
          attendance: avgAttendance,
          subjectsCount: classData.subjects.size,
          subjectsList: Array.from(classData.subjects).join(", "),
        };
      }
    );

    const recentTests = allTests.slice(0, 5);

    const recentActivity = recentTests.map((test) => ({
      type: "test_created" as const,
      title: test.name,
      description: `Test created for ${test.subject} - ${test.standard}-${test.class}`,
      time: getRelativeTime(test.createdAt),
      status:
        test.status === "COMPLETED"
          ? ("completed" as const)
          : ("pending" as const),
    }));

    const totalClasses = myClasses.length;
    const totalStudents = myClasses.reduce((sum, cls) => sum + cls.students, 0);
    const totalSubjects = new Set(teacherAssignments.map((a) => a.subject))
      .size;
    const classTeacherOf = myClasses.filter((cls) => cls.isClassTeacher);

    const avgAttendance =
      myClasses.length > 0
        ? Math.round(
            myClasses.reduce((sum, cls) => sum + cls.attendance, 0) /
              myClasses.length
          )
        : 0;

    return {
      teacher: {
        ...user,
        permissions: {
          canMarkAttendance: user.role === "ATEACHER" || user.role === "ADMIN",
          canCreateTests: true,
          canViewAllMarks: false,
          canEditMarks: true,
        },
      },
      myClasses,
      recentActivity,
      stats: {
        totalClasses,
        totalStudents,
        testsCreated: testsCount,
        totalSubjects,
        avgAttendance,
        classTeacherOf: classTeacherOf.length,
      },
      assignments: teacherAssignments,
    };
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);

    return {
      teacher: {
        ...user,
        permissions: {
          canMarkAttendance: user.role === "ATEACHER" || user.role === "ADMIN",
          canCreateTests: true,
          canViewAllMarks: false,
          canEditMarks: true,
        },
      },
      myClasses: [],
      recentActivity: [],
      stats: {
        totalClasses: 0,
        totalStudents: 0,
        testsCreated: 0,
        totalSubjects: 0,
        avgAttendance: 0,
        classTeacherOf: 0,
      },
      assignments: [],
    };
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}
