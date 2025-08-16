@echo off
chcp 65001 >nul
title Teste de Importação Python

echo.
echo 🔍 TESTE DE IMPORTAÇÃO PYTHON
echo =============================
echo.

if exist "venvs\agno" (
    echo 🧠 Testando importações do Agno...
    call venvs\agno\Scripts\activate.bat
    
    python -c "import sys; print('Python version:', sys.version)"
    python -c "import fastapi; print('FastAPI: OK')" 2>nul || echo "FastAPI: ERRO"
    python -c "import uvicorn; print('Uvicorn: OK')" 2>nul || echo "Uvicorn: ERRO"
    python -c "import pydantic; print('Pydantic: OK')" 2>nul || echo "Pydantic: ERRO"
    
    echo Testando arquivo main.py...
    python -c "import sys; sys.path.append('python-services/agno'); import main; print('main.py: OK')" 2>nul || echo "main.py: ERRO"
    
    call venvs\agno\Scripts\deactivate.bat
) else (
    echo ❌ Ambiente Agno não encontrado
)

echo.
if exist "venvs\crawl4ai" (
    echo 🕷️ Testando importações do Crawl4AI...
    call venvs\crawl4ai\Scripts\activate.bat
    
    python -c "import sys; print('Python version:', sys.version)"
    python -c "import fastapi; print('FastAPI: OK')" 2>nul || echo "FastAPI: ERRO"
    python -c "import uvicorn; print('Uvicorn: OK')" 2>nul || echo "Uvicorn: ERRO"
    python -c "import bs4; print('BeautifulSoup: OK')" 2>nul || echo "BeautifulSoup: ERRO"
    python -c "import requests; print('Requests: OK')" 2>nul || echo "Requests: ERRO"
    
    echo Testando arquivo main.py...
    python -c "import sys; sys.path.append('python-services/crawl4ai'); import main; print('main.py: OK')" 2>nul || echo "main.py: ERRO"
    
    call venvs\crawl4ai\Scripts\deactivate.bat
) else (
    echo ❌ Ambiente Crawl4AI não encontrado
)

echo.
echo 📊 Se você viu "OK" para a maioria dos testes,
echo os serviços Python devem funcionar!
echo.
pause