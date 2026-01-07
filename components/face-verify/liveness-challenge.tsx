"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, RefreshCw, Upload, Video, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_FACE_API_URL || "http://localhost:8000";

interface Challenge {
  challenge_id: string;
  challenge: string;
  expires_at: string;
  instructions: string;
}

interface VerifyResponse {
  success: boolean;
  liveness_passed: boolean;
  message: string;
  challenge_id: string;
  confidence: number;
}

export default function LivenessChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [capturedFrames, setCapturedFrames] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<"frames" | "video">("frames");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Get new challenge
  const getChallenge = async () => {
    setLoading(true);
    setResult(null);
    setCapturedFrames([]);
    setVideoFile(null);
    
    try {
      console.log("challeneg hit...");
      
      const response = await fetch(`${API_BASE_URL}/liveness/challenge`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to get challenge");
      }

      const data: Challenge = await response.json();
      console.log("livemvess Data",data);
      console.log("id",data.challenge_id);
      
      
      setChallenge(data);
      toast.success("Challenge received! Complete the action within 10 seconds.");
    } catch (error) {
      toast.error("Failed to get challenge. Make sure the API server is running.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle frame upload
  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length < 3 || files.length > 5) {
      toast.error("Please upload 3-5 image frames");
      return;
    }
    setCapturedFrames(files);
    toast.success(`${files.length} frames selected`);
  };

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      toast.success("Video selected");
    }
  };

  // Verify liveness
  const verifyLiveness = async () => {
    if (!challenge) {
      toast.error("Please get a challenge first");
      return;
    }

    if (uploadMethod === "frames" && capturedFrames.length === 0) {
      toast.error("Please upload 3-5 image frames");
      return;
    }

    if (uploadMethod === "video" && !videoFile) {
      toast.error("Please upload a video");
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("challenge_id", challenge.challenge_id);
      console.log("challenge_id", challenge.challenge_id);
      

      if (uploadMethod === "frames") {
        capturedFrames.forEach((frame) => {
          formData.append("frames", frame);
        });
      } else {
        formData.append("video", videoFile!);
      }

      const response = await fetch(`${API_BASE_URL}/liveness/verify`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to verify liveness");
      }

      const data: VerifyResponse = await response.json();
      setResult(data);

      if (data.liveness_passed) {
        toast.success(`Liveness verified! Confidence: ${(data.confidence * 100).toFixed(2)}%`);
      } else {
        toast.error("Liveness verification failed. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to verify liveness. Please try again.");
      console.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const getChallengeIcon = (challengeType: string) => {
    switch (challengeType) {
      case "BLINK":
        return "👁️";
      case "TURN_LEFT":
        return "⬅️";
      case "TURN_RIGHT":
        return "➡️";
      case "LOOK_UP":
        return "⬆️";
      case "SMILE":
        return "😊";
      default:
        return "🎯";
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Challenge Card */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Get Liveness Challenge
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Step 1: Request a new challenge
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={getChallenge}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Getting Challenge...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Get New Challenge
              </>
            )}
          </Button>

          {challenge && (
            <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-600 text-white">Active Challenge</Badge>
                <span className="text-4xl">{getChallengeIcon(challenge.challenge)}</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Challenge Type:</span>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{challenge.challenge}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Instructions:</span>
                  <p className="text-slate-900 dark:text-white">{challenge.instructions}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Challenge ID:</span>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">{challenge.challenge_id}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Expires At:</span>
                  <p className="text-sm text-red-600 dark:text-red-400">{new Date(challenge.expires_at).toLocaleString()}</p>
                </div>
              </div>

              <Alert className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Challenge expires in 10 seconds! Complete it quickly.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload & Verify Card */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Upload & Verify
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Step 2: Upload frames or video and verify
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Method Selection */}
          <div className="flex gap-2">
            <Button
              variant={uploadMethod === "frames" ? "default" : "outline"}
              onClick={() => setUploadMethod("frames")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              Frames (3-5)
            </Button>
            <Button
              variant={uploadMethod === "video" ? "default" : "outline"}
              onClick={() => setUploadMethod("video")}
              className="flex-1"
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
          </div>

          {/* Frames Upload */}
          {uploadMethod === "frames" && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFrameUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                disabled={!challenge}
              >
                <Camera className="h-4 w-4 mr-2" />
                Select 3-5 Image Frames
              </Button>
              {capturedFrames.length > 0 && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ {capturedFrames.length} frames selected
                </p>
              )}
            </div>
          )}

          {/* Video Upload */}
          {uploadMethod === "video" && (
            <div className="space-y-2">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
              <Button
                onClick={() => videoInputRef.current?.click()}
                variant="outline"
                className="w-full"
                disabled={!challenge}
              >
                <Video className="h-4 w-4 mr-2" />
                Select Video File
              </Button>
              {videoFile && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  ✓ {videoFile.name} selected
                </p>
              )}
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={verifyLiveness}
            disabled={verifying || !challenge || (uploadMethod === "frames" ? capturedFrames.length === 0 : !videoFile)}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-600/25"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verify Liveness
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-xl border ${
              result.liveness_passed
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-3">
                {result.liveness_passed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-2 flex-1">
                  <p className={`font-semibold ${
                    result.liveness_passed
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  }`}>
                    {result.message}
                  </p>
                  <div className="space-y-1 text-sm">
                    <p className={result.liveness_passed ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                      <strong>Status:</strong> {result.liveness_passed ? "Passed ✓" : "Failed ✗"}
                    </p>
                    <p className={result.liveness_passed ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                      <strong>Confidence:</strong> {(result.confidence * 100).toFixed(2)}%
                    </p>
                    <p className={result.liveness_passed ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                      <strong>Challenge ID:</strong> {result.challenge_id}
                    </p>
                  </div>
                  {result.liveness_passed && (
                    <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 mt-3">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-blue-800 dark:text-blue-200">
                        You can now use this challenge ID to verify your face in the "Verify" tab!
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
