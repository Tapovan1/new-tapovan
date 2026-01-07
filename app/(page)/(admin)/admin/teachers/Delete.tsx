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
      size="icon"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
