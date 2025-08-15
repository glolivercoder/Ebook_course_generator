@echo off
chcp 65001 >nul
title Diagnóstico do Sistema

echo.
echo 🔍 DIAGNÓSTICO COMPLETO DO SISTEMA
echo ==================================
echo.

:: Verificar Python
echo 🐍 Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python não encontrado no PATH
    echo 💡 Instale Python de https://python.org/
    
    :: Tentar python3
    python3 --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ python3 também não encontrado
    ) else (
        echo ✅ python3 encontrado:
        python3 --version
    )
) else (
    echo ✅ Python encontrado:
    python --version
    
    :: Verificar pip
    echo 📦 Verificando pip...
    python -m pip --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ pip não funciona
    ) else (
        echo ✅ pip encontrado:
        python -m pip --version
    )
    
    :: Verificar venv
    echo 📁 Verificando módulo venv...
    python -m venv --help >nul 2>&1
    if errorlevel 1 (
        echo ❌ módulo venv não disponível
    ) else (
        echo ✅ módulo venv disponível
    )
)

:: Verificar Node.js
echo.
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado
    echo 💡 Instale Node.js de https://nodejs.org/
) else (
    echo ✅ Node.js encontrado:
    node --version
    
    echo 📦 Verificando npm...
    npm --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ npm não encontrado
    ) else (
        echo ✅ npm encontrado:
        npm --version
    )
)

:: Verificar estrutura de diretórios
echo.
echo 📁 Verificando estrutura de diretórios...
if exist "package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json não encontrado
)

if exist "python-services" (
    echo ✅ Diretório python-services encontrado
    
    if exist "python-services\agno\main.py" (
        echo ✅ Agno main.py encontrado
    ) else (
        echo ❌ Agno main.py não encontrado
    )
    
    if exist "python-services\crawl4ai\main.py" (
        echo ✅ Crawl4AI main.py encontrado
    ) else (
        echo ❌ Crawl4AI main.py não encontrado
    )
) else (
    echo ❌ Diretório python-services não encontrado
)

:: Verificar ambientes virtuais
echo.
echo 🔧 Verificando ambientes virtuais...
if exist "venvs" (
    echo ✅ Diretório venvs encontrado
    
    if exist "venvs\agno" (
        echo ✅ Ambiente virtual Agno encontrado
        
        if exist "venvs\agno\Scripts\activate.bat" (
            echo ✅ Script de ativação do Agno encontrado
        ) else (
            echo ❌ Script de ativação do Agno não encontrado
        )
        
        if exist "venvs\agno\Scripts\python.exe" (
            echo ✅ Python do Agno encontrado
        ) else (
            echo ❌ Python do Agno não encontrado
        )
    ) else (
        echo ❌ Ambiente virtual Agno não encontrado
    )
    
    if exist "venvs\crawl4ai" (
        echo ✅ Ambiente virtual Crawl4AI encontrado
        
        if exist "venvs\crawl4ai\Scripts\activate.bat" (
            echo ✅ Script de ativação do Crawl4AI encontrado
        ) else (
            echo ❌ Script de ativação do Crawl4AI não encontrado
        )
        
        if exist "venvs\crawl4ai\Scripts\python.exe" (
            echo ✅ Python do Crawl4AI encontrado
        ) else (
            echo ❌ Python do Crawl4AI não encontrado
        )
    ) else (
        echo ❌ Ambiente virtual Crawl4AI não encontrado
    )
) else (
    echo ❌ Diretório venvs não encontrado
)

:: Verificar dependências Node.js
echo.
echo 📦 Verificando dependências Node.js...
if exist "node_modules" (
    echo ✅ node_modules encontrado
) else (
    echo ❌ node_modules não encontrado
    echo 💡 Execute: npm install
)

:: Verificar portas
echo.
echo 🔌 Verificando portas...
netstat -an | findstr :3000 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 3000 em uso
) else (
    echo ✅ Porta 3000 disponível
)

netstat -an | findstr :3001 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 3001 em uso
) else (
    echo ✅ Porta 3001 disponível
)

netstat -an | findstr :8000 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 8000 em uso
) else (
    echo ✅ Porta 8000 disponível
)

netstat -an | findstr :8001 >nul
if not errorlevel 1 (
    echo ⚠️ Porta 8001 em uso
) else (
    echo ✅ Porta 8001 disponível
)

:: Verificar espaço em disco
echo.
echo 💾 Verificando espaço em disco...
for /f "tokens=3" %%a in ('dir /-c ^| find "bytes free"') do set free_space=%%a
echo Espaço livre: %free_space% bytes

:: Verificar permissões
echo.
echo 🔐 Verificando permissões...
echo test > test_write.tmp 2>nul
if exist test_write.tmp (
    echo ✅ Permissões de escrita OK
    del test_write.tmp
) else (
    echo ❌ Sem permissões de escrita
    echo 💡 Execute como administrador
)

echo.
echo 📊 RESUMO DO DIAGNÓSTICO
echo =======================
echo.
echo Se você viu muitos ❌, há problemas na configuração.
echo Se você viu principalmente ✅, o sistema deve funcionar.
echo.
echo 🔧 Próximos passos recomendados:
echo   1. Se Python/Node.js não encontrados: instale-os
echo   2. Se ambientes virtuais não encontrados: execute setup-python-services.bat
echo   3. Se dependências não encontradas: execute npm install
echo   4. Se portas em uso: pare outros serviços ou reinicie o computador
echo.
pause