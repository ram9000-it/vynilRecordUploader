"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLotes, createLote, Lote, testConnection, listAllData } from '@/utils/supabase';

export default function Home() {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingLote, setIsCreatingLote] = useState(false);
  const [novoLoteNome, setNovoLoteNome] = useState('');
  const [showLoteForm, setShowLoteForm] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{success: boolean, message: string} | null>(null);
  const [isListingData, setIsListingData] = useState(false);

  // Testar conexão com o Supabase
  useEffect(() => {
    const testarConexao = async () => {
      try {
        const result = await testConnection();
        if (result.success) {
          setConnectionStatus({ success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' });
        } else {
          setConnectionStatus({ 
            success: false, 
            message: `Falha na conexão com o Supabase: ${JSON.stringify(result.error)}` 
          });
        }
      } catch (error) {
        console.error('Erro ao testar conexão:', error);
        setConnectionStatus({ 
          success: false, 
          message: `Erro ao testar conexão: ${JSON.stringify(error)}` 
        });
      }
    };

    testarConexao();
  }, []);

  // Carregar lotes do Supabase
  useEffect(() => {
    const carregarLotes = async () => {
      try {
        setIsLoading(true);
        console.log('Carregando lotes...');
        const lotesData = await getLotes();
        console.log('Lotes carregados:', lotesData);
        setLotes(lotesData);
      } catch (error) {
        console.error('Erro ao carregar lotes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarLotes();
  }, []);

  // Criar um novo lote
  const handleCriarLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLoteNome.trim()) return;

    try {
      setIsCreatingLote(true);
      console.log('Iniciando criação de lote:', novoLoteNome);
      console.log('URL do Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Chave do Supabase (primeiros 5 caracteres):', 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 5));
      
      const novoLote = await createLote(novoLoteNome);
      console.log('Lote criado com sucesso:', novoLote);
      setLotes(prev => [novoLote, ...prev]);
      setNovoLoteNome('');
      setShowLoteForm(false);
    } catch (error) {
      console.error('Erro detalhado ao criar lote:', error);
      alert('Erro ao criar lote. Por favor, tente novamente.');
    } finally {
      setIsCreatingLote(false);
    }
  };

  // Função para listar todos os dados
  const handleListAllData = async () => {
    try {
      setIsListingData(true);
      console.log('Iniciando listagem de todos os dados...');
      const result = await listAllData();
      console.log('Resultado completo:', result);
      setIsListingData(false);
    } catch (error) {
      console.error('Erro ao listar dados:', error);
      setIsListingData(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Pitaya Records - Catalogação de Discos de Vinil
        </p>
      </div>

      {connectionStatus && (
        <div className={`w-full max-w-5xl mb-4 p-4 rounded-lg ${
          connectionStatus.success ? 'bg-green-100 border border-green-300 text-green-800' : 
          'bg-red-100 border border-red-300 text-red-800'
        }`}>
          <p className="font-medium">{connectionStatus.success ? '✅ ' : '❌ '}{connectionStatus.message}</p>
        </div>
      )}

      <div className="w-full max-w-5xl mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Lotes de Discos</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowLoteForm(!showLoteForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {showLoteForm ? 'Cancelar' : 'Novo Lote'}
              </button>
              <button
                onClick={handleListAllData}
                disabled={isListingData}
                className={`px-4 py-2 rounded flex items-center ${
                  isListingData ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isListingData && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                Ver Dados no Console
              </button>
            </div>
          </div>

          {showLoteForm && (
            <form onSubmit={handleCriarLote} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={novoLoteNome}
                  onChange={(e) => setNovoLoteNome(e.target.value)}
                  placeholder="Nome do novo lote"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded"
                  disabled={isCreatingLote}
                />
                <button
                  type="submit"
                  disabled={isCreatingLote || !novoLoteNome.trim()}
                  className={`px-4 py-2 rounded flex items-center justify-center ${
                    isCreatingLote || !novoLoteNome.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isCreatingLote && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  )}
                  Criar Lote
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">Nenhum lote encontrado</p>
              <p className="text-gray-600">
                Crie um novo lote para começar a catalogar seus discos de vinil.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lotes.map((lote) => (
                <div key={lote.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{lote.nome}</h3>
                      <p className="text-sm text-gray-500">
                        Criado em: {new Date(lote.data_criacao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        Status: {lote.status}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lote.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      lote.status === 'analisado' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lote.status}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/capture?loteId=${lote.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Adicionar Disco
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <Link
          href="/capture"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Capturar Fotos{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Capture fotos de discos de vinil usando a câmera do seu dispositivo.
          </p>
        </Link>

        <Link
          href="/capture/fallback"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Upload Manual{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Faça upload de fotos da sua galeria (para dispositivos sem acesso à câmera).
          </p>
        </Link>

        <Link
          href="/camera-help"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Ajuda com a Câmera{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Problemas com o acesso à câmera? Obtenha ajuda aqui.
          </p>
        </Link>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl w-full">
        <h3 className="text-lg font-medium text-blue-800 mb-2">Compatibilidade de Dispositivos</h3>
        <p className="text-gray-700 mb-2">
          Este aplicativo funciona melhor com:
        </p>
        <ul className="list-disc pl-5 text-gray-700 mb-2">
          <li>Navegadores modernos como Chrome, Firefox ou Safari</li>
          <li>Dispositivos com acesso à câmera habilitado</li>
        </ul>
        <p className="text-gray-700 mt-2">
          <strong>Usuários Samsung:</strong> Se você tiver problemas com a câmera, tente usar o navegador Samsung Internet ou a opção de Upload Manual.
        </p>
      </div>
    </main>
  );
} 