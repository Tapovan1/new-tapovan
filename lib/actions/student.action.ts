"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";
import { isValidStandardClassCombination } from "@/lib/constants/index";



// Helper function to get next roll number for a class
async function getNextRollNo(
  standard: string,
  className: string
): Promise<number> {
  const lastStudent = await prisma.student.findFirst({
    where: {
      standard,
      class: className,
    },
    orderBy: {
      rollNo: "desc",
    },
  });

  return lastStudent ? lastStudent.rollNo + 1 : 1;
}

export async function getStudents() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const students = await prisma.student.findMany({
    orderBy: [{ standard: "asc" }, { class: "asc" }, { rollNo: "asc" }],
  });

  return students;
}

export async function createStudent(formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const name = formData.get("name") as string;
    const standard = formData.get("standard") as string;
    const className = formData.get("class") as string;
    const rollNoStr = formData.get("rollNo") as string;
    

    // Validate required fields
    if (!name || !standard || !className || !rollNoStr) {
      return { error: "Name, standard, class, and roll number are required" };
    }

    const rollNo = Number.parseInt(rollNoStr);
    if (isNaN(rollNo)) {
      return { error: "Invalid roll number" };
    }

    // Validate standard-class combination
    if (!isValidStandardClassCombination(standard as any, className)) {
      return {
        error: `Class ${className} is not available for Standard ${standard}`,
      };
    }

    // Check if this roll number already exists in the same class
    const existingRollNo = await prisma.student.findFirst({
      where: {
        rollNo:Number(rollNoStr),
        standard,
        class: className,
      },
    });
    console.log("existingRollNo", existingRollNo);

    if (existingRollNo) {
      return { error: `Roll number ${rollNo} already exists in this class` };
    }

    const student = await prisma.student.create({
      data: {
        rollNo:Number(rollNoStr),
        name,
        standard,
        class: className,
      },
    });

    revalidatePath("/admin/students");
    return { success: true, student };
  } catch (error) {
    console.error("Error creating student:", error);
    return { error: "Failed to create student" };
  }
}

export async function updateStudent(studentId: string, formData: FormData) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const name = formData.get("name") as string;
    const standard = formData.get("standard") as string;
    const className = formData.get("class") as string;
    const rollNoStr = formData.get("rollNo") as string;
    const status = formData.get("status") as "ACTIVE" | "INACTIVE";

    const rollNo = Number.parseInt(rollNoStr);

    // Validate standard-class combination
    if (!isValidStandardClassCombination(standard as any, className)) {
      return {
        error: `Class ${className} is not available for Standard ${standard}`,
      };
    }

    // Get current student data
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!currentStudent) {
      return { error: "Student not found" };
    }



    // Check if roll number is being changed and if it conflicts
    if (
      rollNo !== currentStudent.rollNo ||
      standard !== currentStudent.standard ||
      className !== currentStudent.class
    ) {
      const existingRollNo = await prisma.student.findFirst({
        where: {
          rollNo,
          standard,
          class: className,
          id: { not: studentId }, // Exclude current student
        },
      });
      if (existingRollNo) {
        return { error: `Roll number ${rollNo} already exists in this class` };
      }
    }



    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        rollNo,
        name,
        standard,
        class: className,
        status: status || "ACTIVE",
      },
    });

    revalidatePath("/admin/students");
    return { success: true, student };
  } catch (error) {
    console.error("Error updating student:", error);
    return { error: "Failed to update student" };
  }
}

export async function deleteStudent(studentId: string) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.student.delete({
      where: { id: studentId },
    });

    revalidatePath("/admin/students");
    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { error: "Failed to delete student" };
  }
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
    orderBy: { rollNo: "asc" },
  });

  return students;
}



// Get students by standard (for filtering)
export async function getStudentsByStandard(standard: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const students = await prisma.student.findMany({
    where: {
      standard,
      status: "ACTIVE",
    },
    orderBy: [{ class: "asc" }, { rollNo: "asc" }],
  });

  return students;
}

// Get students by standard and class (for filtering)
export async function getStudentsByStandardAndClass(
  standard: string,
  className: string
) {
  console.log("standard", standard);
  console.log("className", className);

  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const students = await prisma.student.findMany({
    where: {
      standard,
      class: className,
      status: "ACTIVE",
    },
    orderBy: { rollNo: "asc" },
  });

  return students;
}

// Bulk operations
export async function bulkCreateStudents(studentsData: any[]) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const results = [];

    for (const studentData of studentsData) {
      const {id, name, standard, className, rollNo, subclass } = studentData;

      // Validate standard-class combination
      if (!isValidStandardClassCombination(standard, className)) {
        results.push({
          error: `Invalid standard-class combination: ${standard} - ${className}`,
        });
        continue;
      }

      // // Check if roll number already exists in the same class
      // const existingRollNo = await prisma.student.findFirst({
      //   where: {

      //     rollNo,
      //     standard,
      //     class: className,
      //   },
      // });
      // if (existingRollNo) {
      //   results.push({
      //     error: `Roll number ${rollNo} already exists in ${standard}-${className}`,
      //   });
      //   continue;
      // }

      const student = await prisma.student.create({
        data: {
          id:Number(id),
          rollNo,
          name,
          standard,
          class: className,
          subClass: subclass,
        },
      });

      results.push({ success: true, student });
    }

    revalidatePath("/admin/students");
    return { success: true, results };
  } catch (error) {
    console.error("Error in bulk create:", error);
    return { error: "Failed to create students in bulk" };
  }
}

// Get student statistics
export async function getStudentStats() {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const totalStudents = await prisma.student.count({
      where: { status: "ACTIVE" },
    });

    const studentsByStandard = await prisma.student.groupBy({
      by: ["standard"],
      where: { status: "ACTIVE" },
      _count: {
        id: true,
      },
    });

    const studentsByClass = await prisma.student.groupBy({
      by: ["standard", "class"],
      where: { status: "ACTIVE" },
      _count: {
        id: true,
      },
    });

    return {
      totalStudents,
      byStandard: studentsByStandard,
      byClass: studentsByClass,
    };
  } catch (error) {
    console.error("Error getting student stats:", error);
    throw new Error("Failed to get student statistics");
  }
}

export async function getStudentById(studentId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  return student;
}
