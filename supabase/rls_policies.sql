-- Adicionar coluna de nome customizado (se ainda não tiver sido feito)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Desabilitar RLS em todas as tabelas do projeto
-- (projeto interno de comunidade, sem dados sensíveis de terceiros)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_redemptions DISABLE ROW LEVEL SECURITY;
