"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Video, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_FACE_API_URL || "http://localhost:8000";

interface FaceVerifyResult {
  success: boolean;
  match: boolean;
  teacher_id: string | null;
  score: number | null;
  message: string;
}

interface SimpleFaceLoginProps {
  onSuccess: (teacherId: string) => void;
}

// Eye landmark indices for MediaPipe Face Mesh
const LEFT_EYE = [362, 385, 387, 263, 373, 380];
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];

export default function SimpleFaceLogin({ onSuccess }: SimpleFaceLoginProps) {
  const [status, setStatus] = useState<'idle' | 'detecting' | 'blink-detected' | 'verifying' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [blinkDetected, setBlinkDetected] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  // Blink detection state
  const earHistoryRef = useRef<number[]>([]);
  const blinkCountRef = useRef(0);
  const isBlinkingRef = useRef(false);
  const blinkDetectedRef = useRef(false);
  const statusRef = useRef<'idle' | 'detecting' | 'blink-detected' | 'verifying' | 'complete'>('idle');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    console.log("🛑 Stopping camera and cleaning up...");
    
    // Stop MediaPipe camera
    if (cameraRef.current) {
      try {
        cameraRef.current.stop();
      } catch (e) {
        console.error("Error stopping camera:", e);
      }
      cameraRef.current = null;
    }
    
    // Close MediaPipe FaceMesh
    if (faceMeshRef.current) {
      try {
        faceMeshRef.current.close();
      } catch (e) {
        console.error("Error closing FaceMesh:", e);
      }
      faceMeshRef.current = null;
    }
    
    // Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    
    // Stop video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    console.log("✅ Camera cleanup complete");
  };

  const calculateEAR = (eyeLandmarks: any[], landmarks: any[]) => {
    // Calculate Eye Aspect Ratio
    const p1 = landmarks[eyeLandmarks[0]];
    const p2 = landmarks[eyeLandmarks[1]];
    const p3 = landmarks[eyeLandmarks[2]];
    const p4 = landmarks[eyeLandmarks[3]];
    const p5 = landmarks[eyeLandmarks[4]];
    const p6 = landmarks[eyeLandmarks[5]];

    const vertical1 = Math.sqrt(Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2));
    const vertical2 = Math.sqrt(Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2));
    const horizontal = Math.sqrt(Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2));

    return (vertical1 + vertical2) / (2.0 * horizontal);
  };

  const detectBlink = (landmarks: any[]) => {
    const leftEAR = calculateEAR(LEFT_EYE, landmarks);
    const rightEAR = calculateEAR(RIGHT_EYE, landmarks);
    const avgEAR = (leftEAR + rightEAR) / 2.0;

    console.log(`👁️ EAR: ${avgEAR.toFixed(3)}, Blinking: ${isBlinkingRef.current}, Count: ${blinkCountRef.current}`);

    // Add to history
    earHistoryRef.current.push(avgEAR);
    if (earHistoryRef.current.length > 10) {
      earHistoryRef.current.shift();
    }

    const EAR_THRESHOLD = 0.21;

    // Detect blink
    if (avgEAR < EAR_THRESHOLD && !isBlinkingRef.current) {
      isBlinkingRef.current = true;
      console.log("👁️ Eye closing...");
    } else if (avgEAR > EAR_THRESHOLD + 0.02 && isBlinkingRef.current) {
      isBlinkingRef.current = false;
      blinkCountRef.current++;
      
      console.log(`✅ Blink detected! Count: ${blinkCountRef.current}`);
      
      if (blinkCountRef.current >= 1 && statusRef.current === 'detecting' && !blinkDetectedRef.current) {
        console.log("🎯 Triggering capture...");
        blinkDetectedRef.current = true;
        setBlinkDetected(true);
        setStatus('blink-detected');
        toast.success("Blink detected!");
        
        // Capture and verify after short delay
        setTimeout(() => captureAndVerify(), 500);
      }
    }
  };

  const startCamera = async () => {
    try {
      console.log("🔄 Resetting all state before starting camera...");
      
      // Reset all state
      setStatus('detecting');
      setError(null);
      setBlinkDetected(false);
      blinkDetectedRef.current = false;
      blinkCountRef.current = 0;
      earHistoryRef.current = [];
      isBlinkingRef.current = false;
      
      console.log("📷 Starting camera and MediaPipe...");

      // Dynamically import MediaPipe modules (browser only)
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const { Camera } = await import("@mediapipe/camera_utils");

      // Initialize MediaPipe Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          
          // Only detect blink if we're in detecting state and haven't detected a blink yet
          if (statusRef.current === 'detecting' && !blinkDetectedRef.current) {
            detectBlink(landmarks);
          }
        } else {
          console.log("❌ No face detected");
        }
      });

      faceMeshRef.current = faceMesh;

      // Start camera
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMeshRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await camera.start();
        cameraRef.current = camera;
        
        console.log("✅ Camera and MediaPipe started");
      }
    } catch (err: any) {
      console.error("❌ Camera error:", err);
      setError("Camera access denied");
      toast.error("Please allow camera access");
      setStatus('idle');
    }
  };

  const captureAndVerify = async () => {
    try {
      setStatus('verifying');
      
      // Capture frame
      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Video or canvas not ready");
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) throw new Error("Canvas context not available");
      
      // Set canvas to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the full video frame first
      context.drawImage(video, 0, 0);
      
      // Calculate circular crop dimensions (65% of width, centered)
      const circleSize = Math.min(canvas.width, canvas.height) * 0.65;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = circleSize / 2;
      
      // Create a new canvas for the circular crop
      const cropCanvas = document.createElement('canvas');
      const cropSize = circleSize;
      cropCanvas.width = cropSize;
      cropCanvas.height = cropSize;
      const cropContext = cropCanvas.getContext('2d');
      
      if (!cropContext) throw new Error("Crop canvas context not available");
      
      // Draw circular clipping path
      cropContext.beginPath();
      cropContext.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
      cropContext.closePath();
      cropContext.clip();
      
      // Draw the cropped portion from the original canvas
      cropContext.drawImage(
        canvas,
        centerX - radius,
        centerY - radius,
        circleSize,
        circleSize,
        0,
        0,
        cropSize,
        cropSize
      );
      
      // Convert circular crop to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        cropCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
      });

      if (!blob) throw new Error("Failed to capture image");

      console.log("📸 Circular face image captured:", blob.size, "bytes");

      // Verify face
      const formData = new FormData();
      formData.append("image", new File([blob], 'face.jpg', { type: 'image/jpeg' }));
      
      console.log("📤 Sending face verification request...");
      
      const response = await fetch(`${API_BASE_URL}/face/verify-quick`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Face verification failed");
      }
      
      const data: FaceVerifyResult = await response.json();
      console.log("✅ Face verification result:", data);
      
      if (data.match && data.teacher_id) {
        toast.success("Face verified!");
        setStatus('complete');
        stopCamera();
        onSuccess(data.teacher_id);
      } else {
        console.log("❌ No matching face found, stopping camera...");
        stopCamera();
        setError("No matching face found. Please try again.");
        toast.error("No matching face found");
        setStatus('idle');
      }
    } catch (err: any) {
      console.error("❌ Verification error:", err);
      stopCamera();
      setError("Face verification failed. Please try again.");
      toast.error("Verification failed");
      setStatus('idle');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Camera View - UIDAI Aadhaar Style (Only Circular Portion Visible) */}
      {status !== 'idle' && status !== 'complete' && (
        <div className="relative mb-4 bg-white rounded-2xl p-8">
          {/* Hidden video element */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Circular Camera View Container */}
          <div className="relative mx-auto" style={{ width: '100%', maxWidth: '280px', aspectRatio: '1' }}>
            {/* White background */}
            <div className="absolute inset-0 bg-white rounded-full"></div>
            
            {/* Circular clipped video using CSS */}
            <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-red-500 shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ 
                  transform: 'scaleX(-1)',
                }}
              />
            </div>
            
            {/* Circular border overlay - turns green when blink detected */}
            <div className={`absolute inset-0 rounded-full border-4 shadow-2xl transition-colors duration-300 pointer-events-none ${
              blinkDetected ? 'border-green-400' : 'border-red-500'
            }`}>
            </div>
            
            {/* Inner circle for better face positioning */}
            <div className={`absolute inset-4 rounded-full border-2 transition-colors duration-300 pointer-events-none ${
              blinkDetected ? 'border-green-400/50' : 'border-red-400/50'
            }`}>
            </div>
            
            {/* Alignment markers - Top, Bottom, Left, Right */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-1 h-6 bg-green-400"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-1 h-6 bg-green-400"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 h-1 w-6 bg-green-400"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 h-1 w-6 bg-green-400"></div>
            
            {/* Blink detected checkmark */}
            {blinkDetected && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-green-500 rounded-full p-4 animate-pulse">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
              </div>
            )}
            
            {/* Instruction text */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg whitespace-nowrap">
              <p className="text-sm font-semibold">
                {blinkDetected ? "FACE DETECTED" : "POSITION YOUR FACE IN THE CENTRE"}
              </p>
            </div>
          </div>
          
          {/* Status Text */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-slate-800 text-white px-6 py-2 rounded-full">
              <p className="text-sm font-semibold">
                {status === 'detecting' && !blinkDetected && "👁️ Please blink"}
                {status === 'blink-detected' && "✅ Blink detected!"}
                {status === 'verifying' && "Verifying..."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert className="mb-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Start Button */}
      {status === 'idle' && (
        <Button
          onClick={startCamera}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg shadow-lg"
        >
          <Video className="h-5 w-5 mr-3" />
          Start Face Login
        </Button>
      )}

      {/* Verifying State */}
      {status === 'verifying' && (
        <div className="flex flex-col items-center py-8">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-700">Verifying your identity...</p>
        </div>
      )}

      {/* Retry Button */}
      {status === 'complete' && error && (
        <Button
          onClick={() => {
            console.log("🔄 Retrying face login...");
            setError(null);
            setBlinkDetected(false);
            blinkDetectedRef.current = false;
            blinkCountRef.current = 0;
            earHistoryRef.current = [];
            isBlinkingRef.current = false;
            startCamera();
          }}
          variant="outline"
          className="w-full h-12"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
