@echo off
chcp 65001 >nul
title Teste dos Serviços

echo.
echo 🧪 TESTE DOS SERVIÇOS PYTHON
echo ============================
echo.

:: Testar Agno
echo 🧠 Testando Agno RAG Service...
if exist "venvs\agno" (
    call venvs\agno\Scripts\activate.bat
    
    echo 📦 Verificando dependências do Agno...
    python -c "import fastapi, uvicorn, pydantic; print('✅ Dependências básicas OK')" 2>nul
    if errorlevel 1 (
        echo ❌ Dependências básicas faltando
    )
    
    python -c "import sentence_transformers; print('✅ Sentence Transformers OK')" 2>nul
    if errorlevel 1 (
        echo ⚠️ Sentence Transformers não disponível - modo básico
    )
    
    echo 🚀 Testando inicialização do Agno...
    timeout /t 2 /nobreak >nul
    
    echo import sys > temp_test_agno.py
    echo sys.path.append('python-services/agno') >> temp_test_agno.py
    echo try: >> temp_test_agno.py
    echo     from main import AgnoRAG >> temp_test_agno.py
    echo     import asyncio >> temp_test_agno.py
    echo     async def test(): >> temp_test_agno.py
    echo         agno = AgnoRAG() >> temp_test_agno.py
    echo         await agno.initialize() >> temp_test_agno.py
    echo         print('✅ Agno inicializado com sucesso!') >> temp_test_agno.py
    echo         return True >> temp_test_agno.py
    echo     result = asyncio.run(test()) >> temp_test_agno.py
    echo except Exception as e: >> temp_test_agno.py
    echo     print(f'❌ Erro no Agno: {e}') >> temp_test_agno.py
    echo     exit(1) >> temp_test_agno.py
    
    python temp_test_agno.py
    set agno_result=%errorlevel%
    del temp_test_agno.py 2>nul
    
    call venvs\agno\Scripts\deactivate.bat
    
    if %agno_result% neq 0 (
        echo ❌ Agno falhou no teste
    ) else (
        echo ✅ Agno passou no teste
    )
) else (
    echo ❌ Ambiente virtual do Agno não encontrado
)

echo.
echo 🕷️ Testando Crawl4AI Service...
if exist "venvs\crawl4ai" (
    call venvs\crawl4ai\Scripts\activate.bat
    
    echo 📦 Verificando dependências do Crawl4AI...
    python -c "import fastapi, uvicorn, pydantic, beautifulsoup4, requests; print('✅ Dependências básicas OK')" 2>nul
    if errorlevel 1 (
        echo ❌ Dependências básicas faltando
    )
    
    python -c "import aiohttp; print('✅ aiohttp OK')" 2>nul
    if errorlevel 1 (
        echo ⚠️ aiohttp não disponível - usando requests
    )
    
    echo 🚀 Testando inicialização do Crawl4AI...
    timeout /t 2 /nobreak >nul
    
    echo import sys > temp_test_crawl4ai.py
    echo sys.path.append('python-services/crawl4ai') >> temp_test_crawl4ai.py
    echo try: >> temp_test_crawl4ai.py
    echo     from main import Crawl4AI >> temp_test_crawl4ai.py
    echo     import asyncio >> temp_test_crawl4ai.py
    echo     async def test(): >> temp_test_crawl4ai.py
    echo         crawl4ai = Crawl4AI() >> temp_test_crawl4ai.py
    echo         await crawl4ai.initialize() >> temp_test_crawl4ai.py
    echo         print('✅ Crawl4AI inicializado com sucesso!') >> temp_test_crawl4ai.py
    echo         return True >> temp_test_crawl4ai.py
    echo     result = asyncio.run(test()) >> temp_test_crawl4ai.py
    echo except Exception as e: >> temp_test_crawl4ai.py
    echo     print(f'❌ Erro no Crawl4AI: {e}') >> temp_test_crawl4ai.py
    echo     exit(1) >> temp_test_crawl4ai.py
    
    python temp_test_crawl4ai.py
    set crawl4ai_result=%errorlevel%
    del temp_test_crawl4ai.py 2>nul
    
    call venvs\crawl4ai\Scripts\deactivate.bat
    
    if %crawl4ai_result% neq 0 (
        echo ❌ Crawl4AI falhou no teste
    ) else (
        echo ✅ Crawl4AI passou no teste
    )
) else (
    echo ❌ Ambiente virtual do Crawl4AI não encontrado
)

echo.
echo 📊 RESULTADO DOS TESTES
echo =======================
echo.
echo Se todos os testes passaram, os serviços estão prontos!
echo Se houve falhas, execute: scripts\setup-python-services.bat
echo.
pause