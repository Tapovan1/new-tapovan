"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";
import {
  getStandardsList,
  getClassesForStandard,
  getSubjectsForStandard,
} from "@/lib/constants/index";

export async function getTeacherAssignments() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const teachers = await prisma.teacher.findMany({
    where: {
      NOT: {
        role: "ADMIN", // Exclude admin users
      },
    },
    include: {
      assignments: {
        orderBy: [
          { standardNo: "asc" },
          { className: "asc" },
          { subject: "asc" },
        ],
      },
    },
    orderBy: { name: "asc" },
  });

  return teachers;
}

export async function getGroupedAssignments() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  const teachers = await prisma.teacher.findMany({
    where: {
      NOT: {
        role: "ADMIN",
      },
    },
    include: {
      assignments: {
        orderBy: [
          { standardNo: "asc" },
          { className: "asc" },
          { subject: "asc" },
        ],
      },
    },
    orderBy: { name: "asc" },
  });

  // Group assignments by teacher
  return teachers.map((teacher) => {
    return {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      totalAssignments: teacher.assignments.length,
      assignments: teacher.assignments,
    };
  });
}

export async function createAssignment(data: {
  teacherId: string;
  standardNo: string;
  standardName: string;
  className: string;
  subject: string;
}) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    console.log("Creating assignment with data:", data);

    // Check if assignment already exists
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        teacherId_standardNo_className_subject: {
          teacherId: data.teacherId,
          standardNo: data.standardNo,
          className: data.className,
          subject: data.subject,
        },
      },
    });

    if (existing) {
      console.log("Updating existing assignment:", existing.id);
      // Update existing assignment
      const updated = await prisma.teacherAssignment.update({
        where: { id: existing.id },
        data: {
          teacherId: data.teacherId,
          standardNo: data.standardNo,
          standardName: data.standardName,
          className: data.className,
          subject: data.subject,
        },
      });
      console.log("Updated assignment:", updated);
    } else {
      console.log("Creating new assignment");
      // Create new assignment
      const created = await prisma.teacherAssignment.create({
        data: {
          teacherId: data.teacherId,
          standardNo: data.standardNo,
          standardName: data.standardName,
          className: data.className,
          subject: data.subject,
        },
      });
      console.log("Created assignment:", created);
    }

    revalidatePath("/admin/teacher-assignments");
    return { success: true };
  } catch (error) {
    console.error("Error creating assignment:", error);
    return { error: "Failed to create assignment" };
  }
}

// export async function bulkAssignTeacher(data: {
//   teacherId: string;
//   assignments: Array<{
//     standardName: string;
//     className: string;
//     subject: string;
//   }>;
// }) {
//   const user = await getUser();
//   if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

//   try {
//     console.log("Bulk assigning teacher:", data);

//     // Create all assignments in a transaction
//     const results = await prisma.$transaction(
//       data.assignments.map((assignment) =>
//         prisma.teacherAssignment.upsert({
//           where: {
//             teacherId_standardNo_className_subject: {
//               teacherId: data.teacherId,

//               className: assignment.className,
//               subject: assignment.subject,
//             },
//           },
//           update: {},
//           create: {
//             teacherId: data.teacherId,
//             standardNo: assignment.standardNo,
//             standardName: assignment.standardName,
//             className: assignment.className,
//             subject: assignment.subject,
//           },
//         })
//       )
//     );

//     console.log("Bulk assignment results:", results);

//     revalidatePath("/admin/teacher-assignments");
//     return { success: true };
//   } catch (error) {
//     console.error("Error bulk assigning teacher:", error);
//     return { error: "Failed to bulk assign teacher" };
//   }
// }

export async function deleteAssignment(assignmentId: string) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    console.log("Deleting assignment:", assignmentId);

    const deleted = await prisma.teacherAssignment.delete({
      where: { id: assignmentId },
    });

    console.log("Deleted assignment:", deleted);

    revalidatePath("/admin/teacher-assignments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return { error: "Failed to delete assignment" };
  }
}

export async function updateAssignment(assignmentId: string, data: any) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    console.log("Updating assignment:", assignmentId, "with data:", data);

    const updated = await prisma.teacherAssignment.update({
      where: { id: assignmentId },
      data,
    });

    revalidatePath("/admin/teacher-assignments");
    return { success: true };
  } catch (error) {
    console.error("Error updating assignment:", error);
    return { error: "Failed to update assignment" };
  }
}

export async function getTeacherAssignedData(teacherId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // For teachers, only return their own data
  if (user.role === "TEACHER" && user.id !== teacherId) {
    throw new Error("Unauthorized");
  }

  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId },
    orderBy: [{ standardNo: "asc" }, { className: "asc" }, { subject: "asc" }],
  });

  // Group by standard
  const standardsMap = new Map<
    string,
    {
      standard: {
        id: string;
        name: string;
        displayName: string;
        level: number;
      };
      classes: Set<string>;
      subjects: Set<string>;
    }
  >();

  assignments.forEach((assignment) => {
    if (!standardsMap.has(assignment.standardNo)) {
      const standardData = {
        id: assignment.standardName,
        name: assignment.standardName,
        displayName:
          assignment.standardName === "KG1" || assignment.standardName === "KG2"
            ? assignment.standardName
            : `Standard ${assignment.standardName}`,
        level:
          assignment.standardName === "KG1"
            ? 0
            : assignment.standardName === "KG2"
            ? 1
            : Number.parseInt(assignment.standardName) + 1,
      };

      standardsMap.set(assignment.standardNo, {
        standard: standardData,
        classes: new Set<string>(),
        subjects: new Set<string>(),
      });
    }

    const standardGroup = standardsMap.get(assignment.standardNo);
    if (standardGroup) {
      standardGroup.classes.add(assignment.className);
      standardGroup.subjects.add(assignment.subject);
    }
  });

  // Convert sets to arrays with objects
  return Array.from(standardsMap.values())
    .map((group) => ({
      standard: group.standard,
      classes: Array.from(group.classes).map((name) => ({ name })),
      subjects: Array.from(group.subjects).map((name) => ({ name })),
    }))
    .sort((a, b) => a.standard.level - b.standard.level);
}

export async function getAvailableData() {
  const standards = getStandardsList();
  return {
    standards: standards.map((standardKey) => ({
      id: standardKey,
      name: standardKey,
      displayName:
        standardKey === "KG1" || standardKey === "KG2"
          ? standardKey
          : `Standard ${standardKey}`,
      level:
        standardKey === "KG1"
          ? 0
          : standardKey === "KG2"
          ? 1
          : Number.parseInt(standardKey) + 1,
    })),
    getClassesForStandard,
    getSubjectsForStandard,
  };
}
