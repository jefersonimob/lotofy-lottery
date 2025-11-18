@echo off
chcp 65001 >nul
cls

echo ════════════════════════════════════════════════════════
echo    LOTOFY - Instalação Automática para Windows
echo ════════════════════════════════════════════════════════
echo.

REM Verificar se está rodando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ ERRO: Execute este script como Administrador!
    echo.
    echo Clique com botão direito em "install-windows.bat" e selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Node.js não encontrado!
    echo.
    echo 📥 Baixe e instale o Node.js: https://nodejs.org/
    echo    Recomendado: versão LTS ^(20.x^)
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js instalado: %NODE_VERSION%
)

echo.
echo [2/6] Verificando MySQL...
where mysql >nul 2>&1
if %errorLevel% neq 0 (
    echo ⚠️  MySQL não encontrado no PATH
    echo.
    echo 📥 Instale o MySQL 8:
    echo    Opção 1: XAMPP (recomendado) - https://www.apachefriends.org/
    echo    Opção 2: MySQL Installer - https://dev.mysql.com/downloads/installer/
    echo.
    echo Depois de instalar, execute este script novamente.
    echo.
    pause
    exit /b 1
) else (
    echo ✅ MySQL encontrado
)

echo.
echo [3/6] Instalando dependências do projeto...
call npm install
if %errorLevel% neq 0 (
    echo ❌ Erro ao instalar dependências!
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

echo.
echo [4/6] Configurando variáveis de ambiente...
if not exist .env (
    echo DATABASE_URL="mysql://root:@localhost:3306/lotofy"> .env
    echo NEXTAUTH_URL="http://localhost:3000">> .env
    echo NEXTAUTH_SECRET="lotofy-secret-key-change-in-production-2024">> .env
    echo NODE_ENV="development">> .env
    echo ✅ Arquivo .env criado
) else (
    echo ℹ️  Arquivo .env já existe
)

echo.
echo [5/6] Criando banco de dados MySQL...
echo.
echo ⚙️  Configuração necessária:
echo    - Host: localhost
echo    - Porta: 3306 (padrão)
echo    - Usuário: root
echo    - Senha: (em branco ou 'root')
echo.
set /p DB_PASSWORD="Digite a senha do MySQL (deixe em branco se não tiver): "

if "%DB_PASSWORD%"=="" (
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS lotofy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
) else (
    mysql -u root -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS lotofy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
)

if %errorLevel% neq 0 (
    echo ❌ Erro ao criar banco de dados!
    echo.
    echo Verifique:
    echo    1. MySQL está rodando?
    echo    2. Usuário e senha estão corretos?
    echo    3. MySQL está na porta 3306?
    echo.
    pause
    exit /b 1
)
echo ✅ Banco de dados 'lotofy' criado

echo.
echo [6/6] Criando tabelas no banco...
if "%DB_PASSWORD%"=="" (
    mysql -u root lotofy < scripts\mysql_migration.sql 2>nul
) else (
    mysql -u root -p%DB_PASSWORD% lotofy < scripts\mysql_migration.sql 2>nul
)

if %errorLevel% neq 0 (
    echo ⚠️  Aviso: Erro ao executar SQL (tabelas podem já existir)
) else (
    echo ✅ Tabelas criadas
)

echo.
echo Gerando Prisma Client...
call npx prisma generate
if %errorLevel% neq 0 (
    echo ❌ Erro ao gerar Prisma Client!
    pause
    exit /b 1
)
echo ✅ Prisma Client gerado

echo.
echo Criando usuário admin...
call npx tsx scripts\create-admin.ts
echo.

echo ════════════════════════════════════════════════════════
echo    ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!
echo ════════════════════════════════════════════════════════
echo.
echo 📋 Credenciais do Admin:
echo    Email: admin@lotofy.com
echo    Senha: admin123
echo.
echo 🚀 Para iniciar o servidor:
echo    npm run dev
echo.
echo 🌐 Acesse: http://localhost:3000
echo.
echo ════════════════════════════════════════════════════════
pause
