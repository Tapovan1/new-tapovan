"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Loader2, Users, GraduationCap, BookOpen } from "lucide-react";
import { updateAssignment } from "@/lib/actions/teacher-assignment.action";
import {
  getStandardsList,
  getClassesForStandard,
  getSubjectsForStandard,
  type StandardKey,
} from "@/lib/constants/index";
import { useRouter } from "next/navigation";

interface Assignment {
  id: string;
  teacherId: string;
  standardName: string;
  className: string;
  subject: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface EditAssignmentDialogProps {
  assignment: Assignment;
  teachers: Teacher[];
}

export default function EditAssignmentDialog({
  assignment,
  teachers,
}: EditAssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<StandardKey>(
    assignment.standardName as StandardKey
  );
  const [selectedClass, setSelectedClass] = useState(assignment.className);
  const [selectedSubject, setSelectedSubject] = useState(assignment.subject);
  const [selectedTeacher, setSelectedTeacher] = useState(assignment.teacherId);
  const router = useRouter();

  const updateAssignmentAction = async (prevState: any, formData: FormData) => {
    const assignmentId = formData.get("assignmentId") as string;
    const teacherId = formData.get("teacherId") as string;
    const standardName = formData.get("standardName") as string;
    const className = formData.get("className") as string;
    const subject = formData.get("subject") as string;

    const result = await updateAssignment(assignmentId, {
      teacherId,
      standardNo: standardName, // Using standardName as standardNo
      standardName,
      className,
      subject,
    });

    if (result.success) {
      setIsOpen(false);
      // Refresh server data without full page reload
      setTimeout(() => {
        router.refresh();
      }, 100);
    }

    return result;
  };

  const [state, action, isPending] = useActionState(
    updateAssignmentAction,
    null
  );

  const availableClasses = selectedStandard
    ? getClassesForStandard(selectedStandard)
    : [];
  const availableSubjects = selectedStandard
    ? getSubjectsForStandard(selectedStandard)
    : [];
  const standardsList = getStandardsList();

  const selectedTeacherData = teachers.find((t) => t.id === selectedTeacher);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl border-0 bg-card/95 backdrop-blur-sm shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-xl">
                Edit Assignment
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update assignment details for{" "}
                {teachers.find((t) => t.id === assignment.teacherId)?.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form action={action} className="space-y-6 mt-6">
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Teacher
              </Label>
              <Select
                name="teacherId"
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
                required
              >
                <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
                  {teachers.map((teacher) => (
                    <SelectItem
                      key={teacher.id}
                      value={teacher.id}
                      className="focus:bg-muted/50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold text-xs">
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {teacher.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {teacher.email}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Standard
              </Label>
              <Select
                name="standardName"
                value={selectedStandard}
                onValueChange={(value: StandardKey) => {
                  setSelectedStandard(value);
                  setSelectedClass("");
                  setSelectedSubject("");
                }}
                required
              >
                <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
                  {standardsList.map((standard) => (
                    <SelectItem
                      key={standard}
                      value={standard}
                      className="focus:bg-muted/50 cursor-pointer"
                    >
                      {standard === "KG1" || standard === "KG2"
                        ? standard
                        : `Standard ${standard}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-foreground font-medium">Class</Label>
              <Select
                name="className"
                value={selectedClass}
                onValueChange={setSelectedClass}
                required
              >
                <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
                  {availableClasses.map((cls) => (
                    <SelectItem
                      key={cls}
                      value={cls}
                      className="focus:bg-muted/50 cursor-pointer"
                    >
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Subject
              </Label>
              <Select
                name="subject"
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!selectedStandard}
                required
              >
                <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50 disabled:opacity-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
                  {availableSubjects.map((subject) => (
                    <SelectItem
                      key={subject}
                      value={subject}
                      className="focus:bg-muted/50 cursor-pointer"
                    >
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment Summary */}
          {selectedTeacher &&
            selectedStandard &&
            selectedClass &&
            selectedSubject && (
              <div className="bg-muted/30 border border-border/30 rounded-lg p-4">
                <h4 className="text-foreground font-medium mb-3 flex items-center gap-2">
                  <Edit className="h-4 w-4 text-primary" />
                  Updated Assignment
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teacher:</span>
                    <span className="text-foreground font-medium">
                      {selectedTeacherData?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standard:</span>
                    <span className="text-foreground font-medium">
                      {selectedStandard === "KG1" || selectedStandard === "KG2"
                        ? selectedStandard
                        : `Standard ${selectedStandard}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class:</span>
                    <span className="text-foreground font-medium">
                      {selectedClass}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="text-foreground font-medium">
                      {selectedSubject}
                    </span>
                  </div>
                </div>
              </div>
            )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Assignment"
              )}
            </Button>
          </div>
        </form>
        {state?.error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{state.error}</p>
          </div>
        )}
        {state?.success && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm">
              Assignment updated successfully!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
