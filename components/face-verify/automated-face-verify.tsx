"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Video,
  RefreshCw,
  UserCheck,
  Shield
} from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_FACE_API_URL || "http://localhost:8000";

type Step = 
  | 'idle' 
  | 'camera-access' 
  | 'getting-challenge' 
  | 'performing-challenge' 
  | 'verifying-liveness' 
  | 'verifying-face' 
  | 'complete';

interface Challenge {
  challenge_id: string;
  challenge: string;
  expires_at: string;
  instructions: string;
}

interface LivenessResult {
  success: boolean;
  liveness_passed: boolean;
  message: string;
  challenge_id: string;
  confidence: number;
}

interface FaceVerifyResult {
  success: boolean;
  match: boolean;
  teacher_id: string | null;
  score: number | null;
  message: string;
}

interface AutomatedFaceVerifyProps {
  isLoginMode?: boolean;
  onVerifySuccess?: (teacherId: string) => void;
}

export default function AutomatedFaceVerify({ 
  isLoginMode = false, 
  onVerifySuccess 
}: AutomatedFaceVerifyProps = {}) {
  const [step, setStep] = useState<Step>('idle');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [capturedFrames, setCapturedFrames] = useState<Blob[]>([]);
  const [livenessResult, setLivenessResult] = useState<LivenessResult | null>(null);
  const [verifyResult, setVerifyResult] = useState<FaceVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const framesArrayRef = useRef<Blob[]>([]);
  const challengeRef = useRef<Challenge | null>(null); // Ref to avoid closure staleness

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    console.log("🛑 Stopping camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      console.log("📷 Starting camera...");
      setStep('camera-access');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      
      console.log("✅ Camera access granted");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            console.log("📹 Video metadata loaded");
            resolve(true);
          };
        }
      });
      
      // Start the automated flow
      await getChallenge();
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      setError("Camera access denied. Please allow camera access to continue.");
      toast.error("Camera access denied");
      setStep('idle');
    }
  };

  const getChallenge = async () => {
    try {
      console.log("🎯 Getting challenge from API...");
      setStep('getting-challenge');
      
      // Call real API endpoint
      console.log("📤 Calling GET /liveness/challenge...");
      const response = await fetch(`${API_BASE_URL}/liveness/challenge`, {
        method: "GET",
      });
      
      if (!response.ok) {
        console.error("❌ API returned error:", response.status);
        throw new Error(`Failed to get challenge: ${response.status}`);
      }
      
      const data: Challenge = await response.json();
      console.log("✅ Challenge received from API:", data);
      console.log("Challenge ID:", data.challenge_id);
      console.log("Challenge Type:", data.challenge);
      
      setChallenge(data);
      challengeRef.current = data; // Update ref
      toast.success(`Challenge: ${data.challenge} - ${data.instructions}`);
      
      // Start capturing frames after 2 seconds
      setTimeout(() => {
        console.log("⏰ Starting frame capture...");
        startCapturingFrames();
      }, 2000);
    } catch (err: any) {
      console.error("❌ Challenge error:", err);
      setError("Failed to get challenge. Make sure API server is running.");
      toast.error("Failed to get challenge");
      stopCamera();
      setStep('idle');
    }
  };

  const captureFrame = async (): Promise<Blob | null> => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn("⚠️ Video or canvas ref not available");
      return null;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.warn("⚠️ Canvas context not available");
      return null;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`📸 Frame captured: ${blob.size} bytes`);
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const startCapturingFrames = () => {
    console.log("🎬 Starting frame capture sequence...");
    setStep('performing-challenge');
    setCapturedFrames([]);
    framesArrayRef.current = [];
    let frameCount = 0;
    const maxFrames = 5;
    
    captureIntervalRef.current = setInterval(async () => {
      console.log(`📸 Capturing frame ${frameCount + 1}/${maxFrames}...`);
      
      const frame = await captureFrame();
      if (frame) {
        framesArrayRef.current.push(frame);
        setCapturedFrames([...framesArrayRef.current]);
        frameCount++;
        
        console.log(`✅ Frame ${frameCount} captured. Total frames: ${framesArrayRef.current.length}`);
        
        if (frameCount >= maxFrames) {
          console.log("🎉 All frames captured!");
          if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
          }
          // Auto-submit after capturing all frames
          setTimeout(() => {
            console.log("🚀 Auto-submitting for liveness verification...");
            verifyLiveness();
          }, 500);
        }
      } else {
        console.warn("⚠️ Frame capture returned null");
      }
    }, 800); // Capture every 800ms
  };

  const verifyLiveness = async () => {
    const frames = framesArrayRef.current;
    const currentChallenge = challengeRef.current; // Use ref to get fresh challenge data
    
    console.log(`🔍 Verifying liveness with ${frames.length} frames...`);
    console.log("Current challenge from ref:", currentChallenge);
    
    if (!currentChallenge) {
      console.error("❌ No challenge available (ref is null)");
      toast.error("No challenge available");
      return;
    }
    
    if (frames.length < 3) {
      console.error(`❌ Not enough frames: ${frames.length}/3 minimum`);
      toast.error(`Not enough frames captured: ${frames.length}/3`);
      setError(`Not enough frames captured: ${frames.length}/3. Please try again.`);
      stopCamera();
      setStep('complete');
      return;
    }
    
    try {
      setStep('verifying-liveness');
      const formData = new FormData();
      formData.append("challenge_id", currentChallenge.challenge_id);
      
      frames.forEach((frame, index) => {
        formData.append("frames", new File([frame], `frame${index}.jpg`, { type: 'image/jpeg' }));
        console.log(`📎 Added frame ${index} to FormData`);
      });
      
      console.log("📤 Sending liveness verification request...");
      const response = await fetch(`${API_BASE_URL}/liveness/verify`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Liveness API error:", errorText);
        throw new Error(`Liveness verification failed: ${response.status}`);
      }
      
      const data: LivenessResult = await response.json();
      console.log("✅ Liveness result:", data);
      setLivenessResult(data);
      
      if (data.liveness_passed) {
        console.log(`🎉 Liveness passed! Confidence: ${data.confidence}`);
        toast.success(`Liveness verified! Confidence: ${(data.confidence * 100).toFixed(1)}%`);
        // Auto-proceed to face verification
        setTimeout(() => {
          console.log("➡️ Proceeding to face verification...");
          verifyFace(data.challenge_id);
        }, 1000);
      } else {
        console.error("❌ Liveness check failed");
        setError("Liveness verification failed. Please try again.");
        toast.error("Liveness check failed");
        stopCamera();
        setStep('complete');
      }
    } catch (err: any) {
      console.error("❌ Liveness verification error:", err);
      setError(`Failed to verify liveness: ${err.message}`);
      toast.error("Liveness verification failed");
      stopCamera();
      setStep('complete');
    }
  };

  const verifyFace = async (challengeId: string) => {
    try {
      console.log("👤 Verifying face...");
      setStep('verifying-face');
      
      // Capture final face image
      const faceImage = await captureFrame();
      if (!faceImage) {
        throw new Error("Failed to capture face image");
      }
      
      console.log(`📸 Face image captured: ${faceImage.size} bytes`);
      
      const formData = new FormData();
      formData.append("liveness_challenge_id", challengeId);
      formData.append("image", new File([faceImage], 'face.jpg', { type: 'image/jpeg' }));
      
      console.log("📤 Sending face verification request...");
      console.log("face-formdata-verify",formData.values());
      
      const response = await fetch(`${API_BASE_URL}/face/verify`, {
        method: "POST",
        body: formData,
      });
      
      console.log("face-verify",response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Face verification API error:", errorText);
        throw new Error(`Face verification failed: ${response.status}`);
      }
      
      const data: FaceVerifyResult = await response.json();
      console.log("✅ Face verification result:", data);
      setVerifyResult(data);
      
      if (data.match) {
        console.log(`🎉 Face matched! Teacher ID: ${data.teacher_id}`);
        toast.success(`Welcome! Teacher ID: ${data.teacher_id}`);
        
        // Call onVerifySuccess callback if in login mode
        if (isLoginMode && onVerifySuccess && data.teacher_id) {
          console.log("🔐 Triggering login callback...");
          onVerifySuccess(data.teacher_id);
        }
      } else {
        console.warn("⚠️ No matching face found");
        toast.error("No matching face found");
      }
      
      stopCamera();
      setStep('complete');
    } catch (err: any) {
      console.error("❌ Face verification error:", err);
      setError(`Failed to verify face: ${err.message}`);
      toast.error("Face verification failed");
      stopCamera();
      setStep('complete');
    }
  };

  const reset = () => {
    console.log("🔄 Resetting...");
    setStep('idle');
    setChallenge(null);
    challengeRef.current = null; // Reset ref
    setCapturedFrames([]);
    framesArrayRef.current = [];
    setLivenessResult(null);
    setVerifyResult(null);
    setError(null);
    stopCamera();
  };

  const getChallengeIcon = (challengeType: string) => {
    switch (challengeType) {
      case "BLINK": return "👁️";
      case "TURN_LEFT": return "⬅️";
      case "TURN_RIGHT": return "➡️";
      case "LOOK_UP": return "⬆️";
      case "SMILE": return "😊";
      default: return "🎯";
    }
  };

  const getStepStatus = (currentStep: Step) => {
    const steps = [
      { key: 'idle', label: 'Start' },
      { key: 'camera-access', label: 'Camera' },
      { key: 'getting-challenge', label: 'Challenge' },
      { key: 'performing-challenge', label: 'Capture' },
      { key: 'verifying-liveness', label: 'Liveness' },
      { key: 'verifying-face', label: 'Verify' },
      { key: 'complete', label: 'Complete' },
    ];
    
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    
    return steps.map((s, index) => ({
      ...s,
      status: index < currentIndex ? 'complete' : index === currentIndex ? 'active' : 'pending'
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {getStepStatus(step).slice(1).map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    s.status === 'complete' ? 'bg-green-500' :
                    s.status === 'active' ? 'bg-blue-500 animate-pulse' :
                    'bg-slate-300 dark:bg-slate-600'
                  }`}>
                    {s.status === 'complete' ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${
                    s.status === 'active' ? 'text-blue-600 dark:text-blue-400 font-semibold' :
                    'text-slate-600 dark:text-slate-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < getStepStatus(step).slice(1).length - 1 && (
                  <div className={`w-12 h-1 mx-2 ${
                    s.status === 'complete' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Card */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Automated Face Verification
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                One-click verification with liveness detection
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Preview */}
          {step !== 'idle' && step !== 'complete' && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Face Guide Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-80">
                  {/* Oval face guide */}
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full opacity-60" 
                       style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}>
                  </div>
                  {/* Corner guides */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                  
                  {/* Instruction text */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg whitespace-nowrap">
                    <p className="text-sm font-semibold">Align your face within the guide</p>
                  </div>
                </div>
              </div>
              
              {/* Challenge Overlay */}
              {challenge && step === 'performing-challenge' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getChallengeIcon(challenge.challenge)}</span>
                    <div>
                      <p className="font-bold">{challenge.challenge}</p>
                      <p className="text-sm">{challenge.instructions}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Frame Counter */}
              {step === 'performing-challenge' && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg z-10">
                  <p className="text-sm font-semibold">Frames: {capturedFrames.length}/5</p>
                </div>
              )}
            </div>
          )}

          {/* Status Messages */}
          {step === 'camera-access' && (
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Camera className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Accessing camera...
              </AlertDescription>
            </Alert>
          )}

          {step === 'getting-challenge' && (
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Getting liveness challenge...
              </AlertDescription>
            </Alert>
          )}

          {step === 'verifying-liveness' && (
            <Alert className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
              <Loader2 className="h-4 w-4 text-purple-600 dark:text-purple-400 animate-spin" />
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                Verifying liveness... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {step === 'verifying-face' && (
            <Alert className="bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800">
              <Loader2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <AlertDescription className="text-indigo-800 dark:text-indigo-200">
                Verifying your face... Almost done!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {step === 'complete' && verifyResult && (
            <div className={`p-6 rounded-xl border ${
              verifyResult.match
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-start gap-4">
                {verifyResult.match ? (
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
                    verifyResult.match
                      ? "text-green-900 dark:text-green-100"
                      : "text-red-900 dark:text-red-100"
                  }`}>
                    {verifyResult.match ? "✓ Verification Successful!" : "✗ Verification Failed"}
                  </h3>
                  <p className={verifyResult.match ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
                    {verifyResult.message}
                  </p>
                  {verifyResult.match && verifyResult.teacher_id && (
                    <div className="p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Teacher ID:</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{verifyResult.teacher_id}</p>
                      {verifyResult.score && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Match Score: {(verifyResult.score * 100).toFixed(2)}%
                        </p>
                      )}
                    </div>
                  )}
                  {livenessResult && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Liveness Confidence: {(livenessResult.confidence * 100).toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {step === 'idle' && (
            <Button
              onClick={startCamera}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/25 h-14 text-lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Start Verification
            </Button>
          )}

          {step === 'complete' && (
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg h-12"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {step === 'idle' && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">How it works:</h3>
            <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                <span>Click "Start Verification" and allow camera access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                <span>Align your face within the guide overlay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                <span>Perform the challenge shown (blink, turn head, smile, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
                <span>System automatically captures frames and verifies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">5.</span>
                <span>See your result - no manual steps required!</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

