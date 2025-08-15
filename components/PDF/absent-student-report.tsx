import type React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

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

interface AbsentStudentsPDFProps {
  absentStudents: AbsentStudent[];
  startDate: string;
  endDate: string;
}

// PDF Styles - Big table with proper widths
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 15,
  },
  dateRange: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 20,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: "#1f2937",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderRow: {
    backgroundColor: "#3b82f6",
  },
  // Date column - smaller
  dateCol: {
    width: "15%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  // Standard column - small
  standardCol: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  // Class column - small
  classCol: {
    width: "8%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  // Roll number column - small
  rollCol: {
    width: "10%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  // Student name column - BIG
  nameCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  // Reason column - BIGGEST
  reasonCol: {
    width: "34%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#1f2937",
    padding: 10,
  },
  tableCellHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 10,
    color: "#374151",
    textAlign: "center",
  },
  tableCellLeft: {
    fontSize: 10,
    color: "#374151",
    textAlign: "left",
  },
  tableCellName: {
    fontSize: 11,
    color: "#374151",
    textAlign: "left",
    fontWeight: "bold",
  },
  tableCellReason: {
    fontSize: 10,
    color: "#374151",
    textAlign: "left",
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#6b7280",
  },
});

const AbsentStudentsPDF: React.FC<AbsentStudentsPDFProps> = ({
  absentStudents,
  startDate,
  endDate,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Absent Students Report</Text>
          <Text style={styles.dateRange}>
            From: {format(new Date(startDate), "dd MMMM yyyy")} To:{" "}
            {format(new Date(endDate), "dd MMMM yyyy")}
          </Text>
        </View>

        {/* Big Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.dateCol}>
              <Text style={styles.tableCellHeader}>Date</Text>
            </View>
            <View style={styles.standardCol}>
              <Text style={styles.tableCellHeader}>Std</Text>
            </View>
            <View style={styles.classCol}>
              <Text style={styles.tableCellHeader}>Class</Text>
            </View>
            <View style={styles.rollCol}>
              <Text style={styles.tableCellHeader}>Roll No</Text>
            </View>
            <View style={styles.nameCol}>
              <Text style={styles.tableCellHeader}>Student Name</Text>
            </View>
            <View style={styles.reasonCol}>
              <Text style={styles.tableCellHeader}>Reason for Absence</Text>
            </View>
          </View>

          {/* Data Rows */}
          {absentStudents.map((student, index) => (
            <View key={student.id} style={styles.tableRow}>
              <View style={styles.dateCol}>
                <Text style={styles.tableCell}>
                  {format(new Date(student.date), "dd MMM yyyy")}
                </Text>
              </View>
              <View style={styles.standardCol}>
                <Text style={styles.tableCell}>{student.standard}</Text>
              </View>
              <View style={styles.classCol}>
                <Text style={styles.tableCell}>{student.class}</Text>
              </View>
              <View style={styles.rollCol}>
                <Text style={styles.tableCell}>{student.rollNo}</Text>
              </View>
              <View style={styles.nameCol}>
                <Text style={styles.tableCellName}>{student.studentName}</Text>
              </View>
              <View style={styles.reasonCol}>
                <Text style={styles.tableCellReason}>
                  {student.reason || "No reason provided"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on: {format(new Date(), "dd MMMM yyyy 'at' HH:mm")} | Total
          Absent Students: {absentStudents.length}
        </Text>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default AbsentStudentsPDF;
