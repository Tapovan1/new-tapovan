"use server";

import prisma from "@/lib/prisma";
import { getUser } from "./getUser";

export async function getTeacherDashboardData() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // Get teacher's assignments
    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: { teacherId: user.id },
      orderBy: [
        { standardNo: "asc" },
        { className: "asc" },
        { subject: "asc" },
      ],
    });

    // Get unique classes the teacher is assigned to
    const uniqueClasses = new Map();
    teacherAssignments.forEach((assignment) => {
      const classKey = `${assignment.standardName}-${assignment.className}`;
      if (!uniqueClasses.has(classKey)) {
        uniqueClasses.set(classKey, {
          id: `${assignment.standardName}-${assignment.className}`,
          name: `${assignment.standardName}-${assignment.className}`,
          standard: assignment.standardName,
          class: assignment.className,
          subjects: [],
        });
      }

      const classData = uniqueClasses.get(classKey);
      if (!classData.subjects.includes(assignment.subject)) {
        classData.subjects.push(assignment.subject);
      }

      // Update class teacher status if any assignment has it
    });

    // Get students for each class
    const myClasses = [];
    for (const [classKey, classData] of uniqueClasses) {
      const students = await prisma.student.findMany({
        where: {
          standard: classData.standard,
          class: classData.class,
          status: "ACTIVE",
        },
      });

      // Calculate average marks for this teacher's subjects in this class
      const tests = await prisma.test.findMany({
        where: {
          teacherId: user.id,
          standard: classData.standard,
          class: classData.class,
        },
        include: {
          marks: true,
        },
      });

      let totalMarks = 0;
      let totalMaxMarks = 0;
      tests.forEach((test) => {
        test.marks.forEach((mark) => {
          totalMarks += mark.marks;
          totalMaxMarks += test.maxMarks;
        });
      });

      const avgMarks =
        totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;

      // Calculate attendance (mock for now)
      const avgAttendance = 85; // This would be calculated from actual attendance data

      myClasses.push({
        ...classData,
        students: students.length,
        avgMarks,
        attendance: avgAttendance,
        subjectsCount: classData.subjects.length,
        subjectsList: classData.subjects.join(", "),
      });
    }

    // Get recent tests created by teacher
    const recentTests = await prisma.test.findMany({
      where: { teacherId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Format recent activity
    const recentActivity = recentTests.map((test) => ({
      type: "test_created",
      title: test.name,
      description: `Test created for ${test.subject} - ${test.standard}-${test.class}`,
      time: getRelativeTime(test.createdAt),
      status: test.status === "COMPLETED" ? "completed" : "pending",
    }));

    // Calculate statistics
    const totalClasses = myClasses.length;
    const totalStudents = myClasses.reduce((sum, cls) => sum + cls.students, 0);
    const testsCreated = await prisma.test.count({
      where: { teacherId: user.id },
    });
    const totalSubjects = new Set(teacherAssignments.map((a) => a.subject))
      .size;
    const classTeacherOf = myClasses.filter((cls) => cls.isClassTeacher);

    // Calculate average attendance across all classes
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
        testsCreated,
        totalSubjects,
        avgAttendance,
        classTeacherOf: classTeacherOf.length,
      },
      assignments: teacherAssignments,
    };
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error);

    // Return empty data structure to prevent crashes
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
      classTeacherClasses: [],
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
