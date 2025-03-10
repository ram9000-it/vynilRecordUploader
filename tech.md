# Tech Stack - Catálogo de Discos LP

## Visão Geral
Este documento descreve a pilha tecnológica completa para o aplicativo de catalogação de discos LP, definindo as tecnologias escolhidas e suas funções no projeto.

## Front-end

### Framework Principal
- **Next.js 14+**: Framework React para renderização híbrida (cliente/servidor)
  - Utilização de App Router para roteamento baseado em pastas
  - API Routes para endpoints do backend
  - Uso de Server Components para melhor performance

### UI/Componentes
- **Tailwind CSS**: Para estilização rápida e responsiva
- **Headless UI**: Componentes acessíveis sem estilos predefinidos
- **React Webcam**: Para acesso à câmera do dispositivo
- **SWR**: Para gerenciamento de estado e requisições

### Outras Ferramentas Front-end
- **Framer Motion**: Para animações suaves na interface
- **React Hook Form**: Para gerenciamento de formulários

## Back-end

### Plataforma Serverless
- **Next.js API Routes**: Para funcionalidades de back-end sem servidor dedicado
  - Manipulação de requisições
  - Integração com serviços externos

## Banco de Dados e Armazenamento

### Supabase
- **PostgreSQL**: Banco de dados relacional hospedado pelo Supabase
  - Tabelas principais:
    - `lotes`: Armazena informações de cada lote
    - `discos`: Armazena metadados de cada disco
    - `imagens`: Armazena referências às imagens de cada disco
  - Row Level Security (RLS) para segurança de dados

- **Supabase Storage**: Para armazenamento de imagens
  - Buckets configurados para diferentes tipos de imagens
  - Políticas de acesso para controle de permissões

- **Supabase Auth** (opcional): Para autenticação de usuários
  - Login sem senha via magic link
  - Autenticação social (opcional)

## Integração com IA

### Opções para Reconhecimento de Imagens
- **Opção Principal**: API Discogs
  - Identificação de álbuns através de imagens
  - Retorno de metadados detalhados

- **Alternativa**: Hugging Face Inference API
  - Modelos de visão computacional para reconhecimento de imagens
  - Extração de texto e elementos visuais das capas

## Implantação/Hosting

### Plataforma de Hospedagem
- **Vercel**: Para hospedagem do aplicativo Next.js
  - Implantação contínua via GitHub
  - Ambiente de preview para testes
  - Plano gratuito para projetos hobby

## Ferramentas de Desenvolvimento

### Desenvolvimento e Qualidade
- **TypeScript**: Para tipagem estática e melhor DX
- **ESLint**: Para linting de código
- **Prettier**: Para formatação consistente
- **Jest/React Testing Library**: Para testes (opcional)