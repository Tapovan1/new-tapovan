"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Search,
  FileDown,
  Users,
  Edit3,
  Save,
  X,
  Loader2,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  getAbsentStudents,
  updateAbsentReason,
} from "@/lib/actions/attendace-reason.action";
import { pdf } from "@react-pdf/renderer";
import AbsentStudentsPDF from "@/components/PDF/absent-student-report";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default function AttendanceReasonsClient() {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [absentStudents, setAbsentStudents] = useState<AbsentStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AbsentStudent | null>(
    null
  );
  const [editReason, setEditReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Handle search for absent students
  const handleGetAbsentStudents = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const data = await getAbsentStudents(startDate, endDate);
      setAbsentStudents(data);

      toast.success(
        `Found ${data.length} absent students between ${format(
          new Date(startDate),
          "MMM dd, yyyy"
        )} and ${format(new Date(endDate), "MMM dd, yyyy")}`
      );
    } catch (error) {
      console.error("Error fetching absent students:", error);
      toast.error("Failed to fetch absent students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle update reason dialog
  const handleUpdateReason = (student: AbsentStudent) => {
    setEditingStudent(student);
    setEditReason(student.reason || "");
  };

  // Handle save reason
  const handleSaveReason = async () => {
    if (!editingStudent) return;

    setUpdating(true);

    try {
      await updateAbsentReason(editingStudent.id, editReason.trim());

      // Update local state
      setAbsentStudents((prev) =>
        prev.map((student) =>
          student.id === editingStudent.id
            ? { ...student, reason: editReason.trim() }
            : student
        )
      );

      setEditingStudent(null);
      setEditReason("");
      toast.success("Reason updated successfully");
    } catch (error) {
      console.error("Error updating reason:", error);
      toast.error("Failed to update reason. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Simple PDF download - just pass data to PDF component
  const handleDownloadPDF = async () => {
    if (absentStudents.length === 0) {
      toast.error("No absent students data to download");
      return;
    }

    setDownloadingPDF(true);

    try {
      // Generate PDF using separate component
      const blob = await pdf(
        <AbsentStudentsPDF
          absentStudents={absentStudents}
          startDate={startDate}
          endDate={endDate}
        />
      ).toBlob();

      // Download the PDF
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Absent_Students_${format(
        new Date(startDate),
        "yyyy-MM-dd"
      )}_to_${format(new Date(endDate), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Calculate statistics
  const totalAbsent = absentStudents.length;
  const withReasons = absentStudents.filter(
    (s) => s.reason && s.reason.trim()
  ).length;
  const withoutReasons = totalAbsent - withReasons;
  const uniqueClasses = new Set(
    absentStudents.map((s) => `${s.standard}-${s.class}`)
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-gray-600/50 px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/25">
              <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                Absent Student Reasons
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                Manage and track reasons for student absences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Statistics Cards - Only show after search */}

        {/* Date Range and Actions */}
        <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              Date Range Selection
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-gray-300">
              Select date range to fetch absent students and manage their
              reasons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGetAbsentStudents}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-600/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Fetching Students...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Get Absent Students
                  </>
                )}
              </Button>

              {absentStudents.length > 0 && (
                <Button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPDF}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-600/25"
                >
                  {downloadingPDF ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="h-4 w-4 mr-2" />
                      Download PDF
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
              <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                Fetching Absent Students
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Please wait while we fetch absent students for the selected date
                range...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Absent Students Table */}
        {!loading && hasSearched && absentStudents.length > 0 && (
          <Card className=" bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
                Absent Students ({absentStudents.length})
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">
                Manage reasons for absent students from{" "}
                {format(new Date(startDate), "MMM dd, yyyy")} to{" "}
                {format(new Date(endDate), "MMM dd, yyyy")}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <div className=" absolute w-full overflow-auto sm:overflow-visible">
                <div className="min-w-[800px] sm:w-full">
                  <Table className="overflow-auto sm:overflow-visible">
                    <TableHeader className="bg-slate-50 dark:bg-gray-800/50 border-b border-slate-200 dark:border-gray-600/40">
                      <TableRow className="whitespace-nowrap">
                        <TableHead className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Date
                        </TableHead>
                        <TableHead className="text-center py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Std
                        </TableHead>
                        <TableHead className="text-center py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Class
                        </TableHead>
                        <TableHead className="text-center py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Roll
                        </TableHead>
                        <TableHead className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Name
                        </TableHead>
                        <TableHead className="text-left py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Reason
                        </TableHead>
                        <TableHead className="text-center py-3 px-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-gray-300">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {absentStudents.map((student, index) => (
                        <TableRow
                          key={student.id}
                          className={`whitespace-nowrap border-b  border-slate-200  dark:border-gray-600/30 hover:bg-slate-50 dark:hover:bg-gray-700/20 transition-colors ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800/10"
                              : ""
                          }`}
                        >
                          <TableCell className="py-2 sm:py-3 px-2 text-xs sm:text-sm text-slate-900 dark:text-gray-100">
                            {format(new Date(student.date), "dd/MM/yy")}
                          </TableCell>
                          <TableCell className="py-2 sm:py-3 px-2 text-xs sm:text-sm text-slate-900 dark:text-gray-100 text-center">
                            {student.standard}
                          </TableCell>
                          <TableCell className="py-2 sm:py-3 px-2 text-xs sm:text-sm text-slate-900 dark:text-gray-100 text-center">
                            {student.class}
                          </TableCell>
                          <TableCell className="py-2 sm:py-3 px-2 text-xs sm:text-sm text-slate-900 dark:text-gray-100 font-medium text-center">
                            {student.rollNo}
                          </TableCell>
                          <TableCell className="py-2 sm:py-3 px-2 text-xs sm:text-sm text-slate-900 dark:text-gray-100 font-medium">
                            {student.studentName}
                          </TableCell>
                          <TableCell className="py-2 sm:py-3 px-2 text-xs sm:text-sm">
                            {student.reason ? (
                              <span className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md text-xs text-slate-900 dark:text-gray-100">
                                {student.reason}
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md text-xs whitespace-nowrap">
                                No Reason
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 sm:py-3 px-2 text-center">
                            <Button
                              onClick={() => handleUpdateReason(student)}
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs px-2 py-1 h-auto min-w-0"
                            >
                              <Edit3 className="h-3 w-3 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="md:hidden p-4 text-center border-t border-slate-200 dark:border-gray-600/30 bg-slate-50/50 dark:bg-gray-800/20">
                  <p className="text-xs text-slate-500 dark:text-gray-400 flex items-center justify-center gap-2">
                    <span>← Scroll horizontally to see all columns →</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && hasSearched && absentStudents.length === 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-700/40 dark:to-green-600/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                No Absent Students Found
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Great news! No students were absent during the selected date
                range.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                Ready to Search
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Select a date range above and click "Get Absent Students" to
                view and manage absent student reasons.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Update Reason Dialog */}
      <Dialog
        open={!!editingStudent}
        onOpenChange={() => setEditingStudent(null)}
      >
        <DialogContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-gray-100">
              Update Absence Reason
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-gray-300">
              {editingStudent && (
                <>
                  Update reason for{" "}
                  <strong>{editingStudent.studentName}</strong> (Roll No:{" "}
                  {editingStudent.rollNo}) on{" "}
                  {format(new Date(editingStudent.date), "MMM dd, yyyy")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-700 dark:text-gray-300 font-medium">
                Reason for Absence
              </Label>
              <Textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Enter reason for absence (e.g., Sick, Family emergency, etc.)"
                className="mt-2 bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingStudent(null)}
              className="border-slate-200 dark:border-gray-600/40 hover:bg-slate-50 dark:hover:bg-gray-700/50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveReason}
              disabled={updating}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Reason
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
