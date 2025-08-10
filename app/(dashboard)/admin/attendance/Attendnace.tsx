"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Calendar,
  Download,
  Users,
  TrendingUp,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getAttendanceReport } from "@/lib/actions/admin-attendance.action";
import {
  getStandardsList,
  getClassesForStandard,
  type StandardKey,
} from "@/lib/constants/index";

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

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i;
  return { value: year.toString(), label: year.toString() };
});

export default function AttendanceReportClient() {
  const [selectedStandard, setSelectedStandard] = useState<StandardKey | "">(
    ""
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  // Get available standards and classes
  const availableStandards = getStandardsList();
  const availableClasses = selectedStandard
    ? getClassesForStandard(selectedStandard)
    : [];

  // Reset class when standard changes
  useEffect(() => {
    setSelectedClass("");
  }, [selectedStandard]);

  // Calculate days in selected month
  useEffect(() => {
    const days = new Date(selectedYear, selectedMonth, 0).getDate();
    setDaysInMonth(Array.from({ length: days }, (_, i) => i + 1));
  }, [selectedMonth, selectedYear]);

  // Function to check if a date is Sunday
  const isSunday = (day: number) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    return date.getDay() === 0; // 0 = Sunday
  };

  const handleSearch = async () => {
    if (!selectedStandard || !selectedClass) {
      alert("Please select both standard and class");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await getAttendanceReport(
        selectedStandard,
        selectedClass,
        selectedMonth.toString(),
        selectedYear.toString()
      );

      // Process data to add Sunday holidays
      const processedData = data.map((student) => {
        const updatedAttendanceData = { ...student.attendanceData };
        let totalPresent = 0;
        let totalDays = 0;

        // Mark Sundays as holidays and recalculate stats
        daysInMonth.forEach((day) => {
          if (isSunday(day)) {
            updatedAttendanceData[day.toString()] = "H";
          }

          const status = updatedAttendanceData[day.toString()];
          if (status === "P") {
            totalPresent++;
            totalDays++;
          } else if (status === "A") {
            totalDays++;
          }
          // H (Holiday) doesn't count towards total days
        });

        const percentage =
          totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

        return {
          ...student,
          attendanceData: updatedAttendanceData,
          totalPresent,
          totalDays,
          percentage,
        };
      });

      setAttendanceData(processedData);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      alert("Failed to fetch attendance report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    // TODO: Implement Excel export logic
    alert("Excel export functionality will be implemented later");
  };

  // Calculate overall statistics
  const totalStudents = attendanceData.length;
  const averageAttendance =
    totalStudents > 0
      ? Math.round(
          attendanceData.reduce((sum, student) => sum + student.percentage, 0) /
            totalStudents
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(30 41 59 / 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.8);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(100 116 139 / 0.9);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgb(30 41 59 / 0.5);
        }
      `}</style>

      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-2 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  Attendance Report
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Monthly attendance analysis and reports
                </p>
              </div>
            </div>
          </div>
          {attendanceData.length > 0 && (
            <Button
              onClick={handleExportToExcel}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Statistics Cards - Only show after search */}

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filter Options
            </CardTitle>
            <CardDescription className="text-slate-400">
              Select standard, class, month and year to generate attendance
              report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Standard</Label>
                <Select
                  value={selectedStandard}
                  onValueChange={(value) =>
                    setSelectedStandard(value as StandardKey)
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select Standard" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableStandards.map((standard) => (
                      <SelectItem
                        key={standard}
                        value={standard}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        Standard {standard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Class</Label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={!selectedStandard}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue
                      placeholder={
                        selectedStandard
                          ? "Select Class"
                          : "Select Standard First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableClasses.map((cls) => (
                      <SelectItem
                        key={cls}
                        value={cls}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Month</Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) =>
                    setSelectedMonth(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {MONTHS.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Year</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) =>
                    setSelectedYear(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {YEARS.map((year) => (
                      <SelectItem
                        key={year.value}
                        value={year.value}
                        className="text-white hover:bg-slate-700 focus:bg-slate-700"
                      >
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading || !selectedStandard || !selectedClass}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-white font-medium mb-2">
                Generating Attendance Report
              </h3>
              <p className="text-slate-400">
                Please wait while we fetch attendance data for Standard{" "}
                {selectedStandard} Class {selectedClass}...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Attendance Table */}
        {!loading && hasSearched && attendanceData.length > 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Report - Standard {selectedStandard} Class{" "}
                {selectedClass}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {
                  MONTHS.find((m) => m.value === selectedMonth.toString())
                    ?.label
                }{" "}
                {selectedYear} attendance data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Compact Table Container with Custom Scrollbar */}
              <div
                className="overflow-auto custom-scrollbar max-h-[70vh]"
                style={{ maxWidth: "100%" }}
              >
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-20">
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 px-2 text-slate-300 font-medium sticky left-0 bg-slate-900/95 backdrop-blur-sm z-30 min-w-[50px] border-r border-slate-700">
                        Roll
                      </th>
                      <th className="text-center py-2 px-2 text-slate-300 font-medium sticky left-[50px] bg-slate-900/95 backdrop-blur-sm z-30 min-w-[180px] border-r border-slate-700">
                        Name
                      </th>
                      {daysInMonth.map((day) => (
                        <th
                          key={day}
                          className={`text-center py-2 px-1 text-slate-300 font-medium min-w-[28px] text-xs ${
                            isSunday(day) ? "bg-blue-500/10" : ""
                          }`}
                        >
                          {day}
                        </th>
                      ))}
                      
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((student, index) => (
                      <tr
                        key={student.studentId}
                        className={`border-b border-slate-700/30 hover:bg-slate-800/20 ${
                          index % 2 === 0 ? "bg-slate-800/5" : ""
                        }`}
                      >
                        <td className="py-1.5 px-2 text-white font-medium sticky left-0 bg-slate-900/90 backdrop-blur-sm z-20 border-r border-slate-700/50">
                          {student.rollNo}
                        </td>
                        <td className="py-1.5 px-2 text-white sticky left-[50px] bg-slate-900/90 backdrop-blur-sm z-20 border-r border-slate-700/50">
                          <div>
                            <div className="font-medium text-xs leading-tight">
                              {student.name}
                            </div>
                          </div>
                        </td>
                        {daysInMonth.map((day) => {
                          const status =
                            student.attendanceData[day.toString()] || "-";
                          const isHoliday = isSunday(day);
                          return (
                            <td
                              key={day}
                              className={`py-1.5 px-0.5 text-center ${
                                isHoliday ? "bg-blue-500/5" : ""
                              }`}
                            >
                              <span
                                className={`inline-block w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                  status === "P"
                                    ? "bg-green-500/25 text-green-300 border border-green-500/40"
                                    : status === "A"
                                    ? "bg-red-500/25 text-red-300 border border-red-500/40"
                                    : status === "H"
                                    ? "bg-blue-500/25 text-blue-300 border border-blue-500/40"
                                    : "bg-slate-700/40 text-slate-400 border border-slate-600/40"
                                }`}
                              >
                                {status}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-green-500/25 text-green-300 border border-green-500/40 rounded flex items-center justify-center text-[10px] font-bold">
                      P
                    </span>
                    <span className="text-slate-300">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-500/25 text-red-300 border border-red-500/40 rounded flex items-center justify-center text-[10px] font-bold">
                      A
                    </span>
                    <span className="text-slate-300">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500/25 text-blue-300 border border-blue-500/40 rounded flex items-center justify-center text-[10px] font-bold">
                      H
                    </span>
                    <span className="text-slate-300">Holiday (Sundays)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-slate-700/40 text-slate-400 border border-slate-600/40 rounded flex items-center justify-center text-[10px] font-bold">
                      -
                    </span>
                    <span className="text-slate-300">No Data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Only show after search */}
        {!loading && hasSearched && attendanceData.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">
                No Attendance Data Found
              </h3>
              <p className="text-slate-400">
                No attendance records found for Standard {selectedStandard}{" "}
                Class {selectedClass} in{" "}
                {
                  MONTHS.find((m) => m.value === selectedMonth.toString())
                    ?.label
                }{" "}
                {selectedYear}.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Initial State - Before any search */}
        {!loading && !hasSearched && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">
                Ready to Generate Report
              </h3>
              <p className="text-slate-400">
                Select standard, class, month and year above, then click
                "Generate Report" to view attendance data.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
