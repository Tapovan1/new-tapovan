"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";

export const getTeacherTests = async (teacherId?: string) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const targetTeacherId = teacherId || user.id;

  try {
    const teacherAssignments = await prisma.teacherAssignment.findMany({
      where: { teacherId: targetTeacherId },
      select: {
        standardNo: true,
        className: true,
        subject: true,
      },
    });

    if (teacherAssignments.length === 0) {
      return [];
    }

    const testFilters = teacherAssignments.map((assignment) => ({
      AND: [
        { standard: assignment.standardNo },
        { class: assignment.className },
        { subject: assignment.subject },
      ],
    }));

    const tests = await prisma.test.findMany({
      where: {
        OR: testFilters,
      },
      select: {
        id: true,
        name: true,
        subject: true,
        standard: true,
        class: true,
        date: true,
        maxMarks: true,
        examType: true,
        status: true,
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
      orderBy: {
        date: "desc",
      },
    });

    const testsWithStats = tests.map((test) => {
      const totalMarks = test.marks.reduce((sum, mark) => sum + mark.marks, 0);
      const averageMarks =
        test.marks.length > 0 ? totalMarks / test.marks.length : 0;

      return {
        id: test.id,
        name: test.name,
        subject: test.subject,
        standard: test.standard,
        class: test.class,
        date: test.date.toISOString().split("T")[0], // Format date efficiently
        maxMarks: test.maxMarks,
        examType: test.examType,
        status: test.status,
        totalStudents: test._count.marks,
        averageMarks: Math.round(averageMarks * 100) / 100, // Round to 2 decimal places
      };
    });

    return testsWithStats;
  } catch (error) {
    console.error("Error fetching teacher tests:", error);
    throw new Error("Failed to fetch teacher tests");
  }
};
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
  console.log("Updating test:", testId, data);

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
      where: {
        id: testId,
      },
      data: {
        name: data.name,
        ...(data.date !== undefined && { date: new Date(data.date) }),
        maxMarks: data.maxMarks,
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

//get test by std,class,optional subject
export async function getTestByStdClassSubject(
  standard: string,
  className: string,
  subject?: string
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const tests = await prisma.test.findMany({
      where: {
        standard: standard,
        class: className,
        ...(subject && { subject: subject }),
      },
      select: {
        id: true,
        name: true,
        examType: true,
        date: true,
        status: true,
        subject: true,
      },
    });

    return tests.map((test) => ({
      ...test,
      date: test.date.toISOString().split("T")[0],
      standard: test.standard,
      class: test.class,
    }));
  } catch (error) {
    console.error(
      "Error fetching tests by standard, class, and subject:",
      error
    );
    return [];
  }
}
