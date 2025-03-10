"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoCapture from '@/components/PhotoCapture';
import Link from 'next/link';

export default function CapturePage() {
  const router = useRouter();
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [recordInfo, setRecordInfo] = useState({
    lotId: '', // This would come from the URL or context in a real app
    recordName: '',
  });

  // Handle when photos are captured
  const handlePhotosCapture = (photos: string[]) => {
    setCapturedPhotos(photos);
    setIsCapturing(false);
    
    // In a real app, you would upload these photos to Supabase Storage
    console.log('Photos captured:', photos);
  };

  // Handle cancellation of photo capture
  const handleCaptureCancel = () => {
    setIsCapturing(false);
  };

  // Start the capture process
  const startCapture = () => {
    setIsCapturing(true);
  };

  // Save the record (in a real app, this would save to Supabase)
  const saveRecord = async () => {
    if (capturedPhotos.length === 0) {
      alert('Please capture at least one photo');
      return;
    }

    // In a real app, this would:
    // 1. Upload photos to Supabase Storage
    // 2. Create a record in the 'discos' table
    // 3. Link the photos to the record in the 'imagens' table
    
    alert('Record saved successfully! In a real app, this would save to Supabase.');
    
    // Navigate back to the lot page (in a real app)
    // router.push(`/lots/${recordInfo.lotId}`);
    
    // For demo purposes, just go back to home
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isCapturing ? (
        <div className="fixed inset-0 z-50 bg-black">
          <PhotoCapture
            onPhotosCapture={handlePhotosCapture}
            onCancel={handleCaptureCancel}
            maxPhotos={5}
          />
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Add New Vinyl Record</h1>
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800"
              >
                Back to Home
              </Link>
            </div>

            {capturedPhotos.length > 0 ? (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Captured Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {capturedPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`aspect-square rounded overflow-hidden border-2 ${index === 0 ? 'border-green-500 col-span-2 md:col-span-3' : 'border-gray-300'}`}
                    >
                      <img
                        src={photo}
                        alt={`Captured photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 absolute top-0 right-0">
                          Cover Photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={startCapture}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                  >
                    Retake Photos
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">
                  No photos captured yet. Take photos of your vinyl record.
                </p>
                <button
                  onClick={startCapture}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Capture Photos
                </button>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Link>
              <button
                onClick={saveRecord}
                disabled={capturedPhotos.length === 0}
                className={`px-4 py-2 rounded ${
                  capturedPhotos.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 