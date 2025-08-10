"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";
import { isValidStandardClassCombination } from "@/lib/constants/index";

// Helper function to generate enrollment number
function generateEnrollmentNo(standard: string, rollNo: number): string {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // Get last 2 digits of year (e.g., "25" for 2025)

  // Convert standard to 2-digit format
  let standardCode = "00";

  const stdNum = Number.parseInt(standard);
  if (!isNaN(stdNum)) {
    standardCode = stdNum.toString().padStart(2, "0"); // Std 1 = 02, Std 2 = 03, etc.
  }

  // Format roll number to 4 digits
  const rollNoFormatted = rollNo.toString().padStart(4, "0");

  return `${yearSuffix}${standardCode}${rollNoFormatted}`;
}

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
    const grNo = formData.get("grNo") as string;
    const name = formData.get("name") as string;

    const standard = formData.get("standard") as string;
    const className = formData.get("class") as string;
    const customRollNo = formData.get("rollNo") as string;

    // Validate required fields
    if (!grNo || !name || !standard || !className) {
      return { error: "All fields are required" };
    }

    // Validate standard-class combination
    if (!isValidStandardClassCombination(standard as any, className)) {
      return {
        error: `Class ${className} is not available for Standard ${standard}`,
      };
    }

    // Check if GR Number already exists
    const existingGrNo = await prisma.student.findUnique({
      where: { grNo },
    });
    if (existingGrNo) {
      return { error: "GR Number already exists" };
    }

    // Determine roll number
    let rollNo: number;
    if (customRollNo && !isNaN(Number.parseInt(customRollNo))) {
      rollNo = Number.parseInt(customRollNo);

      // Check if this roll number already exists in the same class
      const existingRollNo = await prisma.student.findFirst({
        where: {
          rollNo,
          standard,
          class: className,
        },
      });
      if (existingRollNo) {
        return { error: `Roll number ${rollNo} already exists in this class` };
      }
    } else {
      // Auto-generate next roll number
      rollNo = await getNextRollNo(standard, className);
    }

    // Generate enrollment number
    const enrollmentNo = generateEnrollmentNo(standard, rollNo);

    // Check if enrollment number already exists (shouldn't happen, but safety check)
    const existingEnrollment = await prisma.student.findFirst({
      where: { enrollmentNo },
    });
    if (existingEnrollment) {
      return { error: "Enrollment number conflict. Please try again." };
    }

    const student = await prisma.student.create({
      data: {
        grNo,
        enrollmentNo,
        rollNo,
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
    const grNo = formData.get("grNo") as string;
    const name = formData.get("name") as string;
    const parentName = formData.get("parentName") as string;
    const parentPhone = formData.get("parentPhone") as string;
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

    // Check if GR Number is being changed and if it already exists
    if (grNo !== currentStudent.grNo) {
      const existingGrNo = await prisma.student.findUnique({
        where: { grNo },
      });
      if (existingGrNo) {
        return { error: "GR Number already exists" };
      }
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

    // Generate new enrollment number if standard or roll number changed
    let enrollmentNo = currentStudent.enrollmentNo;
    if (
      standard !== currentStudent.standard ||
      rollNo !== currentStudent.rollNo
    ) {
      enrollmentNo = generateEnrollmentNo(standard, rollNo);

      // Check if new enrollment number conflicts
      const existingEnrollment = await prisma.student.findFirst({
        where: {
          enrollmentNo,
          id: { not: studentId },
        },
      });
      if (existingEnrollment) {
        return { error: "Enrollment number conflict. Please try again." };
      }
    }

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        grNo,
        enrollmentNo,
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

// Helper function to get enrollment number preview
export async function getEnrollmentPreview(standard: string, rollNo: number) {
  return generateEnrollmentNo(standard, rollNo);
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
      const { grNo, name, parentName, parentPhone, standard, className } =
        studentData;

      // Validate standard-class combination
      if (!isValidStandardClassCombination(standard, className)) {
        results.push({
          error: `Invalid standard-class combination: ${standard} - ${className}`,
        });
        continue;
      }

      // Check if GR Number already exists
      const existingGrNo = await prisma.student.findUnique({
        where: { grNo },
      });
      if (existingGrNo) {
        results.push({ error: `GR Number ${grNo} already exists` });
        continue;
      }

      // Auto-generate roll number
      const rollNo = await getNextRollNo(standard, className);

      // Generate enrollment number
      const enrollmentNo = generateEnrollmentNo(standard, rollNo);

      // Check if enrollment number already exists
      const existingEnrollment = await prisma.student.findUnique({
        where: { enrollmentNo },
      });
      if (existingEnrollment) {
        results.push({ error: `Enrollment number conflict for ${name}` });
        continue;
      }

      const student = await prisma.student.create({
        data: {
          grNo,
          enrollmentNo,
          rollNo,
          name,

          standard,
          class: className,
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
