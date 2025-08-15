@echo off
chcp 65001 >nul
title Teste Simples dos Serviços

echo.
echo 🧪 TESTE SIMPLES DOS SERVIÇOS
echo =============================
echo.

:: Verificar se os ambientes virtuais existem
echo 📁 Verificando ambientes virtuais...
if exist "venvs\agno" (
    echo ✅ Ambiente virtual Agno encontrado
) else (
    echo ❌ Ambiente virtual Agno NÃO encontrado
    echo    Execute: scripts\setup-python-services.bat
    goto :END_TEST
)

if exist "venvs\crawl4ai" (
    echo ✅ Ambiente virtual Crawl4AI encontrado
) else (
    echo ❌ Ambiente virtual Crawl4AI NÃO encontrado
    echo    Execute: scripts\setup-python-services.bat
    goto :END_TEST
)

echo.
echo 🐍 Testando Python nos ambientes virtuais...

:: Testar Agno
echo 🧠 Testando ambiente Agno...
call venvs\agno\Scripts\activate.bat
python --version
if errorlevel 1 (
    echo ❌ Python não funciona no ambiente Agno
) else (
    echo ✅ Python OK no ambiente Agno
    
    echo 📦 Testando importações básicas...
    python -c "import fastapi; print('✅ FastAPI OK')" 2>nul || echo "❌ FastAPI não encontrado"
    python -c "import uvicorn; print('✅ Uvicorn OK')" 2>nul || echo "❌ Uvicorn não encontrado"
    python -c "import pydantic; print('✅ Pydantic OK')" 2>nul || echo "❌ Pydantic não encontrado"
    python -c "import requests; print('✅ Requests OK')" 2>nul || echo "❌ Requests não encontrado"
    python -c "import beautifulsoup4; print('✅ BeautifulSoup OK')" 2>nul || echo "⚠️ BeautifulSoup não encontrado"
)
call venvs\agno\Scripts\deactivate.bat

echo.
echo 🕷️ Testando ambiente Crawl4AI...
call venvs\crawl4ai\Scripts\activate.bat
python --version
if errorlevel 1 (
    echo ❌ Python não funciona no ambiente Crawl4AI
) else (
    echo ✅ Python OK no ambiente Crawl4AI
    
    echo 📦 Testando importações básicas...
    python -c "import fastapi; print('✅ FastAPI OK')" 2>nul || echo "❌ FastAPI não encontrado"
    python -c "import uvicorn; print('✅ Uvicorn OK')" 2>nul || echo "❌ Uvicorn não encontrado"
    python -c "import pydantic; print('✅ Pydantic OK')" 2>nul || echo "❌ Pydantic não encontrado"
    python -c "import requests; print('✅ Requests OK')" 2>nul || echo "❌ Requests não encontrado"
    python -c "import bs4; print('✅ BeautifulSoup OK')" 2>nul || echo "⚠️ BeautifulSoup não encontrado"
)
call venvs\crawl4ai\Scripts\deactivate.bat

echo.
echo 📊 RESULTADO DO TESTE
echo ====================
echo.
echo Se você viu "✅ Python OK" para ambos os ambientes,
echo os serviços devem funcionar!
echo.
echo Se houve erros, execute:
echo   scripts\setup-python-services.bat
echo.

:END_TEST
pause