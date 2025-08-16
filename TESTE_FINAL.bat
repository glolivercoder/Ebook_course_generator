@echo off
chcp 65001 >nul
title Teste Final do Sistema

echo.
echo 🧪 TESTE FINAL DO SISTEMA
echo ========================
echo.

echo 🔍 Verificando estrutura de arquivos...
if exist "package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json não encontrado
    goto :END
)

if exist "server\index.js" (
    echo ✅ server\index.js encontrado
) else (
    echo ❌ server\index.js não encontrado
    goto :END
)

if exist "ebook_course_generator.html" (
    echo ✅ ebook_course_generator.html encontrado
) else (
    echo ❌ ebook_course_generator.html não encontrado
    goto :END
)

echo.
echo 📦 Verificando dependências Node.js...
if exist "node_modules" (
    echo ✅ node_modules encontrado
    
    echo 🔍 Verificando dependências específicas...
    if exist "node_modules\express" (
        echo ✅ express instalado
    ) else (
        echo ❌ express não encontrado
    )
    
    if exist "node_modules\axios" (
        echo ✅ axios instalado
    ) else (
        echo ❌ axios não encontrado
    )
    
    if exist "node_modules\cheerio" (
        echo ✅ cheerio instalado
    ) else (
        echo ❌ cheerio não encontrado - será instalado
        npm install cheerio
    )
) else (
    echo ❌ node_modules não encontrado
    echo 💡 Execute: npm install
    goto :END
)

echo.
echo 🐍 Verificando ambientes Python...
if exist "venvs\agno\Scripts\python.exe" (
    echo ✅ Ambiente Agno OK
) else (
    echo ❌ Ambiente Agno não encontrado
)

if exist "venvs\crawl4ai\Scripts\python.exe" (
    echo ✅ Ambiente Crawl4AI OK
) else (
    echo ❌ Ambiente Crawl4AI não encontrado
)

echo.
echo 🚀 Testando inicialização do backend...
timeout /t 2 /nobreak >nul
start /min cmd /c "node server\index.js > test_backend.log 2>&1"
timeout /t 5 /nobreak >nul

:: Verificar se o servidor iniciou
curl -s http://localhost:3001/api/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend não iniciou corretamente
    echo 📋 Verificando log...
    if exist "test_backend.log" (
        type test_backend.log
    )
) else (
    echo ✅ Backend iniciou com sucesso!
    
    :: Parar o servidor de teste
    taskkill /f /im node.exe >nul 2>&1
)

:: Limpar arquivo de log
if exist "test_backend.log" del test_backend.log

echo.
echo 📊 RESULTADO DO TESTE FINAL
echo ==========================
echo.
echo Se você viu principalmente ✅, o sistema está pronto!
echo.
echo 🚀 Para usar o sistema:
echo   1. Execute: INICIAR.bat
echo   2. Escolha: "INICIAR ESSENCIAL" ou "INICIAR TUDO"
echo   3. Acesse: http://localhost:3000
echo.

:END
pause