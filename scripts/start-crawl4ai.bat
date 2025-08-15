@echo off
chcp 65001 >nul
title Crawl4AI Service

echo.
echo 🕷️ Iniciando Crawl4AI Service
echo =============================
echo.

:: Verificar se o ambiente virtual existe
if not exist "venvs\crawl4ai" (
    echo ❌ Ambiente virtual do Crawl4AI não encontrado!
    echo 🔧 Execute primeiro: scripts\setup-python-services.bat
    pause
    exit /b 1
)

:: Ativar ambiente virtual
echo 🔧 Ativando ambiente virtual...
call venvs\crawl4ai\Scripts\activate.bat

:: Verificar se o arquivo principal existe
if not exist "python-services\crawl4ai\main.py" (
    echo ❌ Arquivo main.py do Crawl4AI não encontrado!
    pause
    exit /b 1
)

:: Definir variáveis de ambiente
set CRAWL4AI_HOST=127.0.0.1
set CRAWL4AI_PORT=8001
set LOG_LEVEL=INFO

echo ✅ Ambiente configurado
echo 🚀 Iniciando servidor Crawl4AI em http://%CRAWL4AI_HOST%:%CRAWL4AI_PORT%
echo 📚 Documentação: http://%CRAWL4AI_HOST%:%CRAWL4AI_PORT%/docs
echo.
echo 💡 Pressione Ctrl+C para parar o servidor
echo.

:: Navegar para o diretório do serviço
cd python-services\crawl4ai

:: Iniciar o servidor
python main.py

:: Desativar ambiente virtual ao sair
call ..\..\venvs\crawl4ai\Scripts\deactivate.bat

pause