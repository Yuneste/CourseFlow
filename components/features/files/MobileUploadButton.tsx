'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Image, Scan, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { optimizeForMobile, isMobileDevice } from '@/lib/utils/image-optimizer';
import { detectAcademicContent } from '@/lib/utils/academic-detector';
import { createResumableUpload } from '@/lib/utils/tus-upload';
import { useAppStore } from '@/stores/useAppStore';

interface MobileUploadButtonProps {
  courseId?: string;
  onUploadComplete?: () => void;
}

export function MobileUploadButton({ courseId, onUploadComplete }: MobileUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'photo' | 'document'>('document');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { addFile, updateUploadProgress } = useAppStore();
  
  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator && isMobileDevice()) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);
  
  const handleCameraCapture = useCallback(() => {
    if (cameraInputRef.current) {
      cameraInputRef.current.accept = 'image/*';
      cameraInputRef.current.capture = 'environment'; // Use back camera
      cameraInputRef.current.click();
    }
  }, []);
  
  const handleGallerySelect = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const processedFiles: File[] = [];
    
    for (const file of fileArray) {
      // Check if it's academic content
      const academicCheck = await detectAcademicContent(file);
      if (!academicCheck.isAcademic && academicCheck.confidence > 0.7) {
        console.warn(`Skipping non-academic file: ${file.name}`);
        continue;
      }
      
      // Optimize for mobile
      if (file.type.startsWith('image/')) {
        try {
          const optimized = await optimizeForMobile(file);
          processedFiles.push(optimized.file);
          console.log(`Optimized ${file.name}: ${file.size} → ${optimized.file.size}`);
        } catch (error) {
          console.error('Failed to optimize image:', error);
          processedFiles.push(file);
        }
      } else {
        processedFiles.push(file);
      }
    }
    
    setSelectedFiles(prev => [...prev, ...processedFiles]);
  }, []);
  
  const startDocumentScanner = useCallback(async () => {
    setIsCapturing(true);
    setCaptureMode('document');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      setIsCapturing(false);
    }
  }, []);
  
  const captureDocument = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Apply document enhancement filters
    if (captureMode === 'document') {
      // Increase contrast and brightness for document scanning
      context.filter = 'contrast(1.5) brightness(1.2)';
      context.drawImage(canvas, 0, 0);
    }
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const filename = `scan-${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      const file = new File([blob], filename, { type: 'image/jpeg' });
      
      // Optimize the captured image
      const optimized = await optimizeForMobile(file);
      setSelectedFiles(prev => [...prev, optimized.file]);
      
      // Stop camera
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [captureMode]);
  
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  }, []);
  
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (const file of selectedFiles) {
        const tempId = `mobile-${Date.now()}-${file.name}`;
        
        // Use resumable upload
        const { upload } = await createResumableUpload({
          file,
          courseId,
          onProgress: (bytesUploaded, bytesTotal) => {
            const progress = Math.round((bytesUploaded / bytesTotal) * 100);
            updateUploadProgress(tempId, {
              fileId: tempId,
              fileName: file.name,
              progress,
              status: 'uploading'
            });
          },
          onSuccess: () => {
            updateUploadProgress(tempId, {
              fileId: tempId,
              fileName: file.name,
              progress: 100,
              status: 'completed'
            });
          },
          onError: (error) => {
            updateUploadProgress(tempId, {
              fileId: tempId,
              fileName: file.name,
              progress: 0,
              status: 'failed',
              error: error.message
            });
            
            // Queue for background sync if service worker is available
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'QUEUE_UPLOAD',
                payload: {
                  file: {
                    name: file.name,
                    size: file.size,
                    type: file.type
                  },
                  courseId
                }
              });
            }
          }
        });
        
        // Start upload
        await upload.start();
      }
      
      setSelectedFiles([]);
      setIsOpen(false);
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, courseId, updateUploadProgress, onUploadComplete]);
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Only show on mobile devices
  if (!isMobileDevice()) {
    return null;
  }
  
  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="h-6 w-6" />
      </Button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Upload Files</SheetTitle>
          </SheetHeader>
          
          {!isCapturing ? (
            <div className="mt-6 space-y-4">
              {/* Upload options */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={handleCameraCapture}
                >
                  <Camera className="h-8 w-8" />
                  <span>Take Photo</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={startDocumentScanner}
                >
                  <Scan className="h-8 w-8" />
                  <span>Scan Document</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={handleGallerySelect}
                >
                  <Image className="h-8 w-8" />
                  <span>From Gallery</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8" />
                  <span>Browse Files</span>
                </Button>
              </div>
              
              {/* Selected files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Selected Files</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Files`}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* Camera view */}
              <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanner overlay */}
                {captureMode === 'document' && (
                  <div className="absolute inset-0 border-2 border-white/50 m-8 rounded-lg pointer-events-none" />
                )}
              </div>
              
              {/* Camera controls */}
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={stopCamera}
                >
                  Cancel
                </Button>
                <Button
                  onClick={captureDocument}
                  className="flex-1"
                >
                  Capture
                </Button>
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant={captureMode === 'document' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCaptureMode('document')}
                >
                  Document
                </Button>
                <Button
                  variant={captureMode === 'photo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCaptureMode('photo')}
                >
                  Photo
                </Button>
              </div>
            </div>
          )}
          
          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            multiple
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}