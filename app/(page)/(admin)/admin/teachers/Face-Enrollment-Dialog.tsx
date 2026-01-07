"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX } from "lucide-react";
import FaceEnrollment from "@/components/face-verify/face-enrollment";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FaceEnrollmentDialogProps {
  teacherId: string;
  teacherName: string;
  isFaceRegistered: boolean;
}

export default function FaceEnrollmentDialog({
  teacherId,
  teacherName,
  isFaceRegistered,
}: FaceEnrollmentDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleEnrollmentSuccess = async () => {
    console.log("✅ Face enrollment successful for teacher:", teacherId);
    
    // Update teacher's Isface field
    try {
      const response = await fetch("/api/teachers/update-face-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, isFaceRegistered: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to update face status");
      }

      toast.success("Face registered successfully!");
      setOpen(false);
      router.refresh(); // Refresh to show updated status
    } catch (error) {
      console.error("Error updating face status:", error);
      toast.error("Face enrolled but status update failed. Please refresh the page.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${
            isFaceRegistered
              ? "text-green-600 hover:text-green-700 hover:bg-green-50"
              : "text-red-600 hover:text-red-700 hover:bg-red-50"
          }`}
          title={isFaceRegistered ? "Face registered" : "Register face"}
        >
          {isFaceRegistered ? (
            <UserCheck className="h-5 w-5" />
          ) : (
            <UserX className="h-5 w-5" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isFaceRegistered ? "Update" : "Register"} Face - {teacherName}
          </DialogTitle>
          <DialogDescription>
            {isFaceRegistered
              ? "Update the face registration for this teacher"
              : "Register face for biometric authentication"}
          </DialogDescription>
        </DialogHeader>
        <FaceEnrollment
          defaultTeacherId={teacherId}
          onSuccess={handleEnrollmentSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
