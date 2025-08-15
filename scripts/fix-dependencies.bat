@echo off
chcp 65001 >nul
title Corrigir Dependências

echo.
echo 🔧 CORRIGINDO DEPENDÊNCIAS
echo =========================
echo.

echo 🧹 Removendo node_modules antigo...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo ✅ node_modules removido
)

echo 🧹 Removendo package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
    echo ✅ package-lock.json removido
)

echo.
echo 📦 Instalando dependências essenciais...
npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    echo.
    echo 💡 Tentando instalação individual...
    npm install express cors dotenv axios
    npm install @anthropic-ai/sdk openai
    npm install multer uuid
    
    if errorlevel 1 (
        echo ❌ Falha na instalação individual
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependências corrigidas!
echo.
echo 🚀 Agora você pode executar:
echo    • npm run server (para o backend)
echo    • npm run dev (para o frontend)
echo.
pause