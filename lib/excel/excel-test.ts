"use server";

import ExcelJS from "exceljs";

interface StudentTestData {
  studentId: string;
  rollNo: number;
  name: string;
  grNo: string;
  marks: { [testId: string]: number | null };
}

interface TestInfo {
  id: string;
  testName: string;
  subject: string;
  testType: string;
  date: string;
  totalMarks: number;
}

interface ExcelTestData {
  tests: TestInfo[];
  students: StudentTestData[];
  subjectGroups: { [subject: string]: TestInfo[] };
}

export async function exportTestDataToExcel(
  data: ExcelTestData,
  standard: string,
  className: string
): Promise<Buffer> {
  try {
    console.log("Starting Excel export with data:", {
      testsCount: data.tests?.length || 0,
      studentsCount: data.students?.length || 0,
      subjectGroupsCount: Object.keys(data.subjectGroups || {}).length,
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Marks Report");

    const { students, subjectGroups } = data;
    const subjects = Object.keys(subjectGroups || {}).sort();

    console.log("Subjects found:", subjects);

    if (subjects.length === 0 || !students || students.length === 0) {
      throw new Error("No data available for export");
    }

    // Calculate total columns needed
    let totalTestColumns = 0;
    subjects.forEach((subject) => {
      totalTestColumns += (subjectGroups[subject] || []).length;
    });
    const totalColumns = 2 + totalTestColumns; // Roll No + Name + Test columns

    // Title
    const title = `Excel Report - Std ${standard}, ${className}`;
    worksheet.mergeCells(1, 1, 1, Math.max(totalColumns, 3));
    const titleCell = worksheet.getCell("A1");
    titleCell.value = title;
    titleCell.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = {
      top: { style: "thick" },
      bottom: { style: "thick" },
      left: { style: "thick" },
      right: { style: "thick" },
    };

    // Subject headers row
    const subjectHeaderRow = worksheet.addRow([]);
    subjectHeaderRow.getCell(1).value = "";
    subjectHeaderRow.getCell(2).value = "";

    let currentCol = 3;
    subjects.forEach((subject) => {
      const subjectTests = subjectGroups[subject] || [];
      if (subjectTests.length > 0) {
        const startCol = currentCol;
        const endCol = currentCol + subjectTests.length - 1;

        // Merge cells for subject header if multiple tests
        if (subjectTests.length > 1) {
          worksheet.mergeCells(2, startCol, 2, endCol);
        }

        const subjectCell = subjectHeaderRow.getCell(startCol);
        subjectCell.value = subject.charAt(0).toUpperCase() + subject.slice(1);
        subjectCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        subjectCell.alignment = { horizontal: "center", vertical: "middle" };

        // Subject-specific colors
        const subjectColors: { [key: string]: string } = {
          gujarati: "FFEC4899", // Pink
          mathematics: "FF8B5CF6", // Purple
          english: "FF3B82F6", // Blue
          science: "FF10B981", // Green
          hindi: "FFEF4444", // Red
          sanskrit: "FFF59E0B", // Orange
          social_science: "FF6366F1", // Indigo
        };

        const bgColor = subjectColors[subject.toLowerCase()] || "FF6B7280";

        // Apply color to all cells in the subject range
        for (let col = startCol; col <= endCol; col++) {
          const cell = subjectHeaderRow.getCell(col);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bgColor },
          };
          cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        }

        currentCol += subjectTests.length;
      }
    });

    // Test name headers row
    const testHeaderRow = worksheet.addRow([]);
    testHeaderRow.getCell(1).value = "Roll No";
    testHeaderRow.getCell(2).value = "Name";

    currentCol = 3;
    subjects.forEach((subject) => {
      const subjectTests = subjectGroups[subject] || [];
      subjectTests.forEach((test) => {
        const testCell = testHeaderRow.getCell(currentCol);
        testCell.value = test.testName;
        testCell.font = { bold: true, size: 10 };
        testCell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        testCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE5E7EB" },
        };
        testCell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        currentCol++;
      });
    });

    // Style Roll No and Name headers
    testHeaderRow.getCell(1).font = { bold: true };
    testHeaderRow.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    testHeaderRow.getCell(1).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    testHeaderRow.getCell(1).border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    testHeaderRow.getCell(2).font = { bold: true };
    testHeaderRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    testHeaderRow.getCell(2).alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    testHeaderRow.getCell(2).border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Student data rows
    students.forEach((student, index) => {
      const row = worksheet.addRow([]);

      // Roll No and Name
      row.getCell(1).value = student.rollNo;
      row.getCell(2).value = student.name;

      // Style student info cells
      row.getCell(1).font = { bold: true };
      row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
      row.getCell(2).font = { bold: true };
      row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };

      // Marks for each test
      currentCol = 3;
      subjects.forEach((subject) => {
        const subjectTests = subjectGroups[subject] || [];
        subjectTests.forEach((test) => {
          const marks = student.marks[test.id];
          const cell = row.getCell(currentCol);

          if (marks !== null && marks !== undefined) {
            cell.value = marks;

            // Color code based on performance
            const percentage = (marks / test.totalMarks) * 100;
            let fillColor = "FFFFFFFF"; // Default white

            if (percentage >= 80) {
              fillColor = "FFD1FAE5"; // Light green
              cell.font = { color: { argb: "FF065F46" }, bold: true };
            } else if (percentage >= 60) {
              fillColor = "FFFED7AA"; // Light orange
              cell.font = { color: { argb: "FF9A3412" }, bold: true };
            } else if (percentage >= 40) {
              fillColor = "FFFCE7F3"; // Light pink
              cell.font = { color: { argb: "FF9D174D" }, bold: true };
            } else {
              fillColor = "FFFECACA"; // Light red
              cell.font = { color: { argb: "FF991B1B" }, bold: true };
            }

            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: fillColor },
            };
          } else {
            cell.value = "-";
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF3F4F6" },
            };
            cell.font = { color: { argb: "FF6B7280" } };
          }

          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          currentCol++;
        });
      });

      // Add borders to Roll No and Name cells
      row.getCell(1).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      row.getCell(2).border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      // Alternate row colors for Roll No and Name
      if (index % 2 === 0) {
        row.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
        row.getCell(2).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      }
    });

    // Set column widths
    worksheet.getColumn(1).width = 8; // Roll No
    worksheet.getColumn(2).width = 30; // Name

    // Set test column widths
    currentCol = 3;
    subjects.forEach((subject) => {
      const subjectTests = subjectGroups[subject] || [];
      subjectTests.forEach(() => {
        worksheet.getColumn(currentCol).width = 10;
        currentCol++;
      });
    });

    // Add legend
    const legendStartRow = 4 + students.length + 2;
    worksheet.getCell(legendStartRow, 1).value = "Performance Legend:";
    worksheet.getCell(legendStartRow, 1).font = { bold: true, size: 12 };

    const legendItems = [
      { label: "80-100%: Excellent", color: "FFD1FAE5" },
      { label: "60-79%: Good", color: "FFFED7AA" },
      { label: "40-59%: Average", color: "FFFCE7F3" },
      { label: "0-39%: Below Average", color: "FFFECACA" },
      { label: "No Data", color: "FFF3F4F6" },
    ];

    legendItems.forEach((item, index) => {
      const row = legendStartRow + 1 + index;
      const cell = worksheet.getCell(row, 1);
      cell.value = item.label;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: item.color },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.font = { bold: true };
    });

    console.log("Excel generation completed successfully");

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error in exportTestDataToExcel:", error);
    throw new Error(`Failed to generate Excel file: ${error.message}`);
  }
}
