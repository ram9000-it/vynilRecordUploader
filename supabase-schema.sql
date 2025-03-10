-- Esquema para o banco de dados Supabase do Pitaya Records Uploader

-- Habilitar a extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de lotes
CREATE TABLE IF NOT EXISTS lotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('pendente', 'analisado', 'completo')) DEFAULT 'pendente'
);

-- Tabela de discos
CREATE TABLE IF NOT EXISTS discos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pendente', 'analisado')) DEFAULT 'pendente',
  data_adicao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de imagens
CREATE TABLE IF NOT EXISTS imagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disco_id UUID REFERENCES discos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo_imagem TEXT CHECK (tipo_imagem IN ('capa', 'adicional')) DEFAULT 'adicional'
);

-- Tabela de análises
CREATE TABLE IF NOT EXISTS analises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  disco_id UUID REFERENCES discos(id) ON DELETE CASCADE,
  artista TEXT,
  album TEXT,
  descricao TEXT,
  valor_estimado DECIMAL(10, 2)
);

-- Políticas de segurança RLS (Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso anônimo (para simplificar o exemplo)
-- Em um ambiente de produção real, você deve restringir o acesso com autenticação
CREATE POLICY "Acesso público para leitura de lotes" ON lotes FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserção de lotes" ON lotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualização de lotes" ON lotes FOR UPDATE USING (true);
CREATE POLICY "Acesso público para exclusão de lotes" ON lotes FOR DELETE USING (true);

CREATE POLICY "Acesso público para leitura de discos" ON discos FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserção de discos" ON discos FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualização de discos" ON discos FOR UPDATE USING (true);
CREATE POLICY "Acesso público para exclusão de discos" ON discos FOR DELETE USING (true);

CREATE POLICY "Acesso público para leitura de imagens" ON imagens FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserção de imagens" ON imagens FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualização de imagens" ON imagens FOR UPDATE USING (true);
CREATE POLICY "Acesso público para exclusão de imagens" ON imagens FOR DELETE USING (true);

CREATE POLICY "Acesso público para leitura de análises" ON analises FOR SELECT USING (true);
CREATE POLICY "Acesso público para inserção de análises" ON analises FOR INSERT WITH CHECK (true);
CREATE POLICY "Acesso público para atualização de análises" ON analises FOR UPDATE USING (true);
CREATE POLICY "Acesso público para exclusão de análises" ON analises FOR DELETE USING (true);

-- Criar um bucket de armazenamento para as imagens
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('imagens', 'imagens', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Política para permitir upload de arquivos no bucket 'imagens'
CREATE POLICY "Permitir uploads públicos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'imagens');
  
CREATE POLICY "Permitir acesso público" ON storage.objects
  FOR SELECT USING (bucket_id = 'imagens'); 