"use client";

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface PhotoCaptureProps {
  onPhotosCapture: (photos: string[]) => void;
  onCancel: () => void;
  maxPhotos?: number;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotosCapture,
  onCancel,
  maxPhotos = 5,
}) => {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Handle camera errors
  const handleCameraError = useCallback(() => {
    setCameraError('Failed to access camera. Please ensure you have granted camera permissions.');
    setIsCameraReady(false);
  }, []);

  // Handle when camera is ready
  const handleCameraUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setCameraError(null);
  }, []);

  // Capture photo from webcam
  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedPhotos((prev) => [...prev, imageSrc]);
    }
  }, [webcamRef]);

  // Remove a specific photo
  const removePhoto = useCallback((index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Complete the photo capture process
  const handleComplete = useCallback(() => {
    if (capturedPhotos.length > 0) {
      onPhotosCapture(capturedPhotos);
    }
  }, [capturedPhotos, onPhotosCapture]);

  // Check if we've reached the maximum number of photos
  const isMaxPhotosReached = capturedPhotos.length >= maxPhotos;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {capturedPhotos.length === 0 
            ? 'Capture Cover Photo' 
            : capturedPhotos.length === 1 
              ? 'Capture Additional Photos (Optional)' 
              : `Additional Photos (${capturedPhotos.length}/${maxPhotos})`}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>

      {cameraError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{cameraError}</p>
          <button 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={onCancel}
          >
            Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Camera View */}
          <div className="relative aspect-square w-full mb-4 bg-gray-100 rounded overflow-hidden">
            {!isMaxPhotosReached && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment", // Use the back camera if available
                }}
                onUserMedia={handleCameraUserMedia}
                onUserMediaError={handleCameraError}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay when max photos reached */}
            {isMaxPhotosReached && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white p-4 text-center">
                <div>
                  <p className="text-xl mb-2">Maximum photos reached</p>
                  <p>You've captured the maximum number of photos ({maxPhotos}).</p>
                </div>
              </div>
            )}
            
            {/* Loading indicator */}
            {!isCameraReady && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}
          </div>

          {/* Capture Controls */}
          <div className="flex justify-center mb-6">
            {isCameraReady && !isMaxPhotosReached && (
              <button
                onClick={capturePhoto}
                className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none"
              >
                <span className="sr-only">Capture Photo</span>
                <div className="w-12 h-12 rounded-full border-2 border-white"></div>
              </button>
            )}
          </div>

          {/* Thumbnails */}
          {capturedPhotos.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Captured Photos</h3>
              <div className="grid grid-cols-5 gap-2">
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className={`aspect-square rounded overflow-hidden border-2 ${index === 0 ? 'border-green-500' : 'border-gray-300'}`}>
                      <img
                        src={photo}
                        alt={`Captured photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">
                        Cover
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-auto">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={capturedPhotos.length === 0}
              className={`px-4 py-2 rounded ${
                capturedPhotos.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {capturedPhotos.length === 0 ? 'Capture at least one photo' : 'Done'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoCapture; 