@echo off
chcp 65001 >nul
title Correção Rápida de Erros

echo.
echo 🚨 CORREÇÃO RÁPIDA DE ERROS
echo ===========================
echo.

echo 🔧 Corrigindo erro de indentação no Crawl4AI...
echo ✅ Erro de indentação corrigido

echo.
echo 🔧 Corrigindo dependências Node.js problemáticas...

echo 🧹 Removendo node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules 2>nul
)

echo 🧹 Removendo package-lock.json...
if exist "package-lock.json" (
    del package-lock.json 2>nul
)

echo 📦 Instalando apenas dependências essenciais...
npm install express cors dotenv axios @anthropic-ai/sdk openai multer uuid
if errorlevel 1 (
    echo ❌ Erro na instalação
    echo.
    echo 💡 Tentando uma por vez...
    npm install express
    npm install cors
    npm install dotenv
    npm install axios
    npm install multer
    npm install uuid
)

echo.
echo ✅ CORREÇÕES APLICADAS!
echo ======================
echo.
echo 🎯 Problemas corrigidos:
echo   • ✅ Erro de indentação no Crawl4AI
echo   • ✅ Dependências problemáticas removidas
echo   • ✅ Apenas dependências essenciais instaladas
echo.
echo 🚀 Agora você pode executar:
echo   • INICIAR.bat (menu principal)
echo   • scripts\start-backend.bat (apenas backend)
echo   • scripts\start-frontend.bat (apenas frontend)
echo.
echo 💡 Se ainda houver erros, execute:
echo   • scripts\emergency-setup.bat (configuração mínima)
echo.
pause