@echo off
chcp 65001 >nul
title Teste Python Simples

echo.
echo 🧪 TESTE PYTHON SIMPLES
echo =======================
echo.

:: Verificar se os ambientes virtuais existem
echo 📁 Verificando ambientes virtuais...
if exist "venvs\agno\Scripts\python.exe" (
    echo ✅ Ambiente Agno encontrado
    
    echo 🧠 Testando Python no ambiente Agno...
    call venvs\agno\Scripts\activate.bat
    python --version
    python -c "print('Python funciona no Agno!')"
    if errorlevel 1 (
        echo ❌ Erro no Python do Agno
    ) else (
        echo ✅ Python OK no Agno
    )
    call venvs\agno\Scripts\deactivate.bat
) else (
    echo ❌ Ambiente Agno não encontrado
    echo 💡 Execute: scripts\setup-python-services.bat
)

echo.
if exist "venvs\crawl4ai\Scripts\python.exe" (
    echo ✅ Ambiente Crawl4AI encontrado
    
    echo 🕷️ Testando Python no ambiente Crawl4AI...
    call venvs\crawl4ai\Scripts\activate.bat
    python --version
    python -c "print('Python funciona no Crawl4AI!')"
    if errorlevel 1 (
        echo ❌ Erro no Python do Crawl4AI
    ) else (
        echo ✅ Python OK no Crawl4AI
    )
    call venvs\crawl4ai\Scripts\deactivate.bat
) else (
    echo ❌ Ambiente Crawl4AI não encontrado
    echo 💡 Execute: scripts\setup-python-services.bat
)

echo.
echo 📊 RESULTADO
echo ============
echo.
echo Se você viu "✅ Python OK" para ambos os ambientes,
echo os serviços Python devem funcionar!
echo.
pause