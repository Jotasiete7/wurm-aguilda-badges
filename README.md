# Guilda Badges 🏅

Um sistema web de **Identidade Social e Reputação** construído para ecossistemas de comunidades de Minecraft/Wurm Online (desacoplado do jogo). O MVP foca numa experiência de "Wallet/Inventário", onde usuários autênticam via Discord para acessar insígnias (badges) recebidas, representando suas conquistas, participações em eventos e ofícios.

## 🌟 Princípios do Projeto

- **Identidade (Badges):** Insígnias desenhadas de forma externa. O banco guarda referências (link), raridades e descrições.  
- **Distribuição (Códigos):** Os usuários não "pegam" as badges no sistema, elas são distribuídas via códigos (ilimitados ou uso único) concedidos por líderes da guilda ou automatizações futuras, ou atribuídas manualmente por admins.
- **Ecossistema:** Todo login é baseado em Discord OAuth2, removendo a necessidade de de registro formal com senhas.
- **Aparência de Jogo:** O design não passa a sensação de painel web, mas sim de um Inventário de um MMORPG Premium com cores atreladas a raridade (ex: Comum, Épico, Lendário).

## 🚀 Tecnologias

- **Framework:** Next.js 15 (App Router)
- **Estilização:** CSS Vanilla puro (Design System próprio MMORPG no `globals.css`)
- **Autenticação:** NextAuth.js (Auth.js Beta) via Discord OAuth2
- **Banco de Dados:** Supabase (PostgreSQL) para escalabilidade e funções atômicas.
- **Segurança**: Rate limiting por IP/User e transações SQL atômicas (RPC) para resgate.

## 🛠️ Como Iniciar (Setup de Desenvolvimento)

1. **Requisitos:** Node.js 18+ (20+ recomendado para Next.js 15).
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o arquivo `.env.local`:
   ```env
   # Auth.js
   AUTH_URL=http://localhost:3000
   AUTH_SECRET=sua_chave_gerada_npx_auth_secret
   AUTH_DISCORD_ID=...
   AUTH_DISCORD_SECRET=...

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
   ```
4. Rode a aplicação em modo dev:
   ```bash
   npm run dev
   ```

## 🗄️ Estrutura do Banco de Dados (Supabase)

O sistema utiliza o PostgreSQL via Supabase para gerenciar:
- **users:** Perfil vinculado à ID do Discord (Snowflake).
- **admins:** Cadastro de IDs do Discord com permissão de administrador.
- **badges:** Catálogo de insígnias (ID, nome, descrição, imagem, raridade, tiragem).
- **codes:** Sistema de distribuição com limites de uso, expiração e notas administrativas.
- **user_badges:** Inventário real dos usuários (Registro de posse).
- **security_logs**: Rastreio de tentativas de resgate para prevenção de brute force.

## ✨ Funcionalidades Adicionadas

- **Hall da Fama (`/ranking`)**: Ranking ponderado de colecionadores baseado na raridade das insígnias.
- **Tooltips de Data**: Visualização da data de conquista ao passar o mouse sobre as badges.
- **Segurança Atômica**: Proteção contra *Race Conditions* e *Brute Force* no resgate de códigos.
- **Mobile First**: Interface 100% responsiva otimizada para dispositivos móveis.

---
*Desenvolvido com foco em Identidade, Reputação e Pertencimento.*
