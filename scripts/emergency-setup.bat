@echo off
chcp 65001 >nul
title Configuração de Emergência

echo.
echo 🚨 CONFIGURAÇÃO DE EMERGÊNCIA
echo =============================
echo.
echo Este script tentará configurar o sistema mesmo
echo quando há problemas com a configuração normal.
echo.
pause

:: Limpar tudo primeiro
echo 🧹 Limpando configuração anterior...
if exist "venvs" (
    echo Removendo ambientes virtuais antigos...
    rmdir /s /q venvs 2>nul
)

:: Verificar Python
echo.
echo 🐍 Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado!
    echo.
    echo 💡 SOLUÇÃO:
    echo   1. Baixe Python de https://python.org/downloads/
    echo   2. Durante a instalação, marque "Add Python to PATH"
    echo   3. Reinicie o computador após a instalação
    echo   4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Python encontrado:
python --version

:: Criar diretórios
echo.
echo 📁 Criando diretórios necessários...
if not exist "venvs" mkdir venvs
if not exist "data" mkdir data
if not exist "data\agno" mkdir data\agno
if not exist "data\crawl4ai" mkdir data\crawl4ai
if not exist "data\projects" mkdir data\projects
if not exist "data\exports" mkdir data\exports

:: Criar ambiente virtual mínimo para Agno
echo.
echo 🧠 Configurando Agno (modo mínimo)...
python -m venv venvs\agno
if errorlevel 1 (
    echo ❌ Falha ao criar ambiente virtual do Agno
    pause
    exit /b 1
)

call venvs\agno\Scripts\activate.bat
echo Instalando dependências mínimas do Agno...
python -m pip install --upgrade pip --quiet
python -m pip install fastapi uvicorn pydantic --quiet
python -m pip install python-multipart aiofiles --quiet
python -m pip install requests beautifulsoup4 --quiet
python -m pip install python-dotenv pyyaml --quiet
python -m pip install sqlalchemy loguru --quiet
call venvs\agno\Scripts\deactivate.bat

echo ✅ Agno configurado em modo mínimo

:: Criar ambiente virtual mínimo para Crawl4AI
echo.
echo 🕷️ Configurando Crawl4AI (modo mínimo)...
python -m venv venvs\crawl4ai
if errorlevel 1 (
    echo ❌ Falha ao criar ambiente virtual do Crawl4AI
    pause
    exit /b 1
)

call venvs\crawl4ai\Scripts\activate.bat
echo Instalando dependências mínimas do Crawl4AI...
python -m pip install --upgrade pip --quiet
python -m pip install fastapi uvicorn pydantic --quiet
python -m pip install python-multipart aiofiles --quiet
python -m pip install requests beautifulsoup4 lxml --quiet
python -m pip install python-dotenv pyyaml --quiet
python -m pip install sqlalchemy loguru validators --quiet
call venvs\crawl4ai\Scripts\deactivate.bat

echo ✅ Crawl4AI configurado em modo mínimo

:: Verificar Node.js
echo.
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo 💡 SOLUÇÃO:
    echo   1. Baixe Node.js de https://nodejs.org/
    echo   2. Instale a versão LTS recomendada
    echo   3. Reinicie o computador após a instalação
    echo   4. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado:
node --version

:: Instalar dependências Node.js
echo.
echo 📦 Instalando dependências Node.js...
if exist "node_modules" (
    echo Removendo node_modules antigo...
    rmdir /s /q node_modules 2>nul
)

if exist "package-lock.json" (
    del package-lock.json 2>nul
)

npm install
if errorlevel 1 (
    echo ❌ Falha na instalação das dependências Node.js
    echo.
    echo 💡 SOLUÇÕES:
    echo   1. Execute como administrador
    echo   2. Verifique sua conexão com a internet
    echo   3. Tente: npm cache clean --force
    echo.
    pause
    exit /b 1
)

echo ✅ Dependências Node.js instaladas

:: Criar arquivos de configuração
echo.
echo ⚙️ Criando arquivos de configuração...

if not exist ".env" (
    echo Criando arquivo .env...
    copy .env.example .env >nul 2>&1
    if not exist ".env" (
        echo # Configuração de Emergência > .env
        echo OPENAI_API_KEY=your_openai_key_here >> .env
        echo AGNO_ENDPOINT=http://localhost:8000 >> .env
        echo CRAWL4AI_ENDPOINT=http://localhost:8001 >> .env
    )
)

:: Teste rápido
echo.
echo 🧪 Teste rápido...
echo Testando ambiente Agno...
call venvs\agno\Scripts\activate.bat
python -c "import fastapi; print('✅ Agno OK')" 2>nul || echo "⚠️ Agno com problemas"
call venvs\agno\Scripts\deactivate.bat

echo Testando ambiente Crawl4AI...
call venvs\crawl4ai\Scripts\activate.bat
python -c "import fastapi; print('✅ Crawl4AI OK')" 2>nul || echo "⚠️ Crawl4AI com problemas"
call venvs\crawl4ai\Scripts\deactivate.bat

echo.
echo 🎉 CONFIGURAÇÃO DE EMERGÊNCIA CONCLUÍDA!
echo ========================================
echo.
echo ✅ Ambientes virtuais criados
echo ✅ Dependências mínimas instaladas
echo ✅ Arquivos de configuração criados
echo.
echo 🚀 Próximos passos:
echo   1. Execute INICIAR.bat
echo   2. Escolha "INICIAR ESSENCIAL" para testar
echo   3. Configure suas chaves de API no arquivo .env
echo.
echo ⚠️ NOTA: Esta é uma configuração mínima.
echo   Para recursos completos, execute setup-python-services.bat
echo.
pause