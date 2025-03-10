# Front-end e Fluxo UX - Catálogo de Discos LP

## Visão Geral
Este documento descreve o fluxo de experiência do usuário e os componentes de interface para o aplicativo de catalogação de discos LP.

## Páginas e Navegação

### Página Inicial
- **Layout**: Minimalista e focado em ação
- **Componentes principais**:
  - Cabeçalho com logo e título do app
  - Botão "Adicionar Lote" (call-to-action principal)
  - Lista de lotes existentes em formato de cards
  - Cada card exibe: nome do lote, miniatura da primeira capa, contador de discos, data de criação

### Página de Lote
- **Componentes principais**:
  - Cabeçalho com nome do lote e data de criação
  - Botão "Adicionar Disco" em destaque
  - Grade de discos já adicionados
  - Cada card de disco mostra imagem da capa
  - Botão "Enviar Lote para Análise" (na parte inferior)
  - Botão de navegação para voltar à página inicial

### Interface de Captura de Fotos
- **Componentes principais**:
  - Visualização da câmera em tempo real
  - Botão de captura
  - Contador de fotos (1/X - primeira é a capa)
  - Miniaturas de fotos já capturadas
  - Botões "Refazer" e "Concluir"

### Página de Disco Individual
- **Componentes principais**:
  - Imagem da capa em tamanho ampliado
  - Carrossel de fotos adicionais (se houver)
  - Seção de informações do disco (após análise):
    - Artista/banda
    - Nome do álbum
    - Descrição
    - Valor estimado
  - Botão de edição manual
  - Navegação para voltar ao lote

### Modal de Análise
- **Componentes principais**:
  - Indicador de progresso geral
  - Lista de discos sendo analisados
  - Status individual por disco
  - Botão para cancelar análise

## Fluxos de Usuário

### Fluxo Principal
1. Usuário acessa a página inicial
2. Cria novo lote ou seleciona lote existente
3. Adiciona discos ao lote através de fotos
4. Envia lote para análise
5. Visualiza e edita resultados se necessário

### Fluxo de Criação de Lote
1. Clique em "Adicionar Lote"
2. Insere nome opcional para o lote
3. Confirma criação
4. Sistema redireciona para a página do novo lote

### Fluxo de Adição de Disco
1. Dentro da página de lote, clique em "Adicionar Disco"
2. Sistema solicita permissão para câmera (se necessário)
3. Usuário captura foto da capa (marcada automaticamente como principal)
4. Opção para capturar fotos adicionais
5. Confirma adição do disco
6. Sistema retorna à visualização do lote com novo disco adicionado

### Fluxo de Análise
1. Na página do lote, clique em "Enviar Lote para Análise"
2. Sistema exibe progresso da análise
3. Ao concluir, exibe resultados por disco
4. Usuário pode editar informações incorretas
5. Usuário confirma resultados