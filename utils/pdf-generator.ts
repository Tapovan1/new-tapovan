import { pdf } from "@react-pdf/renderer";
import { MarkSheetPDF } from "@/components/PDF/StudentMarksReport";

interface StudentData {
  srNo: number;
  rollNo: string;
  name: string;
  marks: string | number;
}

interface MarkSheetProps {
  subject: string;
  standard: string;
  chapter?: string;
  testName: string;
  maxMarks: number;
  date: string;
  students: StudentData[];
}

export async function generateMarkSheetPdf(data: MarkSheetProps) {
  // @ts-ignore: Allow JSX in this file
  const blob = await pdf(<MarkSheetPDF {...data} />).toBlob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.testName}_Marksheet_${data.standard}_${data.subject}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url); // Clean up the URL object
}
