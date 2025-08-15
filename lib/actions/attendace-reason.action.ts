"use server";

import prisma from "@/lib/prisma";
import { getUser } from "@/lib/actions/getUser";

export async function getAbsentStudents(startDate: string, endDate: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Get all attendance records with absent students in the date range
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        records: {
          where: {
            isPresent: false, // Only absent students
          },
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Flatten the data to get individual absent student records
    const absentStudents = attendanceRecords.flatMap((attendance) =>
      attendance.records.map((record) => ({
        id: record.id,
        date: attendance.date.toISOString().split("T")[0],
        standard: attendance.standard,
        class: attendance.class,
        rollNo: record.student.rollNo,
        studentName: record.student.name,
        studentId: record.student.id,
        reason: record.reason || null,
      }))
    );

    // Sort by date (newest first), then by standard, class, and roll number
    absentStudents.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      if (a.standard !== b.standard)
        return a.standard.localeCompare(b.standard);
      if (a.class !== b.class) return a.class.localeCompare(b.class);
      return a.rollNo - b.rollNo;
    });

    return absentStudents;
  } catch (error) {
    console.error("Error fetching absent students:", error);
    throw new Error("Failed to fetch absent students");
  }
}

export async function updateAbsentReason(recordId: string, reason: string) {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const updatedRecord = await prisma.attendanceRecord.update({
      where: {
        id: recordId,
      },
      data: {
        reason: reason.trim() || null,
      },
    });

    return updatedRecord;
  } catch (error) {
    console.error("Error updating absent reason:", error);
    throw new Error("Failed to update absent reason");
  }
}

export async function generateAbsentStudentsPDF(
  absentStudents: any[],
  startDate: string,
  endDate: string
) {
  // This is a placeholder for PDF generation
  // You can implement this using libraries like jsPDF, PDFKit, or Puppeteer
  // For now, we'll return a simple buffer

  try {
    // Mock PDF generation - replace with actual PDF library implementation
    const pdfContent = `
      Absent Students Report
      Date Range: ${startDate} to ${endDate}
      Total Absent Students: ${absentStudents.length}
      
      ${absentStudents
        .map(
          (student, index) =>
            `${index + 1}. ${student.studentName} (Roll: ${student.rollNo}) - ${
              student.standard
            } ${student.class} - ${student.date} - Reason: ${
              student.reason || "NR"
            }`
        )
        .join("\n")}
    `;

    // Convert to buffer (in real implementation, use proper PDF library)
    const buffer = Buffer.from(pdfContent, "utf-8");
    return buffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}
