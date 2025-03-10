"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CameraHelpPage() {
  const [deviceInfo, setDeviceInfo] = useState({
    isAndroid: false,
    isSamsung: false,
    isChrome: false,
    browserName: '',
    osVersion: ''
  });

  useEffect(() => {
    // Detectar informações do dispositivo
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    const isAndroid = /android/i.test(userAgent);
    const isSamsung = /samsung/i.test(userAgent);
    const isChrome = /chrome|chromium|crios/i.test(userAgent);
    
    // Tentar obter a versão do Android
    let osVersion = '';
    const androidVersionMatch = userAgent.match(/Android\s([0-9\.]+)/i);
    if (androidVersionMatch && androidVersionMatch[1]) {
      osVersion = androidVersionMatch[1];
    }
    
    // Detectar o navegador
    let browserName = 'seu navegador';
    if (isChrome) {
      browserName = 'Chrome';
    } else if (/firefox/i.test(userAgent)) {
      browserName = 'Firefox';
    } else if (/safari/i.test(userAgent)) {
      browserName = 'Safari';
    } else if (/samsung/i.test(userAgent) && /browser/i.test(userAgent)) {
      browserName = 'Samsung Internet';
    }
    
    setDeviceInfo({
      isAndroid,
      isSamsung,
      isChrome,
      browserName,
      osVersion
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ajuda com Permissões de Câmera</h1>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            Voltar
          </Link>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <h2 className="text-lg font-medium text-blue-800 mb-2">Informações do seu dispositivo</h2>
            <ul className="list-disc pl-5 text-gray-700">
              <li>Navegador: {deviceInfo.browserName}</li>
              {deviceInfo.isAndroid && <li>Sistema: Android {deviceInfo.osVersion}</li>}
              {deviceInfo.isSamsung && <li>Dispositivo: Samsung</li>}
            </ul>
          </div>

          <h2 className="text-xl font-semibold mb-4">Por que precisamos de acesso à câmera?</h2>
          <p className="text-gray-700 mb-4">
            Nosso aplicativo precisa acessar a câmera do seu dispositivo para que você possa fotografar seus discos de vinil. 
            Sem essa permissão, você só poderá fazer upload manual de fotos da sua galeria.
          </p>

          {deviceInfo.isAndroid && deviceInfo.isChrome && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Como permitir acesso à câmera no Chrome (Android)</h3>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Abra o aplicativo <strong>Configurações</strong> do seu telefone</li>
                <li>Toque em <strong>Aplicativos</strong> ou <strong>Gerenciador de aplicativos</strong></li>
                <li>Encontre e toque em <strong>Chrome</strong></li>
                <li>Toque em <strong>Permissões</strong></li>
                <li>Toque em <strong>Câmera</strong></li>
                <li>Selecione <strong>Permitir</strong> ou <strong>Permitir apenas durante o uso do app</strong></li>
                <li>Volte ao aplicativo e tente novamente</li>
              </ol>
            </div>
          )}

          {deviceInfo.isSamsung && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Dica para dispositivos Samsung</h3>
              <p className="text-gray-700 mb-2">
                Em dispositivos Samsung, o navegador Samsung Internet geralmente tem melhor compatibilidade com a câmera.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="font-medium">Tente usar o Samsung Internet em vez do Chrome</p>
                <p className="text-sm mt-1">
                  Abra este mesmo endereço no navegador Samsung Internet para uma melhor experiência.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Alternativas</h3>
            <p className="text-gray-700 mb-4">
              Se você continuar tendo problemas com a câmera, você pode:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Tentar usar o modo anônimo/privado do seu navegador</li>
              <li>Limpar o cache e os cookies do navegador</li>
              <li>Usar outro navegador (Samsung Internet, Firefox)</li>
              <li>
                <Link 
                  href="/capture/fallback"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Usar o upload manual de fotos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between">
          <Link
            href="/"
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
          >
            Voltar para o início
          </Link>
          <Link
            href="/capture"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </Link>
        </div>
      </div>
    </div>
  );
} 