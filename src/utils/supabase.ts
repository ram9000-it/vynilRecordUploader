// This file will contain Supabase integration code
// For now, it's just a placeholder with types and mock functions

// Supabase client and utility functions
import { createClient } from '@supabase/supabase-js';

// Types for our database tables
export interface Lote {
  id: string;
  nome: string;
  data_criacao: string;
  status: 'pendente' | 'analisado' | 'completo';
}

export interface Disco {
  id: string;
  lote_id: string;
  status: 'pendente' | 'analisado';
  data_adicao: string;
}

export interface Imagem {
  id: string;
  disco_id: string;
  url: string;
  tipo_imagem: 'capa' | 'adicional';
}

export interface Analise {
  id: string;
  disco_id: string;
  artista: string;
  album: string;
  descricao: string;
  valor_estimado: number;
}

// Inicializar o cliente Supabase
// Essas variáveis de ambiente precisam ser configuradas no Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Criar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para fazer upload de imagens
export const uploadImages = async (
  discoId: string,
  images: string[]
): Promise<Imagem[]> => {
  console.log('Uploading images for disco', discoId);
  
  const results: Imagem[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const base64Image = images[i];
    const isCapaImage = i === 0;
    
    try {
      // Converter base64 para Blob
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let j = 0; j < byteCharacters.length; j += 512) {
        const slice = byteCharacters.slice(j, j + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let k = 0; k < slice.length; k++) {
          byteNumbers[k] = slice.charCodeAt(k);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      const file = new File([blob], `${discoId}_${i}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('imagens')
        .upload(`${discoId}/${file.name}`, file);
        
      if (error) throw error;
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(`${discoId}/${file.name}`);
        
      // Criar registro na tabela imagens
      const { data: imageRecord, error: dbError } = await supabase
        .from('imagens')
        .insert({
          disco_id: discoId,
          url: urlData.publicUrl,
          tipo_imagem: isCapaImage ? 'capa' : 'adicional'
        })
        .select()
        .single();
        
      if (dbError) throw dbError;
      
      results.push(imageRecord as Imagem);
    } catch (err) {
      console.error('Error uploading image:', err);
      // Fallback para não quebrar o fluxo se uma imagem falhar
      results.push({
        id: `error-${Date.now()}-${i}`,
        disco_id: discoId,
        url: '',
        tipo_imagem: isCapaImage ? 'capa' : 'adicional',
      });
    }
  }
  
  return results;
};

// Função para criar um novo disco
export const createDisco = async (
  loteId: string
): Promise<Disco> => {
  console.log('Creating new disco in lote', loteId);
  
  const { data, error } = await supabase
    .from('discos')
    .insert({
      lote_id: loteId,
      status: 'pendente',
      data_adicao: new Date().toISOString(),
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return data as Disco;
};

// Função para obter todos os lotes
export const getLotes = async (): Promise<Lote[]> => {
  console.log('Getting all lotes');
  
  const { data, error } = await supabase
    .from('lotes')
    .select('*')
    .order('data_criacao', { ascending: false });
    
  if (error) throw error;
  
  return data as Lote[];
};

// Função para criar um novo lote
export const createLote = async (nome: string): Promise<Lote> => {
  console.log('Creating new lote', nome);
  
  const { data, error } = await supabase
    .from('lotes')
    .insert({
      nome,
      data_criacao: new Date().toISOString(),
      status: 'pendente',
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return data as Lote;
};

// Função para atualizar o status de um disco
export const updateDiscoStatus = async (
  discoId: string, 
  status: 'pendente' | 'analisado'
): Promise<void> => {
  const { error } = await supabase
    .from('discos')
    .update({ status })
    .eq('id', discoId);
    
  if (error) throw error;
};

// Função para salvar uma análise
export const saveAnalise = async (
  discoId: string,
  analise: Omit<Analise, 'id' | 'disco_id'>
): Promise<Analise> => {
  const { data, error } = await supabase
    .from('analises')
    .insert({
      disco_id: discoId,
      ...analise
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return data as Analise;
};

// Função para obter a análise de um disco
export const getAnalise = async (discoId: string): Promise<Analise | null> => {
  const { data, error } = await supabase
    .from('analises')
    .select('*')
    .eq('disco_id', discoId)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      // Não encontrou análise
      return null;
    }
    throw error;
  }
  
  return data as Analise;
};

// To be implemented in the future:
// - Function to send a batch of discos for analysis
// - Function to update disco status
// - Function to get analysis results 