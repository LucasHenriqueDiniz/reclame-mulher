-- Função para criar empresa (chamada pelo usuário)
-- Esta função mapeia os nomes de parâmetros do frontend para as colunas corretas

CREATE OR REPLACE FUNCTION public.create_company_self(
  p_company_name TEXT,
  p_cnpj TEXT,
  p_contact_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_sector TEXT DEFAULT NULL,
  p_website TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL
) RETURNS public.companies
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_company public.companies;
BEGIN
  -- Verifica se usuário está autenticado
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  -- Insere a empresa
  INSERT INTO public.companies (
    name, cnpj, sector, website, responsible_name, responsible_email,
    contact_phone, slug, verified_at
  ) VALUES (
    p_company_name, NULLIF(p_cnpj,''), NULLIF(p_sector,''), NULLIF(p_website,''),
    NULLIF(p_contact_name,''), NULLIF(p_email,''), NULLIF(p_phone,''),
    NULLIF(p_slug,''), NULL
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

