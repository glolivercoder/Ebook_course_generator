@echo off
chcp 65001 >nul
title Gerador de E-books e Cursos - Inicializador

:: Configurar cores do console
color 0A

echo.
echo ████████████████████████████████████████████████████████████████
echo █                                                              █
echo █    📚 GERADOR DE E-BOOKS E CURSOS COM IA                     █
echo █    ═══════════════════════════════════════                  █
echo █                                                              █
echo █    🚀 Sistema completo com RAG, Web Scraping e Editor       █
echo █    🎨 Interface minimalista e profissional                  █
echo █    🤖 Múltiplos provedores de IA integrados                 █
echo █                                                              █
echo ████████████████████████████████████████████████████████████████
echo.

:: Verificar se é a primeira execução
if not exist "venvs" (
    echo 🔧 PRIMEIRA EXECUÇÃO DETECTADA
    echo ==============================
    echo.
    echo Este parece ser o primeiro uso do sistema.
    echo Vamos configurar tudo automaticamente!
    echo.
    pause
    
    echo 📦 Configurando dependências Node.js...
    call npm install
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências Node.js
        pause
        exit /b 1
    )
    
    echo 🐍 Configurando serviços Python...
    call scripts\setup-python-services.bat
    if errorlevel 1 (
        echo ❌ Erro na configuração dos serviços Python
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ Configuração inicial concluída!
    echo.
)

:MENU
cls
echo.
echo 📚 GERADOR DE E-BOOKS E CURSOS - MENU PRINCIPAL
echo ===============================================
echo.
echo Escolha uma opção:
echo.
echo 1. 🚀 INICIAR TUDO (Recomendado)
echo    └─ Inicia todos os serviços automaticamente
echo.
echo 2. 🎯 INICIAR APENAS ESSENCIAL
echo    └─ Frontend + Backend (sem RAG/Scraping)
echo.
echo 3. 🔧 INICIAR SERVIÇOS INDIVIDUAIS
echo    └─ Escolher quais serviços iniciar
echo.
echo 4. ⚙️ CONFIGURAÇÕES E SETUP
echo    └─ Reconfigurar dependências
echo.
echo 5. 🧪 TESTAR SERVIÇOS
echo    └─ Verificar se tudo está funcionando
echo.
echo 6. � DJIAGNÓSTICO COMPLETO
echo    └─ Verificar problemas no sistema
echo.
echo 7. 📖 AJUDA E DOCUMENTAÇÃO
echo    └─ Guias e informações
echo.
echo 8. ❌ SAIR
echo.
set /p choice="Digite sua escolha (1-8): "

if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto START_ESSENTIAL
if "%choice%"=="3" goto START_INDIVIDUAL
if "%choice%"=="4" goto SETUP_MENU
if "%choice%"=="5" goto TEST_SERVICES
if "%choice%"=="6" goto DIAGNOSE
if "%choice%"=="7" goto HELP_MENU
if "%choice%"=="8" goto EXIT
goto MENU

:START_ALL
cls
echo.
echo 🚀 INICIANDO TODOS OS SERVIÇOS
echo ==============================
echo.
echo Os seguintes serviços serão iniciados:
echo • 🧠 Agno RAG Service (localhost:8000)
echo • 🕷️ Crawl4AI Service (localhost:8001)  
echo • 🔧 Backend Node.js (localhost:3001)
echo • 🎨 Frontend Vite (localhost:3000)
echo.
echo ⚠️ IMPORTANTE: Não feche esta janela!
echo    Novos terminais serão abertos para cada serviço.
echo.
pause

:: Iniciar Agno RAG
echo 🧠 Iniciando Agno RAG Service...
start "Agno RAG Service" cmd /k "scripts\start-agno.bat"
timeout /t 3 /nobreak >nul

:: Iniciar Crawl4AI
echo 🕷️ Iniciando Crawl4AI Service...
start "Crawl4AI Service" cmd /k "scripts\start-crawl4ai.bat"
timeout /t 3 /nobreak >nul

:: Iniciar Backend
echo 🔧 Iniciando Backend Node.js...
start "Backend Node.js" cmd /k "scripts\start-backend.bat"
timeout /t 5 /nobreak >nul

:: Iniciar Frontend
echo 🎨 Iniciando Frontend Vite...
start "Frontend Vite" cmd /k "scripts\start-frontend.bat"
timeout /t 3 /nobreak >nul

echo.
echo ✅ TODOS OS SERVIÇOS INICIADOS!
echo ===============================
echo.
echo 🌐 Acesse a aplicação em: http://localhost:3000
echo.
echo 📊 Status dos serviços:
echo • Agno RAG: http://localhost:8000/health
echo • Crawl4AI: http://localhost:8001/health  
echo • Backend: http://localhost:3001/api/health
echo • Frontend: http://localhost:3000
echo.
echo 💡 Dica: Configure suas chaves de API na aba "Configurações"
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto MENU

:START_ESSENTIAL
cls
echo.
echo 🎯 INICIANDO SERVIÇOS ESSENCIAIS
echo ================================
echo.
echo Os seguintes serviços serão iniciados:
echo • 🔧 Backend Node.js (localhost:3001)
echo • 🎨 Frontend Vite (localhost:3000)
echo.
echo ℹ️ RAG e Web Scraping não serão iniciados
echo   (podem ser configurados depois)
echo.
pause

:: Iniciar Backend
echo 🔧 Iniciando Backend Node.js...
start "Backend Node.js" cmd /k "scripts\start-backend.bat"
timeout /t 5 /nobreak >nul

:: Iniciar Frontend
echo 🎨 Iniciando Frontend Vite...
start "Frontend Vite" cmd /k "scripts\start-frontend.bat"
timeout /t 3 /nobreak >nul

echo.
echo ✅ SERVIÇOS ESSENCIAIS INICIADOS!
echo =================================
echo.
echo 🌐 Acesse a aplicação em: http://localhost:3000
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto MENU

:START_INDIVIDUAL
cls
echo.
echo 🔧 INICIAR SERVIÇOS INDIVIDUAIS
echo ===============================
echo.
echo Escolha qual serviço iniciar:
echo.
echo 1. 🧠 Agno RAG Service (localhost:8000)
echo 2. 🕷️ Crawl4AI Service (localhost:8001)
echo 3. 🔧 Backend Node.js (localhost:3001)
echo 4. 🎨 Frontend Vite (localhost:3000)
echo 5. 🔙 Voltar ao menu principal
echo.
set /p service="Digite sua escolha (1-5): "

if "%service%"=="1" (
    start "Agno RAG Service" cmd /k "scripts\start-agno.bat"
    echo ✅ Agno RAG Service iniciado!
    timeout /t 2 /nobreak >nul
)
if "%service%"=="2" (
    start "Crawl4AI Service" cmd /k "scripts\start-crawl4ai.bat"
    echo ✅ Crawl4AI Service iniciado!
    timeout /t 2 /nobreak >nul
)
if "%service%"=="3" (
    start "Backend Node.js" cmd /k "scripts\start-backend.bat"
    echo ✅ Backend Node.js iniciado!
    timeout /t 2 /nobreak >nul
)
if "%service%"=="4" (
    start "Frontend Vite" cmd /k "scripts\start-frontend.bat"
    echo ✅ Frontend Vite iniciado!
    timeout /t 2 /nobreak >nul
)
if "%service%"=="5" goto MENU

goto START_INDIVIDUAL

:SETUP_MENU
cls
echo.
echo ⚙️ CONFIGURAÇÕES E SETUP
echo ========================
echo.
echo 1. 🔄 Reconfigurar serviços Python
echo 2. 📦 Reinstalar dependências Node.js
echo 3. 🔧 Corrigir dependências problemáticas
echo 4. 🧹 Limpar cache e dados temporários
echo 4. 🔑 Configurar chaves de API
echo 5. 🧪 Testar serviços Python
echo 6. � Coonfiguração de emergência
echo 7. 🔙 Voltar ao menu principal
echo.
set /p setup="Digite sua escolha (1-7): "

if "%setup%"=="1" (
    call scripts\setup-python-services.bat
    pause
)
if "%setup%"=="2" (
    echo 📦 Reinstalando dependências Node.js...
    rmdir /s /q node_modules 2>nul
    del package-lock.json 2>nul
    npm install
    echo ✅ Dependências reinstaladas!
    pause
)
if "%setup%"=="3" (
    call scripts\fix-dependencies.bat
    pause
)
if "%setup%"=="4" (
    echo 🧹 Limpando cache...
    rmdir /s /q data\temp 2>nul
    mkdir data\temp 2>nul
    npm cache clean --force 2>nul
    echo ✅ Cache limpo!
    pause
)
if "%setup%"=="4" (
    echo 🔑 Abrindo arquivo de configuração...
    if exist ".env" (
        notepad .env
    ) else (
        copy .env.example .env
        notepad .env
    )
    echo ✅ Configure suas chaves de API e salve o arquivo
    pause
)
if "%setup%"=="5" (
    call scripts\test-services.bat
    pause
)
if "%setup%"=="6" (
    call scripts\emergency-setup.bat
    pause
)
if "%setup%"=="7" goto MENU

goto SETUP_MENU

:TEST_SERVICES
cls
echo.
echo 🧪 TESTE DOS SERVIÇOS
echo ====================
echo.
echo Este teste verificará se todos os serviços Python
echo estão configurados corretamente.
echo.
pause

call scripts\test-services.bat

echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto MENU

:DIAGNOSE
cls
echo.
echo 🔍 DIAGNÓSTICO COMPLETO
echo ======================
echo.
echo Este diagnóstico verificará todos os componentes
echo do sistema e identificará problemas.
echo.
pause

call scripts\diagnose.bat

echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto MENU

:HELP_MENU
cls
echo.
echo 📖 AJUDA E DOCUMENTAÇÃO
echo =======================
echo.
echo 1. 🚀 Guia de início rápido
echo 2. 🔧 Configuração de APIs
echo 3. 🐛 Solução de problemas
echo 4. 📚 Documentação completa
echo 5. 🔙 Voltar ao menu principal
echo.
set /p help="Digite sua escolha (1-5): "

if "%help%"=="1" (
    cls
    echo.
    echo 🚀 GUIA DE INÍCIO RÁPIDO
    echo =======================
    echo.
    echo 1. Execute "INICIAR TUDO" no menu principal
    echo 2. Aguarde todos os serviços iniciarem
    echo 3. Acesse http://localhost:3000
    echo 4. Configure suas chaves de API na aba "Configurações"
    echo 5. Crie seu primeiro projeto na aba "Criador"
    echo.
    echo 💡 Dicas importantes:
    echo • Use templates Kindle para e-books
    echo • Configure RAG para contexto inteligente
    echo • Teste conexões antes de gerar conteúdo
    echo.
    pause
)
if "%help%"=="2" (
    cls
    echo.
    echo 🔧 CONFIGURAÇÃO DE APIS
    echo ======================
    echo.
    echo APIs suportadas:
    echo • OpenAI: https://platform.openai.com/api-keys
    echo • Anthropic: https://console.anthropic.com/
    echo • Google AI: https://makersuite.google.com/app/apikey
    echo • OpenRouter: https://openrouter.ai/keys
    echo.
    echo Configure no arquivo .env ou na interface web
    echo.
    pause
)
if "%help%"=="3" (
    cls
    echo.
    echo 🐛 SOLUÇÃO DE PROBLEMAS
    echo ======================
    echo.
    echo Problemas comuns:
    echo.
    echo ❌ "Python não encontrado"
    echo    → Instale Python 3.8+ de python.org
    echo.
    echo ❌ "Node.js não encontrado"  
    echo    → Instale Node.js de nodejs.org
    echo.
    echo ❌ "Erro ao instalar dependências"
    echo    → Execute como administrador
    echo    → Verifique conexão com internet
    echo.
    echo ❌ "Serviço não inicia"
    echo    → Verifique se as portas estão livres
    echo    → Consulte logs nos terminais abertos
    echo.
    pause
)
if "%help%"=="4" (
    echo 📚 Abrindo documentação...
    if exist "README.md" (
        start README.md
    )
    if exist "docs" (
        start docs
    )
    pause
)
if "%help%"=="5" goto MENU

goto HELP_MENU

:EXIT
cls
echo.
echo 👋 Obrigado por usar o Gerador de E-books e Cursos!
echo.
echo 💡 Lembre-se:
echo • Seus projetos ficam salvos em data/projects/
echo • Configure suas APIs para melhor experiência
echo • Consulte a documentação para recursos avançados
echo.
echo 🌟 Desenvolvido com ❤️ para criadores de conteúdo
echo.
timeout /t 3 /nobreak >nul
exit /b 0