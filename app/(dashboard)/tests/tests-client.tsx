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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Download,
  Trash2,
  Plus,
  GraduationCap,
  Filter,
  Loader2,
  Calendar,
  Hash,
} from "lucide-react";
import Link from "next/link";
import { deleteTest } from "@/lib/actions/test.action";
import { generateMarkSheetPdf } from "@/utils/pdf-generator";
import { getMarksForTest } from "@/lib/actions/marks.action";
import { toast } from "sonner";

interface Test {
  id: string;
  name: string;
  subject: string;
  standard: string;
  TestClass: string;
  class: string;
  status: string;
  date: string;
  maxMarks: number;
  examType: string;
  chapter?: string;
  _count: {
    marks: number;
    students: number;
  };
  marks: Array<{
    marks: number;
    studentId: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    rollNo: string;
  }>;
}

interface TestsClientProps {
  tests: Test[];
  teacher: any;
}

export default function TestsClient({
  tests: initialTests,
  teacher,
}: TestsClientProps) {
  const [tests, setTests] = useState(initialTests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [downloadingTestId, setDownloadingTestId] = useState<string | null>(
    null
  );

  const getStatusColor = (test: Test) => {
    if (test.status === "PENDING") {
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800/50";
    } else if (test.status === "COMPLETED") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50";
    } else {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50";
    }
  };

  const getStatusText = (test: Test) => {
    const marksEntered = test._count?.marks || 0;
    const totalStudents = test._count?.students || 0;
    if (marksEntered === 0) {
      return "PENDING";
    } else if (marksEntered === totalStudents) {
      return "COMPLETED";
    } else {
      return "PARTIAL";
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.examType.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStatusText(test);
    const matchesStatus =
      statusFilter === "all" ||
      status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSubject =
      subjectFilter === "all" || test.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  const handleDeleteTest = async (testId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this test? This action cannot be undone."
      )
    ) {
      const result = await deleteTest(testId);
      if (result.success) {
        setTests(tests.filter((test) => test.id !== testId));
        toast("Test Deleted");
      } else {
        toast("Deletion Failed");
      }
    }
  };

  const handleDownloadReport = async (test: Test) => {
    setDownloadingTestId(test.id);
    toast("Generating PDF");
    try {
      const detailedTestData = await getMarksForTest(test.id);
      if (!detailedTestData) {
        throw new Error("Failed to fetch detailed test data.");
      }

      const studentsForPdf = detailedTestData.marks.map((markItem, index) => {
        return {
          srNo: index + 1,
          rollNo: markItem.student.rollNo,
          name: markItem.student.name,
          marks: markItem.marks,
        };
      });

      const pdfData = {
        subject: test.subject,
        standard: test.standard,
        chapter: test.chapter,
        testName: test.name,
        maxMarks: test.maxMarks,
        date: test.date,
        students: studentsForPdf,
      };

      await generateMarkSheetPdf(pdfData);
      toast("PDF Generated");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast("PDF Generation Failed");
    } finally {
      setDownloadingTestId(null);
    }
  };

  const subjects = [...new Set(tests.map((test) => test.subject))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
      <div className="flex-1">
        {/* Enhanced Top Navigation - Mobile Optimized */}
        <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-gray-600/50 px-3 sm:px-6 py-3 sm:py-6 sticky top-0 z-30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
                <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                  My Tests
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300 hidden sm:block">
                  Manage tests and track marks entry progress
                </p>
              </div>
            </div>
            <Link href="/marks" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25 h-8 sm:h-10 text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span>Enter Marks</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-6">
          {/* Enhanced Search and Filters - Mobile Optimized */}
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-lg text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <Filter className="h-3 w-3 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                Search & Filter Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400 dark:text-gray-400" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 h-8 sm:h-10 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100 h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100 h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Test Records - Mobile Optimized */}
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-lg text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="h-3 w-3 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                Test Records ({filteredTests.length})
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                Manage your tests and track marks entry progress
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {filteredTests.length === 0 ? (
                <div className="text-center py-8 sm:py-16 px-4">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-6">
                    <BookOpen className="h-6 w-6 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-slate-900 dark:text-gray-100 font-semibold mb-2 sm:mb-3 text-sm sm:text-lg">
                    No Tests Found
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-4 sm:mb-6 text-xs sm:text-base max-w-sm mx-auto">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    subjectFilter !== "all"
                      ? "No tests match your current filters."
                      : "You haven't created any tests yet. Start by entering marks to create your first test."}
                  </p>
                  <Link href="/marks">
                    <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25 h-8 sm:h-10 text-sm">
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Enter Marks
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-gray-600/40">
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Test Name
                          </th>
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Subject
                          </th>
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Standard
                          </th>
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Class
                          </th>
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Date
                          </th>
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Max Marks
                          </th>
                          <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Status
                          </th>
                          <th className="text-right py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTests.map((test) => (
                          <tr
                            key={test.id}
                            className="border-b border-slate-100 dark:border-gray-700/40 hover:bg-slate-50/80 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div className="space-y-1">
                                <p className="text-slate-900 dark:text-gray-100 font-medium text-sm">
                                  {test.name}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {test.examType && (
                                    <Badge
                                      variant="outline"
                                      className="border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 text-xs"
                                    >
                                      {test.examType}
                                    </Badge>
                                  )}
                                  {test.chapter && (
                                    <Badge
                                      variant="outline"
                                      className="border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 text-xs"
                                    >
                                      {test.chapter}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-slate-900 dark:text-gray-100 text-sm">
                                {test.subject}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-slate-900 dark:text-gray-100 font-medium text-sm">
                                Std {test.standard}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-slate-900 dark:text-gray-100 text-sm">
                                {test.class}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-slate-900 dark:text-gray-100 text-sm">
                                {new Date(test.date).toLocaleDateString(
                                  "en-IN"
                                )}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-slate-900 dark:text-gray-100 font-medium text-sm">
                                {test.maxMarks}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge
                                className={`${getStatusColor(
                                  test
                                )} text-xs font-medium`}
                                variant="outline"
                              >
                                {test.status}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-1 justify-end">
                                <Link href={`/marks?test=${test.id}`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                    title="Enter/Edit Marks"
                                  >
                                    <BookOpen className="h-3 w-3" />
                                  </Button>
                                </Link>
                                {test.status === "COMPLETED" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDownloadReport(test)}
                                    className="h-7 w-7 p-0 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                                    title="Download Report"
                                    disabled={downloadingTestId === test.id}
                                  >
                                    {downloadingTestId === test.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Download className="h-3 w-3" />
                                    )}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTest(test.id)}
                                  className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                                  title="Delete Test"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-3 p-3">
                    {filteredTests.map((test) => (
                      <Card
                        key={test.id}
                        className="bg-slate-50/80 dark:bg-gray-700/30 border border-slate-200 dark:border-gray-600/30"
                      >
                        <CardContent className="p-3 space-y-3">
                          {/* Header with Test Name and Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100 truncate">
                                {test.name}
                              </h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {test.examType && (
                                  <Badge
                                    variant="outline"
                                    className="border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 text-xs px-1.5 py-0.5"
                                  >
                                    {test.examType}
                                  </Badge>
                                )}
                                {test.chapter && (
                                  <Badge
                                    variant="outline"
                                    className="border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/30 text-xs px-1.5 py-0.5"
                                  >
                                    {test.chapter}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Badge
                              className={`${getStatusColor(
                                test
                              )} text-xs font-medium shrink-0`}
                              variant="outline"
                            >
                              {test.status}
                            </Badge>
                          </div>

                          {/* Test Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-400">
                                <BookOpen className="h-3 w-3" />
                                <span>Subject</span>
                              </div>
                              <p className="text-slate-900 dark:text-gray-100 font-medium">
                                {test.subject}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-400">
                                <GraduationCap className="h-3 w-3" />
                                <span>Standard</span>
                              </div>
                              <p className="text-slate-900 dark:text-gray-100 font-medium">
                                Std {test.standard} - {test.class}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-400">
                                <Calendar className="h-3 w-3" />
                                <span>Date</span>
                              </div>
                              <p className="text-slate-900 dark:text-gray-100 font-medium">
                                {new Date(test.date).toLocaleDateString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-slate-600 dark:text-gray-400">
                                <Hash className="h-3 w-3" />
                                <span>Max Marks</span>
                              </div>
                              <p className="text-slate-900 dark:text-gray-100 font-medium">
                                {test.maxMarks}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-gray-600/30">
                            <Link
                              href={`/marks?test=${test.id}`}
                              className="flex-1"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-7 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 bg-transparent"
                              >
                                <BookOpen className="h-3 w-3 mr-1" />
                                Edit Marks
                              </Button>
                            </Link>
                            {test.status === "COMPLETED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadReport(test)}
                                className="h-7 px-2 text-xs text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800/50 hover:bg-violet-50 dark:hover:bg-violet-900/30"
                                disabled={downloadingTestId === test.id}
                              >
                                {downloadingTestId === test.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Download className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTest(test.id)}
                              className="h-7 px-2 text-xs text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
