"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createDisco, uploadImages } from '@/utils/supabase';

export default function CaptureManualPage() {
  const router = useRouter();
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [isSamsung, setIsSamsung] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detectar se é um dispositivo Samsung
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/samsung/i.test(userAgent)) {
      setIsSamsung(true);
    }
  }, []);

  // Função para lidar com o upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Converter os arquivos para base64
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setCapturedPhotos(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Função para remover uma foto
  const removePhoto = (index: number) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Função para salvar as fotos no Supabase
  const savePhotos = async () => {
    if (capturedPhotos.length === 0) {
      alert('Por favor, faça upload de pelo menos uma foto');
      return;
    }

    try {
      setIsLoading(true);
      
      // Criar um novo disco no lote (usando um lote de demonstração)
      const loteId = 'lote-demo'; // Em um app real, isso viria da URL ou contexto
      const disco = await createDisco(loteId);
      console.log('Disco criado:', disco);
      
      // Fazer upload das imagens e associá-las ao disco
      const imagens = await uploadImages(disco.id, capturedPhotos);
      console.log('Imagens enviadas:', imagens);
      
      alert('Fotos salvas com sucesso!');
      router.push('/');
    } catch (error) {
      console.error('Erro ao salvar as fotos:', error);
      alert('Erro ao salvar as fotos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Upload Manual de Fotos</h1>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            Voltar
          </Link>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Acesso à Câmera Indisponível</h2>
            <p className="text-gray-700 mb-2">
              Não foi possível acessar a câmera do seu dispositivo. Isso pode ser devido a:
            </p>
            <ul className="list-disc pl-5 text-gray-700 mb-2">
              <li>Seu navegador não suporta acesso à câmera</li>
              <li>As permissões de câmera foram negadas</li>
              <li>Seu dispositivo tem restrições de acesso à câmera</li>
            </ul>
            {isSamsung && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="font-medium text-blue-800">Dicas para dispositivos Samsung:</p>
                <ul className="list-disc pl-5 text-gray-700 mt-1">
                  <li>Tente usar o navegador Samsung Internet em vez do Chrome</li>
                  <li>Verifique as permissões de câmera nas configurações do seu dispositivo</li>
                </ul>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 mb-4">
            Você ainda pode fazer upload de fotos dos seus discos de vinil a partir da galeria do seu dispositivo.
          </p>
          
          <div className="mb-6 p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">
              Toque abaixo para selecionar fotos da sua galeria
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Selecionar Fotos
            </button>
          </div>
        </div>

        {capturedPhotos.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Fotos Enviadas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {capturedPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className={`aspect-square rounded overflow-hidden border-2 relative ${index === 0 ? 'border-green-500 col-span-2 md:col-span-3' : 'border-gray-300'}`}
                >
                  <img
                    src={photo}
                    alt={`Foto enviada ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1">
                      Foto de Capa
                    </div>
                  )}
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </Link>
          <button
            onClick={savePhotos}
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
            Salvar Fotos
          </button>
        </div>
      </div>
    </div>
  );
} 