# Guilda Badges 🏅

Um sistema web de **Identidade Social e Reputação** construído para ecossistemas de comunidades de Minecraft/Wurm Online (desacoplado do jogo). O MVP foca numa experiência de "Wallet/Inventário", onde usuários autênticam via Discord para acessar insígnias (badges) recebidas, representando suas conquistas, participações em eventos e ofícios.

## 🌟 Princípios do Projeto

- **Identidade (Badges):** Insígnias desenhadas de forma externa. O banco guarda referências (link), raridades e descrições.  
- **Distribuição (Códigos):** Os usuários não "pegam" as badges no sistema, elas são distribuídas via códigos (ilimitados ou uso único) concedidos por líderes da guilda ou automatizações futuras, ou atribuídas manualmente por admins.
- **Ecossistema:** Todo login é baseado em Discord OAuth2, removendo a necessidade de de registro formal com senhas.
- **Aparência de Jogo:** O design não passa a sensação de painel web, mas sim de um Inventário de um MMORPG Premium com cores atreladas a raridade (ex: Comum, Épico, Lendário).

## 🚀 Tecnologias

- **Framework:** Next.js 15 (App Router)
- **Estilização:** CSS Vanilla puro (Design System próprio `globals.css`)
- **Autenticação:** NextAuth.js (Auth.js Beta) via interface **Discord**
- **Banco de Dados:** SQLite (via biblioteca `better-sqlite3`) para um banco leve e relacional (`guilda.db`).

## 🛠️ Como Iniciar (Setup de Desenvolvimento)

1. **Requisitos:** Node.js 18+ (20+ recomendado para Next.js 15).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Configure as chaves do Discord dentro do novo arquivo:
   - Crie uma aplicação no [Discord Dev Portal](https://discord.com/developers/applications).
   - Obtenha o seu `Client ID` e o `Client Secret`.
   - Na aba OAuth2 da Aplicação, configure o **Redirect URI** como: `http://localhost:3000/api/auth/callback/discord`.
5. Gere ou preencha a chave `AUTH_SECRET` (pode rodar `npx auth secret` ou usar uma string randômica aleatória grande).
6. Rode a aplicação em modo dev:
   ```bash
   npm run dev
   ```

O banco SQLite (`guilda.db`) será auto-provisionado no primeiro boot caso as interfaces de banco de dados (`src/lib/db.ts`) sejam chamadas.

## 🗄️ Estrutura do Banco de Dados Inicial

O sistema utiliza o SQLite para suportar os seguintes modelos principais:
- **users:** Perfil vinculado à ID do discord.
- **admins:** Cadastro simples contendo os IDs do Discord que possuem liberação de ADM.
- **badges:** Catálogo principal. Id, nome, imagem_url, raridade.
- **codes:** Sistema de geração de distribuição. Traz código legível, vinculo com a badge referenciada e limites de uso.
- **user_badges:** Tabela relacional pilar mantendo o registro de quem detém quais insígnias (O Inventário real do usuário).

## ✅ Próximos Passos Priorizados

1. Estruturação da Autenticação via Discord (`Layout Configs`). ✔️ Em andamento
2. Interface do Usuário (Logins, Listagem do Inventário `Wallet`). 
3. Formulários de Admins Server Actions para CRUD em Códigos e Insígnias.
4. Lógica de Resgate de Códigos transacional.
