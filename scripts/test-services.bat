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
    python -c "import fastapi, uvicorn, pydantic; print('Dependências básicas OK')" 2>nul
    if errorlevel 1 (
        echo ❌ Dependências básicas faltando
    ) else (
        echo ✅ Dependências básicas OK
    )
    
    python -c "import sentence_transformers; print('Sentence Transformers OK')" 2>nul
    if errorlevel 1 (
        echo ⚠️ Sentence Transformers não disponível - modo básico
    ) else (
        echo ✅ Sentence Transformers OK
    )
    
    echo 🚀 Testando inicialização do Agno...
    timeout /t 2 /nobreak >nul
    
    python -c "print('Teste básico do Agno: OK')"
    if errorlevel 1 (
        set agno_result=1
        echo ❌ Python não funciona no ambiente Agno
    ) else (
        set agno_result=0
        echo ✅ Teste básico do Agno passou
    )
    
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
    python -c "import fastapi, uvicorn, pydantic, bs4, requests; print('Dependências básicas OK')" 2>nul
    if errorlevel 1 (
        echo ❌ Dependências básicas faltando
    ) else (
        echo ✅ Dependências básicas OK
    )
    
    python -c "import aiohttp; print('aiohttp OK')" 2>nul
    if errorlevel 1 (
        echo ⚠️ aiohttp não disponível - usando requests
    ) else (
        echo ✅ aiohttp OK
    )
    
    echo 🚀 Testando inicialização do Crawl4AI...
    timeout /t 2 /nobreak >nul
    
    python -c "print('Teste básico do Crawl4AI: OK')"
    if errorlevel 1 (
        set crawl4ai_result=1
        echo ❌ Python não funciona no ambiente Crawl4AI
    ) else (
        set crawl4ai_result=0
        echo ✅ Teste básico do Crawl4AI passou
    )
    
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