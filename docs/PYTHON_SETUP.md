# 🐍 Configuração dos Serviços Python

Este documento explica como configurar e executar os serviços Agno (RAG) e Crawl4AI usando ambientes virtuais Python.

## 📋 **Pré-requisitos**

### Python
- **Versão**: Python 3.8 ou superior
- **Download**: https://www.python.org/downloads/
- **Verificação**: `python --version`

### Dependências do Sistema (Windows)
```bash
# Instalar Visual C++ Build Tools (para algumas dependências)
# Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

## 🚀 **Instalação Automática (Recomendada)**

### Usando INICIAR.bat
1. Execute `INICIAR.bat` na raiz do projeto
2. Escolha opção **4** (Configurações e Setup)
3. Escolha opção **1** (Reconfigurar serviços Python)
4. Aguarde a instalação automática

### Usando Script Direto
```bash
# Execute o script de configuração
scripts\setup-python-services.bat
```

## 🔧 **Instalação Manual**

### 1. Criar Ambientes Virtuais

```bash
# Criar diretório para ambientes virtuais
mkdir venvs

# Ambiente virtual para Agno RAG
python -m venv venvs\agno

# Ambiente virtual para Crawl4AI
python -m venv venvs\crawl4ai
```

### 2. Instalar Dependências do Agno

```bash
# Ativar ambiente virtual
venvs\agno\Scripts\activate.bat

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r python-services\agno\requirements.txt

# Desativar ambiente
deactivate
```

### 3. Instalar Dependências do Crawl4AI

```bash
# Ativar ambiente virtual
venvs\crawl4ai\Scripts\activate.bat

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r python-services\crawl4ai\requirements.txt

# Instalar navegadores do Playwright (opcional)
playwright install

# Desativar ambiente
deactivate
```

## 🏃 **Executando os Serviços**

### Opção 1: Scripts Individuais

```bash
# Iniciar Agno RAG
scripts\start-agno.bat

# Iniciar Crawl4AI (em outro terminal)
scripts\start-crawl4ai.bat
```

### Opção 2: Comando Manual

```bash
# Agno RAG
cd python-services\agno
..\..\venvs\agno\Scripts\activate.bat
python main.py

# Crawl4AI (novo terminal)
cd python-services\crawl4ai
..\..\venvs\crawl4ai\Scripts\activate.bat
python main.py
```

### Opção 3: INICIAR.bat
- Execute `INICIAR.bat`
- Escolha **"INICIAR TUDO"** ou **"INICIAR SERVIÇOS INDIVIDUAIS"**

## 🔗 **URLs dos Serviços**

### Agno RAG Service
- **URL**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Crawl4AI Service
- **URL**: http://localhost:8001
- **Documentação**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## ⚙️ **Configuração**

### Variáveis de Ambiente

Crie o arquivo `python-services\.env`:

```env
# Agno RAG Configuration
AGNO_HOST=127.0.0.1
AGNO_PORT=8000

# Crawl4AI Configuration
CRAWL4AI_HOST=127.0.0.1
CRAWL4AI_PORT=8001

# Logging
LOG_LEVEL=INFO
```

### Configuração do Agno RAG

```python
# Exemplo de uso da API do Agno
import requests

# Criar índice
response = requests.post('http://localhost:8000/indices', json={
    'name': 'ebook-projects',
    'description': 'Índice para projetos de e-books',
    'settings': {
        'embedding_model': 'sentence-transformers/all-MiniLM-L6-v2',
        'chunk_size': 1000,
        'chunk_overlap': 200
    }
})

# Adicionar documento
response = requests.post('http://localhost:8000/documents', json={
    'index': 'ebook-projects',
    'document_id': 'project_1',
    'content': 'Conteúdo do projeto...',
    'metadata': {
        'type': 'project',
        'title': 'Meu E-book'
    }
})

# Buscar documentos
response = requests.post('http://localhost:8000/search', json={
    'index': 'ebook-projects',
    'query': 'marketing digital',
    'limit': 5
})
```

### Configuração do Crawl4AI

```python
# Exemplo de uso da API do Crawl4AI
import requests

# Fazer crawling
response = requests.post('http://localhost:8001/crawl', json={
    'url': 'https://example.com',
    'depth': 2,
    'delay': 1000,
    'extract_content': True,
    'extract_links': True,
    'extract_images': True
})

# Extrair conteúdo específico
response = requests.post('http://localhost:8001/extract', json={
    'url': 'https://example.com',
    'selectors': {
        'title': 'h1',
        'content': '.content p',
        'links': 'a[href]'
    }
})
```

## 🐛 **Solução de Problemas**

### Erro: "Python não encontrado"
```bash
# Verificar instalação
python --version
python3 --version

# Adicionar ao PATH se necessário
# Windows: Configurações > Sistema > Variáveis de Ambiente
```

### Erro: "pip não encontrado"
```bash
# Reinstalar pip
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

### Erro: "Microsoft Visual C++ 14.0 is required"
```bash
# Instalar Visual C++ Build Tools
# Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Ou usar versões pré-compiladas
pip install --only-binary=all package_name
```

### Erro: "Port already in use"
```bash
# Verificar processos usando as portas
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Matar processo se necessário
taskkill /PID <PID> /F

# Ou alterar portas nos arquivos .env
```

### Erro: "Permission denied"
```bash
# Executar como administrador
# Ou verificar permissões da pasta

# Limpar cache do pip
pip cache purge
```

### Problemas com Playwright
```bash
# Reinstalar navegadores
venvs\crawl4ai\Scripts\activate.bat
playwright install

# Se falhar, o serviço funcionará apenas com BeautifulSoup
```

## 📊 **Monitoramento**

### Logs dos Serviços
- Os logs aparecem nos terminais dos serviços
- Nível de log configurável via `LOG_LEVEL`

### Health Checks
```bash
# Verificar status dos serviços
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### Métricas (Futuro)
- Prometheus endpoints planejados
- Grafana dashboards
- Alertas automáticos

## 🔄 **Atualizações**

### Atualizar Dependências
```bash
# Agno
venvs\agno\Scripts\activate.bat
pip install --upgrade -r python-services\agno\requirements.txt
deactivate

# Crawl4AI
venvs\crawl4ai\Scripts\activate.bat
pip install --upgrade -r python-services\crawl4ai\requirements.txt
deactivate
```

### Backup de Dados
```bash
# Fazer backup dos dados do Agno
xcopy data\agno backup\agno\ /E /I

# Fazer backup dos dados do Crawl4AI
xcopy data\crawl4ai backup\crawl4ai\ /E /I
```

## 🚀 **Produção**

### Usando Gunicorn (Linux/Mac)
```bash
# Instalar gunicorn
pip install gunicorn

# Executar Agno
gunicorn -w 4 -k uvicorn.workers.UvicornWorker python-services.agno.main:app --bind 0.0.0.0:8000

# Executar Crawl4AI
gunicorn -w 4 -k uvicorn.workers.UvicornWorker python-services.crawl4ai.main:app --bind 0.0.0.0:8001
```

### Usando Docker (Alternativa)
```bash
# Build das imagens
docker build -t agno-service python-services/agno/
docker build -t crawl4ai-service python-services/crawl4ai/

# Executar containers
docker run -d -p 8000:8000 agno-service
docker run -d -p 8001:8001 crawl4ai-service
```

## 📚 **Recursos Adicionais**

- [Documentação FastAPI](https://fastapi.tiangolo.com/)
- [Guia Python Virtual Environments](https://docs.python.org/3/tutorial/venv.html)
- [Playwright Documentation](https://playwright.dev/python/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

---

**💡 Dica**: Use o arquivo `INICIAR.bat` para uma experiência mais simples e automatizada!