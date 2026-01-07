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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import AddAssignmentDialog from "./add-assignment-dialog";
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

const ITEMS_PER_PAGE = 10;

export default function TeacherAssignments({
  groupedTeachers,
  allTeachers,
}: TeacherAssignmentsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStandard, setFilterStandard] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Clear expanded rows when data changes (after router.refresh())
  useEffect(() => {
    setExpandedRows(new Set());
  }, [groupedTeachers]);

  // Toggle row expansion
  const toggleRow = (teacherId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(teacherId)) {
      newExpanded.delete(teacherId);
    } else {
      newExpanded.add(teacherId);
    }
    setExpandedRows(newExpanded);
  };

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

  // Pagination
  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const standardsList = getStandardsList();
  const allSubjects = getAllSubjects();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <BookOpen className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Teacher Assignments
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage class and subject assignments
              </p>
            </div>
          </div>
          <AddAssignmentDialog teachers={allTeachers} />
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                  <p className="text-2xl font-bold text-foreground">{groupedTeachers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold text-foreground">
                    {groupedTeachers.reduce((sum, t) => sum + t.totalAssignments, 0)}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Class Teachers</p>
                  <p className="text-2xl font-bold text-foreground">
                    {groupedTeachers.filter(t => t.classTeacherAssignments.length > 0).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Search and Filters */}
        <Card className="border-0 bg-card shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Teachers</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name or email..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleFilterChange();
                    }}
                    className="pl-10 h-10 bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Standard</Label>
                <Select
                  value={filterStandard}
                  onValueChange={(value) => {
                    setFilterStandard(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-10 bg-background/50">
                    <SelectValue placeholder="All Standards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Standards</SelectItem>
                    {standardsList.map((standard) => (
                      <SelectItem key={standard} value={standard}>
                        {standard === "KG1" || standard === "KG2"
                          ? standard
                          : `Standard ${standard}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subject</Label>
                <Select
                  value={filterSubject}
                  onValueChange={(value) => {
                    setFilterSubject(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-10 bg-background/50">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {allSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Results</Label>
                <div className="bg-muted/50 border rounded-lg px-4 h-10 flex items-center">
                  <span className="text-foreground font-semibold">
                    {filteredTeachers.length}
                  </span>
                  <span className="text-muted-foreground text-sm ml-1">
                    {filteredTeachers.length === 1 ? "teacher" : "teachers"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teacher Assignments Table */}
        <Card className="border-0 bg-card shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teachers ({filteredTeachers.length})
              </CardTitle>
              {totalPages > 1 && (
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 bg-muted/30">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold">Teacher</TableHead>
                    <TableHead className="font-semibold text-center">Assignments</TableHead>
                    {/* <TableHead className="font-semibold">Class Teacher</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTeachers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">
                              No teachers found
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              Try adjusting your search criteria
                            </p>
                          </div>
                          {(searchTerm || filterStandard !== "all" || filterSubject !== "all") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterStandard("all");
                                setFilterSubject("all");
                                handleFilterChange();
                              }}
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTeachers.map((teacher) => {
                      const isExpanded = expandedRows.has(teacher.id);
                      return (
                        <>
                          <TableRow
                            key={teacher.id}
                            className="border-border/30 hover:bg-muted/20 transition-colors cursor-pointer"
                            onClick={() => toggleRow(teacher.id)}
                          >
                            <TableCell className="text-center">
                              {teacher.assignments.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm">
                                  <span className="text-primary-foreground font-semibold text-xs">
                                    {teacher.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground text-sm">
                                    {teacher.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {teacher.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-semibold">
                                {teacher.totalAssignments}
                              </Badge>
                            </TableCell>
                            {/* <TableCell>
                              {teacher.classTeacherAssignments.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {teacher.classTeacherAssignments.map((assignment) => (
                                    <Badge
                                      key={assignment.id}
                                      className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs"
                                    >
                                      <Award className="h-3 w-3 mr-1" />
                                      {assignment.standardName === "KG1" ||
                                      assignment.standardName === "KG2"
                                        ? assignment.standardName
                                        : `Std ${assignment.standardName}`}{" "}
                                      {assignment.className}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell> */}
                          </TableRow>
                          {isExpanded && teacher.assignments.length > 0 && (
                            <TableRow key={`${teacher.id}-expanded`}>
                              <TableCell colSpan={4} className="bg-muted/10 p-4">
                                <div className="space-y-2">
                                  <p className="text-sm font-semibold text-foreground mb-3">
                                    All Assignments ({teacher.assignments.length})
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {teacher.assignments.map((assignment) => (
                                      <div
                                        key={assignment.id}
                                        className="flex items-center justify-between bg-background p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                                      >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                          <Badge
                                            variant="outline"
                                            className="text-xs shrink-0"
                                          >
                                            {assignment.standardName === "KG1" ||
                                            assignment.standardName === "KG2"
                                              ? assignment.standardName
                                              : `Std ${assignment.standardName}`}
                                          </Badge>
                                          <span className="text-sm font-medium truncate">
                                            {assignment.className}
                                          </span>
                                          <span className="text-muted-foreground text-xs">•</span>
                                          <span className="text-sm text-primary font-medium truncate">
                                            {assignment.subject}
                                          </span>
                                          {assignment.isClassTeacher && (
                                            <Award className="h-3 w-3 text-emerald-500 shrink-0" />
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 shrink-0">
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
                                            } - ${assignment.className} - ${assignment.subject}`}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/50 px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of{" "}
                  {filteredTeachers.length} teachers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <>
                            {showEllipsis && (
                              <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                                ...
                              </span>
                            )}
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          </>
                        );
                      })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
