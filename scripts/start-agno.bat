@echo off
chcp 65001 >nul
title Agno RAG Service

echo.
echo 🧠 Iniciando Agno RAG Service
echo =============================
echo.

:: Verificar se o ambiente virtual existe
if not exist "venvs\agno" (
    echo ❌ Ambiente virtual do Agno não encontrado!
    echo 🔧 Execute primeiro: scripts\setup-python-services.bat
    pause
    exit /b 1
)

:: Ativar ambiente virtual
echo 🔧 Ativando ambiente virtual...
call venvs\agno\Scripts\activate.bat

:: Verificar se o arquivo principal existe
if not exist "python-services\agno\main.py" (
    echo ❌ Arquivo main.py do Agno não encontrado!
    pause
    exit /b 1
)

:: Definir variáveis de ambiente
set AGNO_HOST=127.0.0.1
set AGNO_PORT=8000
set LOG_LEVEL=INFO

echo ✅ Ambiente configurado
echo 🚀 Iniciando servidor Agno em http://%AGNO_HOST%:%AGNO_PORT%
echo 📚 Documentação: http://%AGNO_HOST%:%AGNO_PORT%/docs
echo.
echo 💡 Pressione Ctrl+C para parar o servidor
echo.

:: Navegar para o diretório do serviço
cd python-services\agno

:: Iniciar o servidor
python main.py

:: Desativar ambiente virtual ao sair
call ..\..\venvs\agno\Scripts\deactivate.bat

pause