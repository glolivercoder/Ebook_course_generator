@echo off
chcp 65001 >nul
title Frontend Vite

echo.
echo 🎨 Iniciando Frontend Vite
echo ==========================
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

echo 🚀 Iniciando servidor frontend em http://localhost:3000
echo 🎨 Interface: http://localhost:3000
echo.
echo 💡 Pressione Ctrl+C para parar o servidor
echo.

:: Iniciar o servidor Vite
npx vite

pause