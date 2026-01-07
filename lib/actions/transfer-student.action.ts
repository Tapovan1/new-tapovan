"use server";

import prisma from "@/lib/prisma";
import { getUser } from "./getUser";
import { revalidatePath } from "next/cache";

export interface TransferResult {
  success: boolean;
  message: string;
  marksTransferred?: number;
  marksFailed?: number;
  details?: string[];
}

/**
 * Transfer a student to a new class and migrate their marks
 */
export async function transferStudent(
  studentId: string,
  newStandard: string,
  newClass: string
): Promise<TransferResult> {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Get current student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        marks: {
          include: {
            test: true,
          },
        },
      },
    });

    if (!student) {
      return { success: false, message: "Student not found" };
    }

    const oldStandard = student.standard;
    const oldClass = student.class;

    // If no class change, just update
    if (oldStandard === newStandard && oldClass === newClass) {
      return {
        success: false,
        message: "Student is already in this class",
      };
    }

    const details: string[] = [];
    let marksTransferred = 0;
    let marksFailed = 0;

    // Find and migrate marks
    for (const mark of student.marks) {
      const oldTest = mark.test;

      // Find matching test in new class
      // Match by: name, date, subject, standard (but different class)
      const matchingTest = await prisma.test.findFirst({
        where: {
          name: oldTest.name,
          date: oldTest.date,
          subject: oldTest.subject,
          standard: newStandard,
          class: newClass,
        },
      });

      if (matchingTest) {
        // Check if mark already exists for this test
        const existingMark = await prisma.mark.findFirst({
          where: {
            studentId: studentId,
            testId: matchingTest.id,
          },
        });

        if (!existingMark) {
          // Create new mark in the new class's test
          await prisma.mark.create({
            data: {
              studentId: studentId,
              testId: matchingTest.id,
              marks: mark.marks,
              grade: mark.grade,
              subject: matchingTest.subject,
            },
          });
          marksTransferred++;
          details.push(
            `✓ Transferred ${mark.marks} marks for ${oldTest.name}`
          );
        } else {
          details.push(`⚠ Mark already exists for ${oldTest.name}`);
        }
      } else {
        marksFailed++;
        details.push(
          `✗ No matching test found for ${oldTest.name} in new class`
        );
      }
    }

    // Update student's class
    await prisma.student.update({
      where: { id: studentId },
      data: {
        standard: newStandard,
        class: newClass,
      },
    });

    revalidatePath("/admin/students");

    return {
      success: true,
      message: `Student transferred from ${oldStandard}-${oldClass} to ${newStandard}-${newClass}`,
      marksTransferred,
      marksFailed,
      details,
    };
  } catch (error) {
    console.error("Error transferring student:", error);
    return {
      success: false,
      message: "Failed to transfer student",
    };
  }
}
