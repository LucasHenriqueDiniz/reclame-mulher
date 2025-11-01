-- Atualiza a função update_profile_person para incluir how_heard_other
CREATE OR REPLACE FUNCTION public.update_profile_person(
  p_name TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_how_heard TEXT DEFAULT NULL,
  p_how_heard_other TEXT DEFAULT NULL,
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

  -- Garante que o profile existe (caso o trigger não tenha criado)
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (v_uid, COALESCE(NULLIF(TRIM(p_name), ''), split_part((SELECT email FROM auth.users WHERE id = v_uid), '@', 1)), 'USER'::app_role)
  ON CONFLICT (user_id) DO NOTHING;

  -- Cria ou atualiza o profile completo
  INSERT INTO public.profiles (
    user_id, 
    name, 
    cpf, 
    phone, 
    address, 
    city, 
    state, 
    how_heard,
    how_heard_other,
    accepted_terms_at,
    onboarding_completed_at,
    locale,
    role,
    email,
    provider
  )
  VALUES (
    v_uid,
    COALESCE(NULLIF(TRIM(p_name), ''), split_part((SELECT email FROM auth.users WHERE id = v_uid), '@', 1)),
    NULLIF(TRIM(p_cpf), ''),
    NULLIF(TRIM(p_phone), ''),
    NULLIF(TRIM(p_address), ''),
    NULLIF(TRIM(p_city), ''),
    NULLIF(TRIM(p_state), ''),
    CASE 
      WHEN NULLIF(TRIM(p_how_heard), '') IS NOT NULL 
      THEN NULLIF(TRIM(p_how_heard), '')::how_heard_type 
      ELSE NULL 
    END,
    NULLIF(TRIM(p_how_heard_other), ''),
    CASE WHEN p_accepted_terms THEN NOW() ELSE NULL END,
    CASE WHEN p_accepted_terms THEN NOW() ELSE NULL END,
    COALESCE(NULLIF(TRIM(p_locale), ''), 'pt-BR'),
    'USER'::app_role,
    (SELECT email FROM auth.users WHERE id = v_uid),
    COALESCE((SELECT raw_app_meta_data->>'provider' FROM auth.users WHERE id = v_uid), 'email')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(NULLIF(TRIM(p_name), ''), profiles.name),
    cpf = COALESCE(NULLIF(TRIM(p_cpf), ''), profiles.cpf),
    phone = COALESCE(NULLIF(TRIM(p_phone), ''), profiles.phone),
    address = COALESCE(NULLIF(TRIM(p_address), ''), profiles.address),
    city = COALESCE(NULLIF(TRIM(p_city), ''), profiles.city),
    state = COALESCE(NULLIF(TRIM(p_state), ''), profiles.state),
    how_heard = CASE 
      WHEN NULLIF(TRIM(p_how_heard), '') IS NOT NULL 
      THEN NULLIF(TRIM(p_how_heard), '')::how_heard_type 
      ELSE profiles.how_heard 
    END,
    how_heard_other = COALESCE(NULLIF(TRIM(p_how_heard_other), ''), profiles.how_heard_other),
    accepted_terms_at = CASE 
      WHEN p_accepted_terms AND profiles.accepted_terms_at IS NULL THEN NOW()
      ELSE profiles.accepted_terms_at
    END,
    onboarding_completed_at = CASE 
      WHEN p_accepted_terms AND profiles.onboarding_completed_at IS NULL THEN NOW()
      ELSE profiles.onboarding_completed_at
    END,
    locale = COALESCE(NULLIF(TRIM(p_locale), ''), profiles.locale, 'pt-BR'),
    updated_at = NOW();
END;
$$;

-- Atualiza permissões
GRANT EXECUTE ON FUNCTION public.update_profile_person(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

-- Comentário
COMMENT ON FUNCTION public.update_profile_person(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS 'Atualiza perfil de pessoa (usado no onboarding) - inclui how_heard e how_heard_other';

