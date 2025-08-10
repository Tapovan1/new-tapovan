"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTeacher } from "@/lib/actions/teacher.action";

interface DeleteTeacherProps {
  teacherId: string;
  teacherName: string;
}

export default function DeleteTeacher({
  teacherId,
  teacherName,
}: DeleteTeacherProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${teacherName}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTeacher(teacherId);
    });
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:bg-red-500/20"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
