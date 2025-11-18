@echo off
chcp 65001 >nul
cls

echo ════════════════════════════════════════════════════════
echo              🎰 LOTOFY - Iniciar Servidor
echo ════════════════════════════════════════════════════════
echo.

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

echo ✅ Verificações OK
echo.
echo 🚀 Iniciando servidor de desenvolvimento...
echo.
echo 📍 URL: http://localhost:3000
echo 📧 Admin: admin@lotofy.com
echo 🔑 Senha: admin123
echo.
echo Pressione Ctrl+C para parar o servidor
echo ════════════════════════════════════════════════════════
echo.

call npm run dev
