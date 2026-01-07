"use server";

import prisma from "@/lib/prisma";
import { getUser } from "./getUser";
import {
  getClassesForStandard,
  getStandardsList,
  standards,
} from "../constants";
import { TeacherRole } from "../generated/prisma/enums";

export async function getTeacherDashboardData() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Get teacher's classes with students and subjects
  const teacherClasses = await prisma.teacherAssignment.findMany({
    where: { teacherId: user.id },
    include: {
      teacher: true,
    },
  });

  // Get unique standards and classes for this teacher
  const uniqueClasses = teacherClasses.reduce((acc: any[], assignment) => {
    const existing = acc.find(
      (item) =>
        item.standardName === assignment.standardName &&
        item.className === assignment.className
    );
    if (!existing) {
      acc.push({
        standardName: assignment.standardName,
        className: assignment.className,
        subjects: [assignment.subject],
      });
    } else {
      if (!existing.subjects.includes(assignment.subject)) {
        existing.subjects.push(assignment.subject);
      }
    }
    return acc;
  }, []);

  // Get students count for teacher's classes
  const studentCounts = await Promise.all(
    uniqueClasses.map(async (cls) => {
      const count = await prisma.student.count({
        where: {
          standard: cls.standardName,
          class: cls.className,
          status: "ACTIVE",
        },
      });
      return { ...cls, studentCount: count };
    })
  );

  // Get recent tests created by teacher
  const recentTests = await prisma.test.findMany({
    where: { teacherId: user.id },
    include: {
      marks: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate statistics
  const totalClasses = uniqueClasses.length;
  const totalStudents = studentCounts.reduce(
    (sum, cls) => sum + cls.studentCount,
    0
  );
  const testsCreated = await prisma.test.count({
    where: { teacherId: user.id },
  });

  // Format classes data
  const myClasses = studentCounts.map((cls) => ({
    id: `${cls.standardName}-${cls.className}`,
    name: `${cls.standardName}-${cls.className}`,
    standard: cls.standardName,
    class: cls.className,
    students: cls.studentCount,
    subjects: cls.subjects,
  }));

  // Format recent activity
  const recentActivity = recentTests.map((test) => ({
    type: "test_created",
    title: test.name,
    description: `Test created for ${test.subject}`,
    time: getRelativeTime(test.createdAt),
    status: test.marks.length > 0 ? "completed" : "pending",
  }));

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
      avgAttendance: 0, // Will be calculated from actual attendance records
    },
  };
}

export async function getAdminDashboardData() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  // Get all standards from constants
  const allStandards = getStandardsList();

  // Get student counts for each standard-class combination
  // const standardsData = await Promise.all(
  //   allStandards.map(async (standardKey) => {
  //     const classes = getClassesForStandard(standardKey);

      // Get student count for each class in this standard
      // const classData = await Promise.all(
      //   classes.map(async (className) => {
      //     const studentCount = await prisma.student.count({
      //       where: {
      //         standard: standardKey,
      //         class: className,
      //         status: "ACTIVE",
      //       },
      //     });
      //     return { className, studentCount };
      //   })
      // );

      // Calculate total students and active classes for this standard
  //     const totalStudents = classData.reduce(
  //       (sum, cls) => sum + cls.studentCount,
  //       0
  //     );
  //     const activeClasses = classData.filter(
  //       (cls) => cls.studentCount > 0
  //     ).length;

  //     return {
  //       name: standardKey,
  //       students: totalStudents,
  //       classes: activeClasses, // Only count classes that have students
  //       totalPossibleClasses: classes.length, // Total classes defined in constants
  //     };
  //   })
  // );

  // Filter out standards with no students and sort properly
  // const standardsFiltered = standardsData
  //   .filter((standard) => standard.students > 0)
  //   .sort((a, b) => {
  //     // Sort standards properly (KG1, KG2, 1, 2, 3, etc.)
  //     const getOrder = (name: string) => {
  //       if (name === "KG1") return 0;
  //       if (name === "KG2") return 1;
  //       return Number.parseInt(name) || 999;
  //     };
  //     return getOrder(a.name) - getOrder(b.name);
  //   });

  // Calculate overall statistics
  const totalStudents = await prisma.student.count({
    where: { status: "ACTIVE" },
  });

  //active also not admin
  const totalTeachers = await prisma.teacher.count({
    where:{
      NOT:{
        role:TeacherRole.ADMIN
      },
      status:"ACTIVE"
    }
  })

  // Calculate total active classes (classes with students)
  // const totalActiveClasses = standardsFiltered.reduce(
  //   (sum, std) => sum + std.classes,
  //   0
  // );

  // Calculate total possible classes from constants
  const totalPossibleClasses = Object.values(standards).reduce(
    (sum, standardData) => sum + standardData.classes.length,
    0
  );

  // Get tests without marks (pending evaluations)
  const pendingTests = await prisma.test.count({
    where: {
      marks: {
        none: {},
      },
    },
  });

  // Get recent activity from tests and other operations
  const recentTests = await prisma.test.findMany({
    include: {
      teacher: true,
      marks: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentActivity = recentTests.map((test) => ({
    type: "test",
    message: `${test.teacher.name} created test "${test.name}" for ${test.subject}`,
    time: getRelativeTime(test.createdAt),
  }));

  // Get today's date for attendance check
  const indianDateString = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });

    const formattedIndianDate = new Date(indianDateString);
 
  

  // Check attendance marked today
  const attendanceMarkedToday = await prisma.attendance.count({
    where: {
      date: formattedIndianDate,
    },
  });

  // Calculate classes that should mark attendance (active classes)
  // const attendanceNotMarked = Math.max(
  //   0,
  //   totalActiveClasses - attendanceMarkedToday
  // );

  // Pending actions (calculated from real data)
  // const pendingActions = [
  //   {
  //     type: "attendance",
  //     title: "Attendance Not Marked",
  //     description: `${attendanceNotMarked} classes haven't marked today's attendance`,
  //     count: attendanceNotMarked,
  //     priority:
  //       attendanceNotMarked > 5
  //         ? "high"
  //         : attendanceNotMarked > 2
  //         ? "medium"
  //         : "low",
  //     action: "Mark Now",
  //   },
  //   {
  //     type: "marks",
  //     title: "Pending Evaluations",
  //     description: "Tests pending marks entry",
  //     count: pendingTests,
  //     priority:
  //       pendingTests > 10 ? "high" : pendingTests > 5 ? "medium" : "low",
  //     action: "Review",
  //   },
  //   {
  //     type: "system",
  //     title: "System Overview",
  //     description: `${totalActiveClasses} active classes out of ${totalPossibleClasses} possible`,
  //     count: totalPossibleClasses - totalActiveClasses,
  //     priority: "low",
  //     action: "Review",
  //   },
  // ].filter((action) => action.count > 0);

  // Quick stats with better metrics
  const quickStats = [
    {
      label: "Total Students",
      value: totalStudents.toString(),
      trend: "+0",
      color: "blue",
    },
    {
      label: "Active Teachers",
      value: totalTeachers.toString(),
      trend: "+0",
      color: "green",
    },
    // {
    //   label: "Active Classes",
    //   value: `${totalActiveClasses}/${totalPossibleClasses}`,
    //   trend:
    //     totalActiveClasses === totalPossibleClasses
    //       ? "100%"
    //       : `${Math.round((totalActiveClasses / totalPossibleClasses) * 100)}%`,
    //   color: "purple",
    // },
    {
      label: "Pending Tests",
      value: pendingTests.toString(),
      trend: pendingTests > 0 ? `${pendingTests} pending` : "All clear",
      color: "cyan",
    },
  ];

  return {
    admin: user,
    // standards: standardsFiltered,
    recentActivity,
    // pendingActions,
    quickStats,
    systemStats: {
      // totalActiveClasses,
      totalPossibleClasses,
      attendanceMarkedToday,
      // attendanceNotMarked,
    },
  };
}

// export async function getPendingActionDetails(actionType: string) {
//   const user = await getUser();
//   if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

//   switch (actionType) {
//     case "attendance":
//       return await getAttendancePendingDetails();
//     case "marks":
//       return await getMarksPendingDetails();
//     case "system":
//       return await getSystemPendingDetails();
//     default:
//       throw new Error("Invalid action type");
//   }
// }

// async function getAttendancePendingDetails() {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   // Get all active classes
//   const allStandards = getStandardsList();
//   const activeClasses = [];

//   for (const standardKey of allStandards) {
//     const classes = getClassesForStandard(standardKey);
//     for (const className of classes) {
//       const studentCount = await prisma.student.count({
//         where: {
//           standard: standardKey,
//           class: className,
//           status: "ACTIVE",
//         },
//       });
//       if (studentCount > 0) {
//         activeClasses.push({
//           standard: standardKey,
//           class: className,
//           students: studentCount,
//         });
//       }
//     }
//   }

//   // Get attendance marked today
//   const attendanceMarked = await prisma.attendance.findMany({
//     where: {
//       date: today,
//     },
//     select: {
//       standard: true,
//       class: true,
//     },
//   });

//   // Find classes without attendance
//   const classesWithoutAttendance = activeClasses.filter((activeClass) => {
//     return !attendanceMarked.some(
//       (marked) =>
//         marked.standard.toString() === activeClass.standard &&
//         marked.class === activeClass.class
//     );
//   });

//   return {
//     type: "attendance",
//     title: "Classes Without Attendance",
//     items: classesWithoutAttendance.map((cls) => ({
//       id: `${cls.standard}-${cls.class}`,
//       title: `${
//         cls.standard === "KG1" || cls.standard === "KG2"
//           ? cls.standard
//           : `Std ${cls.standard}`
//       } - ${cls.class}`,
//       description: `${cls.students} students`,
//       actionUrl: `/attendance?standard=${cls.standard}&class=${cls.class}`,
//     })),
//   };
// }

// async function getMarksPendingDetails() {
//   const pendingTests = await prisma.test.findMany({
//     where: {
//       marks: {
//         none: {},
//       },
//     },
//     include: {
//       teacher: true,
//     },
//     orderBy: {
//       date: "desc",
//     },
//   });

//   return {
//     type: "marks",
//     title: "Tests Pending Evaluation",
//     items: pendingTests.map((test) => ({
//       id: test.id,
//       title: test.name,
//       description: `${test.subject} • ${
//         test.standard === "KG1" || test.standard === "KG2"
//           ? test.standard
//           : `Std ${test.standard}`
//       }-${test.class} • ${test.teacher.name}`,
//       actionUrl: `/marks?testId=${test.id}`,
//       date: test.date,
//     })),
//   };
// }

// async function getSystemPendingDetails() {
//   const allStandards = getStandardsList();
//   const unusedClasses = [];

//   for (const standardKey of allStandards) {
//     const classes = getClassesForStandard(standardKey);
//     for (const className of classes) {
//       const studentCount = await prisma.student.count({
//         where: {
//           standard: standardKey,
//           class: className,
//           status: "ACTIVE",
//         },
//       });
//       if (studentCount === 0) {
//         unusedClasses.push({
//           standard: standardKey,
//           class: className,
//         });
//       }
//     }
//   }

//   return {
//     type: "system",
//     title: "Unused Classes",
//     items: unusedClasses.map((cls) => ({
//       id: `${cls.standard}-${cls.class}`,
//       title: `${
//         cls.standard === "KG1" || cls.standard === "KG2"
//           ? cls.standard
//           : `Std ${cls.standard}`
//       } - ${cls.class}`,
//       description: "No students enrolled",
//       actionUrl: `/admin/students?standard=${cls.standard}&class=${cls.class}`,
//     })),
//   };
// }

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
