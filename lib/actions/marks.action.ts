"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "./getUser";
import { getExamTypeById } from "../constants/exam";

export async function getMarksForTest(testId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      marks: {
        include: {
          student: true,
        },
        orderBy: {
          student: {
            rollNo: "asc",
          },
        },
      },
    },
  });

  if (!test) throw new Error("Test not found");

  // Teachers can only see marks for their own tests
  if (user.role === "TEACHER" && test.teacherId !== user.id) {
    throw new Error("Unauthorized");
  }

  return test;
}

export async function saveMarks(
  testId: string,
  marksData: Array<{
    studentId: string;
    marks: number;
    grade?: string;
  }>
) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) throw new Error("Test not found");

    // Teachers can only save marks for their own tests
    if (user.role === "TEACHER" && test.teacherId !== user.id) {
      throw new Error("Unauthorized");
    }

    // Save marks in a transaction
    await prisma.$transaction(
      marksData.map((mark) =>
        prisma.mark.upsert({
          where: {
            studentId_testId: {
              studentId: mark.studentId,
              testId: testId,
            },
          },
          update: {
            marks: mark.marks,
            grade: mark.grade,
          },
          create: {
            studentId: mark.studentId,
            testId: testId,
            subject: test.subject,
            marks: mark.marks,
            grade: mark.grade,
          },
        })
      )
    );

    // Update test status to COMPLETED
    await prisma.test.update({
      where: { id: testId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/marks");
    revalidatePath("/admin/marks");
    return { success: true };
  } catch (error) {
    console.error("Error saving marks:", error);
    return { error: "Failed to save marks" };
  }
}

export async function getTeacherTests(teacherId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Teachers can only see their own tests
  if (user.role === "TEACHER" && user.id !== teacherId) {
    throw new Error("Unauthorized");
  }

  const tests = await prisma.test.findMany({
    where: { teacherId },
    include: {
      _count: {
        select: { marks: true },
      },
    },
    orderBy: { date: "desc" },
  });

  return tests;
}

export async function getStudentMarks(studentId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const marks = await prisma.mark.findMany({
    where: { studentId },
    include: {
      test: true,
    },
    orderBy: {
      test: {
        date: "desc",
      },
    },
  });

  return marks;
}

export async function createTest(formData: FormData) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    const standard = formData.get("standard") as string;
    const className = formData.get("class") as string;
    const date = new Date(formData.get("date") as string);
    const maxMarks = Number.parseInt(formData.get("maxMarks") as string);
    const examType = formData.get("examType") as string;
    const chapter = (formData.get("chapter") as string) || null;

    const test = await prisma.test.create({
      data: {
        name,
        subject,
        standard,
        class: className,
        date,
        maxMarks,
        teacherId: user.id,
        examType,

        status: "PENDING",
      },
      include: {
        _count: {
          select: { marks: true },
        },
      },
    });

    revalidatePath("/marks");
    revalidatePath("/admin/marks");
    return { success: true, test };
  } catch (error) {
    console.error("Error creating test:", error);
    return { error: "Failed to create test" };
  }
}

export async function getTestById(testId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        marks: true,
      },
    });

    if (!test) {
      return null;
    }

    // Get students for this test's class
    const students = await prisma.student.findMany({
      where: {
        standard: test.standard,
        class: test.class,
        status: "ACTIVE",
      },
      orderBy: { rollNo: "asc" },
    });

    // Add exam type details
    const examTypeDetails = getExamTypeById(test.examType || "unit_test");

    return {
      ...test,
      students,
      examTypeDetails,
    };
  } catch (error) {
    console.error("Error fetching test:", error);
    return null;
  }
}

export async function getTestsByExamType(examType: string, teacherId: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const tests = await prisma.test.findMany({
      where: {
        examType,
        teacherId: user.role === "ADMIN" ? undefined : teacherId,
      },
      include: {
        _count: {
          select: { marks: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return tests;
  } catch (error) {
    console.error("Error fetching tests by exam type:", error);
    return [];
  }
}
