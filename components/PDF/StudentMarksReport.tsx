"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5Q.ttf",
});

interface MarkSheetProps {
  subject: string;
  standard: string;
  chapter?: string;
  testName: string;
  maxMarks: number;
  date: string;
  students: {
    srNo: number;
    rollNo: string;
    name: string;
    marks: string | number;
  }[];
}

interface HeaderProps {
  subject: string;
  chapter?: string;
  standard: string;
  date: string;
  testName: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#000",
  },
  header: {
    backgroundColor: "#0D47A1", // Deep blue
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
  },
  schoolName: {
    color: "#FFD600", // Yellow
    fontSize: 22,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 5,
  },
  subHeader: {
    color: "#FFD600",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  examInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    color: "#FFD600",
    marginTop: 5,
  },
  examInfoText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#0D47A1",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0D47A1",
    alignItems: "center",
  },
  tableHeaderRow: {
    backgroundColor: "#1565C0", // Table header blue
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: "#0D47A1",
    height: 28,
    justifyContent: "center",
  },
  tableCellText: {
    textAlign: "center",
    fontSize: 10,
  },
  srNo: {
    width: "10%",
  },
  rollNo: {
    width: "15%",
  },
  name: {
    width: "55%",
  },
  marks: {
    width: "20%",
  },
  absentText: {
    color: "#FF0000",
    fontWeight: "bold",
    textAlign: "center",
  },
  oddRow: {
    backgroundColor: "#FFFFFF",
  },
  evenRow: {
    backgroundColor: "#E3F2FD", // Light blue background
  },
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
};

const Header = ({
  subject,
  chapter,
  standard,
  date,
  testName,
}: HeaderProps) => (
  <View style={styles.header}>
    <Text style={styles.schoolName}>TAPOVAN VIDHYAMANDIR SANKUL</Text>
    <Text style={styles.subHeader}>{testName}</Text>
    <View style={styles.examInfo}>
      <Text style={styles.examInfoText}>SUB - {subject}</Text>
      {chapter && <Text style={styles.examInfoText}>CH - {chapter}</Text>}
      <Text style={styles.examInfoText}>STD - {standard}</Text>
      <Text style={styles.examInfoText}>DATE - {formatDate(date)}</Text>
    </View>
  </View>
);

export function MarkSheetPDF({
  subject,
  chapter,
  testName,
  maxMarks,
  standard,
  date,
  students,
}: MarkSheetProps) {
  const STUDENTS_PER_PAGE = 27;
  const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <Header
            subject={subject}
            chapter={chapter}
            standard={standard}
            date={date}
            testName={testName}
          />
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.tableCell, styles.srNo]}>
                <Text style={styles.tableCellText}>Sr No</Text>
              </View>
              <View style={[styles.tableCell, styles.rollNo]}>
                <Text style={styles.tableCellText}>Roll No</Text>
              </View>
              <View style={[styles.tableCell, styles.name]}>
                <Text style={styles.tableCellText}>Name</Text>
              </View>
              <View style={[styles.tableCell, styles.marks]}>
                <Text style={styles.tableCellText}>Marks ({maxMarks})</Text>
              </View>
            </View>

            {/* Table Body */}
            {students
              .slice(
                pageIndex * STUDENTS_PER_PAGE,
                (pageIndex + 1) * STUDENTS_PER_PAGE
              )
              .map((student, index) => (
                <View
                  key={student.srNo}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  ]}
                >
                  <View style={[styles.tableCell, styles.srNo]}>
                    <Text style={styles.tableCellText}>{student.srNo}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.rollNo]}>
                    <Text style={styles.tableCellText}>{student.rollNo}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.name]}>
                    <Text style={styles.tableCellText}>{student.name}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.marks]}>
                    <Text
                      style={
                        student.marks === "AB"
                          ? styles.absentText
                          : styles.tableCellText
                      }
                    >
                      {student.marks}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </Page>
      ))}
    </Document>
  );
}
