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

console.log('Inicializando cliente Supabase com:');
console.log('URL:', supabaseUrl);
console.log('Key (primeiros 5 caracteres):', supabaseKey.substring(0, 5));

// Criar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para testar a conexão com o Supabase
export const testConnection = async () => {
  try {
    console.log('Testando conexão com o Supabase...');
    // Tenta listar as tabelas para verificar a conexão
    const { data, error } = await supabase.from('lotes').select('count');
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error);
      return { success: false, error };
    }
    
    console.log('Conexão com o Supabase bem-sucedida!');
    return { success: true, data };
  } catch (err) {
    console.error('Exceção ao testar conexão:', err);
    return { success: false, error: err };
  }
};

// Função para fazer upload de imagens
export const uploadImages = async (
  discoId: string,
  images: string[]
): Promise<Imagem[]> => {
  console.log('Iniciando upload de imagens para o disco', discoId);
  console.log('Número de imagens:', images.length);
  
  // Verificar se o bucket existe, se não, tentar criá-lo
  try {
    const { data: bucketExists, error: bucketCheckError } = await supabase
      .storage
      .getBucket('imagens');
      
    if (bucketCheckError) {
      console.log('Bucket não encontrado, tentando criar...');
      const { error: createBucketError } = await supabase
        .storage
        .createBucket('imagens', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
          fileSizeLimit: 5242880, // 5MB
        });
        
      if (createBucketError) {
        console.error('Erro ao criar bucket:', createBucketError);
        throw createBucketError;
      }
      
      console.log('Bucket criado com sucesso');
    } else {
      console.log('Bucket já existe:', bucketExists);
    }
  } catch (err) {
    console.error('Erro ao verificar/criar bucket:', err);
  }
  
  const results: Imagem[] = [];
  
  for (let i = 0; i < images.length; i++) {
    const base64Image = images[i];
    const isCapaImage = i === 0;
    
    try {
      console.log(`Processando imagem ${i+1}/${images.length}`);
      
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
      const fileName = `${discoId}_${i}_${Date.now()}.jpg`;
      
      console.log(`Fazendo upload do arquivo ${fileName}`);
      
      // Upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('imagens')
        .upload(`${discoId}/${fileName}`, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw error;
      }
      
      console.log('Upload bem-sucedido:', data);
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(`${discoId}/${fileName}`);
        
      console.log('URL pública obtida:', urlData);
      
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
        
      if (dbError) {
        console.error('Erro ao inserir registro da imagem no banco:', dbError);
        throw dbError;
      }
      
      console.log('Registro da imagem criado:', imageRecord);
      results.push(imageRecord as Imagem);
    } catch (err) {
      console.error(`Erro ao processar imagem ${i+1}:`, err);
      // Fallback para não quebrar o fluxo se uma imagem falhar
      results.push({
        id: `error-${Date.now()}-${i}`,
        disco_id: discoId,
        url: '',
        tipo_imagem: isCapaImage ? 'capa' : 'adicional',
      });
    }
  }
  
  console.log(`Upload concluído. ${results.length} imagens processadas.`);
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
  console.log('Criando novo lote com nome:', nome);
  console.log('Usando cliente Supabase com URL:', supabaseUrl);
  
  try {
    const { data, error } = await supabase
      .from('lotes')
      .insert({
        nome,
        data_criacao: new Date().toISOString(),
        status: 'pendente',
      })
      .select()
      .single();
      
    if (error) {
      console.error('Erro do Supabase ao criar lote:', error);
      throw error;
    }
    
    console.log('Lote criado com sucesso no Supabase:', data);
    return data as Lote;
  } catch (err) {
    console.error('Exceção ao criar lote:', err);
    throw err;
  }
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

// Função para listar todos os lotes e discos com detalhes
export const listAllData = async () => {
  console.log('===== LISTANDO TODOS OS DADOS DO SUPABASE =====');
  
  try {
    // 1. Buscar todos os lotes
    console.log('Buscando lotes...');
    const { data: lotes, error: lotesError } = await supabase
      .from('lotes')
      .select('*')
      .order('data_criacao', { ascending: false });
      
    if (lotesError) {
      console.error('Erro ao buscar lotes:', lotesError);
      return { success: false, error: lotesError };
    }
    
    console.log(`Encontrados ${lotes.length} lotes:`);
    lotes.forEach(lote => {
      console.log(`- Lote ID: ${lote.id}`);
      console.log(`  Nome: ${lote.nome}`);
      console.log(`  Data de Criação: ${new Date(lote.data_criacao).toLocaleString()}`);
      console.log(`  Status: ${lote.status}`);
    });
    
    // 2. Para cada lote, buscar os discos
    console.log('\nBuscando discos para cada lote...');
    const lotesComDiscos = [];
    
    for (const lote of lotes) {
      const { data: discos, error: discosError } = await supabase
        .from('discos')
        .select('*')
        .eq('lote_id', lote.id)
        .order('data_adicao', { ascending: false });
        
      if (discosError) {
        console.error(`Erro ao buscar discos do lote ${lote.id}:`, discosError);
        continue;
      }
      
      console.log(`\n- Lote: ${lote.nome} (${lote.id}) - ${discos.length} discos:`);
      
      const discosComImagens = [];
      
      // 3. Para cada disco, buscar as imagens
      for (const disco of discos) {
        const { data: imagens, error: imagensError } = await supabase
          .from('imagens')
          .select('*')
          .eq('disco_id', disco.id);
          
        if (imagensError) {
          console.error(`Erro ao buscar imagens do disco ${disco.id}:`, imagensError);
          continue;
        }
        
        console.log(`  - Disco ID: ${disco.id}`);
        console.log(`    Data de Adição: ${new Date(disco.data_adicao).toLocaleString()}`);
        console.log(`    Status: ${disco.status}`);
        console.log(`    Imagens: ${imagens.length}`);
        
        imagens.forEach((imagem, index) => {
          console.log(`      ${index + 1}. ${imagem.tipo_imagem}: ${imagem.url}`);
        });
        
        // 4. Buscar análise do disco, se existir
        const { data: analise, error: analiseError } = await supabase
          .from('analises')
          .select('*')
          .eq('disco_id', disco.id)
          .maybeSingle();
          
        if (!analiseError && analise) {
          console.log(`    Análise:`);
          console.log(`      Artista: ${analise.artista || 'Não informado'}`);
          console.log(`      Álbum: ${analise.album || 'Não informado'}`);
          console.log(`      Valor Estimado: R$ ${analise.valor_estimado?.toFixed(2) || '0.00'}`);
        }
        
        discosComImagens.push({
          ...disco,
          imagens,
          analise: analise || null
        });
      }
      
      lotesComDiscos.push({
        ...lote,
        discos: discosComImagens
      });
    }
    
    console.log('\n===== RESUMO =====');
    console.log(`Total de Lotes: ${lotes.length}`);
    const totalDiscos = lotesComDiscos.reduce((acc, lote) => acc + lote.discos.length, 0);
    console.log(`Total de Discos: ${totalDiscos}`);
    const totalImagens = lotesComDiscos.reduce((acc, lote) => 
      acc + lote.discos.reduce((discAcc, disc) => discAcc + disc.imagens.length, 0), 0);
    console.log(`Total de Imagens: ${totalImagens}`);
    
    return { 
      success: true, 
      data: lotesComDiscos,
      summary: {
        totalLotes: lotes.length,
        totalDiscos,
        totalImagens
      }
    };
  } catch (err) {
    console.error('Erro ao listar dados:', err);
    return { success: false, error: err };
  }
};

// To be implemented in the future:
// - Function to send a batch of discos for analysis
// - Function to update disco status
// - Function to get analysis results 