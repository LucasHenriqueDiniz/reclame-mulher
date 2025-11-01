-- Correção COMPLETA para recursão infinita nas RLS policies
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. FUNÇÕES HELPER (SECURITY DEFINER - bypassam RLS)
-- =====================================================

-- Função para verificar se usuário é membro da empresa (bypass RLS)
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

-- Função para verificar se usuário é OWNER (bypass RLS)
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

-- Função para verificar se usuário é ADMIN ou OWNER (bypass RLS)
CREATE OR REPLACE FUNCTION public.is_company_admin_or_owner(p_company_id uuid, p_user_id uuid)
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
    AND role IN ('OWNER', 'ADMIN')
  );
$$;

-- =====================================================
-- 2. CORRIGIR POLICIES DE COMPANY_USERS
-- =====================================================

DROP POLICY IF EXISTS "Owners can view company members" ON company_users;
DROP POLICY IF EXISTS "Users can view own company memberships" ON company_users;
DROP POLICY IF EXISTS "Company members can view other members" ON company_users;

-- Policy 1: Usuários podem ver suas próprias memberships (sem recursão)
CREATE POLICY "Users can view own company memberships"
  ON company_users FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Membros da empresa podem ver outros membros (usando função que bypassa RLS)
CREATE POLICY "Company members can view other members"
  ON company_users FOR SELECT
  USING (public.user_is_company_member(company_id, auth.uid()));

-- =====================================================
-- 3. CORRIGIR POLICIES DE COMPANIES (que usam company_users)
-- =====================================================

DROP POLICY IF EXISTS "Company members can view their companies" ON companies;
DROP POLICY IF EXISTS "Company owners can update their companies" ON companies;

CREATE POLICY "Company members can view their companies"
  ON companies FOR SELECT
  USING (public.user_is_company_member(id, auth.uid()));

CREATE POLICY "Company owners can update their companies"
  ON companies FOR UPDATE
  USING (public.is_company_admin_or_owner(id, auth.uid()));

-- =====================================================
-- 4. CORRIGIR POLICIES DE PROJECTS (que usam company_users)
-- =====================================================

DROP POLICY IF EXISTS "Company members can view projects" ON projects;
DROP POLICY IF EXISTS "Company admins can update projects" ON projects;
DROP POLICY IF EXISTS "Company admins can delete projects" ON projects;

CREATE POLICY "Company members can view projects"
  ON projects FOR SELECT
  USING (public.user_is_company_member(company_id, auth.uid()));

CREATE POLICY "Company admins can update projects"
  ON projects FOR UPDATE
  USING (public.is_company_admin_or_owner(company_id, auth.uid()));

CREATE POLICY "Company admins can delete projects"
  ON projects FOR DELETE
  USING (public.is_company_admin_or_owner(company_id, auth.uid()));

-- =====================================================
-- 5. CORRIGIR POLICIES DE COMPLAINTS (que usam company_users)
-- =====================================================

DROP POLICY IF EXISTS "Company members can view complaints" ON complaints;
DROP POLICY IF EXISTS "Company members can update complaints" ON complaints;
DROP POLICY IF EXISTS "Company members can respond to complaints" ON complaints;

CREATE POLICY "Company members can view complaints"
  ON complaints FOR SELECT
  USING (
    author_id = auth.uid()  -- Autor vê suas próprias reclamações
    OR public.user_is_company_member(company_id, auth.uid())  -- Membros veem reclamações da empresa
  );

CREATE POLICY "Company members can update complaints"
  ON complaints FOR UPDATE
  USING (public.user_is_company_member(company_id, auth.uid()));

CREATE POLICY "Company members can respond to complaints"
  ON complaints FOR UPDATE
  USING (public.user_is_company_member(company_id, auth.uid()));

-- =====================================================
-- 6. CORRIGIR POLICIES DE COMPLAINT_MESSAGES (que usam company_users)
-- =====================================================

DROP POLICY IF EXISTS "Company members can view complaint messages" ON complaint_messages;
DROP POLICY IF EXISTS "Company members can create messages" ON complaint_messages;

CREATE POLICY "Company members can view complaint messages"
  ON complaint_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_messages.complaint_id
      AND (
        complaints.author_id = auth.uid()
        OR public.user_is_company_member(complaints.company_id, auth.uid())
      )
    )
  );

CREATE POLICY "Company members can create messages"
  ON complaint_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_messages.complaint_id
      AND (
        complaints.author_id = auth.uid()
        OR public.user_is_company_member(complaints.company_id, auth.uid())
      )
    )
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON FUNCTION public.user_is_company_member(uuid, uuid) IS 'Verifica se usuário é membro da empresa (bypass RLS para evitar recursão)';
COMMENT ON FUNCTION public.is_company_owner(uuid, uuid) IS 'Verifica se usuário é OWNER da empresa (bypass RLS para evitar recursão)';
COMMENT ON FUNCTION public.is_company_admin_or_owner(uuid, uuid) IS 'Verifica se usuário é ADMIN ou OWNER da empresa (bypass RLS para evitar recursão)';

