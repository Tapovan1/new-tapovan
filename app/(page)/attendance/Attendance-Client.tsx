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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  Users,
  Calendar,
  GraduationCap,
  Loader2,
  History,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
} from "lucide-react";
import {
  getStudentsByClass,
  markAttendance,
  getAttendanceByClass,
} from "@/lib/actions/attendnace.action";
import { isHoliday } from "@/lib/actions/holiday.action";

interface AttendanceClientProps {
  teacher: any;
  assignedClasses: any[];
}

export default function AttendanceClient({
  teacher,
  assignedClasses,
}: AttendanceClientProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState<{
    isHoliday: boolean;
    holiday?: any;
  }>({ isHoliday: false });

  // Check if selected date is a holiday
  useEffect(() => {
    const checkHoliday = async () => {
      if (selectedDate) {
        const result = await isHoliday(new Date(selectedDate));
        setHolidayInfo(result);
      }
    };
    checkHoliday();
  }, [selectedDate]);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  // Load existing attendance when date changes
  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadExistingAttendance();
    }
  }, [selectedClass, selectedDate]);

  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const classData = assignedClasses.find((c) => c.id === selectedClass);
      if (classData) {
        const studentsData = await getStudentsByClass(
          classData.standard,
          classData.class
        );
        setStudents(studentsData);
        // Initialize attendance - default to present
        const initialAttendance: { [key: string]: boolean } = {};
        studentsData.forEach((student) => {
          initialAttendance[student.id] = true;
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    try {
      const classData = assignedClasses.find((c) => c.id === selectedClass);
      if (classData) {
        const existingAttendance = await getAttendanceByClass(
          classData.standard,
          classData.class,
          selectedDate
        );
        if (existingAttendance) {
          const attendanceMap: { [key: string]: boolean } = {};
          existingAttendance.records.forEach((record) => {
            attendanceMap[record.studentId] = record.isPresent;
          });
          setAttendance(attendanceMap);
        }
      }
    } catch (error) {
      console.error("Error loading existing attendance:", error);
    }
  };

  const handleAttendanceToggle = (studentId: string, isPresent: boolean) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: isPresent,
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: { [key: string]: boolean } = {};
    students.forEach((student) => {
      allPresent[student.id] = true;
    });
    setAttendance(allPresent);
  };

  const handleMarkAllAbsent = () => {
    const allAbsent: { [key: string]: boolean } = {};
    students.forEach((student) => {
      allAbsent[student.id] = false;
    });
    setAttendance(allAbsent);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      alert("Please select class and date");
      return;
    }
    if (holidayInfo.isHoliday) {
      alert(
        `Cannot mark attendance on ${holidayInfo.holiday?.name || "Holiday"}`
      );
      return;
    }

    setSaving(true);
    try {
      const classData = assignedClasses.find((c) => c.id === selectedClass);
      if (!classData) {
        alert("Invalid class selection");
        return;
      }

      const attendanceData = Object.entries(attendance).map(
        ([studentId, isPresent]) => ({
          studentId,
          isPresent,
        })
      );

      const result = await markAttendance(
        classData.standard,
        classData.class,
        selectedDate,
        attendanceData
      );
      if (result.success) {
        alert("Attendance saved successfully!");
      } else {
        alert(result.error || "Failed to save attendance");
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
      {/* Enhanced Top Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-gray-600/50 px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
              Attendance Marking
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
              Mark daily attendance for your assigned classes
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Holiday Alert */}
        {holidayInfo.isHoliday && (
          <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>{holidayInfo.holiday?.name || "Holiday"}</strong> -
              Attendance cannot be marked on this date.
              {holidayInfo.holiday?.description && (
                <span className="block text-sm mt-1">
                  {holidayInfo.holiday.description}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Recent Attendance History */}
        {/* {attendanceHistory.length > 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Recent Attendance
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">
                Your recent attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-slate-50 dark:bg-gray-700/30 rounded-xl border border-slate-200 dark:border-gray-600/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="outline"
                        className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300"
                      >
                        Std {record.standard} - {record.class}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {record.presentCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            {record.absentCount}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {record.attendancePercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Class and Date Selection */}
        <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Select Class & Date
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-gray-300">
              Choose your assigned class and date for attendance marking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Class
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {assignedClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Date
                </Label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-700/60 border border-slate-200 dark:border-gray-600/40 rounded-md text-slate-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Summary */}
        {students.length > 0 && !holidayInfo.isHoliday && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-gray-100">
                  {students.length}
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Total Students
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {presentCount}
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Present
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {absentCount}
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Absent
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900/40 dark:to-violet-800/40 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {students.length > 0
                    ? Math.round((presentCount / students.length) * 100)
                    : 0}
                  %
                </div>
                <div className="text-slate-600 dark:text-gray-300 text-sm">
                  Attendance
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                Loading Students...
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Please wait while we load the student data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Students Attendance List */}
        {!loading && students.length > 0 && !holidayInfo.isHoliday && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Students -{" "}
                    {assignedClasses.find((c) => c.id === selectedClass)?.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-gray-300">
                    Mark attendance for{" "}
                    {new Date(selectedDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllPresent}
                    className="border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 bg-transparent"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAbsent}
                    className="border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 bg-transparent"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    All Absent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-700/30 rounded-xl border border-slate-200 dark:border-gray-600/30 hover:shadow-md transition-all duration-200"
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 text-xs"
                        >
                          {student.rollNo}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-900 dark:text-gray-100 font-medium block truncate">
                            {student.name}
                          </span>
                          <span className="text-slate-500 dark:text-gray-400 text-xs">
                            {student.grNo}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === true}
                            onChange={() =>
                              handleAttendanceToggle(student.id, true)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                              attendance[student.id] === true
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                : "bg-slate-200 dark:bg-gray-600 text-slate-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                            }`}
                          >
                            P
                          </div>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === false}
                            onChange={() =>
                              handleAttendanceToggle(student.id, false)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${
                              attendance[student.id] === false
                                ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                                : "bg-slate-200 dark:bg-gray-600 text-slate-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                            }`}
                          >
                            A
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex sm:items-center sm:gap-4">
                      <div className="flex-shrink-0">
                        <Badge
                          variant="outline"
                          className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 text-xs"
                        >
                          {student.rollNo}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-900 dark:text-gray-100 font-medium block truncate">
                          {student.name}
                        </span>
                        <span className="text-slate-500 dark:text-gray-400 text-xs">
                          {student.grNo}
                        </span>
                      </div>
                      <div className="flex gap-3 flex-shrink-0">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === true}
                            onChange={() =>
                              handleAttendanceToggle(student.id, true)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                              attendance[student.id] === true
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                                : "bg-slate-200 dark:bg-gray-600 text-slate-600 dark:text-gray-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400"
                            }`}
                          >
                            P
                          </div>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`attendance-${student.id}`}
                            checked={attendance[student.id] === false}
                            onChange={() =>
                              handleAttendanceToggle(student.id, false)
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                              attendance[student.id] === false
                                ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                                : "bg-slate-200 dark:bg-gray-600 text-slate-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                            }`}
                          >
                            A
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSaveAttendance}
                  disabled={
                    saving ||
                    !selectedClass ||
                    !selectedDate ||
                    holidayInfo.isHoliday
                  }
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && selectedClass && students.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                No Students Found
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                No active students found for the selected class.
              </p>
            </CardContent>
          </Card>
        )}

        {/* No Classes Assigned */}
        {assignedClasses.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                No Classes Assigned
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                You don't have any classes assigned for attendance marking.
                Contact your administrator to get class assignments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
