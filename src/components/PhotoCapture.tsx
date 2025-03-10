"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import Link from 'next/link';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isSamsung, setIsSamsung] = useState(false);
  const [cameraPermissionRequested, setCameraPermissionRequested] = useState(false);
  const [isMediaDevicesSupported, setIsMediaDevicesSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Detectar o dispositivo e navegador
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Detectar se é um dispositivo móvel
    if (/android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent)) {
      setIsMobile(true);
    }
    
    // Detectar se é Android
    if (/android/i.test(userAgent)) {
      setIsAndroid(true);
    }
    
    // Detectar se é Samsung
    if (/samsung/i.test(userAgent)) {
      setIsSamsung(true);
    }
    
    // Verificar se o navegador suporta MediaDevices
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsMediaDevicesSupported(false);
      setCameraError('Your browser does not support camera access. Please try another browser or upload photos manually.');
    }
  }, []);

  // Verificar o status da permissão de câmera (se disponível)
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Verificar se a API de permissões está disponível
        if (navigator.permissions && navigator.permissions.query) {
          const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setPermissionStatus(result.state);
          
          // Adicionar listener para mudanças no status da permissão
          result.onchange = () => {
            setPermissionStatus(result.state);
            
            if (result.state === 'granted') {
              setIsCameraReady(true);
              setCameraError(null);
            } else if (result.state === 'denied') {
              setCameraError('Camera access was denied. Please grant camera permissions to use this feature.');
            }
          };
        }
      } catch (err) {
        console.log('Permissions API not supported or camera permission not available');
      }
    };
    
    if (isMediaDevicesSupported) {
      checkPermission();
    }
  }, [isMediaDevicesSupported]);

  // Solicitar permissão de câmera explicitamente
  useEffect(() => {
    if (!cameraPermissionRequested && isMediaDevicesSupported) {
      const requestCameraPermission = async () => {
        try {
          setCameraPermissionRequested(true);
          
          // Verificar se o navegador suporta MediaDevices
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('getUserMedia is not implemented in this browser');
          }
          
          // Em dispositivos Android, mostrar uma mensagem para o usuário
          if (isAndroid) {
            console.log('Android device detected, requesting camera permission...');
          }
          
          // Solicitar permissão explicitamente com configurações específicas para Android
          const constraints = {
            video: {
              facingMode: isMobile ? "environment" : "user",
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          
          // Liberar a stream após obter permissão
          stream.getTracks().forEach(track => track.stop());
          
          // Se chegou aqui, a permissão foi concedida
          setIsCameraReady(true);
          setCameraError(null);
        } catch (err: any) {
          console.error('Erro ao solicitar permissão de câmera:', err);
          
          // Mensagem de erro específica para diferentes casos
          if (err.name === 'NotAllowedError') {
            setCameraError('Camera access was denied. Please grant camera permissions in your browser settings.');
          } else if (err.name === 'NotFoundError') {
            setCameraError('No camera found on your device, or the camera is already in use.');
          } else if (err.message && err.message.includes('getUserMedia is not implemented')) {
            setIsMediaDevicesSupported(false);
            setCameraError('Your browser does not support camera access. Please try another browser or upload photos manually.');
          } else {
            setCameraError(`Failed to access camera: ${err.message || 'Unknown error'}`);
          }
        }
      };
      
      requestCameraPermission();
    }
  }, [cameraPermissionRequested, isMediaDevicesSupported, isAndroid, isMobile]);

  // Handle camera errors
  const handleCameraError = useCallback((err: any) => {
    console.error('Camera error:', err);
    
    if (err.name === 'NotAllowedError') {
      setCameraError('Camera access was denied. Please grant camera permissions in your browser settings.');
    } else if (err.name === 'NotFoundError') {
      setCameraError('No camera found on your device, or the camera is already in use.');
    } else if (err.message && err.message.includes('getUserMedia is not implemented')) {
      setIsMediaDevicesSupported(false);
      setCameraError('Your browser does not support camera access. Please try another browser or upload photos manually.');
    } else {
      setCameraError(`Failed to access camera: ${err.message || 'Unknown error'}`);
    }
    
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

  // Configurações de vídeo otimizadas para dispositivos móveis
  const videoConstraints = {
    facingMode: isMobile ? "environment" : "user", // Usar câmera traseira em dispositivos móveis
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  // Função para tentar novamente a permissão de câmera
  const retryPermission = async () => {
    setCameraPermissionRequested(false);
    setCameraError(null);
    
    try {
      // Verificar se o navegador suporta MediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not implemented in this browser');
      }
      
      // Tentar abrir as configurações de permissão no Android
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: isMobile ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      stream.getTracks().forEach(track => track.stop());
      setIsCameraReady(true);
    } catch (err: any) {
      console.error('Erro ao solicitar permissão novamente:', err);
      
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access was denied. Please grant camera permissions in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on your device, or the camera is already in use.');
      } else if (err.message && err.message.includes('getUserMedia is not implemented')) {
        setIsMediaDevicesSupported(false);
        setCameraError('Your browser does not support camera access. Please try another browser or upload photos manually.');
      } else {
        setCameraError(`Failed to access camera: ${err.message || 'Unknown error'}`);
      }
    }
  };

  // Função para abrir as configurações do navegador (funciona em alguns navegadores)
  const openBrowserSettings = () => {
    if (isAndroid) {
      if (isSamsung) {
        alert('Para permitir acesso à câmera no Samsung:\n\n1. Abra as Configurações do telefone\n2. Vá para Aplicativos > Chrome\n3. Toque em Permissões > Câmera\n4. Selecione "Permitir"');
      } else {
        alert('Para permitir acesso à câmera:\n\n1. Abra as Configurações do telefone\n2. Vá para Aplicativos > Chrome\n3. Toque em Permissões > Câmera\n4. Selecione "Permitir"');
      }
    } else {
      alert('Por favor, verifique as configurações do seu navegador para permitir o acesso à câmera.');
    }
  };

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
          <div className="mt-4 flex flex-col space-y-2">
            {isMediaDevicesSupported ? (
              <>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={retryPermission}
                >
                  Try Again
                </button>
                <button 
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  onClick={openBrowserSettings}
                >
                  Open Camera Settings
                </button>
                <Link 
                  href="/camera-help"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                >
                  Detailed Instructions
                </Link>
              </>
            ) : (
              <Link 
                href="/capture/fallback"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                Upload Photos Manually
              </Link>
            )}
            
            {isAndroid && (
              <div className="text-sm mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-medium">Android Device Tips:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Verifique se o Chrome tem permissão para acessar sua câmera</li>
                  <li>Vá para Configurações &gt; Apps &gt; Chrome &gt; Permissões &gt; Câmera</li>
                  <li>Tente usar o navegador Samsung Internet se estiver disponível</li>
                  <li>Tente usar o modo anônimo do Chrome</li>
                </ul>
              </div>
            )}
            
            <button 
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={onCancel}
            >
              Go Back
            </button>
          </div>
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
                videoConstraints={videoConstraints}
                onUserMedia={handleCameraUserMedia}
                onUserMediaError={handleCameraError}
                className="w-full h-full object-cover"
                mirrored={!isMobile} // Não espelhar em dispositivos móveis
                forceScreenshotSourceSize={true}
                imageSmoothing={true}
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
                  <p className="text-sm mt-2">Please allow camera access when prompted</p>
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