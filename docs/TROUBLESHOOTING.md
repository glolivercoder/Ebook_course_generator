# 🔧 Solução de Problemas

Este documento lista os problemas mais comuns e suas soluções.

## ❌ **Erros Corrigidos**

### 1. **Erro: "No matching distribution found for sqlite3"**

**Problema**: `sqlite3` já vem incluído no Python e não deve estar no requirements.txt

**Solução**: ✅ Removido `sqlite3` dos arquivos requirements.txt

### 2. **Erro: "Microsoft Visual C++ 14.0 is required"**

**Problema**: Algumas dependências precisam de compilação

**Solução**: ✅ Criados requirements-minimal.txt com dependências pré-compiladas

### 3. **Erro: "Failed building wheel for sentence-transformers"**

**Problema**: Dependência pesada que pode falhar

**Solução**: ✅ Tornado opcional com fallback para modo básico

### 4. **Erro: "Port already in use"**

**Problema**: Portas 8000/8001 já em uso

**Solução**: 
```bash
# Verificar processos
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# Matar processo se necessário
taskkill /PID <PID> /F
```

## 🐛 **Problemas Comuns**

### **Python não encontrado**
```bash
# Verificar instalação
python --version

# Adicionar ao PATH se necessário
# Windows: Configurações > Sistema > Variáveis de Ambiente
```

### **pip não encontrado**
```bash
# Reinstalar pip
python -m ensurepip --upgrade
python -m pip install --upgrade pip
```

### **Ambiente virtual não ativa**
```bash
# Ativar manualmente
venvs\agno\Scripts\activate.bat
venvs\crawl4ai\Scripts\activate.bat
```

### **Dependências não instalam**
```bash
# Usar instalação mínima
pip install -r python-services\agno\requirements-minimal.txt
pip install -r python-services\crawl4ai\requirements-minimal.txt
```

## 🔄 **Scripts de Recuperação**

### **Limpeza Completa**
```bash
# Execute para limpar tudo e reinstalar
scripts\clean-install.bat
```

### **Teste dos Serviços**
```bash
# Execute para verificar se tudo funciona
scripts\test-services.bat
```

### **Verificar Dependências**
```bash
# Execute para verificar o que está faltando
scripts\check-dependencies.bat
```

## 🚀 **Modos de Funcionamento**

### **Modo Completo**
- ✅ Todas as dependências instaladas
- ✅ RAG com embeddings avançados
- ✅ Web scraping com Playwright
- ✅ Todas as funcionalidades

### **Modo Básico**
- ✅ Dependências mínimas apenas
- ⚠️ RAG com busca por texto simples
- ⚠️ Web scraping apenas com BeautifulSoup
- ✅ Funcionalidades essenciais

### **Modo Fallback**
- ✅ Apenas FastAPI + requests
- ❌ Sem RAG avançado
- ❌ Sem web scraping assíncrono
- ✅ Interface funcional

## 📊 **Verificação de Status**

### **Agno RAG Service**
```bash
# Verificar se está rodando
curl http://localhost:8000/health

# Resposta esperada:
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "agno_rag": "running",
    "embeddings": "loaded" | "not_loaded"
  }
}
```

### **Crawl4AI Service**
```bash
# Verificar se está rodando
curl http://localhost:8001/health

# Resposta esperada:
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "crawl4ai": "running",
    "session": "active" | "inactive"
  }
}
```

## 🔧 **Configurações Avançadas**

### **Variáveis de Ambiente**

Crie `python-services\.env`:
```env
# Agno Configuration
AGNO_HOST=127.0.0.1
AGNO_PORT=8000

# Crawl4AI Configuration
CRAWL4AI_HOST=127.0.0.1
CRAWL4AI_PORT=8001

# Logging
LOG_LEVEL=INFO
```

### **Configuração de Proxy**
```bash
# Se estiver atrás de proxy corporativo
set HTTP_PROXY=http://proxy:8080
set HTTPS_PROXY=http://proxy:8080

# Ou no pip
pip install --proxy http://proxy:8080 package_name
```

### **Configuração de Memória**
```bash
# Para sistemas com pouca RAM
set PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:512
```

## 📝 **Logs e Debugging**

### **Localização dos Logs**
- **Agno**: `data/agno/agno.log`
- **Crawl4AI**: `data/crawl4ai/crawl4ai.log`
- **Backend**: Console do terminal
- **Frontend**: Console do navegador

### **Aumentar Verbosidade**
```bash
# No arquivo .env
LOG_LEVEL=DEBUG
```

### **Logs em Tempo Real**
```bash
# Windows
tail -f data/agno/agno.log
tail -f data/crawl4ai/crawl4ai.log
```

## 🆘 **Suporte**

### **Antes de Pedir Ajuda**
1. ✅ Execute `scripts\check-dependencies.bat`
2. ✅ Execute `scripts\test-services.bat`
3. ✅ Verifique os logs
4. ✅ Tente `scripts\clean-install.bat`

### **Informações para Suporte**
- Versão do Python: `python --version`
- Versão do Node.js: `node --version`
- Sistema operacional
- Logs de erro completos
- Resultado dos scripts de teste

### **Problemas Conhecidos**
- **Windows Defender**: Pode bloquear downloads de dependências
- **Antivírus**: Pode interferir com ambientes virtuais
- **Proxy Corporativo**: Pode bloquear instalação de pacotes
- **Espaço em Disco**: Dependências ocupam ~2GB

---

**💡 Dica**: Use sempre o `INICIAR.bat` para uma experiência mais estável!