# 🎰 Lotofy - Sistema de Análise da Lotofácil

Sistema completo para análise estatística e geração de jogos da Lotofácil com interface web moderna.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [Scripts Úteis](#scripts-úteis)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Doação](#doação)

## 📖 Sobre o Projeto

O Lotofy é um sistema avançado para análise estatística dos resultados da Lotofácil, com recursos de geração de jogos inteligentes, verificação de prêmios, comparação de apostas e muito mais.

## 🌟 Funcionalidades

### Para Usuários Comuns:
- 📊 Análise estatística completa dos resultados históricos
- 🎯 Geração de jogos baseada em estatísticas
- 🏆 Verificação automática de prêmios
- 📈 Comparação de apostas
- 📋 Histórico de apostas pessoais
- 📱 Interface responsiva para desktop e mobile

### Para Administradores:
- 📥 Importação de resultados históricos
- 📊 Dashboard de estatísticas administrativas
- 👥 Gerenciamento de usuários
- 🛠️ Ferramentas de administração avançadas

## ⚙️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: MySQL 8
- **Autenticação**: NextAuth.js
- **UI**: Tailwind CSS, Shadcn UI
- **Deploy**: Docker, Nginx

## 🚀 Instalação

### Requisitos

- Node.js 18+ (recomendado: LTS 20.x)
- MySQL 8
- Git

### Instalação no Windows

1. **Instale os pré-requisitos:**
   - [Node.js](https://nodejs.org/)
   - [MySQL 8](https://dev.mysql.com/downloads/installer/) ou [XAMPP](https://www.apachefriends.org/)

2. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/lotofy-lottery2.git
   cd lotofy-lottery2
   ```

3. **Execute o instalador automático:**
   - Clique com botão direito em `install-windows.bat`
   - Selecione "Executar como administrador"
   - Siga as instruções na tela

4. **Para mais detalhes, consulte:** [INSTALL_WINDOWS.md](INSTALL_WINDOWS.md)

### Instalação Manual

Consulte [INSTALL_WINDOWS.md](INSTALL_WINDOWS.md) para instruções detalhadas de instalação manual.

## ▶️ Uso

### Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

### Credenciais Padrão

**Administrador:**
- Email: `admin@lotofy.com`
- Senha: `admin123`

## 🛠️ Scripts Úteis

### Scripts Windows

- `install-windows.bat` - Instalação automática completa
- `start.bat` - Inicia o servidor de desenvolvimento
- `lotofy-start.bat` - Script para iniciar o sistema e abrir o navegador
- `criar-atalho-desktop.ps1` - Cria atalho na área de trabalho

### Para criar um atalho na área de trabalho:

1. Execute `criar-atalho-desktop.ps1` como administrador
2. Um atalho será criado na sua área de trabalho
3. Clique no atalho para iniciar o sistema automaticamente

### Comandos npm

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar em produção
npm start

# Lint
npm run lint

# Testes
npm test
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e pertence a Lucas Saud.

## 💰 Doação

Se este projeto foi útil para você, considere fazer uma doação via PIX:

**Chave PIX:** 53484890000110

---

**Desenvolvido por Lucas Saud** 🇧🇷