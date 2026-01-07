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
import {
  Search,
  Calendar,
  Users,
  TrendingUp,
  Loader2,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import { getAttendanceReport } from "@/lib/actions/admin-attendance.action";
import {
  getStandardsList,
  getClassesForStandard,
  type StandardKey,
} from "@/lib/constants/index";
import { exportAttendanceToExcel } from "@/lib/excel/attendance";
import { toast } from "sonner";

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
  const [exporting, setExporting] = useState(false);
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

  // Function to check if a date is a holiday (Sunday OR database holiday)
  const isHoliday = (day: number, attendanceData: AttendanceRecord[]) => {
    // Check if it's Sunday
    if (isSunday(day)) return true;

    // Check if any student has 'H' for this day (indicating a database holiday)
    return attendanceData.some(
      (student) => student.attendanceData[day.toString()] === "H"
    );
  };

  const handleSearch = async () => {
    if (!selectedStandard || !selectedClass) {
      toast.error("Please select both standard and class");
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

      // Process data - DON'T override existing holiday data, just add Sundays
      const processedData = data.map((student) => {
        const updatedAttendanceData = { ...student.attendanceData };
        let totalPresent = 0;
        let totalDays = 0;

        // Only mark Sundays as holidays if they don't already have data
        daysInMonth.forEach((day) => {
          const currentStatus = updatedAttendanceData[day.toString()];

          // If it's a holiday and no data exists, mark as holiday
          if (
            isHoliday(day, attendanceData) &&
            (!currentStatus || currentStatus === "-")
          ) {
            updatedAttendanceData[day.toString()] = "H";
          }

          // Recalculate stats based on final status
          const finalStatus = updatedAttendanceData[day.toString()];
          if (finalStatus === "P") {
            totalPresent++;
            totalDays++;
          } else if (finalStatus === "A") {
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
      toast.success(
        `Successfully loaded attendance data for ${processedData.length} students`
      );
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      toast.error("Failed to fetch attendance report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    if (attendanceData.length === 0) {
      toast.error("No data available for export");
      return;
    }

    setExporting(true);

    try {
      const buffer = await exportAttendanceToExcel(
        attendanceData,
        selectedStandard,
        selectedClass,
        selectedMonth,
        selectedYear
      );

      // Create blob and download
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const monthName = MONTHS.find(
        (m) => m.value === selectedMonth.toString()
      )?.label;
      link.download = `Attendance_Report_Std${selectedStandard}_${selectedClass}_${monthName}_${selectedYear}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Attendance report has been exported to Excel");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export attendance report");
    } finally {
      setExporting(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(148 163 184 / 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(148 163 184 / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(148 163 184 / 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgb(148 163 184 / 0.1);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(71 85 105 / 0.2);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(71 85 105 / 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(71 85 105 / 0.6);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-corner {
          background: rgb(71 85 105 / 0.2);
        }
      `}</style>

      {/* Top Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-gray-600/50 px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                Attendance Report
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                Monthly attendance analysis and reports
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards - Only show after search
        {hasSearched && attendanceData.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                  {totalStudents}
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Total Students
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {averageAttendance}%
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Average Attendance
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {daysInMonth.length}
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Days in Month
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {selectedStandard} - {selectedClass}
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Selected Class
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

        {/* Filters */}
        <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
              <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Filter Options
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-gray-300">
              Select standard, class, month and year to generate attendance
              report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Standard
                </Label>
                <Select
                  value={selectedStandard}
                  onValueChange={(value) =>
                    setSelectedStandard(value as StandardKey)
                  }
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue placeholder="Select Standard" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {availableStandards.map((standard) => (
                      <SelectItem
                        key={standard}
                        value={standard}
                        className="text-slate-900 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-700/50 focus:bg-slate-100 dark:focus:bg-gray-700/50"
                      >
                        Standard {standard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Class
                </Label>
                <Select
                  value={selectedClass}
                  onValueChange={setSelectedClass}
                  disabled={!selectedStandard}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue
                      placeholder={
                        selectedStandard
                          ? "Select Class"
                          : "Select Standard First"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {availableClasses.map((cls) => (
                      <SelectItem
                        key={cls}
                        value={cls}
                        className="text-slate-900 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-700/50 focus:bg-slate-100 dark:focus:bg-gray-700/50"
                      >
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Month
                </Label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) =>
                    setSelectedMonth(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {MONTHS.map((month) => (
                      <SelectItem
                        key={month.value}
                        value={month.value}
                        className="text-slate-900 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-700/50 focus:bg-slate-100 dark:focus:bg-gray-700/50"
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Year
                </Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) =>
                    setSelectedYear(Number.parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {YEARS.map((year) => (
                      <SelectItem
                        key={year.value}
                        value={year.value}
                        className="text-slate-900 dark:text-gray-100 hover:bg-slate-100 dark:hover:bg-gray-700/50 focus:bg-slate-100 dark:focus:bg-gray-700/50"
                      >
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSearch}
                disabled={loading || !selectedStandard || !selectedClass}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-600/25"
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
              {attendanceData.length > 0 && (
                <Button
                  onClick={handleExportToExcel}
                  disabled={exporting}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-600/25"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export to Excel
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                Generating Attendance Report
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Please wait while we fetch attendance data for Standard{" "}
                {selectedStandard} Class {selectedClass}...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Attendance Table */}
        {!loading && hasSearched && attendanceData.length > 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Attendance Report - Standard {selectedStandard} Class{" "}
                {selectedClass}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">
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
                  <thead className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-20">
                    <tr className="border-b border-slate-200 dark:border-gray-600/40">
                      <th className="text-left py-2 px-2 text-slate-700 dark:text-gray-300 font-medium sticky left-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-30 min-w-[50px] border-r border-slate-200 dark:border-gray-600/40">
                        Roll
                      </th>
                      <th className="text-center py-2 px-2 text-slate-700 dark:text-gray-300 font-medium sticky left-[50px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm z-30 min-w-[180px] border-r border-slate-200 dark:border-gray-600/40">
                        Name
                      </th>
                      {daysInMonth.map((day) => (
                        <th
                          key={day}
                          className={`text-center py-2 px-1 text-slate-700 dark:text-gray-300 font-medium min-w-[28px] text-xs ${
                            isHoliday(day, attendanceData)
                              ? "bg-blue-100 dark:bg-blue-900/20"
                              : ""
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
                        className={`border-b border-slate-200 dark:border-gray-600/30 hover:bg-slate-50 dark:hover:bg-gray-700/20 transition-colors ${
                          index % 2 === 0
                            ? "bg-slate-25 dark:bg-gray-800/10"
                            : ""
                        }`}
                      >
                        <td className="py-1.5 px-2 text-slate-900 dark:text-gray-100 font-medium sticky left-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-20 border-r border-slate-200 dark:border-gray-600/40">
                          {student.rollNo}
                        </td>
                        <td className="py-1.5 px-2 text-slate-900 dark:text-gray-100 sticky left-[50px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-20 border-r border-slate-200 dark:border-gray-600/40">
                          <div>
                            <div className="font-medium text-xs leading-tight">
                              {student.name}
                            </div>
                          </div>
                        </td>
                        {daysInMonth.map((day) => {
                          const status =
                            student.attendanceData[day.toString()] || "-";
                          const isHolidayDay = isHoliday(day, attendanceData);
                          return (
                            <td
                              key={day}
                              className={`py-1.5 px-1  text-center ${
                                isHolidayDay
                                  ? "bg-blue-50 dark:bg-blue-900/10"
                                  : ""
                              }`}
                            >
                              <span
                                className={` w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${
                                  status === "P"
                                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50"
                                    : status === "A"
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/50"
                                    : status === "H"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50"
                                    : "bg-slate-100 dark:bg-gray-700/40 text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-gray-600/40"
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
              <div className="p-4 border-t border-slate-200 dark:border-gray-600/40">
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50 rounded flex items-center justify-center text-[10px] font-bold">
                      P
                    </span>
                    <span className="text-slate-700 dark:text-gray-300">
                      Present
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/50 rounded flex items-center justify-center text-[10px] font-bold">
                      A
                    </span>
                    <span className="text-slate-700 dark:text-gray-300">
                      Absent
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50 rounded flex items-center justify-center text-[10px] font-bold">
                      H
                    </span>
                    <span className="text-slate-700 dark:text-gray-300">
                      Holiday (Sundays & Public Holidays)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-slate-100 dark:bg-gray-700/40 text-slate-500 dark:text-gray-400 border border-slate-300 dark:border-gray-600/40 rounded flex items-center justify-center text-[10px] font-bold">
                      -
                    </span>
                    <span className="text-slate-700 dark:text-gray-300">
                      No Data
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State - Only show after search */}
        {!loading && hasSearched && attendanceData.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700/40 dark:to-gray-600/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-slate-500 dark:text-gray-400" />
              </div>
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                No Attendance Data Found
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
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
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                Ready to Generate Report
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
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
