-- Adicionar coluna de nome customizado (se ainda não tiver sido feito)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Padronização de RLS e Políticas de Segurança
-- Este script habilita a segurança e define quem pode acessar o quê.

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas existentes (para permitir re-execução)
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON public.badges;
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "User badges are viewable by everyone" ON public.user_badges;
DROP POLICY IF EXISTS "Admins are viewable by everyone" ON public.admins;

-- 3. Criar novas políticas
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id);
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Admins are viewable by everyone" ON public.admins FOR SELECT USING (true);

-- Nota: Tabelas 'codes', 'code_redemptions' e 'security_logs' permanecem privadas.
-- O acesso a elas é feito via funções SECURITY DEFINER ou Service Role.

