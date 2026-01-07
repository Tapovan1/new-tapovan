"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";
import SimpleFaceLogin from "./Simple-Face-Login";

interface FaceLoginDialogProps {
  onSuccess: (teacherId: string) => Promise<void>;
}

export default function FaceLoginDialog({ onSuccess }: FaceLoginDialogProps) {
  const [open, setOpen] = useState(false);

  const handleVerifySuccess = async (teacherId: string) => {
    console.log("✅ Face verified! Teacher ID:", teacherId);
    
    try {
      await onSuccess(teacherId);
      // Dialog will close and page will redirect via session
      setOpen(false);
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 font-medium transition-all duration-200"
      >
        <Scan className="w-5 h-5 mr-3" />
        Sign In with Face
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Face Authentication</DialogTitle>
            <DialogDescription className="text-center">
              Position your face in the circle and blink when prompted
            </DialogDescription>
          </DialogHeader>
          
          <SimpleFaceLogin onSuccess={handleVerifySuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
