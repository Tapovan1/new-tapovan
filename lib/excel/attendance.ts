"use server";

import ExcelJS from "exceljs";

interface AttendanceRecord {
  studentId: string;
  rollNo: number;
  name: string;
  grNo: string;
  attendanceData: { [key: string]: "P" | "A" | "H" | "-" };
  totalPresent: number;
  totalDays: number;
  percentage: number;
}

export async function exportAttendanceToExcel(
  attendanceData: AttendanceRecord[],
  selectedStandard: string,
  selectedClass: string,
  selectedMonth: number,
  selectedYear: number
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Attendance Report");

  // Calculate days in month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month names for title
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[selectedMonth - 1];

  // Create title
  const title = `Standard ${selectedStandard} - Class ${selectedClass} - Attendance Report for ${monthName} ${selectedYear}`;

  // Function to check if a date is Sunday
  const isSunday = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return date.getDay() === 0;
  };

  // Build headers
  const headers = ["Roll No", "Student Name"];
  dayNumbers.forEach((day) => headers.push(day.toString()));
  headers.push("Present", "Total Days", "Percentage");

  // Title Row (merged across all columns)
  worksheet.mergeCells(1, 1, 1, headers.length);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, color: { argb: "FF000000" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE3F2FD" },
  };
  titleCell.border = {
    top: { style: "thick" },
    bottom: { style: "thick" },
    left: { style: "thick" },
    right: { style: "thick" },
  };

  // Add some spacing
  worksheet.addRow([]);

  // Header Row
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 25;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1976D2" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };

    // Mark Sundays in red header
    if (colNumber > 3 && colNumber <= dayNumbers.length + 3) {
      const dayIndex = colNumber - 4;
      if (isSunday(dayNumbers[dayIndex])) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF5722" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      }
    }
  });

  // Data Rows
  attendanceData.forEach((student, index) => {
    const row: (string | number)[] = [
      student.rollNo,
      student.name
    ];

    // Add attendance data for each day
    dayNumbers.forEach((day) => {
      const status = student.attendanceData[day.toString()] || "-";
      row.push(status);
    });

    // Add summary columns
    row.push(student.totalPresent, student.totalDays, `${student.percentage}%`);

    const dataRow = worksheet.addRow(row);
    dataRow.height = 20;

    // Style the row
    dataRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };

      // Style first three columns (student info)
      if (colNumber <= 3) {
        cell.font = { bold: colNumber === 1 }; // Bold roll number
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: index % 2 === 0 ? "FFF5F5F5" : "FFFFFFFF" },
        };
        if (colNumber === 2) {
          // Student name
          cell.alignment = { horizontal: "left", vertical: "middle" };
        }
      }
      // Style attendance columns
      else if (colNumber > 3 && colNumber <= dayNumbers.length + 3) {
        const dayIndex = colNumber - 4;
        const day = dayNumbers[dayIndex];
        const status = cell.value as string;
        const isSundayCell = isSunday(day);

        // Color coding for attendance status
        if (status === "P") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE8F5E8" },
          };
          cell.font = { color: { argb: "FF2E7D32" }, bold: true };
        } else if (status === "A") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFE8E8" },
          };
          cell.font = { color: { argb: "FFD32F2F" }, bold: true };
        } else if (status === "H" || isSundayCell) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFE3F2FD" },
          };
          cell.font = { color: { argb: "FF1976D2" }, bold: true };
        } else {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F5F5" },
          };
          cell.font = { color: { argb: "FF757575" } };
        }
      }
      // Style summary columns
      else {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEF7E0" },
        };

        // Color code percentage
        if (colNumber === headers.length) {
          // Percentage column
          const percentage = student.percentage;
          if (percentage >= 90) {
            cell.font = { color: { argb: "FF2E7D32" }, bold: true };
          } else if (percentage >= 75) {
            cell.font = { color: { argb: "FFFF9800" }, bold: true };
          } else {
            cell.font = { color: { argb: "FFD32F2F" }, bold: true };
          }
        }
      }
    });
  });

  // Add summary row
  const summaryRow = worksheet.addRow([]);
  summaryRow.height = 25;

  // Add legend/summary information
  const legendStartRow = worksheet.rowCount + 2;
  worksheet.addRow([]);

  const legendTitle = worksheet.addRow(["Legend:"]);
  legendTitle.getCell(1).font = { bold: true, size: 12 };

  const legendItems = [
    ["P", "Present", "Green"],
    ["A", "Absent", "Red"],
    ["H", "Holiday (Sunday)", "Blue"],
    ["-", "No Data", "Gray"],
  ];

  legendItems.forEach(([symbol, meaning, color]) => {
    const legendRow = worksheet.addRow([symbol, meaning]);
    const symbolCell = legendRow.getCell(1);
    const meaningCell = legendRow.getCell(2);

    symbolCell.font = { bold: true };
    symbolCell.alignment = { horizontal: "center" };
    meaningCell.alignment = { horizontal: "left" };

    if (color === "Green") {
      symbolCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE8F5E8" },
      };
      symbolCell.font = { color: { argb: "FF2E7D32" }, bold: true };
    } else if (color === "Red") {
      symbolCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFE8E8" },
      };
      symbolCell.font = { color: { argb: "FFD32F2F" }, bold: true };
    } else if (color === "Blue") {
      symbolCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE3F2FD" },
      };
      symbolCell.font = { color: { argb: "FF1976D2" }, bold: true };
    } else {
      symbolCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F5F5" },
      };
      symbolCell.font = { color: { argb: "FF757575" }, bold: true };
    }
  });

  // Set column widths
  const columnWidths = [8, 25]; // Roll No, Name, GR No
  dayNumbers.forEach(() => columnWidths.push(4)); // Day columns
  columnWidths.push(8, 15, 15); // Present, Total Days, Percentage

  worksheet.columns.forEach((column, index) => {
    column.width = columnWidths[index] || 10;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
