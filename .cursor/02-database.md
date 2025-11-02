# Database Schema

## Tabelas Principais

### profiles

Perfis de usuários (pessoas físicas e empresas).

**Campos importantes:**

- `user_id` (PK): UUID do usuário do Supabase Auth
- `role`: Enum `app_role` (USER, COMPANY, ADMIN)
- `cpf`: Único, obrigatório para pessoas (USER role)
- `email`: Único, cache do email do auth.users
- `phone`, `address`, `city`, `state`: Dados de contato
- `how_heard`: Como ficou sabendo da plataforma (enum)
- `how_heard_other`: Texto livre quando `how_heard = 'OUTRO'`

**Constraints:**

- `cpf` é UNIQUE (permite múltiplos NULLs para empresas)
- `email` é UNIQUE (permite múltiplos NULLs)

### companies

Empresas cadastradas no sistema.

**Campos importantes:**

- `id` (PK): UUID
- `name`: Nome da empresa (obrigatório)
- `cnpj`: CNPJ (obrigatório, único)
- `responsible_name`: Nome do responsável
- `responsible_email`: Email do responsável
- `contact_phone`: Telefone de contato
- `verified_at`: Timestamp de verificação pela administração

**Constraints:**

- `cnpj` é NOT NULL e UNIQUE

### company_users

Relacionamento N:N entre usuários e empresas.

**Campos:**

- `user_id` + `company_id` (PK composta)
- `role`: OWNER, ADMIN, MEMBER

### complaints

Reclamações feitas por usuários sobre empresas/projetos.

**Campos importantes:**

- `id` (PK): UUID
- `author_id`: FK para profiles (usuário que fez a reclamação)
- `company_id`: FK para companies (empresa alvo)
- `project_id`: FK opcional para projects
- `title`, `description`: Conteúdo da reclamação
- `status`: Enum (OPEN, RESPONDED, RESOLVED, CANCELLED)
- `is_public`: Se a reclamação é pública
- `is_anonymous`: Se o autor quer se manter anônimo

### complaint_messages

Mensagens trocadas nas reclamações (conversação).

**Campos:**

- `id` (PK): UUID
- `complaint_id`: FK para complaints
- `sender_type`: Enum (USER, COMPANY, ADMIN)
- `author_id`: FK opcional para profiles (pode ser null para mensagens automáticas)
- `content`: Texto da mensagem
- `attachment_path`: Caminho de anexo (opcional)

### reports

Feedbacks, bugs, reports e solicitações de usuários.

**Campos:**

- `id` (PK): UUID
- `reporter_id`: FK para profiles (quem reportou)
- `type`: Enum (BUG, FEATURE_REQUEST, FEEDBACK, ABUSE, OTHER)
- `status`: Enum (PENDING, REVIEWING, RESOLVED, REJECTED)
- `title`: Título do report
- `description`: Descrição detalhada
- `related_complaint_id`: FK opcional para complaints
- `related_company_id`: FK opcional para companies
- `admin_notes`: Observações do admin (opcional)
- `resolved_at`: Timestamp de resolução
- `resolved_by`: FK opcional para profiles (admin que resolveu)

### projects

Projetos de infraestrutura das empresas.

**Campos:**

- `id` (PK): UUID
- `company_id`: FK para companies
- `name`: Nome do projeto
- `description`: Descrição
- `status`: Enum (PLANNING, IN_PROGRESS, COMPLETED, CANCELLED)
- `start_date`, `end_date`: Datas do projeto

### blog_posts, blog_tags, blog_post_tags

Sistema de blog com posts, tags e relacionamento N:N.

## Enums

### app_role

- `USER`: Pessoa física
- `COMPANY`: Empresa
- `ADMIN`: Administrador

### complaint_status

- `OPEN`: Aberta
- `RESPONDED`: Empresa respondeu
- `RESOLVED`: Resolvida
- `CANCELLED`: Cancelada

### sender_type

- `USER`: Mensagem do usuário
- `COMPANY`: Mensagem da empresa
- `ADMIN`: Mensagem administrativa

### report_type

- `BUG`: Bug no sistema
- `FEATURE_REQUEST`: Solicitação de feature
- `FEEDBACK`: Feedback geral
- `ABUSE`: Denúncia de abuso
- `OTHER`: Outro

### report_status

- `PENDING`: Aguardando revisão
- `REVIEWING`: Em revisão
- `RESOLVED`: Resolvido
- `REJECTED`: Rejeitado

## Constraints Importantes

1. **Unicidade:**

   - `profiles.cpf`: UNIQUE (permite múltiplos NULLs)
   - `profiles.email`: UNIQUE (permite múltiplos NULLs)
   - `companies.cnpj`: NOT NULL, UNIQUE
   - `blog_posts.slug`: UNIQUE
   - `blog_tags.name`: UNIQUE
   - `blog_tags.slug`: UNIQUE

2. **Foreign Keys:**
   - Relacionamentos com `onDelete: "cascade"` ou `"restrict"` conforme necessário
   - Profiles sempre referencia `auth.users` (não modelado no Drizzle)

## Migrations

- **NUNCA criar migrations SQL manuais** - sempre usar Drizzle
- Schema (`src/db/schema.ts`) é a **fonte de verdade única**
- Fluxo: editar schema → `pnpm db:generate` → revisar → `pnpm db:migrate`
