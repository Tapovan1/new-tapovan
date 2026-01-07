"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, UserPlus } from "lucide-react";
import AutomatedFaceVerify from "./automated-face-verify";
import FaceEnrollment from "./face-enrollment";

export default function FaceVerifyClient() {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                Face Verification System
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Automated verification with liveness detection
              </p>
            </div>
            
            {/* Enroll Button */}
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/25">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll New Face
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-white">Face Enrollment</DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-300">
                    Register your face for the first time
                  </DialogDescription>
                </DialogHeader>
                <FaceEnrollment />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <AutomatedFaceVerify />
      </main>
    </div>
  );
}
