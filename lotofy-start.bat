@echo off
chcp 65001 >nul
cls

echo ════════════════════════════════════════════════════════
echo              🎰 LOTOFY - Iniciar Sistema
echo ════════════════════════════════════════════════════════
echo.

REM Verificar se o diretório do sistema existe
if not exist "C:\lotofacil" (
    echo ❌ Diretório do sistema não encontrado!
    echo.
    echo Certifique-se de que o sistema está instalado em C:\lotofacil
    echo.
    pause
    exit /b 1
)

echo ✅ Sistema encontrado em C:\lotofacil
echo.

REM Navegar para o diretório do sistema
cd /d "C:\lotofacil"

REM Verificar se node_modules existe
if not exist node_modules (
    echo ⚠️  Dependências não instaladas!
    echo.
    echo Execute primeiro: install-windows.bat
    echo.
    pause
    exit /b 1
)

REM Verificar se .env existe
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado!
    echo.
    echo Execute primeiro: install-windows.bat
    echo.
    pause
    exit /b 1
)

echo 🚀 Iniciando servidor e abrindo navegador...
echo.

REM Iniciar o servidor em segundo plano
start "LOTOFY Server" /min cmd /c "npm run dev > server.log 2>&1"

REM Aguardar alguns segundos para o servidor iniciar
echo ⏳ Aguardando servidor iniciar...
timeout /t 5 /nobreak >nul

REM Abrir o navegador com a página do sistema
echo 🌐 Abrindo navegador...
start "" "http://localhost:3000"

echo.
echo ✅ Sistema iniciado com sucesso!
echo.
echo 📍 URL: http://localhost:3000
echo 📧 Admin: admin@lotofy.com
echo 🔑 Senha: admin123
echo.
echo Para parar o servidor, feche a janela do terminal que abriu.
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul