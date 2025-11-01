-- Correção para recursão infinita na RLS policy de company_users
-- Execute este script no Supabase SQL Editor ou via psql

-- Função helper para verificar se usuário é membro da empresa (bypass RLS)
-- Esta função NÃO causa recursão porque SECURITY DEFINER bypassa RLS
CREATE OR REPLACE FUNCTION public.user_is_company_member(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_users
    WHERE company_id = p_company_id
    AND user_id = p_user_id
  );
$$;

-- Função helper para verificar se usuário é OWNER (bypass RLS)
CREATE OR REPLACE FUNCTION public.is_company_owner(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_users
    WHERE company_id = p_company_id
    AND user_id = p_user_id
    AND role = 'OWNER'
  );
$$;

-- Dropar TODAS as policies de company_users
DROP POLICY IF EXISTS "Owners can view company members" ON company_users;
DROP POLICY IF EXISTS "Users can view own company memberships" ON company_users;

-- Policy 1: Usuários podem ver suas próprias memberships (sem recursão)
CREATE POLICY "Users can view own company memberships"
  ON company_users FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Membros da empresa podem ver outros membros da mesma empresa
-- Usa função SECURITY DEFINER que bypassa RLS, evitando recursão
CREATE POLICY "Company members can view other members"
  ON company_users FOR SELECT
  USING (
    -- Verifica se o usuário logado é membro da mesma empresa usando função que bypassa RLS
    public.user_is_company_member(company_id, auth.uid())
  );

-- Comentários
COMMENT ON FUNCTION public.user_is_company_member(uuid, uuid) IS 'Verifica se usuário é membro da empresa (bypass RLS para evitar recursão)';
COMMENT ON FUNCTION public.is_company_owner(uuid, uuid) IS 'Verifica se usuário é OWNER da empresa (bypass RLS para evitar recursão)';

