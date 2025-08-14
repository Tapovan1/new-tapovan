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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Plus,
  Calendar,
  BookOpen,
  GraduationCap,
  Loader2,
  School,
  FileText,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  createTest,
  saveMarks,
  getTestById,
  getTestsByExamType,
} from "@/lib/actions/marks.action";
import { getTeacherAssignedData } from "@/lib/actions/teacher-assignment.action";
import { useRouter, useSearchParams } from "next/navigation";

interface TestData {
  id: string;
  name: string;
  subject: string;
  standard: string;
  class: string;
  date: string | Date;
  maxMarks: number;
  examType: string;
  students: {
    id: string;
    name: string;
    standard: string;
    class: string;
    status: any;
    createdAt: Date;
    updatedAt: Date;
    grNo: string;
    enrollmentNo: string;
    rollNo: number;
  }[];
  marks?: { studentId: string; marks: number }[];
  chapter?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: { marks: number };
}

interface MarksClientProps {
  teacher: any;
  initialTests: any[];
  examTypes: any[];
}

export default function MarksClient({
  teacher,
  initialTests = [],
  examTypes = [],
}: MarksClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testIdFromUrl = searchParams.get("test");

  // Initialize all state with proper default values
  const [tests, setTests] = useState<any[]>(initialTests || []);
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<string>("");
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [currentTest, setCurrentTest] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [filteredTests, setFilteredTests] = useState<any[]>([]);

  // Hierarchical selection state
  const [assignedData, setAssignedData] = useState<any[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // New test creation fields
  const [newTestName, setNewTestName] = useState<string>("");
  const [testDate, setTestDate] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<string>("");
  const [chapterName, setChapterName] = useState<string>("");

  // Initialize date on client side only to avoid hydration mismatch
  useEffect(() => {
    if (!testDate) {
      setTestDate(new Date().toISOString().split("T")[0]);
    }
  }, [testDate]);

  // Load teacher's assigned data on component mount
  useEffect(() => {
    loadTeacherAssignedData();
  }, []);

  // Load tests when exam type changes
  useEffect(() => {
    if (selectedExamType) {
      loadTestsByExamType(selectedExamType);
    } else {
      setFilteredTests([]);
    }
    setSelectedTest("");
  }, [selectedExamType]);

  // Handle test ID from URL parameters
  useEffect(() => {
    if (testIdFromUrl && testIdFromUrl !== selectedTest) {
      loadTestFromUrl(testIdFromUrl);
    }
  }, [testIdFromUrl]);

  const loadTestFromUrl = async (testId: string) => {
    setLoading(true);
    try {
      const testData = await getTestById(testId);
      if (testData) {
        // Auto-fill all the form fields based on test data
        setSelectedExamType(testData.examType || "");
        setSelectedTest(testId);
        setSelectedStandard(testData.standard || "");
        setSelectedClass(testData.class || "");
        setSelectedSubject(testData.subject || "");
        setNewTestName(testData.name || "");
        setTestDate(
          testData.date
            ? typeof testData.date === "string"
              ? testData.date
              : new Date(testData.date).toISOString().split("T")[0]
            : ""
        );
        setMaxMarks(testData.maxMarks?.toString() || "");
        setChapterName((testData as any).chapter || "");

        // Set current test and students
        setCurrentTest(testData);
        setStudents(Array.isArray(testData.students) ? testData.students : []);

        // Load existing marks
        const existingMarks: { [key: string]: string } = {};
        if (Array.isArray(testData.marks)) {
          testData.marks.forEach((mark: any) => {
            existingMarks[mark.studentId] = mark.marks?.toString() || "";
          });
        }
        setMarks(existingMarks);

        // Load the exam type's tests to populate the dropdown
        if (testData.examType) {
          await loadTestsByExamType(testData.examType);
        }
      }
    } catch (error) {
      console.error("Error loading test from URL:", error);
      alert("Failed to load test data");
    } finally {
      setLoading(false);
    }
  };

  const loadTestsByExamType = async (examType: string) => {
    try {
      const examTests = await getTestsByExamType(examType, teacher.id);
      setFilteredTests(Array.isArray(examTests) ? examTests : []);
    } catch (error) {
      console.error("Error loading tests by exam type:", error);
      setFilteredTests([]);
    }
  };

  const loadTeacherAssignedData = async () => {
    try {
      const data = await getTeacherAssignedData(teacher.id);
      setAssignedData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading teacher assigned data:", error);
      setAssignedData([]);
    }
  };

  // Get available classes and subjects based on selected standard
  const selectedStandardData = assignedData.find(
    (item) => item.standard.id === selectedStandard
  );
  const availableClasses = selectedStandardData?.classes || [];
  const availableSubjects = selectedStandardData?.subjects || [];

  useEffect(() => {
    if (selectedTest && selectedTest !== "new") {
      loadTestData(selectedTest);
    } else if (selectedTest === "new") {
      setIsCreatingNew(true);
      setCurrentTest(null);
      setStudents([]);
      setMarks({});
    } else {
      setIsCreatingNew(false);
      setCurrentTest(null);
      setStudents([]);
      setMarks({});
    }
  }, [selectedTest]);

  const loadTestData = async (testId: string) => {
    setLoading(true);
    try {
      const testData = await getTestById(testId);
      if (testData) {
        setCurrentTest(testData);
        setStudents(Array.isArray(testData.students) ? testData.students : []);
        // Load existing marks with proper initialization
        const existingMarks: { [key: string]: string } = {};
        if (Array.isArray(testData.marks)) {
          testData.marks.forEach((mark: any) => {
            existingMarks[mark.studentId] = mark.marks?.toString() || "";
          });
        }
        setMarks(existingMarks);
        // Set hierarchical selections based on test data
        setSelectedStandard(testData.standard || "");
        setSelectedClass(testData.class || "");
        setSelectedSubject(testData.subject || "");
      }
    } catch (error) {
      console.error("Error loading test data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: value,
    }));
  };

  const handleCreateTest = async () => {
    if (
      !newTestName ||
      !selectedSubject ||
      !selectedStandard ||
      !selectedClass ||
      !testDate ||
      !maxMarks ||
      !selectedExamType
    ) {
      alert("Please fill all required fields to create test");
      return;
    }

    const currentExamType = examTypes.find((et) => et.id === selectedExamType);
    if (currentExamType?.hasChapter && !chapterName) {
      alert("Please enter a chapter name for this test type");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newTestName);
      formData.append("subject", selectedSubject);
      formData.append("standard", selectedStandard);
      formData.append("class", selectedClass);
      formData.append("date", testDate);
      formData.append("maxMarks", maxMarks);
      formData.append("examType", selectedExamType);
      if (chapterName) {
        formData.append("chapter", chapterName);
      }

      const result = await createTest(formData);
      if (result.success && result.test) {
        setCurrentTest(result.test);
        setTests((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [result.test, ...prevArray];
        });
        setFilteredTests((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [result.test, ...prevArray];
        });
        setSelectedTest(result.test.id);
        setIsCreatingNew(false);
        await loadTestData(result.test.id);
        alert("Test created successfully! You can now enter marks.");
      } else {
        alert(result.error || "Failed to create test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedTest || (!currentTest && !isCreatingNew)) {
      alert("Please select a test");
      return;
    }

    if (isCreatingNew) {
      alert("Please create the test first");
      return;
    }

    setSaving(true);
    try {
      const marksData = Object.entries(marks)
        .filter(([_, mark]) => mark && mark.trim() !== "")
        .map(([studentId, mark]) => ({
          studentId,
          marks: Number.parseFloat(mark),
        }));

      if (marksData.length === 0) {
        alert("Please enter at least one mark");
        return;
      }

      const result = await saveMarks(selectedTest, marksData);
      if (result.success) {
        alert("Marks saved successfully!");
        router.refresh();
      } else {
        alert(result.error || "Failed to save marks");
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      alert("Failed to save marks");
    } finally {
      setSaving(false);
    }
  };

  const getTestStatus = (test: any) => {
    return test._count?.marks > 0 ? "Completed" : "Pending";
  };

  const getTestStatusColor = (test: any) => {
    return test._count?.marks > 0
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  };

  const getCurrentExamType = () => {
    return examTypes.find((et) => et.id === selectedExamType) || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/30 transition-colors duration-300">
      {/* Enhanced Top Navigation */}
      <div className="bg-white/80 dark:bg-gray-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-gray-600/50 px-4 sm:px-6 py-4 sm:py-6 sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25">
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-gray-100 tracking-tight">
                Marks Entry
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                Enter marks for your students
              </p>
            </div>
          </div>
          <Link href="/tests" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 h-9 sm:h-10">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="sm:hidden">Tests</span>
              <span className="hidden sm:inline">My Tests</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Exam Type and Test Selection */}
        <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Create Mark Entry
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-gray-300">
              Select exam type and test to enter marks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Exam Type Selection */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  1. Exam Type
                </Label>
                <Select
                  value={selectedExamType}
                  onValueChange={setSelectedExamType}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue placeholder="Select Exam Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {examTypes.map((examType) => (
                      <SelectItem key={examType.id} value={examType.id}>
                        {examType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedExamType && (
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Max Marks: {getCurrentExamType()?.maxMarks} •
                    {getCurrentExamType()?.hasChapter
                      ? " Requires Chapter"
                      : " No Chapter Required"}
                  </p>
                )}
              </div>

              {/* Test Selection */}
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-gray-300 font-medium">
                  2. Select Test
                </Label>
                <Select
                  value={selectedTest}
                  onValueChange={setSelectedTest}
                  disabled={!selectedExamType}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                    <SelectValue placeholder="Select Test" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                    {testIdFromUrl && selectedTest ? (
                      <SelectItem value={selectedTest}>
                        {newTestName || "Selected Test"}
                      </SelectItem>
                    ) : (
                      <>
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />+ Create New Test
                          </div>
                        </SelectItem>
                        {filteredTests.map((test) => (
                          <SelectItem
                            key={test.id}
                            value={test.id || `test-${test.name}`}
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span>{test.name}</span>
                                <Badge
                                  className={`${getTestStatusColor(
                                    test
                                  )} text-xs`}
                                  variant="outline"
                                >
                                  {getTestStatus(test)}
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-gray-400">
                                {test.subject} • Std {test.standard}-
                                {test.class} •{" "}
                                {new Date(test.date).toLocaleDateString()}
                                {test.chapter && ` • ${test.chapter}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create New Test Dialog */}
        {selectedTest === "new" && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Create New {getCurrentExamType()?.name}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-gray-300">
                Fill in the test details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Test Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="testName"
                    className="text-slate-700 dark:text-gray-300 font-medium"
                  >
                    3. Test Name
                  </Label>
                  <Input
                    id="testName"
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    placeholder="Enter test name"
                    className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100"
                  />
                </div>

                {/* Chapter Name (if required) */}
                {getCurrentExamType()?.hasChapter && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="chapterName"
                      className="text-slate-700 dark:text-gray-300 font-medium"
                    >
                      4. Chapter Name
                    </Label>
                    <Input
                      id="chapterName"
                      value={chapterName}
                      onChange={(e) => setChapterName(e.target.value)}
                      placeholder="Enter chapter name"
                      className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Standard Selection */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300 font-medium">
                      Standard
                    </Label>
                    <Select
                      value={selectedStandard}
                      onValueChange={setSelectedStandard}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                        <SelectValue placeholder="Select Standard" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                        {assignedData.map((item) => (
                          <SelectItem
                            key={item.standard.id}
                            value={
                              item.standard.id || `std-${item.standard.name}`
                            }
                          >
                            Standard {item.standard.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class Selection */}
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
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                        {availableClasses.map((cls: any) => (
                          <SelectItem
                            key={cls.name}
                            value={cls.name || `class-${cls.name}`}
                          >
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              {cls.name}
                              {cls.isClassTeacher && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                  (CT)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-gray-300 font-medium">
                      Subject
                    </Label>
                    <Select
                      value={selectedSubject}
                      onValueChange={setSelectedSubject}
                      disabled={!selectedStandard}
                    >
                      <SelectTrigger className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100">
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-600/40">
                        {availableSubjects.map((subject: any) => (
                          <SelectItem
                            key={subject.name}
                            value={subject.name || `subject-${subject.name}`}
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              {subject.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="testDate"
                      className="text-slate-700 dark:text-gray-300 font-medium"
                    >
                      5. Date
                    </Label>
                    <div className="relative">
                      <input
                        type="date"
                        id="testDate"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-700/60 border border-slate-200 dark:border-gray-600/40 rounded-md text-slate-900 dark:text-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Max Marks */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="maxMarks"
                      className="text-slate-700 dark:text-gray-300 font-medium"
                    >
                      Marks
                    </Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      value={maxMarks || getCurrentExamType()?.maxMarks || ""}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      placeholder={
                        getCurrentExamType()?.maxMarks?.toString() || ""
                      }
                      className="bg-slate-50 dark:bg-gray-700/60 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreateTest}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-600/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardContent className="text-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                Loading...
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Please wait while we load the test data.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Students Marks Entry */}
        {!loading && students.length > 0 && currentTest && (
          <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-slate-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    {currentTest.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{currentTest.subject}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      <span>
                        Std {currentTest.standard}-{currentTest.class}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>Max: {currentTest.maxMarks}</span>
                    </div>
                    {currentTest.chapter && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{currentTest.chapter}</span>
                      </div>
                    )}
                  </div>
                </div>
                {currentTest.marks && currentTest.marks.length > 0 && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {currentTest.marks.length} marks entered
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile-First Design */}
              <div className="space-y-3">
                {/* Header for larger screens */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-4 p-3 bg-slate-100 dark:bg-gray-700/50 rounded-lg font-medium text-slate-700 dark:text-gray-300">
                  <div>Roll No</div>
                  <div>Student Name</div>
                  <div className="text-center">Marks</div>
                </div>

                {/* Student Rows */}
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-3 sm:p-4 bg-slate-50 dark:bg-gray-700/30 rounded-lg border border-slate-200 dark:border-gray-600/30"
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300"
                          >
                            {student.rollNo}
                          </Badge>
                          <span className="text-slate-900 dark:text-gray-100 font-medium">
                            {student.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-slate-600 dark:text-gray-300 min-w-[50px]">
                          Marks:
                        </Label>
                        <Input
                          type="number"
                          value={marks[student.id] || ""}
                          onChange={(e) =>
                            handleMarkChange(student.id, e.target.value)
                          }
                          placeholder="0"
                          className="bg-white dark:bg-gray-600/50 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100 w-20 text-center"
                          min="0"
                          max={currentTest.maxMarks}
                        />
                        <span className="text-xs text-slate-500 dark:text-gray-400">
                          / {currentTest.maxMarks}
                        </span>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid sm:grid-cols-3 gap-4 items-center">
                      <div>
                        <Badge
                          variant="outline"
                          className="border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300"
                        >
                          {student.rollNo}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-900 dark:text-gray-100 font-medium">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        <Input
                          type="number"
                          value={marks[student.id] || ""}
                          onChange={(e) =>
                            handleMarkChange(student.id, e.target.value)
                          }
                          placeholder="0"
                          className="bg-white dark:bg-gray-600/50 border-slate-200 dark:border-gray-600/40 text-slate-900 dark:text-gray-100 w-20 text-center"
                          min="0"
                          max={currentTest.maxMarks}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSaveMarks}
                  disabled={saving}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Marks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading &&
          selectedTest &&
          students.length === 0 &&
          !isCreatingNew && (
            <Card className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm border border-slate-200 dark:border-gray-600/30 shadow-lg">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/40 dark:to-indigo-800/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-slate-900 dark:text-gray-100 font-medium mb-2">
                  No Students Found
                </h3>
                <p className="text-slate-600 dark:text-gray-300">
                  No students found for the selected test.
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
