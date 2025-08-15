@echo off
chcp 65001 >nul
title Verificador de Dependências

echo.
echo 🔍 VERIFICADOR DE DEPENDÊNCIAS
echo ==============================
echo.

set "all_ok=true"

:: Verificar Node.js
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado
    echo    📥 Download: https://nodejs.org/
    set "all_ok=false"
) else (
    echo ✅ Node.js encontrado:
    node --version
)

:: Verificar npm
echo.
echo 📦 Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não encontrado
    set "all_ok=false"
) else (
    echo ✅ npm encontrado:
    npm --version
)

:: Verificar Python
echo.
echo 🐍 Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado
    echo    📥 Download: https://python.org/
    set "all_ok=false"
) else (
    echo ✅ Python encontrado:
    python --version
)

:: Verificar pip
echo.
echo 📦 Verificando pip...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip não encontrado
    set "all_ok=false"
) else (
    echo ✅ pip encontrado:
    pip --version
)

:: Verificar dependências Node.js
echo.
echo 📦 Verificando dependências Node.js...
if exist "node_modules" (
    echo ✅ Dependências Node.js instaladas
) else (
    echo ⚠️ Dependências Node.js não instaladas
    echo    Execute: npm install
    set "all_ok=false"
)

:: Verificar ambientes virtuais Python
echo.
echo 🐍 Verificando ambientes virtuais Python...
if exist "venvs\agno" (
    echo ✅ Ambiente virtual Agno encontrado
) else (
    echo ⚠️ Ambiente virtual Agno não encontrado
    echo    Execute: scripts\setup-python-services.bat
)

if exist "venvs\crawl4ai" (
    echo ✅ Ambiente virtual Crawl4AI encontrado
) else (
    echo ⚠️ Ambiente virtual Crawl4AI não encontrado
    echo    Execute: scripts\setup-python-services.bat
)

:: Verificar arquivos de configuração
echo.
echo ⚙️ Verificando configurações...
if exist ".env" (
    echo ✅ Arquivo .env encontrado
) else (
    echo ⚠️ Arquivo .env não encontrado
    echo    Execute: copy .env.example .env
)

if exist "data" (
    echo ✅ Diretório de dados encontrado
) else (
    echo ⚠️ Diretório de dados não encontrado
    echo    Será criado automaticamente
)

:: Verificar portas disponíveis
echo.
echo 🔌 Verificando portas...
netstat -an | findstr :3000 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 3000 em uso (Frontend)
) else (
    echo ✅ Porta 3000 disponível (Frontend)
)

netstat -an | findstr :3001 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 3001 em uso (Backend)
) else (
    echo ✅ Porta 3001 disponível (Backend)
)

netstat -an | findstr :8000 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 8000 em uso (Agno)
) else (
    echo ✅ Porta 8000 disponível (Agno)
)

netstat -an | findstr :8001 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 8001 em uso (Crawl4AI)
) else (
    echo ✅ Porta 8001 disponível (Crawl4AI)
)

:: Resultado final
echo.
echo ===============================
if "%all_ok%"=="true" (
    echo ✅ SISTEMA PRONTO PARA USO!
    echo.
    echo 🚀 Execute INICIAR.bat para começar
) else (
    echo ❌ ALGUMAS DEPENDÊNCIAS ESTÃO FALTANDO
    echo.
    echo 🔧 Soluções:
    echo    1. Execute INICIAR.bat (configuração automática)
    echo    2. Instale as dependências manualmente
    echo    3. Consulte docs\PYTHON_SETUP.md
)
echo ===============================
echo.

pause