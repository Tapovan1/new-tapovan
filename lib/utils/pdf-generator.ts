"use client";

import { pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import AbsentStudentsPDFDocument from "@/components/PDF/absent-student-report";

interface AbsentStudent {
  id: string;
  date: string;
  standard: string;
  class: string;
  rollNo: number;
  studentName: string;
  studentId: string;
  reason: string | null;
  updatedAt: string;
}

export async function generateAbsentStudentsPDF(
  absentStudents: AbsentStudent[],
  startDate: string,
  endDate: string
) {
  try {
    // Create PDF document using React-PDF
    const pdfDoc = pdf(
      <AbsentStudentsPDFDocument
        absentStudents={absentStudents}
        startDate={startDate}
        endDate={endDate}
      />
    );

    // Generate blob
    const blob = await pdfDoc.toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Generate filename
    const filename = `Absent_Students_${format(
      new Date(startDate),
      "yyyy-MM-dd"
    )}_to_${format(new Date(endDate), "yyyy-MM-dd")}.pdf`;

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return Promise.resolve();
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}
