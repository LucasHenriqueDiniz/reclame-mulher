-- =====================================================
-- RLS Policies, Triggers e Functions
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS RLS PARA PROFILES
-- =====================================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem inserir seu próprio perfil (via trigger)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Público pode ver nomes de perfis (para exibir em reclamações públicas)
CREATE POLICY "Public can view profile names"
  ON profiles FOR SELECT
  USING (true);

-- =====================================================
-- 3. POLÍTICAS RLS PARA COMPANIES
-- =====================================================

-- Público pode ver empresas verificadas
CREATE POLICY "Public can view verified companies"
  ON companies FOR SELECT
  USING (verified_at IS NOT NULL);

-- Usuários podem ver empresas das quais são membros
CREATE POLICY "Company members can view their companies"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = companies.id
      AND company_users.user_id = auth.uid()
    )
  );

-- Usuários autenticados podem criar empresas (via RPC)
CREATE POLICY "Authenticated can insert companies"
  ON companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Proprietários/Admins podem atualizar suas empresas
CREATE POLICY "Company owners can update their companies"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = companies.id
      AND company_users.user_id = auth.uid()
      AND company_users.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 4. POLÍTICAS RLS PARA COMPANY_USERS
-- =====================================================

-- Usuários podem ver empresas das quais são membros
CREATE POLICY "Users can view own company memberships"
  ON company_users FOR SELECT
  USING (auth.uid() = user_id);

-- Função helper para verificar se usuário é OWNER (bypass RLS)
CREATE OR REPLACE FUNCTION public.is_company_owner(p_company_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users
    WHERE company_id = p_company_id
    AND user_id = p_user_id
    AND role = 'OWNER'
  );
$$;

-- Proprietários podem ver todos os membros de suas empresas
CREATE POLICY "Owners can view company members"
  ON company_users FOR SELECT
  USING (
    public.is_company_owner(company_id, auth.uid())
  );

-- Usuários autenticados podem inserir membros (apenas via função)
-- (criado automaticamente ao criar empresa)

-- =====================================================
-- 5. POLÍTICAS RLS PARA PROJECTS
-- =====================================================

-- Membros da empresa podem ver projetos da empresa
CREATE POLICY "Company members can view projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = projects.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Proprietários/Admins podem criar projetos
CREATE POLICY "Company admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = projects.company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role IN ('OWNER', 'ADMIN')
    )
  );

-- Proprietários/Admins podem atualizar projetos
CREATE POLICY "Company admins can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = projects.company_id
      AND company_users.user_id = auth.uid()
      AND company_users.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 6. POLÍTICAS RLS PARA COMPLAINTS
-- =====================================================

-- Usuários podem ver suas próprias reclamações
CREATE POLICY "Users can view own complaints"
  ON complaints FOR SELECT
  USING (auth.uid() = author_id);

-- Usuários podem ver reclamações públicas
CREATE POLICY "Public can view public complaints"
  ON complaints FOR SELECT
  USING (is_public = true);

-- Membros da empresa podem ver reclamações da empresa
CREATE POLICY "Company members can view company complaints"
  ON complaints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = complaints.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Usuários autenticados podem criar reclamações
CREATE POLICY "Authenticated can create complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Usuários podem atualizar suas próprias reclamações (apenas status/descrição)
CREATE POLICY "Users can update own complaints"
  ON complaints FOR UPDATE
  USING (auth.uid() = author_id);

-- Membros da empresa podem atualizar status de reclamações da empresa
CREATE POLICY "Company members can update complaint status"
  ON complaints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM company_users
      WHERE company_users.company_id = complaints.company_id
      AND company_users.user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. POLÍTICAS RLS PARA COMPLAINT_MESSAGES
-- =====================================================

-- Usuários podem ver mensagens de suas reclamações
CREATE POLICY "Users can view messages from own complaints"
  ON complaint_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_messages.complaint_id
      AND complaints.author_id = auth.uid()
    )
  );

-- Membros da empresa podem ver mensagens de reclamações da empresa
CREATE POLICY "Company members can view complaint messages"
  ON complaint_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      JOIN company_users ON company_users.company_id = complaints.company_id
      WHERE complaints.id = complaint_messages.complaint_id
      AND company_users.user_id = auth.uid()
    )
  );

-- Usuários podem criar mensagens em suas reclamações
CREATE POLICY "Users can create messages in own complaints"
  ON complaint_messages FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_messages.complaint_id
      AND complaints.author_id = auth.uid()
    )
  );

-- Membros da empresa podem criar mensagens em reclamações da empresa
CREATE POLICY "Company members can create messages"
  ON complaint_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints
      JOIN company_users ON company_users.company_id = complaints.company_id
      WHERE complaints.id = complaint_messages.complaint_id
      AND company_users.user_id = auth.uid()
    )
  );

-- =====================================================
-- 8. POLÍTICAS RLS PARA BLOG_POSTS
-- =====================================================

-- Público pode ver posts publicados
CREATE POLICY "Public can view published posts"
  ON blog_posts FOR SELECT
  USING (published_at IS NOT NULL);

-- =====================================================
-- 9. TRIGGER: Criar profile automaticamente ao criar usuário
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, provider)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 10. TRIGGER: Atualizar updated_at automaticamente
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 11. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_verified_at ON companies(verified_at) WHERE verified_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj) WHERE cnpj IS NOT NULL;

-- Company Users
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users(company_id);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Complaints
CREATE INDEX IF NOT EXISTS idx_complaints_author_id ON complaints(author_id);
CREATE INDEX IF NOT EXISTS idx_complaints_company_id ON complaints(company_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_is_public ON complaints(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_complaints_project_id ON complaints(project_id) WHERE project_id IS NOT NULL;

-- Complaint Messages
CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint_id ON complaint_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_author_id ON complaint_messages(author_id) WHERE author_id IS NOT NULL;

-- Blog Posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at) WHERE published_at IS NOT NULL;

-- =====================================================
-- 12. FUNÇÃO: Atualizar perfil de pessoa (usada no onboarding)
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_profile_person(
  p_name TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_how_heard TEXT DEFAULT NULL,
  p_accepted_terms BOOLEAN DEFAULT false,
  p_locale TEXT DEFAULT 'pt-BR'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  UPDATE profiles
  SET
    name = COALESCE(p_name, name),
    cpf = COALESCE(NULLIF(p_cpf, ''), cpf),
    phone = COALESCE(NULLIF(p_phone, ''), phone),
    address = COALESCE(NULLIF(p_address, ''), address),
    city = COALESCE(NULLIF(p_city, ''), city),
    state = COALESCE(NULLIF(p_state, ''), state),
    how_heard = COALESCE(NULLIF(p_how_heard, ''), how_heard),
    accepted_terms_at = CASE 
      WHEN p_accepted_terms AND accepted_terms_at IS NULL THEN NOW()
      ELSE accepted_terms_at
    END,
    locale = COALESCE(p_locale, locale),
    updated_at = NOW()
  WHERE user_id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_profile_person TO authenticated;

-- =====================================================
-- 13. FUNÇÃO: Criar empresa (versão JSON simplificada)
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_company_self_json(p_data JSONB)
RETURNS public.companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_company public.companies;
  v_base_slug TEXT;
  v_slug TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Gera slug único
  v_base_slug := lower(regexp_replace(p_data->>'name', '[^a-z0-9]+', '-', 'g'));
  v_slug := v_base_slug;
  
  -- Garante slug único
  WHILE EXISTS (SELECT 1 FROM companies WHERE slug = v_slug) LOOP
    v_slug := v_base_slug || '-' || floor(random() * 10000)::TEXT;
  END LOOP;

  -- Insere a empresa
  INSERT INTO public.companies (
    name, cnpj, corporate_name, sector, website,
    responsible_name, responsible_email, contact_phone,
    slug, verified_at
  ) VALUES (
    p_data->>'name',
    NULLIF(p_data->>'cnpj', ''),
    NULLIF(p_data->>'corporate_name', ''),
    NULLIF(p_data->>'sector', ''),
    NULLIF(p_data->>'website', ''),
    NULLIF(p_data->>'responsible_name', ''),
    NULLIF(p_data->>'responsible_email', ''),
    NULLIF(p_data->>'contact_phone', ''),
    v_slug,
    NULL
  )
  RETURNING * INTO v_company;

  -- Vincula o usuário como OWNER
  INSERT INTO public.company_users (user_id, company_id, role)
  VALUES (v_uid, v_company.id, 'OWNER')
  ON CONFLICT DO NOTHING;

  RETURN v_company;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_company_self_json(JSONB) TO authenticated;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria profile automaticamente ao criar usuário no auth';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Atualiza updated_at automaticamente';
COMMENT ON FUNCTION public.update_profile_person(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS 'Atualiza perfil de pessoa (usado no onboarding)';
COMMENT ON FUNCTION public.create_company_self_json(JSONB) IS 'Cria empresa com dados JSON e slug único';

