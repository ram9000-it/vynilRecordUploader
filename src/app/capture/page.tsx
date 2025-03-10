"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoCapture from '@/components/PhotoCapture';
import Link from 'next/link';
import { createDisco, uploadImages } from '@/utils/supabase';

export default function CapturePage() {
  const router = useRouter();
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [recordInfo, setRecordInfo] = useState({
    lotId: 'lote-demo', // Em um app real, isso viria da URL ou contexto
    recordName: '',
  });

  // Verificar se o navegador suporta a API de câmera
  useEffect(() => {
    // Verificar se o navegador suporta MediaDevices
    const checkCameraSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsCameraSupported(false);
          return;
        }
        
        // Tentar acessar a câmera para verificar se é suportada
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setIsCameraSupported(true);
      } catch (err) {
        console.error('Erro ao verificar suporte de câmera:', err);
        setIsCameraSupported(false);
      }
    };
    
    checkCameraSupport();
  }, []);

  // Redirecionar para a página de fallback se a câmera não for suportada
  useEffect(() => {
    if (!isCameraSupported) {
      // Pequeno atraso para garantir que o redirecionamento ocorra após a renderização
      const timer = setTimeout(() => {
        router.push('/capture/fallback');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isCameraSupported, router]);

  // Handle when photos are captured
  const handlePhotosCapture = (photos: string[]) => {
    setCapturedPhotos(photos);
    setIsCapturing(false);
    
    console.log('Photos captured:', photos.length);
  };

  // Handle cancellation of photo capture
  const handleCaptureCancel = () => {
    setIsCapturing(false);
  };

  // Start the capture process
  const startCapture = () => {
    setIsCapturing(true);
  };

  // Save the record to Supabase
  const saveRecord = async () => {
    if (capturedPhotos.length === 0) {
      alert('Por favor, capture pelo menos uma foto');
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Criar um novo disco no lote
      const disco = await createDisco(recordInfo.lotId);
      console.log('Disco criado:', disco);
      
      // 2. Fazer upload das imagens e associá-las ao disco
      const imagens = await uploadImages(disco.id, capturedPhotos);
      console.log('Imagens enviadas:', imagens);
      
      alert('Disco salvo com sucesso!');
      
      // Navegar de volta para a página inicial
      router.push('/');
    } catch (error) {
      console.error('Erro ao salvar o disco:', error);
      alert('Erro ao salvar o disco. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Se a câmera não for suportada, mostrar uma mensagem de carregamento enquanto redireciona
  if (!isCameraSupported) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Redirecionando para upload manual...</p>
          <p className="text-sm text-gray-500 mt-2">Seu navegador não suporta acesso à câmera.</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Adicionar Novo Disco de Vinil</h1>
              <Link 
                href="/"
                className="text-blue-600 hover:text-blue-800"
              >
                Voltar
              </Link>
            </div>

            {capturedPhotos.length > 0 ? (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Fotos Capturadas</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {capturedPhotos.map((photo, index) => (
                    <div 
                      key={index} 
                      className={`aspect-square rounded overflow-hidden border-2 ${index === 0 ? 'border-green-500 col-span-2 md:col-span-3' : 'border-gray-300'}`}
                    >
                      <img
                        src={photo}
                        alt={`Foto capturada ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 absolute top-0 right-0">
                          Foto de Capa
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
                    Tirar Novas Fotos
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
                  Nenhuma foto capturada ainda. Tire fotos do seu disco de vinil.
                </p>
                <div className="flex flex-col space-y-2 items-center">
                  <button
                    onClick={startCapture}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Capturar Fotos
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Problemas com o acesso à câmera?
                  </p>
                  <Link
                    href="/capture/fallback"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Fazer upload manual das fotos
                  </Link>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Link>
              <button
                onClick={saveRecord}
                disabled={capturedPhotos.length === 0 || isLoading}
                className={`px-4 py-2 rounded flex items-center ${
                  capturedPhotos.length === 0 || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                Salvar Disco
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 