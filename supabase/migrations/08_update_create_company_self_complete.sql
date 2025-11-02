-- Atualiza a função create_company_self para aceitar todos os parâmetros necessários
DROP FUNCTION IF EXISTS public.create_company_self(text, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION public.create_company_self(
  p_company_name   text DEFAULT NULL,
  p_cnpj           text DEFAULT NULL,
  p_contact_name   text DEFAULT NULL,
  p_phone          text DEFAULT NULL,
  p_address        text DEFAULT NULL,
  p_city           text DEFAULT NULL,
  p_state          text DEFAULT NULL,
  p_accepted_terms boolean DEFAULT false,
  p_locale         text DEFAULT 'pt-BR'
) RETURNS public.companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_user_email text;
  v_user_metadata jsonb;
  v_company_name text;
  v_cnpj text;
  v_company public.companies;
  v_company_id uuid;
BEGIN
  -- Verifica se usuário está autenticado
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Busca dados do usuário e metadata
  SELECT email, raw_user_meta_data INTO v_user_email, v_user_metadata
  FROM auth.users
  WHERE id = v_uid;

  -- Busca company_name e cnpj do metadata se não foram passados
  v_company_name := COALESCE(p_company_name, v_user_metadata->>'company_name');
  v_cnpj := COALESCE(p_cnpj, v_user_metadata->>'cnpj');

  -- Verifica se já existe uma empresa vinculada ao usuário
  SELECT company_id INTO v_company_id
  FROM public.company_users
  WHERE user_id = v_uid
  LIMIT 1;

  IF v_company_id IS NOT NULL THEN
    -- Atualiza empresa existente
    UPDATE public.companies
    SET
      name = COALESCE(v_company_name, name),
      cnpj = COALESCE(NULLIF(p_cnpj, ''), cnpj),
      contact_phone = COALESCE(NULLIF(p_phone, ''), contact_phone),
      responsible_name = COALESCE(NULLIF(p_contact_name, ''), responsible_name),
      responsible_email = COALESCE(v_user_email, responsible_email),
      updated_at = now()
    WHERE id = v_company_id
    RETURNING * INTO v_company;

    -- Atualiza perfil do usuário
    UPDATE public.profiles
    SET
      phone = COALESCE(NULLIF(p_phone, ''), phone),
      address = COALESCE(NULLIF(p_address, ''), address),
      city = COALESCE(NULLIF(p_city, ''), city),
      state = COALESCE(NULLIF(p_state, ''), state),
      accepted_terms_at = CASE WHEN p_accepted_terms THEN now() ELSE accepted_terms_at END,
      locale = COALESCE(p_locale, locale),
      role = 'COMPANY',
      updated_at = now()
    WHERE user_id = v_uid;
  ELSE
    -- Cria nova empresa
    INSERT INTO public.companies (
      name,
      cnpj,
      contact_phone,
      responsible_name,
      responsible_email,
      verified_at
    ) VALUES (
      v_company_name,
      NULLIF(p_cnpj, ''),
      NULLIF(p_phone, ''),
      NULLIF(p_contact_name, ''),
      v_user_email,
      NULL
    )
    RETURNING * INTO v_company;

    -- Vincula o usuário como OWNER da empresa
    INSERT INTO public.company_users (user_id, company_id, role)
    VALUES (v_uid, v_company.id, 'OWNER')
    ON CONFLICT DO NOTHING;

    -- Cria ou atualiza perfil do usuário
    INSERT INTO public.profiles (
      user_id,
      name,
      email,
      role,
      phone,
      address,
      city,
      state,
      accepted_terms_at,
      locale,
      cpf
    ) VALUES (
      v_uid,
      NULLIF(p_contact_name, ''),
      v_user_email,
      'COMPANY',
      NULLIF(p_phone, ''),
      NULLIF(p_address, ''),
      NULLIF(p_city, ''),
      NULLIF(p_state, ''),
      CASE WHEN p_accepted_terms THEN now() ELSE NULL END,
      p_locale,
      NULL
    )
    ON CONFLICT (user_id) DO UPDATE SET
      phone = COALESCE(NULLIF(p_phone, ''), profiles.phone),
      address = COALESCE(NULLIF(p_address, ''), profiles.address),
      city = COALESCE(NULLIF(p_city, ''), profiles.city),
      state = COALESCE(NULLIF(p_state, ''), profiles.state),
      accepted_terms_at = CASE 
        WHEN p_accepted_terms THEN now() 
        ELSE profiles.accepted_terms_at 
      END,
      locale = COALESCE(p_locale, profiles.locale),
      role = 'COMPANY',
      updated_at = now();
  END IF;

  RETURN v_company;
END;
$$;

-- Configura permissões da função
REVOKE ALL ON FUNCTION public.create_company_self(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_self(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,BOOLEAN,TEXT) TO authenticated;

-- Comentário na função para documentação
COMMENT ON FUNCTION public.create_company_self(
  p_company_name TEXT,
  p_cnpj TEXT,
  p_contact_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_accepted_terms BOOLEAN,
  p_locale TEXT
) IS 'Cria ou atualiza uma empresa vinculada ao usuário autenticado e atualiza o perfil';

