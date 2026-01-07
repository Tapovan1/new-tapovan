"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCheck, Upload, Loader2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_FACE_API_URL || "http://localhost:8000";

interface VerifyFaceResponse {
  success: boolean;
  match: boolean;
  teacher_id: string | null;
  score: number | null;
  message: string;
}

export default function FaceVerification() {
  const [challengeId, setChallengeId] = useState("");
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyFaceResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceImage(file);
      toast.success("Face image selected");
    }
  };

  const verifyFace = async () => {
    if (!challengeId.trim()) {
      toast.error("Please enter a liveness challenge ID");
      return;
    }

    if (!faceImage) {
      toast.error("Please upload a face image");
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("liveness_challenge_id", challengeId);
      formData.append("image", faceImage);

      const response = await fetch(`${API_BASE_URL}/face/verify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to verify face");
      }

      const data: VerifyFaceResponse = await response.json();
      setResult(data);

      if (data.match) {
        toast.success(`Face verified! Teacher ID: ${data.teacher_id}`);
      } else {
        toast.error("No matching face found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify face. Make sure you completed liveness verification first.");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Face Verification (Login)
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Verify your face after completing liveness check
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Important Notice */}
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Important:</strong> You must complete liveness verification first and use the challenge ID from a successful liveness check.
            </AlertDescription>
          </Alert>

          {/* Challenge ID Input */}
          <div className="space-y-2">
            <Label htmlFor="challengeId" className="text-slate-900 dark:text-white font-medium">
              Liveness Challenge ID
            </Label>
            <Input
              id="challengeId"
              type="text"
              placeholder="Enter challenge ID from successful liveness verification"
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Get this from the "Liveness" tab after successfully passing a liveness check
            </p>
          </div>

          {/* Face Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="faceImage" className="text-slate-900 dark:text-white font-medium">
              Face Image
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {faceImage ? faceImage.name : "Upload Face Image"}
            </Button>
            {faceImage && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(faceImage)}
                  alt="Preview"
                  className="w-full max-w-xs mx-auto rounded-xl border border-slate-300 dark:border-slate-600"
                />
              </div>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={verifyFace}
            disabled={verifying || !challengeId.trim() || !faceImage}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-600/25"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying Face...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Verify Face
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className={`p-6 rounded-xl border ${
              result.match
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-4">
                {result.match ? (
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="space-y-3 flex-1">
                  <h3 className={`text-lg font-bold ${
                    result.match
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  }`}>
                    {result.match ? "✓ Face Verified Successfully!" : "✗ Face Verification Failed"}
                  </h3>
                  <p className={result.match ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                    {result.message}
                  </p>
                  <div className="space-y-2">
                    {result.match && result.teacher_id && (
                      <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Teacher ID:</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{result.teacher_id}</p>
                      </div>
                    )}
                    {result.score !== null && (
                      <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Match Score:</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">
                          {(result.score * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                  {result.match && (
                    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Login successful! You can now access the system.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Workflow Guide */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Complete Workflow:</h4>
            <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                <span>Go to "Liveness" tab and get a challenge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                <span>Upload frames or video showing you performing the challenge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                <span>Verify liveness and get the challenge ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                <span>Come back here and enter the challenge ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">5.</span>
                <span>Upload your face image and verify</span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
