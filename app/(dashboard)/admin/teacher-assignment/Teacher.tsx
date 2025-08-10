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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  Search,
  Award,
  BookOpen,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import AddAssignmentDialog from "./add-assignment-dialog";
// import BulkAssignmentDialog from "./bulk-assignment-dialog"
import EditAssignmentDialog from "./edit-assignment-dialog";
import DeleteAssignment from "./delete-assignment";
import { getStandardsList, getAllSubjects } from "@/lib/constants/index";

interface Assignment {
  id: string;
  teacherId: string;
  standardName: string;
  className: string;
  subject: string;
  isClassTeacher: boolean;
  assignedDate: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  assignments: Assignment[];
  classTeacherAssignments: Assignment[];
  totalAssignments: number;
}

interface TeacherAssignmentsProps {
  groupedTeachers: Teacher[];
  allTeachers: Teacher[];
}

export default function TeacherAssignments({
  groupedTeachers,
  allTeachers,
}: TeacherAssignmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  // Filter teachers based on search and filters
  const filteredTeachers = groupedTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStandard =
      filterStandard === "all" ||
      teacher.assignments.some((a) => a.standardName === filterStandard);

    const matchesSubject =
      filterSubject === "all" ||
      teacher.assignments.some((a) => a.subject === filterSubject);

    return matchesSearch && matchesStandard && matchesSubject;
  });

  const standardsList = getStandardsList();
  const allSubjects = getAllSubjects();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Teacher Assignments
                </h1>
                <p className="text-sm text-slate-400">
                  Manage teacher class and subject assignments
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <AddAssignmentDialog teachers={allTeachers} />
            {/* <BulkAssignmentDialog teachers={allTeachers} /> */}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filters */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-200">Search Teachers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Standard</Label>
                <Select
                  value={filterStandard}
                  onValueChange={setFilterStandard}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="All Standards" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Standards
                    </SelectItem>
                    {standardsList.map((standard) => (
                      <SelectItem
                        key={standard}
                        value={standard}
                        className="text-white"
                      >
                        {standard === "KG1" || standard === "KG2"
                          ? standard
                          : `Standard ${standard}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Subject</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all" className="text-white">
                      All Subjects
                    </SelectItem>
                    {allSubjects.map((subject) => (
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
                <Label className="text-slate-200">Results</Label>
                <div className="bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white">
                  {filteredTeachers.length} teachers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Assignments Overview */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teacher Assignments Overview ({filteredTeachers.length} Teachers)
            </CardTitle>
            <CardDescription className="text-slate-400">
              All teachers with their complete assignment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Teacher</TableHead>
                    <TableHead className="text-slate-300">
                      Total Assignments
                    </TableHead>
                    <TableHead className="text-slate-300">
                      Class Teacher Of
                    </TableHead>
                    <TableHead className="text-slate-300">
                      All Assignments
                    </TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center">
                        <p className="text-slate-400">
                          {searchTerm ||
                          filterStandard !== "all" ||
                          filterSubject !== "all"
                            ? "No teachers found matching the filters"
                            : "No teachers found"}
                        </p>
                        {(searchTerm ||
                          filterStandard !== "all" ||
                          filterSubject !== "all") && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setFilterStandard("all");
                              setFilterSubject("all");
                            }}
                            className="text-blue-400 hover:underline text-sm mt-1"
                          >
                            Clear filters
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <TableRow key={teacher.id} className="border-slate-700">
                        <TableCell className="text-white font-medium">
                          <div>
                            <div className="font-semibold">{teacher.name}</div>
                            <div className="text-sm text-slate-400">
                              {teacher.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <Badge
                            variant="outline"
                            className="border-blue-500 text-blue-300"
                          >
                            {teacher.totalAssignments} assignments
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="space-y-1">
                            {teacher.assignments.length === 0 ? (
                              <span className="text-slate-500 text-sm">
                                None
                              </span>
                            ) : (
                              teacher.assignments.map((assignment) => (
                                <Badge
                                  key={assignment.id}
                                  className="bg-green-500/20 text-green-300 mr-1 mb-1"
                                >
                                  <Award className="h-3 w-3 mr-1" />
                                  {assignment.standardName === "KG1" ||
                                  assignment.standardName === "KG2"
                                    ? assignment.standardName
                                    : `Std ${assignment.standardName}`}{" "}
                                  - {assignment.className}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="space-y-1 max-w-md">
                            {teacher.assignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="flex items-center justify-between bg-slate-800/30 p-2 rounded text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 text-xs"
                                  >
                                    {assignment.standardName === "KG1" ||
                                    assignment.standardName === "KG2"
                                      ? assignment.standardName
                                      : `Std ${assignment.standardName}`}
                                  </Badge>
                                  <span className="text-white">
                                    {assignment.className}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-blue-300">
                                    {assignment.subject}
                                  </span>
                                  {assignment.isClassTeacher && (
                                    <Award className="h-3 w-3 text-green-400" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <EditAssignmentDialog
                                    assignment={assignment}
                                    teachers={allTeachers}
                                  />
                                  <DeleteAssignment
                                    assignmentId={assignment.id}
                                    assignmentDetails={`${
                                      assignment.standardName === "KG1" ||
                                      assignment.standardName === "KG2"
                                        ? assignment.standardName
                                        : `Std ${assignment.standardName}`
                                    } - ${assignment.className} - ${
                                      assignment.subject
                                    }`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-slate-600 text-slate-300"
                            >
                              <BookOpen className="h-3 w-3 mr-1" />
                              {teacher.assignments.length}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
