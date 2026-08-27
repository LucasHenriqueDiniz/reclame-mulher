import { z } from "zod";

/**
 * Campo opcional de atualização parcial.
 *
 * A distinção que estes três helpers precisam preservar, e que até a task `56`
 * eles apagavam:
 *
 * - **chave ausente** → `undefined`, "não mexe neste campo";
 * - **`null` explícito** → `null`, "limpa este campo";
 * - **texto vazio ou só espaço** → `null`, pela mesma razão.
 *
 * Os três escreviam `if (value == null) return null`, e `==` casa `undefined`
 * junto. Como o `transform` do Zod roda **também para chave ausente** quando o
 * schema é opcional, `UpdateCompanyProfileDto.parse({})` devolvia dezoito
 * campos, todos `null` — inclusive `name`, que é `NOT NULL` no banco.
 *
 * Na prática: qualquer atualização parcial do perfil da empresa apagava todo
 * campo não enviado, e um corpo vazio devolvia 500. Ninguém tinha visto porque
 * a rota exige `OWNER` e a única conta de empresa do seed era `MEMBER` — o
 * próprio achado `56`. Havia rota que conta nenhuma alcançava.
 */
const opcional = <T extends z.ZodTypeAny>(
  schema: T,
  normalizar: (value: string) => string = (value) => value.trim()
) =>
  z
    .union([schema, z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const trimmed = normalizar(String(value));
      return trimmed.length > 0 ? trimmed : null;
    });

const nullableTrimmedString = opcional(z.string());

/**
 * Campo que o **banco** exige, e que por isso não pode ser limpo.
 *
 * O `opcional()` acima existe para distinguir "não mandei" de "quero limpar".
 * Só que limpar não vale para toda coluna: `companies.name` e `companies.cnpj`
 * são `NOT NULL`, e mandar `null` neles produzia `UPDATE ... SET cnpj = NULL`,
 * que o Postgres recusa — a rota devolvia **500** onde devia devolver 400. Ver
 * task `69`.
 *
 * O comportamento aqui é o de sempre para chave ausente, e recusa explícita
 * para `null` e para texto em branco:
 *
 * - **chave ausente** → `undefined`, "não mexe";
 * - **`null`** → erro de validação (o Zod recusa antes, por tipo);
 * - **texto vazio ou só espaço** → erro de validação.
 */
const obrigatorioSeEnviado = (mensagem: string) =>
  z
    .string()
    .optional()
    .transform((valor) => (valor === undefined ? undefined : valor.trim()))
    .refine((valor) => valor === undefined || valor.length > 0, mensagem);

/**
 * O CNPJ chega com pontuação e é guardado só com dígitos — a mesma
 * normalização que `POST /api/auth/register-company` faz. A validação roda
 * depois de normalizar, senão `12.345.678/0001-99` reprovaria por "tamanho".
 */
const cnpjObrigatorioSeEnviado = z
  .string()
  .optional()
  .transform((valor) => (valor === undefined ? undefined : valor.replace(/\D/g, "")))
  .refine(
    (valor) => valor === undefined || valor.length === 14,
    "CNPJ deve ter 14 dígitos"
  );

const nullableEmail = opcional(z.string().email("E-mail inválido"), (value) =>
  value.trim().toLowerCase()
);

const nullableUrl = opcional(z.string().url("URL inválida"));

export const CreateCompanyDto = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().min(14, "CNPJ é obrigatório e deve ter 14 dígitos"),
  corporate_name: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().url().optional(),
  contact_phone: z.string().optional(),
  responsible_name: z.string().min(1, "Nome do responsável é obrigatório"),
  responsible_title: z.string().optional(),
  responsible_email: z.string().email("E-mail inválido"),
  slug: z.string().optional(),
  logo_url: z.string().url().optional(),
});

export const UpdateCompanyDto = z.object({
  name: z.string().min(1).optional(),
  cnpj: z.string().optional(),
  corporate_name: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().url().optional(),
  contact_phone: z.string().optional(),
  responsible_name: z.string().min(1).optional(),
  responsible_title: z.string().optional(),
  responsible_email: z.string().email().optional(),
  logo_url: z.string().url().optional(),
});

export const VerifyCompanyDto = z.object({
  verified: z.boolean(),
});

export const UpdateCompanyProfileDto = z.object({
  // `name` e `cnpj` são `NOT NULL` no banco — ver `obrigatorioSeEnviado`.
  name: obrigatorioSeEnviado("Nome da empresa não pode ficar em branco"),
  corporateName: nullableTrimmedString,
  cnpj: cnpjObrigatorioSeEnviado,
  description: nullableTrimmedString,
  phone: nullableTrimmedString,
  email: nullableEmail,
  website: nullableUrl,
  address: nullableTrimmedString,
  neighborhood: nullableTrimmedString,
  streetNumber: nullableTrimmedString,
  city: nullableTrimmedString,
  state: nullableTrimmedString,
  region: nullableTrimmedString,
  sector: nullableTrimmedString,
  contactName: nullableTrimmedString,
  contactPhone: nullableTrimmedString,
  responsibleName: nullableTrimmedString,
  responsibleEmail: nullableEmail,
  foundationDate: z.union([z.string(), z.null()]).optional(),
});

export const CreateCompanyReportDto = z.object({
  companyId: z.string().uuid("ID da empresa inválido"),
  reason: z.string().min(3, "Informe o motivo da denúncia"),
  details: z.string().max(2000, "A denúncia é muito longa").optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanyDto>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanyDto>;
export type VerifyCompanyInput = z.infer<typeof VerifyCompanyDto>;
export type UpdateCompanyProfileInput = z.infer<typeof UpdateCompanyProfileDto>;
export type CreateCompanyReportInput = z.infer<typeof CreateCompanyReportDto>;
