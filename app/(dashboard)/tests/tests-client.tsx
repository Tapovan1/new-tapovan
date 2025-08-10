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
} from "lucide-react"; // Import Loader2 for spinner
import Link from "next/link";
import { deleteTest } from "@/lib/actions/test.action";
import { generateMarkSheetPdf } from "@/utils/pdf-generator"; // Import the new utility
import { getMarksForTest } from "@/lib/actions/marks.action"; // Keep this import
import { toast } from "sonner";

// Assuming useToast is available from shadcn/ui setup
// import { useToast } from "@/components/ui/use-toast";

interface Test {
  id: string;
  name: string;
  subject: string;
  standard: string;
  TestClass: string; // This seems like a duplicate of 'class', consider unifying in schema
  class: string;
  status: string;
  date: string; // Date as string YYYY-MM-DD
  maxMarks: number;
  examType: string;
  chapter?: string;
  _count: {
    marks: number;
    students: number;
  };
  marks: Array<{
    marks: number; // Assuming marks are numbers for PDF, "AB" handled in client
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
  teacher: any; // Assuming teacher object is passed, adjust type if needed
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
  ); // State for loading spinner
  // Initialize toast

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
      return "PARTIAL"; // This status is derived, not from DB enum
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
    setDownloadingTestId(test.id); // Set loading for this specific test
    toast("Generating PDF");

    try {
      // Fetch the detailed test data including student names and roll numbers
      // from the server action.
      const detailedTestData = await getMarksForTest(test.id);

      if (!detailedTestData) {
        throw new Error("Failed to fetch detailed test data.");
      }

      // Prepare student data for the PDF using the fetched detailed data
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
      setDownloadingTestId(null); // Reset loading state
    }
  };

  const subjects = [...new Set(tests.map((test) => test.subject))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
      <div className="flex-1">
        {/* Enhanced Top Navigation */}
        <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-gray-600/50 px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                  My Tests
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                  Manage tests and track marks entry progress
                </p>
              </div>
            </div>
            <Link href="/marks" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25 h-9 sm:h-10">
                <Plus className="h-4 w-4 mr-2" />
                <span>Enter Marks</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Enhanced Search and Filters */}
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400" />
                Search & Filter Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-400" />
                  <Input
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue placeholder="Filter by Subject" />
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

          {/* Test Records Table */}
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Test Records ({filteredTests.length})
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">
                Manage your tests and track marks entry progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTests.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-slate-900 dark:text-gray-100 font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                    No Tests Found
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base max-w-sm mx-auto">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    subjectFilter !== "all"
                      ? "No tests match your current filters."
                      : "You haven't created any tests yet. Start by entering marks to create your first test."}
                  </p>
                  <Link href="/marks">
                    <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25">
                      <Plus className="h-4 w-4 mr-2" />
                      Enter Marks
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-gray-600/40">
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Test Name
                        </th>
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Subject
                        </th>
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Standard
                        </th>
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Class
                        </th>
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Date
                        </th>
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Max Marks
                        </th>
                        <th className="text-left py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
                          Status
                        </th>
                        <th className="text-right py-4 px-4 text-slate-700 dark:text-gray-300 font-semibold">
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
                              <p className="text-slate-900 dark:text-gray-100 font-medium">
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
                            <p className="text-slate-900 dark:text-gray-100">
                              {test.subject}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-900 dark:text-gray-100 font-medium">
                              Std {test.standard}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-900 dark:text-gray-100">
                              {test.class}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-900 dark:text-gray-100">
                              {new Date(test.date).toLocaleDateString("en-IN")}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-900 dark:text-gray-100 font-medium">
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
                                  className="h-8 w-8 p-0 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                                  title="Enter/Edit Marks"
                                >
                                  <BookOpen className="h-4 w-4" />
                                </Button>
                              </Link>
                              {test.status === "COMPLETED" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownloadReport(test)} // Pass the entire test object
                                  className="h-8 w-8 p-0 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30"
                                  title="Download Report"
                                  disabled={downloadingTestId === test.id} // Disable button while loading
                                >
                                  {downloadingTestId === test.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteTest(test.id)}
                                className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                                title="Delete Test"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
