"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Users,
  Loader2,
  GraduationCap,
  FileSpreadsheet,
} from "lucide-react";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  getEnrollmentPreview,
  getStudentsByStandardAndClass,
} from "@/lib/actions/student.action";
import {
  getStandardsList,
  getClassesForStandard,
  type StandardKey,
} from "@/lib/constants/index";
import Link from "next/link";

interface StudentsClientProps {
  admin?: any;
}

export default function StudentsClient({ admin }: StudentsClientProps) {
  // State management
  const [allStudents, setAllStudents] = useState<
    Record<string, Record<string, any[]>>
  >({});
  const [activeStandard, setActiveStandard] = useState("1");
  const [activeClass, setActiveClass] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStandards, setLoadingStandards] = useState<
    Record<string, boolean>
  >({});
  const [enrollmentPreview, setEnrollmentPreview] = useState("");
  const [selectedStandard, setSelectedStandard] = useState<StandardKey | "">(
    ""
  );
  const [rollNoInput, setRollNoInput] = useState("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  const standardsList = getStandardsList();

  // Set initial active class when standard changes
  useEffect(() => {
    const classes = getClassesForStandard(activeStandard as StandardKey);
    if (classes.length > 0 && !activeClass) {
      setActiveClass(classes[0]);
    }
  }, [activeStandard, activeClass]);

  // Update available classes when selected standard changes (for create form)
  useEffect(() => {
    if (selectedStandard) {
      setAvailableClasses(getClassesForStandard(selectedStandard));
    } else {
      setAvailableClasses([]);
    }
  }, [selectedStandard]);

  // Update enrollment preview when standard or roll number changes
  useEffect(() => {
    if (selectedStandard && rollNoInput) {
      const rollNo = Number.parseInt(rollNoInput);
      if (!isNaN(rollNo)) {
        getEnrollmentPreview(selectedStandard, rollNo).then(
          setEnrollmentPreview
        );
      }
    } else {
      setEnrollmentPreview("");
    }
  }, [selectedStandard, rollNoInput]);

  // Fetch students for a specific standard and class
  const fetchStudentsForClass = async (standard: string, className: string) => {
    const key = `${standard}-${className}`;
    setLoadingStandards((prev) => ({ ...prev, [key]: true }));

    try {
      const students = await getStudentsByStandardAndClass(standard, className);
      setAllStudents((prev) => ({
        ...prev,
        [standard]: {
          ...prev[standard],
          [className]: students,
        },
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoadingStandards((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Load students when active standard or class changes
  useEffect(() => {
    if (activeStandard && activeClass) {
      if (!allStudents[activeStandard]?.[activeClass]) {
        fetchStudentsForClass(activeStandard, activeClass);
      }
    }
  }, [activeStandard, activeClass]);

  // Load students for all classes when standard tab changes
  useEffect(() => {
    const classes = getClassesForStandard(activeStandard as StandardKey);
    classes.forEach((className) => {
      if (!allStudents[activeStandard]?.[className]) {
        fetchStudentsForClass(activeStandard, className);
      }
    });
  }, [activeStandard]);

  const getStudentsForClass = (standard: string, className: string) => {
    return allStudents[standard]?.[className] || [];
  };

  const isClassLoading = (standard: string, className: string) => {
    const key = `${standard}-${className}`;
    return loadingStandards[key] || false;
  };

  const handleCreate = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await createStudent(formData);
      if (result.success) {
        setIsCreateOpen(false);
        setSelectedStandard("");
        setRollNoInput("");
        setEnrollmentPreview("");
        setAvailableClasses([]);
        // Refresh the students data for the added class
        const standard = formData.get("standard") as string;
        const className = formData.get("class") as string;
        await fetchStudentsForClass(standard, className);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!editingStudent) return;

    setLoading(true);
    try {
      const result = await updateStudent(editingStudent.id, formData);
      if (result.success) {
        setIsEditOpen(false);
        setEditingStudent(null);
        // Refresh the students data
        const standard = formData.get("standard") as string;
        const className = formData.get("class") as string;
        await fetchStudentsForClass(standard, className);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    studentId: string,
    standard: string,
    className: string
  ) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    setLoading(true);
    try {
      const result = await deleteStudent(studentId);
      if (result.success) {
        await fetchStudentsForClass(standard, className);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllInClass = (
    standard: string,
    className: string,
    checked: boolean
  ) => {
    const classStudentIds = getStudentsForClass(standard, className).map(
      (s: any) => s.id
    );
    if (checked) {
      setSelectedStudents((prev) => [
        ...new Set([...prev, ...classStudentIds]),
      ]);
    } else {
      setSelectedStudents((prev) =>
        prev.filter((id) => !classStudentIds.includes(id))
      );
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedStudents.length} student(s)?`
      )
    )
      return;

    setLoading(true);
    try {
      // Delete each student individually (you can optimize this with a bulk delete API)
      for (const studentId of selectedStudents) {
        await deleteStudent(studentId);
      }
      setSelectedStudents([]);
      // Refresh all loaded classes
      Object.keys(allStudents).forEach((standard) => {
        Object.keys(allStudents[standard]).forEach((className) => {
          fetchStudentsForClass(standard, className);
        });
      });
    } catch (error) {
      alert("Error deleting students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Students Management
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage student records across all standards and classes
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/bulk-import">
                <Button className="gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Bulk Upload Excel
                </Button>
              </Link>
              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Delete Selected ({selectedStudents.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Standards Tabs */}
        <Tabs
          value={activeStandard}
          onValueChange={setActiveStandard}
          className="w-full"
        >
          <div className="space-y-3 mb-8">
            {/* First row of standards */}
            <TabsList className="grid grid-cols-6 h-auto p-1 bg-muted/50 rounded-lg">
              {standardsList.slice(0, 6).map((standard) => (
                <TabsTrigger
                  key={standard}
                  value={standard}
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground py-3 px-4 rounded-md font-medium transition-all"
                >
                  {standard === "KG1" || standard === "KG2"
                    ? standard
                    : `Std ${standard}`}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Second row of standards if needed */}
            {standardsList.slice(6).length > 0 && (
              <TabsList className="grid grid-cols-6 h-auto p-1 bg-muted/50 rounded-lg">
                {standardsList.slice(6).map((standard) => (
                  <TabsTrigger
                    key={standard}
                    value={standard}
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground py-3 px-4 rounded-md font-medium transition-all"
                  >
                    {standard === "KG1" || standard === "KG2"
                      ? standard
                      : `Std ${standard}`}
                  </TabsTrigger>
                ))}
                {/* Fill empty slots */}
                {Array.from({ length: 6 - standardsList.slice(6).length }).map(
                  (_, index) => (
                    <div key={`empty-${index}`} className="invisible"></div>
                  )
                )}
              </TabsList>
            )}
          </div>

          {/* Standard Content */}
          {standardsList.map((standard) => (
            <TabsContent key={standard} value={standard} className="mt-8">
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      {standard === "KG1" || standard === "KG2"
                        ? standard
                        : `Standard ${standard}`}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      Manage students in this standard
                    </p>
                  </div>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Add New Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>
                          Enter student information. Enrollment number will be
                          auto-generated.
                        </DialogDescription>
                      </DialogHeader>
                      <form action={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>GR Number *</Label>
                            <Input
                              name="grNo"
                              placeholder="e.g., GR001"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Standard *</Label>
                            <Select
                              name="standard"
                              required
                              onValueChange={(value) =>
                                setSelectedStandard(value as StandardKey)
                              }
                              defaultValue=""
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Standard" />
                              </SelectTrigger>
                              <SelectContent>
                                {standardsList.map((std) => (
                                  <SelectItem key={std} value={std}>
                                    {std === "KG1" || std === "KG2"
                                      ? std
                                      : `Standard ${std}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Roll Number</Label>
                            <Input
                              name="rollNo"
                              type="number"
                              placeholder="Auto-generated if empty"
                              value={rollNoInput}
                              onChange={(e) => setRollNoInput(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Enrollment Number</Label>
                            <div className="bg-muted/50 border rounded-md px-3 py-2">
                              <span className="text-muted-foreground">
                                {enrollmentPreview || "Auto-generated"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Student Name *</Label>
                          <Input name="name" placeholder="Full Name" required />
                        </div>

                        <div className="space-y-2">
                          <Label>Class *</Label>
                          <Select name="class" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent>
                              {getClassesForStandard(
                                (selectedStandard || standard) as StandardKey
                              ).map((cls) => (
                                <SelectItem key={cls} value={cls}>
                                  Class {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCreateOpen(false);
                              setSelectedStandard("");
                              setRollNoInput("");
                              setEnrollmentPreview("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="gap-2"
                          >
                            {loading && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            Add Student
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Classes Tabs */}
                <Tabs
                  value={activeClass}
                  onValueChange={setActiveClass}
                  defaultValue={
                    getClassesForStandard(standard as StandardKey)[0]
                  }
                  className="w-full"
                >
                  <TabsList className="bg-muted/50 p-1 rounded-lg">
                    {getClassesForStandard(standard as StandardKey).map(
                      (className) => (
                        <TabsTrigger
                          key={className}
                          value={className}
                          className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-4 py-2 rounded-md font-medium transition-all"
                        >
                          Class {className}
                        </TabsTrigger>
                      )
                    )}
                  </TabsList>

                  {getClassesForStandard(standard as StandardKey).map(
                    (className) => (
                      <TabsContent
                        key={className}
                        value={className}
                        className="mt-6"
                      >
                        <Card className="shadow-sm">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                Students -{" "}
                                {standard === "KG1" || standard === "KG2"
                                  ? standard
                                  : `Standard ${standard}`}
                                , Class {className}
                              </CardTitle>
                              <Badge variant="secondary" className="px-3 py-1">
                                {
                                  getStudentsForClass(standard, className)
                                    .length
                                }{" "}
                                students
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {isClassLoading(standard, className) ? (
                              <div className="flex justify-center items-center h-32">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                  <span className="text-muted-foreground">
                                    Loading students...
                                  </span>
                                </div>
                              </div>
                            ) : getStudentsForClass(standard, className)
                                .length > 0 ? (
                              <div className="rounded-lg border overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="hover:bg-muted/50">
                                      <TableHead className="w-12">
                                        <Checkbox
                                          checked={getStudentsForClass(
                                            standard,
                                            className
                                          ).every((s: any) =>
                                            selectedStudents.includes(s.id)
                                          )}
                                          onCheckedChange={(checked) =>
                                            handleSelectAllInClass(
                                              standard,
                                              className,
                                              checked as boolean
                                            )
                                          }
                                        />
                                      </TableHead>
                                      <TableHead className="font-semibold">
                                        GR No
                                      </TableHead>
                                      <TableHead className="font-semibold">
                                        Enrollment No
                                      </TableHead>
                                      <TableHead className="font-semibold">
                                        Roll No
                                      </TableHead>
                                      <TableHead className="font-semibold">
                                        Name
                                      </TableHead>
                                      <TableHead className="font-semibold text-right">
                                        Actions
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {getStudentsForClass(
                                      standard,
                                      className
                                    ).map((student: any) => (
                                      <TableRow
                                        key={student.id}
                                        className="hover:bg-muted/30 transition-colors"
                                      >
                                        <TableCell>
                                          <Checkbox
                                            checked={selectedStudents.includes(
                                              student.id
                                            )}
                                            onCheckedChange={() =>
                                              handleStudentSelect(student.id)
                                            }
                                          />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {student.grNo}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {student.enrollmentNo}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {student.rollNo}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                          {student.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditingStudent(student);
                                                setIsEditOpen(true);
                                              }}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() =>
                                                handleDelete(
                                                  student.id,
                                                  standard,
                                                  className
                                                )
                                              }
                                              disabled={loading}
                                            >
                                              {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                "Delete"
                                              )}
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="text-center py-16">
                                <div className="flex flex-col items-center gap-4">
                                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-foreground mb-2">
                                      No Students Found
                                    </h3>
                                    <p className="text-muted-foreground mb-6">
                                      No students found in this class. Add the
                                      first student to get started.
                                    </p>
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsCreateOpen(true)}
                                      className="gap-2"
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add First Student
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>
                    )
                  )}
                </Tabs>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student information. Enrollment number will be
                regenerated if needed.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GR Number *</Label>
                  <Input
                    name="grNo"
                    defaultValue={editingStudent?.grNo}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard *</Label>
                  <Select
                    name="standard"
                    defaultValue={editingStudent?.standard}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Roll Number *</Label>
                  <Input
                    name="rollNo"
                    type="number"
                    defaultValue={editingStudent?.rollNo}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Enrollment No</Label>
                  <div className="bg-muted/50 border rounded-md px-3 py-2">
                    <span className="text-muted-foreground">
                      {editingStudent?.enrollmentNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Student Name *</Label>
                <Input
                  name="name"
                  defaultValue={editingStudent?.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <Select
                  name="class"
                  defaultValue={editingStudent?.class}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editingStudent?.standard &&
                      getClassesForStandard(
                        editingStudent.standard as StandardKey
                      ).map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          Class {cls}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  name="status"
                  defaultValue={editingStudent?.status || "ACTIVE"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingStudent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
