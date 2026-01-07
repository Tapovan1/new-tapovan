"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Video, X } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_FACE_API_URL || "http://localhost:8000";

interface EnrollResponse {
  success: boolean;
  message: string;
  teacher_id: string;
}

interface FaceEnrollmentProps {
  defaultTeacherId?: string;
  onSuccess?: () => void;
}

export default function FaceEnrollment({ defaultTeacherId, onSuccess }: FaceEnrollmentProps = {}) {
  const [teacherId, setTeacherId] = useState(defaultTeacherId || "");
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [result, setResult] = useState<EnrollResponse | null>(null);
  const [captureMethod, setCaptureMethod] = useState<"upload" | "camera">("upload");
  const [cameraActive, setCameraActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Debug: Log when cameraActive changes
  useEffect(() => {
    console.log("🔄 cameraActive state changed to:", cameraActive);
    
    // Start camera stream when cameraActive becomes true
    if (cameraActive && !streamRef.current) {
      const initCamera = async () => {
        try {
          console.log("📷 Initializing camera stream...");
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 640, height: 480 } 
          });
          
          console.log("✅ Camera stream obtained");
          console.log("Stream active?", stream.active);
          
          if (videoRef.current) {
            console.log("Setting video srcObject...");
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            console.log("✅ Video preview should be showing now");
          } else {
            console.error("❌ videoRef still null after cameraActive=true");
          }
        } catch (err: any) {
          console.error("❌ Camera stream error:", err);
          toast.error("Camera access denied");
          setCameraActive(false);
        }
      };
      
      initCamera();
    }
  }, [cameraActive]);

  const stopCamera = () => {
    console.log("🛑 Stopping enrollment camera...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = () => {
    console.log("📷 Start camera button clicked");
    console.log("Setting cameraActive to true to render video element...");
    setCameraActive(true);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready");
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'enrollment-photo.jpg', { type: 'image/jpeg' });
        setFaceImage(file);
        console.log(`📸 Enrollment photo captured: ${blob.size} bytes`);
        toast.success("Photo captured!");
        stopCamera();
      }
    }, 'image/jpeg', 0.95);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceImage(file);
      toast.success("Face image selected");
    }
  };

  const enrollFace = async () => {
    if (!teacherId.trim()) {
      toast.error("Please enter a teacher ID");
      return;
    }

    if (!faceImage) {
      toast.error("Please capture or upload a face image");
      return;
    }

    setEnrolling(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("teacher_id", teacherId);
      formData.append("image", faceImage);

      console.log("📤 Enrolling face for teacher:", teacherId);
      const response = await fetch(`${API_BASE_URL}/face/enroll`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to enroll face");
      }

      const data: EnrollResponse = await response.json();
      console.log("✅ Enrollment successful:", data);
      setResult(data);
      toast.success("Face enrolled successfully!");
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form (only if not using defaultTeacherId)
      if (!defaultTeacherId) {
        setTeacherId("");
      }
      setFaceImage(null);
    } catch (error: any) {
      console.error("❌ Enrollment error:", error);
      toast.error(error.message || "Failed to enroll face. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Face Enrollment
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300">
                Register your face with a teacher ID
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              Capture a clear face photo to register. Make sure your face is well-lit and clearly visible.
            </AlertDescription>
          </Alert>

          {/* Teacher ID Input */}
          <div className="space-y-2">
            <Label htmlFor="teacherId" className="text-slate-900 dark:text-white font-medium">
              Teacher ID
            </Label>
            <Input
              id="teacherId"
              type="text"
              placeholder="Enter your teacher ID (e.g., TEACH001)"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
            />
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This can be any unique identifier (UUID, number, or custom ID)
            </p>
          </div>

          {/* Capture Method Tabs */}
          <Tabs value={captureMethod} onValueChange={(v) => setCaptureMethod(v as "upload" | "camera")}>
            <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-slate-800/80">
              <TabsTrigger value="upload" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </TabsTrigger>
              <TabsTrigger value="camera" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Video className="h-4 w-4 mr-2" />
                Live Camera
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faceImage" className="text-slate-900 dark:text-white font-medium">
                  Face Image
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {faceImage ? faceImage.name : "Upload Face Image (JPEG/PNG)"}
                </Button>
              </div>
            </TabsContent>

            {/* Camera Tab */}
            <TabsContent value="camera" className="space-y-4">
              {!cameraActive && !faceImage && (
                <Button
                  onClick={startCamera}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              )}

              {cameraActive && (
                <div className="space-y-4">
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
                        <div className="absolute inset-0 border-4 border-green-500 rounded-full opacity-60" 
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
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Image Preview */}
          {faceImage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-slate-900 dark:text-white font-medium">Preview:</Label>
                <Button
                  onClick={() => setFaceImage(null)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <img
                src={URL.createObjectURL(faceImage)}
                alt="Face preview"
                className="w-full max-w-sm mx-auto rounded-xl border-2 border-slate-300 dark:border-slate-600 shadow-lg"
              />
            </div>
          )}

          {/* Enroll Button */}
          <Button
            onClick={enrollFace}
            disabled={enrolling || !teacherId.trim() || !faceImage}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-600/25 h-12"
          >
            {enrolling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enrolling Face...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Enroll Face
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
                    ✓ Face Enrolled Successfully!
                  </h3>
                  <p className="text-green-800 dark:text-green-200">
                    {result.message}
                  </p>
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Teacher ID:</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{result.teacher_id}</p>
                  </div>
                  <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      You can now use face verification to login!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">📸 Photo Tips:</h4>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Use good lighting - face should be clearly visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Look directly at the camera</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Align your face within the oval guide (camera mode)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Remove sunglasses or face coverings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400">✗</span>
                <span>Avoid blurry or low-quality images</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
