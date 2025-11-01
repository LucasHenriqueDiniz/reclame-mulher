-- Corrige a função update_profile_person para lidar melhor com strings vazias

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
    name = COALESCE(NULLIF(TRIM(p_name), ''), name),
    cpf = COALESCE(NULLIF(TRIM(p_cpf), ''), cpf),
    phone = COALESCE(NULLIF(TRIM(p_phone), ''), phone),
    address = COALESCE(NULLIF(TRIM(p_address), ''), address),
    city = COALESCE(NULLIF(TRIM(p_city), ''), city),
    state = COALESCE(NULLIF(TRIM(p_state), ''), state),
    how_heard = COALESCE(NULLIF(TRIM(p_how_heard), ''), how_heard),
    accepted_terms_at = CASE 
      WHEN p_accepted_terms AND accepted_terms_at IS NULL THEN NOW()
      ELSE accepted_terms_at
    END,
    locale = COALESCE(NULLIF(TRIM(p_locale), ''), locale, 'pt-BR'),
    updated_at = NOW()
  WHERE user_id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_profile_person(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) TO authenticated;

COMMENT ON FUNCTION public.update_profile_person(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS 'Atualiza perfil de pessoa (usado no onboarding)';
