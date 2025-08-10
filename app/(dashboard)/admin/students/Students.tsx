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
import { ArrowLeft, Plus, Users, Loader2, Upload } from "lucide-react";
import Link from "next/link";
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

interface StudentsClientProps {
  admin: any;
}

export default function StudentsClient() {
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
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Students Management
                </h1>
                <p className="text-sm text-slate-400">
                  Manage student records across all standards and classes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 bg-transparent"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload Excel
            </Button>
            {selectedStudents.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Delete Selected ({selectedStudents.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Standards Tabs */}
        <Tabs
          value={activeStandard}
          onValueChange={setActiveStandard}
          className="w-full"
        >
          <div className="space-y-2 mb-6">
            {/* First row of standards */}
            <TabsList className="grid grid-cols-6 h-auto p-1 bg-slate-800/50 rounded-md">
              {standardsList.slice(0, 6).map((standard) => (
                <TabsTrigger
                  key={standard}
                  value={standard}
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 py-3"
                >
                  {standard === "KG1" || standard === "KG2"
                    ? standard
                    : `Std ${standard}`}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Second row of standards if needed */}
            {standardsList.slice(6).length > 0 && (
              <TabsList className="grid grid-cols-6 h-auto p-1 bg-slate-800/50 rounded-md">
                {standardsList.slice(6).map((standard) => (
                  <TabsTrigger
                    key={standard}
                    value={standard}
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300 py-3"
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
            <TabsContent key={standard} value={standard} className="mt-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-white">
                    {standard === "KG1" || standard === "KG2"
                      ? standard
                      : `Standard ${standard}`}
                  </h2>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Student
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Add New Student
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Enter student information. Enrollment number will be
                          auto-generated.
                        </DialogDescription>
                      </DialogHeader>
                      <form action={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-200">
                              GR Number *
                            </Label>
                            <Input
                              name="grNo"
                              placeholder="e.g., GR001"
                              className="bg-slate-800/50 border-slate-700 text-white"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-200">Standard *</Label>
                            <Select
                              name="standard"
                              required
                              onValueChange={(value) =>
                                setSelectedStandard(value as StandardKey)
                              }
                              defaultValue={standard}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-700">
                                {standardsList.map((std) => (
                                  <SelectItem
                                    key={std}
                                    value={std}
                                    className="text-white"
                                  >
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
                            <Label className="text-slate-200">
                              Roll Number
                            </Label>
                            <Input
                              name="rollNo"
                              type="number"
                              placeholder="Auto-generated if empty"
                              className="bg-slate-800/50 border-slate-700 text-white"
                              value={rollNoInput}
                              onChange={(e) => setRollNoInput(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-200">
                              Enrollment Number
                            </Label>
                            <div className="bg-slate-800/30 border border-slate-700 rounded-md px-3 py-2">
                              <span className="text-slate-300">
                                {enrollmentPreview || "Auto-generated"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-200">
                            Student Name *
                          </Label>
                          <Input
                            name="name"
                            placeholder="Full Name"
                            className="bg-slate-800/50 border-slate-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-200">Class *</Label>
                          <Select name="class" required>
                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {getClassesForStandard(
                                (selectedStandard || standard) as StandardKey
                              ).map((cls) => (
                                <SelectItem
                                  key={cls}
                                  value={cls}
                                  className="text-white"
                                >
                                  {cls}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-200">
                              Parent Name *
                            </Label>
                            <Input
                              name="parentName"
                              placeholder="Parent/Guardian Name"
                              className="bg-slate-800/50 border-slate-700 text-white"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-200">
                              Parent Phone *
                            </Label>
                            <Input
                              name="parentPhone"
                              placeholder="Phone Number"
                              className="bg-slate-800/50 border-slate-700 text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCreateOpen(false);
                              setSelectedStandard("");
                              setRollNoInput("");
                              setEnrollmentPreview("");
                            }}
                            className="border-slate-600 text-slate-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {loading && (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                  <TabsList className="bg-slate-800/50">
                    {getClassesForStandard(standard as StandardKey).map(
                      (className) => (
                        <TabsTrigger
                          key={className}
                          value={className}
                          className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300"
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
                        className="mt-4"
                      >
                        <Card className="bg-slate-900/50 border-slate-800">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              Students -{" "}
                              {standard === "KG1" || standard === "KG2"
                                ? standard
                                : `Standard ${standard}`}
                              , Class {className}
                              <Badge
                                variant="outline"
                                className="border-blue-600 text-blue-300 ml-2"
                              >
                                {
                                  getStudentsForClass(standard, className)
                                    .length
                                }{" "}
                                students
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isClassLoading(standard, className) ? (
                              <div className="flex justify-center items-center h-32">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                              </div>
                            ) : getStudentsForClass(standard, className)
                                .length > 0 ? (
                              <div className="rounded-lg border border-slate-800 overflow-hidden">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                      <TableHead className="w-12 text-slate-300">
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
                                          className="border-slate-600"
                                        />
                                      </TableHead>
                                      <TableHead className="text-slate-300 font-medium">
                                        Roll No
                                      </TableHead>
                                      <TableHead className="text-slate-300 font-medium">
                                        Name
                                      </TableHead>
                                      <TableHead className="text-slate-300 font-medium text-right">
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
                                        className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                                      >
                                        <TableCell>
                                          <Checkbox
                                            checked={selectedStudents.includes(
                                              student.id
                                            )}
                                            onCheckedChange={() =>
                                              handleStudentSelect(student.id)
                                            }
                                            className="border-slate-600"
                                          />
                                        </TableCell>
                                        <TableCell className="text-white font-medium">
                                          {student.rollNo}
                                        </TableCell>
                                        <TableCell className="text-white font-medium">
                                          {student.name}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex items-center justify-end gap-1">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditingStudent(student);
                                                setIsEditOpen(true);
                                              }}
                                              className="border-slate-600 text-slate-300 bg-transparent hover:bg-slate-800"
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
                              <div className="text-center py-12">
                                <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-white font-medium mb-2">
                                  No Students Found
                                </h3>
                                <p className="text-slate-400 mb-4">
                                  No students found in this class.
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsCreateOpen(true)}
                                  className="border-slate-600 text-slate-300 bg-transparent"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add First Student
                                </Button>
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
          <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Student</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update student information. Enrollment number will be
                regenerated if needed.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">GR Number *</Label>
                  <Input
                    name="grNo"
                    defaultValue={editingStudent?.grNo}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Standard *</Label>
                  <Select
                    name="standard"
                    defaultValue={editingStudent?.standard}
                    required
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Roll Number *</Label>
                  <Input
                    name="rollNo"
                    type="number"
                    defaultValue={editingStudent?.rollNo}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">
                    Current Enrollment No
                  </Label>
                  <div className="bg-slate-800/30 border border-slate-700 rounded-md px-3 py-2">
                    <span className="text-slate-300">
                      {editingStudent?.enrollmentNo}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Student Name *</Label>
                <Input
                  name="name"
                  defaultValue={editingStudent?.name}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Class *</Label>
                <Select
                  name="class"
                  defaultValue={editingStudent?.class}
                  required
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {editingStudent?.standard &&
                      getClassesForStandard(
                        editingStudent.standard as StandardKey
                      ).map((cls) => (
                        <SelectItem
                          key={cls}
                          value={cls}
                          className="text-white"
                        >
                          {cls}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-200">Parent Name *</Label>
                  <Input
                    name="parentName"
                    defaultValue={editingStudent?.parentName}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Parent Phone *</Label>
                  <Input
                    name="parentPhone"
                    defaultValue={editingStudent?.parentPhone}
                    className="bg-slate-800/50 border-slate-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Status</Label>
                <Select
                  name="status"
                  defaultValue={editingStudent?.status || "ACTIVE"}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="ACTIVE" className="text-white">
                      Active
                    </SelectItem>
                    <SelectItem value="INACTIVE" className="text-white">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingStudent(null);
                  }}
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
