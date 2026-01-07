"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteAssignment } from "@/lib/actions/teacher-assignment.action"
import { useRouter } from "next/navigation"

interface DeleteAssignmentProps {
  assignmentId: string
  assignmentDetails: string
}

export default function DeleteAssignment({ assignmentId, assignmentDetails }: DeleteAssignmentProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this assignment: ${assignmentDetails}?`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteAssignment(assignmentId)
      if (result.success) {
        // Refresh server data without full page reload
        router.refresh()
      } else {
        alert(result.error || "Failed to delete assignment")
      }
    })
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:bg-red-500/20"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
    </Button>
  )
}
