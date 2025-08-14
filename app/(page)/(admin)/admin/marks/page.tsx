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
import { Input } from "@/components/ui/input";
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
  Download,
  BookOpen,
  Filter,
  TrendingUp,
  Award,
  Users,
  FileText,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

// Sample marks data
const marksData = [
  {
    id: "M001",
    studentName: "PATEL DIVYAM HIRAKBHAI",
    rollNo: 1,
    standard: 1,
    class: "Nachiketa",
    subject: "Mathematics",
    examType: "Unit Test 1",
    maxMarks: 100,
    obtainedMarks: 85,
    grade: "A",
    date: "2024-01-15",
  },
  {
    id: "M002",
    studentName: "PATEL PARV DIPAKBHAI",
    rollNo: 2,
    standard: 1,
    class: "Nachiketa",
    subject: "Mathematics",
    examType: "Unit Test 1",
    maxMarks: 100,
    obtainedMarks: 92,
    grade: "A+",
    date: "2024-01-15",
  },
  {
    id: "M003",
    studentName: "PATEL SANVI BHAVIKKUMAR",
    rollNo: 3,
    standard: 1,
    class: "Nachiketa",
    subject: "Mathematics",
    examType: "Unit Test 1",
    maxMarks: 100,
    obtainedMarks: 78,
    grade: "B+",
    date: "2024-01-15",
  },
  {
    id: "M004",
    studentName: "PATEL SHRIDHAR SATISHBHAI",
    rollNo: 4,
    standard: 1,
    class: "Nachiketa",
    subject: "Mathematics",
    examType: "Unit Test 1",
    maxMarks: 100,
    obtainedMarks: 88,
    grade: "A",
    date: "2024-01-15",
  },
  {
    id: "M005",
    studentName: "PATEL TVISHA KRUNALBHAI",
    rollNo: 5,
    standard: 1,
    class: "Nachiketa",
    subject: "Mathematics",
    examType: "Unit Test 1",
    maxMarks: 100,
    obtainedMarks: 95,
    grade: "A+",
    date: "2024-01-15",
  },
];

const subjects = [
  "Mathematics",
  "Science",
  "English",
  "Hindi",
  "Social Studies",
];
const examTypes = [
  "Unit Test 1",
  "Unit Test 2",
  "Mid Term",
  "Final Exam",
  "Assignment",
];

export default function AdminMarks() {
  const [admin, setAdmin] = useState<any>(null);
  const [marks, setMarks] = useState(marksData);
  const [filteredMarks, setFilteredMarks] = useState(marksData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterExamType, setFilterExamType] = useState("all");

  useEffect(() => {
    let filtered = marks;

    if (searchTerm) {
      filtered = filtered.filter(
        (mark) =>
          mark.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mark.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStandard !== "all") {
      filtered = filtered.filter(
        (mark) => mark.standard.toString() === filterStandard
      );
    }

    if (filterClass !== "all") {
      filtered = filtered.filter(
        (mark) => mark.class.toLowerCase() === filterClass
      );
    }

    if (filterSubject !== "all") {
      filtered = filtered.filter((mark) => mark.subject === filterSubject);
    }

    if (filterExamType !== "all") {
      filtered = filtered.filter((mark) => mark.examType === filterExamType);
    }

    setFilteredMarks(filtered);
  }, [
    searchTerm,
    filterStandard,
    filterClass,
    filterSubject,
    filterExamType,
    marks,
  ]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "bg-green-500/20 text-green-300";
      case "A":
        return "bg-blue-500/20 text-blue-300";
      case "B+":
        return "bg-yellow-500/20 text-yellow-300";
      case "B":
        return "bg-orange-500/20 text-orange-300";
      default:
        return "bg-red-500/20 text-red-300";
    }
  };

  const calculateStats = () => {
    const totalMarks = filteredMarks.reduce(
      (sum, mark) => sum + mark.obtainedMarks,
      0
    );
    const avgMarks =
      filteredMarks.length > 0
        ? (totalMarks / filteredMarks.length).toFixed(1)
        : "0";
    const highestMarks =
      filteredMarks.length > 0
        ? Math.max(...filteredMarks.map((m) => m.obtainedMarks))
        : 0;
    const lowestMarks =
      filteredMarks.length > 0
        ? Math.min(...filteredMarks.map((m) => m.obtainedMarks))
        : 0;

    return {
      avgMarks,
      highestMarks,
      lowestMarks,
      totalStudents: filteredMarks.length,
    };
  };

  const stats = calculateStats();

  const exportMarks = () => {
    alert(
      "Exporting marks data to Excel. This will be implemented with backend integration!"
    );
  };

  const generateReport = () => {
    alert(
      "Generating detailed marks report with analytics. This will be implemented with backend integration!"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:bg-slate-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <GraduationCap className="h-6 w-6 text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={exportMarks}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              onClick={generateReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Students</p>
                  <p className="text-white text-xl font-bold">
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Average Marks</p>
                  <p className="text-white text-xl font-bold">
                    {stats.avgMarks}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Award className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Highest Score</p>
                  <p className="text-white text-xl font-bold">
                    {stats.highestMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Lowest Score</p>
                  <p className="text-white text-xl font-bold">
                    {stats.lowestMarks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Standard</Label>
                <Select
                  value={filterStandard}
                  onValueChange={setFilterStandard}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Standards
                    </SelectItem>
                    <SelectItem value="1" className="text-white">
                      Standard 1
                    </SelectItem>
                    <SelectItem value="2" className="text-white">
                      Standard 2
                    </SelectItem>
                    <SelectItem value="3" className="text-white">
                      Standard 3
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Class</Label>
                <Select value={filterClass} onValueChange={setFilterClass}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Classes
                    </SelectItem>
                    <SelectItem value="nachiketa" className="text-white">
                      Nachiketa
                    </SelectItem>
                    <SelectItem value="dhruv" className="text-white">
                      Dhruv
                    </SelectItem>
                    <SelectItem value="prahlad" className="text-white">
                      Prahlad
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Subject</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Subjects
                    </SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="text-white"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Exam Type</Label>
                <Select
                  value={filterExamType}
                  onValueChange={setFilterExamType}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Exams
                    </SelectItem>
                    {examTypes.map((examType) => (
                      <SelectItem
                        key={examType}
                        value={examType}
                        className="text-white"
                      >
                        {examType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Results</Label>
                <div className="bg-slate-800/50 border border-slate-700 rounded-md px-3 py-2 text-white">
                  {filteredMarks.length} records
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marks Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Student Marks
            </CardTitle>
            <CardDescription className="text-slate-400">
              View and manage student examination results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Roll No
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Student Name
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Exam Type
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Marks
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Grade
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.map((mark) => (
                    <tr
                      key={mark.id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="py-3 px-4 text-slate-300">
                        {mark.rollNo}
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {mark.studentName}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {mark.subject}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {mark.examType}
                      </td>
                      <td className="py-3 px-4 text-white">
                        {mark.obtainedMarks}/{mark.maxMarks}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getGradeColor(mark.grade)}>
                          {mark.grade}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">
                        {((mark.obtainedMarks / mark.maxMarks) * 100).toFixed(
                          1
                        )}
                        %
                      </td>
                      <td className="py-3 px-4 text-slate-300">{mark.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
