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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Loader2 } from "lucide-react";
import { updateAssignment } from "@/lib/actions/teacher-assignment.action";
import {
  getStandardsList,
  getClassesForStandard,
  getSubjectsForStandard,
  type StandardKey,
} from "@/lib/constants/index";

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
      window.location.reload();
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-green-400 hover:bg-green-500/20"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Assignment</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update assignment details
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200">Teacher</Label>
              <Select
                name="teacherId"
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
                required
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {teachers.map((teacher) => (
                    <SelectItem
                      key={teacher.id}
                      value={teacher.id}
                      className="text-white"
                    >
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Standard</Label>
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
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
            <div className="space-y-2">
              <Label className="text-slate-200">Class</Label>
              <Select
                name="className"
                value={selectedClass}
                onValueChange={setSelectedClass}
                required
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {availableClasses.map((cls) => (
                    <SelectItem key={cls} value={cls} className="text-white">
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-200">Subject</Label>
              <Select
                name="subject"
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={!selectedStandard}
                required
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {availableSubjects.map((subject) => (
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
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-slate-600 text-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
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
          <p className="text-red-400 text-sm mt-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-green-400 text-sm mt-2">{state.message}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
