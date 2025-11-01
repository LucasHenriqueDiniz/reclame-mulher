-- Apaga assinaturas antigas (se existirem)
DROP FUNCTION IF EXISTS public.create_company_self(
  text, text, text, text, text, text, text, text, text, text, text
);
DROP FUNCTION IF EXISTS public.create_company_self(
  text, text, text, text, text, text, text, text
);

-- Recria com a assinatura usada no frontend
CREATE OR REPLACE FUNCTION public.create_company_self(
  p_company_name   text,
  p_cnpj           text DEFAULT NULL,
  p_contact_name   text DEFAULT NULL,
  p_phone          text DEFAULT NULL,
  p_email          text DEFAULT NULL,
  p_sector         text DEFAULT NULL,
  p_website        text DEFAULT NULL,
  p_slug           text DEFAULT NULL
) RETURNS public.companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_company public.companies;
BEGIN
  -- Verifica se usuário está autenticado
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Insere a empresa
  INSERT INTO public.companies (
    name, cnpj, sector, website,
    responsible_name, responsible_email, contact_phone,
    slug, verified_at
  ) VALUES (
    p_company_name,
    NULLIF(p_cnpj,''),
    NULLIF(p_sector,''),
    NULLIF(p_website,''),
    NULLIF(p_contact_name,''),
    NULLIF(p_email,''),
    NULLIF(p_phone,''),
    COALESCE(NULLIF(p_slug,''), REGEXP_REPLACE(LOWER(p_company_name), '[^a-z0-9\-]+', '-', 'g')),
    NULL
  )
  RETURNING * INTO v_company;

  -- Vincula o usuário como OWNER da empresa
  INSERT INTO public.company_users (user_id, company_id, role)
  VALUES (v_uid, v_company.id, 'OWNER')
  ON CONFLICT DO NOTHING;

  RETURN v_company;
END;
$$;

-- Configura permissões da função
REVOKE ALL ON FUNCTION public.create_company_self(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_self(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO authenticated;

-- Comentário na função para documentação
COMMENT ON FUNCTION public.create_company_self(
  p_company_name TEXT,
  p_cnpj TEXT,
  p_contact_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_sector TEXT,
  p_website TEXT,
  p_slug TEXT
) IS 'Cria uma nova empresa e vincula o usuário autenticado como OWNER';
