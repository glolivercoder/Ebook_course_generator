@echo off
chcp 65001 >nul
title Limpeza e Reinstalação

echo.
echo 🧹 LIMPEZA E REINSTALAÇÃO COMPLETA
echo ==================================
echo.
echo ⚠️ ATENÇÃO: Esta operação irá:
echo    • Remover todas as dependências instaladas
echo    • Limpar caches e arquivos temporários
echo    • Reinstalar tudo do zero
echo.
echo 💾 Seus projetos em data/projects/ serão preservados
echo.
set /p confirm="Deseja continuar? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operação cancelada.
    pause
    exit /b 0
)

echo.
echo 🧹 Iniciando limpeza...
echo.

:: Remover node_modules
echo 📦 Removendo node_modules...
if exist "node_modules" (
    rmdir /s /q node_modules
    echo ✅ node_modules removido
) else (
    echo ℹ️ node_modules não encontrado
)

:: Remover package-lock.json
echo 📦 Removendo package-lock.json...
if exist "package-lock.json" (
    del package-lock.json
    echo ✅ package-lock.json removido
) else (
    echo ℹ️ package-lock.json não encontrado
)

:: Remover ambientes virtuais Python
echo 🐍 Removendo ambientes virtuais Python...
if exist "venvs" (
    rmdir /s /q venvs
    echo ✅ Ambientes virtuais removidos
) else (
    echo ℹ️ Ambientes virtuais não encontrados
)

:: Limpar cache npm
echo 📦 Limpando cache npm...
npm cache clean --force >nul 2>&1
echo ✅ Cache npm limpo

:: Limpar arquivos temporários
echo 🗑️ Limpando arquivos temporários...
if exist "data\temp" (
    rmdir /s /q data\temp
    mkdir data\temp
    echo ✅ Arquivos temporários limpos
)

if exist "data\agno\*.tmp" (
    del data\agno\*.tmp >nul 2>&1
)

if exist "data\crawl4ai\*.tmp" (
    del data\crawl4ai\*.tmp >nul 2>&1
)

:: Limpar logs antigos
echo 📝 Limpando logs antigos...
if exist "*.log" (
    del *.log >nul 2>&1
)
if exist "data\*.log" (
    del data\*.log >nul 2>&1
)

echo.
echo ✅ Limpeza concluída!
echo.
echo 🔄 Iniciando reinstalação...
echo.

:: Reinstalar dependências Node.js
echo 📦 Reinstalando dependências Node.js...
npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências Node.js
    pause
    exit /b 1
)
echo ✅ Dependências Node.js instaladas

:: Reconfigurar serviços Python
echo 🐍 Reconfigurando serviços Python...
call scripts\setup-python-services.bat
if errorlevel 1 (
    echo ❌ Erro na configuração dos serviços Python
    pause
    exit /b 1
)

echo.
echo 🎉 REINSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo =====================================
echo.
echo ✅ Todas as dependências foram reinstaladas
echo ✅ Ambientes virtuais Python reconfigurados
echo ✅ Sistema pronto para uso
echo.
echo 🚀 Execute INICIAR.bat para começar a usar
echo.
pause