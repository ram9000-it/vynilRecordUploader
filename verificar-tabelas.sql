-- Script para verificar se as tabelas foram criadas no Supabase

-- Verificar tabela lotes
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'lotes'
);

-- Verificar tabela discos
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'discos'
);

-- Verificar tabela imagens
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'imagens'
);

-- Verificar tabela analises
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'analises'
);

-- Verificar políticas RLS na tabela lotes
SELECT 
    pol.polname AS policy_name,
    pol.polcmd AS command_type
FROM 
    pg_policy pol
JOIN 
    pg_class cls ON pol.polrelid = cls.oid
WHERE 
    cls.relname = 'lotes';

-- Verificar bucket de armazenamento
SELECT EXISTS (
   SELECT FROM storage.buckets
   WHERE id = 'imagens'
);

-- Verificar políticas no storage
SELECT 
    pol.polname AS policy_name,
    pol.polcmd AS command_type
FROM 
    pg_policy pol
JOIN 
    pg_class cls ON pol.polrelid = cls.oid
WHERE 
    cls.relname = 'objects' AND cls.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage'); 