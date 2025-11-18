# 🪟 Instalação no Windows - Lotofy

Guia rápido e simples para instalar o Lotofy no Windows.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

### 1. **Node.js** (obrigatório)
- Download: https://nodejs.org/
- Versão recomendada: **LTS 20.x**
- Verificar instalação: abra o CMD e digite `node --version`

### 2. **MySQL 8** (obrigatório)

**Opção A - XAMPP (Recomendado - Mais Fácil)**
- Download: https://www.apachefriends.org/
- Instalar e iniciar o módulo MySQL
- Porta padrão: 3306
- Usuário: `root`
- Senha: (deixe em branco)

**Opção B - MySQL Installer**
- Download: https://dev.mysql.com/downloads/installer/
- Escolha "MySQL Server" na instalação
- Configure usuário `root` com senha em branco (ou anote a senha)

---

## 🚀 Instalação Automática (FÁCIL)

### Passo 1: Baixar o projeto
```bash
git clone https://github.com/seu-usuario/lotofy-lottery2.git
cd lotofy-lottery2
```

### Passo 2: Executar instalador
1. Clique com **botão direito** em `install-windows.bat`
2. Selecione **"Executar como administrador"**
3. Siga as instruções na tela
4. Pronto! ✅

O script vai:
- ✅ Verificar Node.js
- ✅ Verificar MySQL
- ✅ Instalar dependências
- ✅ Criar arquivo `.env`
- ✅ Criar banco de dados
- ✅ Criar tabelas
- ✅ Criar usuário admin

---

## 🔧 Instalação Manual (se o automático falhar)

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Criar arquivo `.env`
Crie um arquivo chamado `.env` na raiz do projeto com:

```env
DATABASE_URL="mysql://root:@localhost:3306/lotofy"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="lotofy-secret-change-in-production"
NODE_ENV="development"
```

**Se sua senha do MySQL não estiver em branco**, altere:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/lotofy"
```

### Passo 3: Criar banco de dados
Abra o MySQL (via XAMPP phpMyAdmin ou MySQL Workbench) e execute:

```sql
CREATE DATABASE lotofy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Ou via terminal:
```bash
mysql -u root -p -e "CREATE DATABASE lotofy;"
```

### Passo 4: Criar tabelas
No terminal do projeto:

```bash
mysql -u root lotofy < scripts/mysql_migration.sql
```

Ou via phpMyAdmin:
1. Selecione o banco `lotofy`
2. Vá em "SQL"
3. Cole o conteúdo de `scripts/mysql_migration.sql`
4. Clique em "Executar"

### Passo 5: Gerar Prisma Client
```bash
npx prisma generate
```

### Passo 6: Criar usuário admin
```bash
npx tsx scripts/create-admin.ts
```

---

## ▶️ Iniciar o Servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔑 Credenciais Padrão

**Admin:**
- Email: `admin@lotofy.com`
- Senha: `admin123`

---

## ❓ Problemas Comuns

### ❌ "Node.js não encontrado"
**Solução:** Instale o Node.js e reinicie o terminal
- Download: https://nodejs.org/

### ❌ "MySQL não encontrado"
**Solução:**
1. Instale XAMPP ou MySQL
2. Inicie o serviço MySQL
3. Verifique se está rodando na porta 3306

### ❌ "Erro ao conectar no banco"
**Solução:**
1. Verifique se o MySQL está rodando
2. Confira usuário e senha no `.env`
3. Teste a conexão:
   ```bash
   mysql -u root -p
   ```

### ❌ "Prisma Client não gerado"
**Solução:**
```bash
npx prisma generate
```

### ❌ "Admin não foi criado"
**Solução:**
```bash
npx tsx scripts/create-admin.ts
```

### ❌ Porta 3000 já está em uso
**Solução:** Mude a porta no comando:
```bash
PORT=3001 npm run dev
```

---

## 🗂️ Estrutura do Banco

Tabelas criadas automaticamente:
- `profiles` - Usuários do sistema
- `lottery_results` - Resultados históricos
- `user_predictions` - Apostas dos usuários
- `number_statistics` - Estatísticas de números
- `prize_verifications` - Verificações de prêmios
- `all_possible_games` - Todas as combinações (3.2M)

---

## 📊 Verificar Instalação

Execute estes comandos para verificar se está tudo OK:

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar MySQL
mysql --version

# Verificar conexão com banco
mysql -u root -e "USE lotofy; SHOW TABLES;"

# Verificar Prisma
npx prisma -v
```

---

## 🔄 Atualizar o Projeto

```bash
git pull
npm install
npx prisma generate
npm run dev
```

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se seguiu todos os passos
2. Confira os logs de erro no terminal
3. Consulte [MIGRATION_LOCALHOST.md](MIGRATION_LOCALHOST.md) para mais detalhes
4. Abra uma issue no GitHub

---

## ✅ Checklist de Instalação

- [ ] Node.js instalado (v20+)
- [ ] MySQL 8 instalado e rodando
- [ ] Repositório clonado
- [ ] `npm install` executado
- [ ] Arquivo `.env` criado
- [ ] Banco `lotofy` criado
- [ ] Tabelas criadas
- [ ] Prisma Client gerado
- [ ] Admin criado
- [ ] Servidor rodando
- [ ] Login funcionando

---

## 🎉 Pronto!

Agora você pode acessar o Lotofy em:
**http://localhost:3000**

Faça login com:
- Email: `admin@lotofy.com`
- Senha: `admin123`
