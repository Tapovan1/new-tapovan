"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserX, Trash2, Loader2, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_FACE_API_URL || "http://localhost:8000";

interface UnenrollResponse {
  success: boolean;
  message: string;
  teacher_id: string;
}

export default function FaceUnenrollment() {
  const [teacherId, setTeacherId] = useState("");
  const [unenrolling, setUnenrolling] = useState(false);
  const [result, setResult] = useState<UnenrollResponse | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleUnenrollClick = () => {
    if (!teacherId.trim()) {
      toast.error("Please enter a teacher ID");
      return;
    }
    setShowConfirmDialog(true);
  };

  const unenrollFace = async () => {
    setShowConfirmDialog(false);
    setUnenrolling(true);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/face/unenroll/${encodeURIComponent(teacherId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to unenroll face");
      }

      const data: UnenrollResponse = await response.json();
      setResult(data);
      toast.success("Face unenrolled successfully!");
      
      // Reset form
      setTeacherId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to unenroll face. Please check the teacher ID.");
      console.error(error);
    } finally {
      setUnenrolling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Face Unenrollment
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Remove face registration from the system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning Alert */}
          <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Warning:</strong> This action will permanently delete the face embedding for this teacher ID. 
              You will need to re-enroll to use face verification again.
            </AlertDescription>
          </Alert>

          {/* Teacher ID Input */}
          <div className="space-y-2">
            <Label htmlFor="unenrollTeacherId" className="text-slate-900 dark:text-white font-medium">
              Teacher ID
            </Label>
            <Input
              id="unenrollTeacherId"
              type="text"
              placeholder="Enter teacher ID to remove (e.g., TEACH001)"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Enter the exact teacher ID that was used during enrollment
            </p>
          </div>

          {/* Unenroll Button */}
          <Button
            onClick={handleUnenrollClick}
            disabled={unenrolling || !teacherId.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-600/25"
          >
            {unenrolling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removing Face...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Unenroll Face
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className="p-6 rounded-xl border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    ✓ Face Unenrolled Successfully!
                  </h3>
                  <p className="text-green-800 dark:text-green-200">
                    {result.message}
                  </p>
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Removed Teacher ID:</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{result.teacher_id}</p>
                  </div>
                  <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      The face embedding has been deleted. To use face verification again, you'll need to re-enroll in the "Enroll" tab.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">ℹ️ What Happens:</h4>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>The face embedding associated with this teacher ID will be permanently deleted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>You will no longer be able to login using face verification with this ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>This action cannot be undone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>You can re-enroll the same teacher ID with a new face image if needed</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              Confirm Face Unenrollment
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-300">
              Are you sure you want to remove the face registration for teacher ID <strong className="text-slate-900 dark:text-white">{teacherId}</strong>?
              <br /><br />
              This will permanently delete the face embedding and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={unenrollFace}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
            >
              Yes, Remove Face
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
