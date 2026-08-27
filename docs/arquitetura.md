# Arquitetura

> Nasceu de [`docs/historico/project-status.md`](historico/project-status.md),
> escrito em março de 2026, e foi reconferido contra o repositório na task `21`
> (agosto de 2026). Onde o documento antigo estava desatualizado, o texto diz o
> que mudou e onde a mudança está registrada.

## O que é

Plataforma que liga mulheres impactadas por obras de infraestrutura às empresas
responsáveis. Uma pessoa registra um relato; a empresa responde; o histórico
fica público (ou anônimo, se ela escolher).

O repositório se chama `reclame-mulher`; a marca na interface é
**ComunicaMulher**. Os dois nomes convivem.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 15.5.9, App Router, Turbopack |
| Linguagem | TypeScript, `strict: true` |
| UI | Tailwind CSS + shadcn/ui sobre Radix |
| Banco | Postgres no Neon, driver serverless HTTP |
| ORM | Drizzle |
| Sessão | JWT assinado com `jose`, cookie `__session` HTTP-only |
| Formulários | React Hook Form + Zod |
| Estado de servidor | TanStack Query |
| Estado de cliente | Zustand |
| Arquivos | UploadThing |
| i18n | next-intl com provider próprio |

**Não há Supabase.** O legado baseado em RLS, RPC e `auth.uid()` foi removido
para não haver duas fontes de verdade sobre o banco. **Não há RLS**: toda a
autorização é código de aplicação, o que muda o custo de errar — ver
[`autorizacao.md`](autorizacao.md).

## Estrutura de pastas

```
src/
  app/           rotas do App Router: 42 páginas, 32 rotas de API
  components/    UI compartilhada, layout, landing, blog, empresa
  server/
    repos/       acesso a dados (8 repositórios)
    dto/         contratos de entrada, em Zod
    auth/        exigirEmpresa, exigirAdmin e afins
    http/        respostas de erro padronizadas
  db/            schema Drizzle, client, migrations
  lib/           auth, env, http, máscaras, rate limit, utilitários
  hooks/         hooks de React
  stores/        Zustand
  i18n/ messages/  internacionalização
  middleware.ts  portão de autenticação
```

`src/middleware.ts` **precisa** ficar exatamente ali. Com diretório `src/`, o
Next só reconhece o middleware nesse caminho; na raiz do repositório ele é
compilado e nunca executa. Foi um bug real — task `50`.

## Banco

13 tabelas:

`users` · `profiles` · `companies` · `company_users` · `projects` ·
`complaints` · `complaint_messages` · `complaint_attachments` · `blog_posts` ·
`blog_tags` · `blog_post_tags` · `reports` · `audit_logs`

A fonte de verdade é `src/db/schema.ts`, com as migrations em
`src/db/migrations` e a configuração em `drizzle.config.ts`.

### Status de relato

```
OPEN · RESPONDED · RESOLVED · CANCELLED
```

Quatro, e só. **Não existe `IN_PROGRESS` para relato** — a documentação de julho
descrevia a transição "OPEN → IN_PROGRESS → RESOLVED", que nunca existiu no
código. `IN_PROGRESS` é status de **projeto** (`PLANNING`, `IN_PROGRESS`,
`COMPLETED`, `CANCELLED`), outra coisa.

## Autenticação e sessão

Cookie `__session` com JWT assinado, montado em `src/lib/auth/session.ts`. A
chave vem de `SESSION_SECRET`, validada na subida por `src/lib/env.server.ts`.

O `src/middleware.ts` é um portão grosso: tem sessão ou não tem. A lista de
páginas públicas é a única exceção, e **falha fechado** — rota nova nasce
protegida. Papel, posse do recurso e visibilidade continuam sendo decididos em
cada página e em cada route handler, que têm contexto que o middleware não tem.

## Domínios

| Domínio | Existe | Não existe |
|---|---|---|
| **Relatos** | criação (assistente de 4 etapas), listagem, detalhe, mensagens, status, anonimato | reabertura depois de resolvido (task `55`) |
| **Empresas** | listagem pública, perfil por slug, dashboard, edição, projetos, equipe, denúncia | verificação administrativa de verdade |
| **Blog** | CRUD admin, tags, editor markdown, upload de imagem, listagem e detalhe públicos | — |
| **Admin** | layout protegido por papel `ADMIN`, painel, CRUD do blog, verificação de empresa, consulta de auditoria | auditoria **abrangente**: `audit_logs` só é escrito pela verificação de empresa, nenhuma outra ação é registrada |
| **E-mail** | quatro modelos HTML em `email-templates/` | **envio.** Nada no projeto manda e-mail (task `61`) |

O onboarding era, em março, o ponto mais frágil — `onboardingCompletedAt`
existia no schema e não era persistido. **Isso mudou:** as server actions de
`onboarding/person/step2` e `onboarding/company/step2` gravam o campo, e
`src/app/app/page.tsx` o consulta. O que sobrou de heurística está no
`ProfilesRepo.getRequiredOnboardingStep()`, que decide a etapa quando o campo
ainda está nulo.

## Anexos

Vão para o UploadThing. Duas coisas a saber:

- **Sem ACL.** O arquivo fica acessível por URL a quem tiver a URL. Ver a seção
  "Visibilidade de anexos" em [`autorizacao.md`](autorizacao.md).
- **Cliente e servidor discordam do limite.** O componente aceita 3 arquivos de
  até 5 MB; a rota do UploadThing aceita 1 de até 4 MB. Registrado como task
  `62`. (A documentação de julho dizia "10 MB por arquivo, 50 MB no total" —
  número que não corresponde a nenhum dos dois.)

## Erros de API

Um formato só, documentado e testado em [`api-erros.md`](api-erros.md). Antes da
task `17` havia 34 formatos diferentes.

## Onde está o resto

| Assunto | Documento |
|---|---|
| quem pode o quê | [`autorizacao.md`](autorizacao.md) |
| contrato de erro | [`api-erros.md`](api-erros.md) |
| como rodar os testes | [`testes.md`](testes.md) |
| acessibilidade | [`acessibilidade.md`](acessibilidade.md) |
| o que ainda falta | [`../TODO.md`](../TODO.md) |
| como cada correção foi medida | [`../.claude/fixes/INDEX.md`](../.claude/fixes/INDEX.md) |
