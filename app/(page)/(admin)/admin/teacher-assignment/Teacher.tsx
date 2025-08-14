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
  Users,
  Search,
  Award,
  BookOpen,
  UserCheck,
  Filter,
} from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserCheck className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <BookOpen className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Teacher Assignments
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage teacher class and subject assignments across all
                  standards
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <AddAssignmentDialog teachers={allTeachers} />
            {/* <BulkAssignmentDialog teachers={allTeachers} /> */}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Find teachers and filter by standards or subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Search Teachers
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Standard</Label>
                <Select
                  value={filterStandard}
                  onValueChange={setFilterStandard}
                >
                  <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="All Standards" />
                  </SelectTrigger>
                  <SelectContent className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
                    <SelectItem value="all" className="focus:bg-muted/50">
                      All Standards
                    </SelectItem>
                    {standardsList.map((standard) => (
                      <SelectItem
                        key={standard}
                        value={standard}
                        className="focus:bg-muted/50"
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
                <Label className="text-foreground font-medium">Subject</Label>
                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
                    <SelectItem value="all" className="focus:bg-muted/50">
                      All Subjects
                    </SelectItem>
                    {allSubjects.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="focus:bg-muted/50"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Results</Label>
                <div className="bg-muted/50 border border-border/50 rounded-lg px-4 py-2.5 h-11 flex items-center">
                  <span className="text-foreground font-semibold">
                    {filteredTeachers.length}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {filteredTeachers.length === 1 ? "teacher" : "teachers"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Assignments Overview */}
        <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Teacher Assignments Overview ({filteredTeachers.length} Teachers)
            </CardTitle>
            <CardDescription>
              All teachers with their complete assignment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground font-semibold">
                      Teacher
                    </TableHead>

                    <TableHead className="text-muted-foreground font-semibold">
                      Class Teacher Of
                    </TableHead>
                    <TableHead className="text-muted-foreground font-semibold">
                      All Assignments
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                            <Users className="h-10 w-10 text-muted-foreground/50" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-lg font-medium">
                              {searchTerm ||
                              filterStandard !== "all" ||
                              filterSubject !== "all"
                                ? "No teachers found matching the filters"
                                : "No teachers found"}
                            </p>
                            <p className="text-muted-foreground/70 text-sm mt-1">
                              {searchTerm ||
                              filterStandard !== "all" ||
                              filterSubject !== "all"
                                ? "Try adjusting your search criteria"
                                : "Add teacher assignments to get started"}
                            </p>
                          </div>
                          {(searchTerm ||
                            filterStandard !== "all" ||
                            filterSubject !== "all") && (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterStandard("all");
                                setFilterSubject("all");
                              }}
                              className="mt-2"
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <TableRow
                        key={teacher.id}
                        className="border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-foreground font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md">
                              <span className="text-primary-foreground font-semibold text-sm">
                                {teacher.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">
                                {teacher.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-foreground">
                          <div className="space-y-1">
                            {teacher.assignments.length === 0 ? (
                              <span className="text-muted-foreground text-sm">
                                None
                              </span>
                            ) : (
                              teacher.assignments.map((assignment) => (
                                <Badge
                                  key={assignment.id}
                                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20 mr-1 mb-1"
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
                        <TableCell className="text-foreground">
                          <div className="space-y-2 max-w-md">
                            {teacher.assignments.map((assignment) => (
                              <div
                                key={assignment.id}
                                className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/30"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="outline"
                                    className="border-border/50 text-muted-foreground text-xs"
                                  >
                                    {assignment.standardName === "KG1" ||
                                    assignment.standardName === "KG2"
                                      ? assignment.standardName
                                      : `Std ${assignment.standardName}`}
                                  </Badge>
                                  <span className="text-foreground font-medium">
                                    {assignment.className}
                                  </span>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-primary font-medium">
                                    {assignment.subject}
                                  </span>
                                  {assignment.isClassTeacher && (
                                    <Award className="h-3 w-3 text-emerald-500" />
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
