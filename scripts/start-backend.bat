@echo off
chcp 65001 >nul
title Backend Node.js

echo.
echo 🚀 Iniciando Backend Node.js
echo ============================
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado! Instale Node.js primeiro.
    echo 📥 Download: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado:
node --version

:: Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo 📦 Instalando dependências do Node.js...
    npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências
        pause
        exit /b 1
    )
    echo ✅ Dependências instaladas
)

:: Verificar se o arquivo .env existe
if not exist ".env" (
    echo ⚙️ Criando arquivo .env...
    copy .env.example .env
    echo ✅ Arquivo .env criado - Configure suas chaves de API
)

:: Definir variáveis de ambiente
set NODE_ENV=development
set PORT=3001

echo 🚀 Iniciando servidor backend em http://localhost:3001
echo 📚 API Docs: http://localhost:3001/api/health
echo.
echo 💡 Pressione Ctrl+C para parar o servidor
echo.

:: Iniciar o servidor
node server/index.js

pause