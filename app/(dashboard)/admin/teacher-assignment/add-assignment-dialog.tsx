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
import { Plus, Loader2 } from "lucide-react";
import { createAssignment } from "@/lib/actions/teacher-assignment.action";
import {
  getStandardsList,
  getClassesForStandard,
  getSubjectsForStandard,
  type StandardKey,
} from "@/lib/constants/index";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface AddAssignmentDialogProps {
  teachers: Teacher[];
}

export default function AddAssignmentDialog({
  teachers,
}: AddAssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState<StandardKey | "">(
    ""
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);

  const addAssignmentAction = async (prevState: any, formData: FormData) => {
    const teacherId = formData.get("teacherId") as string;
    const standardName = formData.get("standardName") as string;
    const className = formData.get("className") as string;
    const subject = formData.get("subject") as string;

    const result = await createAssignment({
      teacherId,
      standardNo: standardName, // Using standardName as standardNo since your structure uses string keys
      standardName,
      className,
      subject,
    });

    if (result.success) {
      setIsOpen(false);
      resetForm();
      window.location.reload();
    }

    return result;
  };

  const [state, action, isPending] = useActionState(addAssignmentAction, null);

  const resetForm = () => {
    setSelectedStandard("");
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedTeacher("");
    setIsClassTeacher(false);
  };

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
        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            Create New Assignment
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Assign a teacher to specific standard, class, and subject
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
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
                  <SelectValue placeholder="Select teacher" />
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
                  <SelectValue placeholder="Select standard" />
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
                disabled={!selectedStandard}
                required
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select class" />
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
                  <SelectValue placeholder="Select subject" />
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
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
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
                  Creating...
                </>
              ) : (
                "Create Assignment"
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
