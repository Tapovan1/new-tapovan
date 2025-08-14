"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/actions/getUser";

export interface StudentTestData {
  studentId: string;
  rollNo: number;
  name: string;
  grNo: string;
  marks: { [testId: string]: number | null };
}

export interface TestInfo {
  id: string;
  testName: string;
  subject: string;
  testType: string;
  date: string;
  totalMarks: number;
}

export interface ExcelTestData {
  tests: TestInfo[];
  students: StudentTestData[];
  subjectGroups: { [subject: string]: TestInfo[] };
}

export async function getSelectedTestsDataForExcel(
  standard: string,
  className: string,
  testIds: string[]
): Promise<ExcelTestData> {
  try {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    // Get test details
    const tests = await prisma.test.findMany({
      where: {
        id: { in: testIds },
        standard,
        class: className,
      },
      orderBy: [{ subject: "asc" }, { date: "asc" }],
    });

    if (tests.length === 0) {
      return { tests: [], students: [], subjectGroups: {} };
    }

    // Get all students in the class
    const students = await prisma.student.findMany({
      where: {
        standard,
        class: className,
      },
      orderBy: { rollNo: "asc" },
    });

    // Get marks for all selected tests
    const marks = await prisma.mark.findMany({
      where: {
        testId: { in: testIds },
        student: {
          standard,
          class: className,
        },
      },
      include: {
        student: true,
      },
    });

    // Process the data
    const testInfo: TestInfo[] = tests.map((test) => ({
      id: test.id,
      testName: test.name,
      subject: test.subject,
      testType: test.examType || "Regular",
      date: test.date.toISOString().split("T")[0],
      totalMarks: test.maxMarks || 100,
    }));

    const studentTestData: StudentTestData[] = students.map((student) => {
      const studentMarks: { [testId: string]: number | null } = {};

      // Initialize all tests with null marks
      testIds.forEach((testId) => {
        studentMarks[testId] = null;
      });

      // Fill in actual marks
      marks
        .filter((mark) => mark.student.id === student.id)
        .forEach((mark) => {
          studentMarks[mark.testId] = mark.marks;
        });

      return {
        studentId: student.id,
        rollNo: student.rollNo,
        name: student.name,
        grNo: student.grNo,
        marks: studentMarks,
      };
    });

    // Group tests by subject
    const subjectGroups: { [subject: string]: TestInfo[] } = {};
    testInfo.forEach((test) => {
      if (!subjectGroups[test.subject]) {
        subjectGroups[test.subject] = [];
      }
      subjectGroups[test.subject].push(test);
    });

    return {
      tests: testInfo,
      students: studentTestData,
      subjectGroups,
    };
  } catch (error) {
    console.error("Error fetching test data for Excel:", error);
    throw new Error("Failed to fetch test data for Excel export");
  }
}

export async function getTestDataForExcel(
  standard: string,
  className: string,
  subject?: string
): Promise<ExcelTestData> {
  try {
    const user = await getUser();
    if (!user) throw new Error("Unauthorized");

    // Get all tests for the class/subject
    const tests = await prisma.test.findMany({
      where: {
        teacherId: user.id,
        standard,
        class: className,
        ...(subject && { subject }),
      },
      orderBy: [{ subject: "asc" }, { date: "asc" }],
    });

    if (tests.length === 0) {
      return { tests: [], students: [], subjectGroups: {} };
    }

    const testIds = tests.map((test) => test.id);
    return await getSelectedTestsDataForExcel(standard, className, testIds);
  } catch (error) {
    console.error("Error fetching all test data for Excel:", error);
    throw new Error("Failed to fetch test data for Excel export");
  }
}
