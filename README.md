# 📚 Gerador de E-books e Cursos com IA

Um sistema completo para criação de e-books e cursos educacionais usando inteligência artificial, RAG (Retrieval-Augmented Generation) e web scraping.

## 🚀 Características

- **Interface Minimalista**: Interface web moderna e responsiva
- **Múltiplos Provedores de IA**: OpenAI, Anthropic, Google Gemini, OpenRouter
- **Sistema RAG**: Integração com Agno para contexto inteligente
- **Web Scraping**: Crawl4AI para coleta de dados de pesquisa
- **Geração Incremental**: Criação de capítulos individuais sem perder contexto
- **Editor Visual**: Interface similar ao Kindle Create para diagramação
- **Templates Profissionais**: Layouts otimizados para Kindle, PDF e web
- **Múltiplos Formatos**: Exportação para PDF, HTML, JSON, EPUB, DOCX, SCORM, Kindle
- **Gestão de Mídia**: Adição de imagens, gráficos e elementos interativos
- **Integração com Editores**: Adobe InDesign, Canva, Affinity Publisher
- **Kindle Direct Publishing**: Exportação otimizada para KDP
- **Plataformas**: Integração com Lovble, Cursor e outras plataformas

## 🛠️ Tecnologias

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Vite para build e desenvolvimento
- Interface responsiva e moderna

### Backend
- Node.js com Express
- APIs RESTful
- Integração com múltiplos serviços de IA

### Integrações
- **Agno**: Sistema RAG para contexto inteligente
- **Crawl4AI**: Web scraping avançado
- **OpenAI**: GPT-4 e outros modelos
- **Anthropic**: Claude
- **Google**: Gemini
- **OpenRouter**: Acesso a múltiplos modelos

## 📦 Instalação

### Pré-requisitos
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://python.org/) (para RAG e Web Scraping)
- **npm ou yarn** - Incluído com Node.js

### 🚀 Instalação Rápida (Windows)

1. **Clone o repositório**
```bash
git clone <repository-url>
cd ebook-course-generator
```

2. **Execute o instalador automático**
```bash
# Execute o arquivo INICIAR.bat
INICIAR.bat
```

3. **Siga o assistente de configuração**
   - O sistema detectará se é a primeira execução
   - Instalará automaticamente todas as dependências
   - Configurará os ambientes virtuais Python

4. **Acesse a aplicação**
```
http://localhost:3000
```

### 🔧 Instalação Manual

#### 1. Dependências Node.js
```bash
npm install
```

#### 2. Configurar Serviços Python (Opcional)
```bash
# Executar script de configuração
scripts\setup-python-services.bat

# Ou manualmente:
python -m venv venvs\agno
python -m venv venvs\crawl4ai
# ... (ver docs/PYTHON_SETUP.md)
```

#### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas chaves de API
```

#### 4. Iniciar serviços
```bash
# Opção 1: Usar INICIAR.bat (Recomendado)
INICIAR.bat

# Opção 2: Scripts individuais
scripts\start-backend.bat
scripts\start-frontend.bat
scripts\start-agno.bat      # Opcional
scripts\start-crawl4ai.bat  # Opcional

# Opção 3: Comandos manuais
npm run server    # Backend
npm run dev       # Frontend
```

## ⚙️ Configuração

### 1. Chaves de API

Configure suas chaves de API no arquivo `.env`:

```env
# APIs de IA
OPENAI_API_KEY=sua_chave_openai
ANTHROPIC_API_KEY=sua_chave_anthropic
GOOGLE_AI_API_KEY=sua_chave_google
OPENROUTER_API_KEY=sua_chave_openrouter

# Agno RAG
AGNO_ENDPOINT=http://localhost:8000
AGNO_API_KEY=sua_chave_agno

# Crawl4AI
CRAWL4AI_ENDPOINT=http://localhost:8001
```

### 2. Agno (RAG)

Para usar o sistema RAG com Agno:

1. Instale e configure o Agno
2. Configure o endpoint na interface ou arquivo .env
3. Inicialize o índice RAG na aba "Configurações"

### 3. Crawl4AI

Para web scraping com Crawl4AI:

1. Instale e configure o Crawl4AI
2. Configure o endpoint na interface
3. Teste a conexão na aba "Configurações"

## 🎯 Como Usar

### 🚀 Início Rápido

1. **Execute INICIAR.bat**
2. **Escolha "INICIAR TUDO"** (recomendado)
3. **Acesse http://localhost:3000**
4. **Configure suas chaves de API** na aba "Configurações"

### 📚 Fluxo Completo

#### 1. Criar Projeto
1. Acesse a aba **"Criador"**
2. Preencha as informações:
   - Título e tipo (E-book/Curso)
   - Tema e descrição detalhada
   - Público-alvo e número de capítulos
   - URLs para pesquisa (opcional - usa Crawl4AI)
3. Clique em **"Gerar Estrutura do Projeto"**

#### 2. Gerenciar Capítulos
1. Acesse a aba **"Capítulos"**
2. Para cada capítulo:
   - **"Gerar Conteúdo"** - Cria texto com IA + contexto RAG
   - **"Adicionar Mídia"** - Imagens e gráficos
   - **"Editar"** - Modificações manuais
   - **"Visualizar"** - Preview do capítulo

#### 3. Editor Visual (Novo!)
1. Acesse a aba **"Editor Visual"**
2. **"Abrir Editor Visual"** - Interface estilo Kindle Create
3. **"Carregar Capítulo"** - Importa conteúdo gerado
4. Edite com drag-and-drop, templates profissionais

#### 4. Configurar Integrações
1. Acesse a aba **"Configurações"**
2. Configure:
   - **Provedor de IA** (OpenAI, Claude, Gemini, OpenRouter)
   - **Agno RAG** (contexto inteligente)
   - **Crawl4AI** (web scraping)
   - **Parâmetros gerais** (tokens, temperatura, idioma)

#### 5. Exportar Projeto
1. Acesse a aba **"Exportar"**
2. Escolha formato:
   - **E-books**: PDF, EPUB, DOCX, **Kindle**
   - **Cursos**: SCORM, HTML, JSON
   - **Editores**: InDesign, Canva, Affinity
   - **Plataformas**: KDP, Lovble, Cursor

## 🔧 API Endpoints

### Projetos
- `GET /api/projects` - Listar projetos
- `GET /api/projects/:id` - Obter projeto
- `POST /api/projects` - Criar projeto
- `PUT /api/projects/:id` - Atualizar projeto
- `DELETE /api/projects/:id` - Deletar projeto

### IA
- `POST /api/ai/test` - Testar conexão
- `POST /api/ai/generate` - Gerar conteúdo
- `POST /api/ai/generate-outline` - Gerar estrutura

### RAG
- `POST /api/rag/test` - Testar Agno
- `POST /api/rag/initialize` - Inicializar índice
- `POST /api/rag/save-project` - Salvar projeto
- `POST /api/rag/search` - Buscar contexto

### Web Scraping
- `POST /api/crawl/test` - Testar Crawl4AI
- `POST /api/crawl/scrape` - Fazer scraping
- `POST /api/crawl/analyze` - Analisar página

### Exportação
- `POST /api/export/:id/:format` - Exportar projeto
- `GET /api/export/download/:filename` - Download

## 🎨 Personalização

### Temas e Estilos
- Modifique o CSS no arquivo HTML principal
- Adicione novos temas na seção de estilos
- Customize cores e layouts conforme necessário

### Novos Provedores de IA
1. Adicione o provedor em `server/routes/ai.js`
2. Implemente a lógica de conexão e geração
3. Atualize a interface de configuração

### Formatos de Exportação
1. Adicione o formato em `server/routes/export.js`
2. Implemente a função de conversão
3. Atualize a interface de exportação

## 🔍 Resolução de Problemas

### Erro de Conexão com IA
- Verifique se a chave API está correta
- Confirme se o provedor está disponível
- Teste a conexão na aba Configurações

### Problemas com RAG
- Verifique se o Agno está rodando
- Confirme o endpoint e chave API
- Inicialize o índice RAG

### Falhas no Web Scraping
- Verifique se o Crawl4AI está ativo
- Confirme as URLs fornecidas
- Ajuste os parâmetros de delay e profundidade

## 📝 Estrutura do Projeto

```
ebook-course-generator/
├── server/
│   ├── routes/
│   │   ├── ai.js          # Rotas de IA
│   │   ├── rag.js         # Rotas RAG
│   │   ├── crawl.js       # Rotas web scraping
│   │   ├── projects.js    # Rotas de projetos
│   │   └── export.js      # Rotas de exportação
│   └── index.js           # Servidor principal
├── data/
│   ├── projects/          # Projetos salvos
│   └── exports/           # Arquivos exportados
├── ebook_course_generator.html  # Interface principal
├── package.json
├── vite.config.js
└── README.md
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação
- Verifique os logs do sistema na interface

---

**Desenvolvido com ❤️ para educadores e criadores de conteúdo**