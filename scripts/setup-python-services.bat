@echo off
chcp 65001 >nul
echo.
echo 🐍 Configurando Serviços Python (Agno + Crawl4AI)
echo ================================================
echo.

:: Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado! Instale Python 3.8+ primeiro.
    echo 📥 Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo ✅ Python encontrado:
python --version

:: Criar diretório para ambientes virtuais se não existir
if not exist "venvs" mkdir venvs

echo.
echo 📦 Configurando Agno RAG Service...
echo -----------------------------------

:: Criar ambiente virtual para Agno
if not exist "venvs\agno" (
    echo 🔧 Criando ambiente virtual para Agno...
    python -m venv venvs\agno
    if errorlevel 1 (
        echo ❌ Erro ao criar ambiente virtual para Agno
        echo 🔧 Tentando com python3...
        python3 -m venv venvs\agno
        if errorlevel 1 (
            echo ❌ Erro crítico: não foi possível criar ambiente virtual
            echo 💡 Verifique se Python está instalado corretamente
            pause
            exit /b 1
        )
    )
    echo ✅ Ambiente virtual do Agno criado
) else (
    echo ✅ Ambiente virtual do Agno já existe
)

:: Verificar se o ambiente foi criado corretamente
if not exist "venvs\agno\Scripts\activate.bat" (
    echo ❌ Ambiente virtual do Agno não foi criado corretamente
    echo 🔧 Removendo e tentando novamente...
    rmdir /s /q venvs\agno 2>nul
    python -m venv venvs\agno
    if errorlevel 1 (
        echo ❌ Falha crítica na criação do ambiente virtual
        pause
        exit /b 1
    )
)

:: Ativar ambiente virtual do Agno e instalar dependências
echo 📥 Instalando dependências do Agno...
call venvs\agno\Scripts\activate.bat

echo 🔧 Atualizando pip...
python -m pip install --upgrade pip --quiet

echo 📦 Tentando instalar dependências completas...
pip install --no-cache-dir -r python-services\agno\requirements.txt --quiet
if errorlevel 1 (
    echo ⚠️ Instalação completa falhou, usando dependências mínimas...
    
    echo 📦 Instalando dependências mínimas do Agno...
    pip install --no-cache-dir -r python-services\agno\requirements-minimal.txt --quiet
    if errorlevel 1 (
        echo ❌ Falha crítica na instalação mínima do Agno
        pause
        exit /b 1
    )
    
    echo 📦 Tentando instalar dependências opcionais...
    pip install sentence-transformers numpy --quiet 2>nul
    pip install python-docx markdown httpx --quiet 2>nul
    
    echo ✅ Instalação mínima do Agno concluída
) else (
    echo ✅ Todas as dependências do Agno instaladas
)

call venvs\agno\Scripts\deactivate.bat

echo.
echo 🕷️ Configurando Crawl4AI Service...
echo ----------------------------------

:: Criar ambiente virtual para Crawl4AI
if not exist "venvs\crawl4ai" (
    echo 🔧 Criando ambiente virtual para Crawl4AI...
    python -m venv venvs\crawl4ai
    if errorlevel 1 (
        echo ❌ Erro ao criar ambiente virtual para Crawl4AI
        echo 🔧 Tentando com python3...
        python3 -m venv venvs\crawl4ai
        if errorlevel 1 (
            echo ❌ Erro crítico: não foi possível criar ambiente virtual
            echo 💡 Verifique se Python está instalado corretamente
            pause
            exit /b 1
        )
    )
    echo ✅ Ambiente virtual do Crawl4AI criado
) else (
    echo ✅ Ambiente virtual do Crawl4AI já existe
)

:: Verificar se o ambiente foi criado corretamente
if not exist "venvs\crawl4ai\Scripts\activate.bat" (
    echo ❌ Ambiente virtual do Crawl4AI não foi criado corretamente
    echo 🔧 Removendo e tentando novamente...
    rmdir /s /q venvs\crawl4ai 2>nul
    python -m venv venvs\crawl4ai
    if errorlevel 1 (
        echo ❌ Falha crítica na criação do ambiente virtual
        pause
        exit /b 1
    )
)

:: Ativar ambiente virtual do Crawl4AI e instalar dependências
echo 📥 Instalando dependências do Crawl4AI...
call venvs\crawl4ai\Scripts\activate.bat

echo 🔧 Atualizando pip...
python -m pip install --upgrade pip --quiet

echo 📦 Tentando instalar dependências completas...
pip install --no-cache-dir -r python-services\crawl4ai\requirements.txt --quiet
if errorlevel 1 (
    echo ⚠️ Instalação completa falhou, usando dependências mínimas...
    
    echo 📦 Instalando dependências mínimas do Crawl4AI...
    pip install --no-cache-dir -r python-services\crawl4ai\requirements-minimal.txt --quiet
    if errorlevel 1 (
        echo ❌ Falha crítica na instalação mínima do Crawl4AI
        pause
        exit /b 1
    )
    
    echo 📦 Tentando instalar dependências opcionais...
    pip install aiohttp httpx html5lib fake-useragent --quiet 2>nul
    pip install readability-lxml --quiet 2>nul
    
    echo ✅ Instalação mínima do Crawl4AI concluída
) else (
    echo ✅ Todas as dependências do Crawl4AI instaladas
)

:: Tentar instalar Playwright (opcional)
echo 🎭 Tentando instalar Playwright (opcional)...
pip install playwright --quiet
if not errorlevel 1 (
    echo 🎭 Instalando navegadores do Playwright...
    playwright install chromium --quiet
    if errorlevel 1 (
        echo ⚠️ Navegadores do Playwright não instalados - usando BeautifulSoup apenas
    ) else (
        echo ✅ Playwright configurado com sucesso
    )
) else (
    echo ⚠️ Playwright não instalado - usando BeautifulSoup apenas
)

call venvs\crawl4ai\Scripts\deactivate.bat

:: Criar diretórios de dados
echo.
echo 📁 Criando diretórios de dados...
if not exist "data\agno" mkdir data\agno
if not exist "data\crawl4ai" mkdir data\crawl4ai
echo ✅ Diretórios criados

:: Criar arquivos de configuração
echo.
echo ⚙️ Criando arquivos de configuração...

:: Arquivo .env para serviços Python
if not exist "python-services\.env" (
    echo # Configurações dos Serviços Python > python-services\.env
    echo AGNO_HOST=127.0.0.1 >> python-services\.env
    echo AGNO_PORT=8000 >> python-services\.env
    echo CRAWL4AI_HOST=127.0.0.1 >> python-services\.env
    echo CRAWL4AI_PORT=8001 >> python-services\.env
    echo LOG_LEVEL=INFO >> python-services\.env
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)

echo.
echo 🎉 Configuração dos serviços Python concluída!
echo.
echo 📋 Próximos passos:
echo    1. Execute INICIAR.bat para iniciar todos os serviços
echo    2. Ou use os scripts individuais em scripts\
echo.
echo 🔗 URLs dos serviços:
echo    • Agno RAG: http://localhost:8000
echo    • Crawl4AI: http://localhost:8001
echo    • Frontend: http://localhost:3000
echo    • Backend: http://localhost:3001
echo.
pause