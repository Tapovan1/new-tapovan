"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";
import test from "node:test";

export async function getTeacherTests(teacherId?: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Use provided teacherId or current user's ID
  const targetTeacherId = teacherId || user.id;

  // Teachers can only see their own tests unless they're admin
  if (user.role === "TEACHER" && user.id !== targetTeacherId) {
    throw new Error("Unauthorized");
  }

  try {
    const tests = await prisma.test.findMany({
      where: { teacherId: targetTeacherId },
      include: {
        _count: {
          select: {
            marks: true,
          },
        },
        marks: {
          select: {
            marks: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Transform the data to match the expected format
    return tests.map((test) => ({
      ...test,
      date: test.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      standard: test.standard,
      class: test.class,
    }));
  } catch (error) {
    console.error("Error fetching teacher tests:", error);
    return [];
  }
}

export async function createTest(data: {
  name: string;
  subject: string;
  standardName: string;
  className: string;
  date: Date;
  maxMarks: number;
  examType: string;
  chapter?: string;
}) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const test = await prisma.test.create({
      data: {
        name: data.name,
        subject: data.subject,
        teacherId: user.id,
        standard: data.standardName,
        class: data.className,
        date: data.date,
        maxMarks: data.maxMarks,
        examType: data.examType,
      },
      include: {
        _count: {
          select: {
            marks: true,
          },
        },
      },
    });

    revalidatePath("/tests");
    return { success: true, test };
  } catch (error) {
    console.error("Error creating test:", error);
    return { error: "Failed to create test" };
  }
}

export async function updateTest(
  testId: string,
  data: {
    name?: string;
    date?: Date;
    maxMarks?: number;
    status?: string;
  }
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // Check if user owns this test
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
      select: { teacherId: true },
    });

    if (!existingTest || existingTest.teacherId !== user.id) {
      throw new Error("Unauthorized");
    }

    const test = await prisma.test.update({
      where: { id: testId },
      data,
      include: {
        _count: {
          select: {
            marks: true,
          },
        },
      },
    });

    revalidatePath("/tests");
    return { success: true, test };
  } catch (error) {
    console.error("Error updating test:", error);
    return { error: "Failed to update test" };
  }
}

export async function deleteTest(testId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    // Check if user owns this test
    const existingTest = await prisma.test.findUnique({
      where: { id: testId },
      select: { teacherId: true },
    });

    if (!existingTest || existingTest.teacherId !== user.id) {
      throw new Error("Unauthorized");
    }

    // Delete related marks first
    await prisma.mark.deleteMany({
      where: { testId },
    });

    // Then delete the test
    await prisma.test.delete({
      where: { id: testId },
    });

    revalidatePath("/tests");
    return { success: true };
  } catch (error) {
    console.error("Error deleting test:", error);
    return { error: "Failed to delete test" };
  }
}

export async function getTestById(testId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        marks: {
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
       
        _count: {
          select: {
            marks: true,
       
          },
        },
      },
    });

    if (!test) {
      throw new Error("Test not found");
    }

    // Check if user owns this test
    if (test.teacherId !== user.id && user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    return {
      ...test,
      date: test.date.toISOString().split("T")[0],
      standard: test.standard,
      class: test.class,
    };
  } catch (error) {
    console.error("Error fetching test:", error);
    throw error;
  }
}

export async function getTestsByExamType(examType: string, teacherId?: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const targetTeacherId = teacherId || user.id;

  try {
    const tests = await prisma.test.findMany({
      where: {
        teacherId: targetTeacherId,
        examType: examType,
      },
      include: {
        _count: {
          select: {
            marks: true,
           
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return tests.map((test) => ({
      ...test,
      date: test.date.toISOString().split("T")[0],
      standard: test.standard,
      class: test.class,
    }));
  } catch (error) {
    console.error("Error fetching tests by exam type:", error);
    return [];
  }
}
