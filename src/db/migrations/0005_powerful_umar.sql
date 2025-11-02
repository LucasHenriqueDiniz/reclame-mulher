-- Remove duplicatas de CNPJ antes de adicionar constraint (mantém apenas o primeiro)
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  FOR duplicate_record IN
    SELECT cnpj, array_agg(id) as company_ids
    FROM companies
    WHERE cnpj IS NOT NULL AND cnpj != ''
    GROUP BY cnpj
    HAVING COUNT(*) > 1
  LOOP
    -- Mantém o primeiro e atualiza os demais para NULL temporariamente
    UPDATE companies
    SET cnpj = NULL
    WHERE cnpj = duplicate_record.cnpj
      AND id != (SELECT id FROM companies WHERE cnpj = duplicate_record.cnpj LIMIT 1);
  END LOOP;
END $$;

-- Remove duplicatas de CPF antes de adicionar constraint
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  FOR duplicate_record IN
    SELECT cpf, array_agg(user_id) as user_ids
    FROM profiles
    WHERE cpf IS NOT NULL AND cpf != ''
    GROUP BY cpf
    HAVING COUNT(*) > 1
  LOOP
    -- Mantém o primeiro e atualiza os demais para NULL
    UPDATE profiles
    SET cpf = NULL
    WHERE cpf = duplicate_record.cpf
      AND user_id != (SELECT user_id FROM profiles WHERE cpf = duplicate_record.cpf LIMIT 1);
  END LOOP;
END $$;

-- Remove duplicatas de email antes de adicionar constraint
DO $$
DECLARE
  duplicate_record RECORD;
BEGIN
  FOR duplicate_record IN
    SELECT email, array_agg(user_id) as user_ids
    FROM profiles
    WHERE email IS NOT NULL AND email != ''
    GROUP BY email
    HAVING COUNT(*) > 1
  LOOP
    -- Mantém o primeiro e atualiza os demais para NULL
    UPDATE profiles
    SET email = NULL
    WHERE email = duplicate_record.email
      AND user_id != (SELECT user_id FROM profiles WHERE email = duplicate_record.email LIMIT 1);
  END LOOP;
END $$;

-- Verifica se há empresas sem CNPJ e aborta se houver
DO $$
DECLARE
  missing_cnpj_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_cnpj_count
  FROM companies
  WHERE cnpj IS NULL OR cnpj = '';
  
  IF missing_cnpj_count > 0 THEN
    RAISE EXCEPTION 'Existem % empresas sem CNPJ. Por favor, adicione CNPJ a todas as empresas antes de aplicar esta migration.', missing_cnpj_count;
  END IF;
END $$;

-- Agora aplica as constraints
ALTER TABLE "companies" ALTER COLUMN "cnpj" SET NOT NULL;
ALTER TABLE "companies" ADD CONSTRAINT "companies_cnpj_unique" UNIQUE("cnpj");
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_cpf_unique" UNIQUE("cpf");
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_email_unique" UNIQUE("email");