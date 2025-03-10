# Pitaya Records - Vinyl Record Uploader

Aplicativo para fotografar e catalogar discos de vinil usando a câmera do celular.

## Configuração

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (https://supabase.com)
- Conta no Vercel (https://vercel.com)

### Configuração do Supabase

1. Crie um novo projeto no Supabase chamado "pitaya-uploader"
2. No SQL Editor do Supabase, execute o script `supabase-schema.sql` para criar as tabelas e políticas
3. No painel do Supabase, vá para Settings > API e copie:
   - URL do projeto
   - anon/public key

### Configuração do Vercel

1. Faça deploy do projeto no Vercel
2. No painel do Vercel, vá para Settings > Environment Variables e adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: chave anon/public do seu projeto Supabase

### Desenvolvimento local

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Crie um arquivo `.env.local` com as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   ```
4. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Uso

1. Acesse o aplicativo pelo URL do Vercel
2. Na página inicial, crie um novo lote ou selecione um existente
3. Na página de captura, permita o acesso à câmera quando solicitado
4. Fotografe o disco de vinil
5. Adicione informações adicionais se necessário
6. Envie para análise

## Estrutura do Projeto

- `src/app`: Páginas da aplicação (Next.js App Router)
- `src/components`: Componentes React reutilizáveis
- `src/utils`: Utilitários, incluindo a integração com o Supabase

## Tecnologias

- Next.js 15
- React 19
- Supabase (banco de dados e armazenamento)
- Vercel (hospedagem)
- TypeScript
- Tailwind CSS

## Licença

Este projeto é proprietário e confidencial. © Pitaya Records 2024. 