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
- **Limite: 3 arquivos de até 4 MB cada**, em PNG, JPG, JPEG ou PDF. O número
  vive em [`src/lib/constants/anexos.ts`](../src/lib/constants/anexos.ts) e é
  importado pela tela e pela rota do UploadThing. Até a task `62` cada lado
  tinha o seu — a tela aceitava 5 MB, a rota aceitava 4 — e um arquivo de 4,5 MB
  só era recusado no fim do formulário. `src/lib/__tests__/anexos.test.ts` falha
  se algum dos dois voltar a escrever o número na mão.
- **Um arquivo por requisição.** O envio chama o UploadThing uma vez para cada
  anexo, então os três não disputam o mesmo `maxFileCount`.

## Renderização das páginas públicas

O `next build` classifica cada rota: `ƒ` é renderizada a cada visita, `○` é
pré-renderizada. **Página `○` que consulta o banco roda a consulta uma vez, no
build**, e serve o resultado congelado até o próximo deploy — foi o defeito que
a task `64` corrigiu na home, onde a seção "Nosso impacto em números" mostrava
o que era verdade no dia do deploy.

- **Home (`/`)**: `export const revalidate = 300`. Continua pré-renderizada, mas
  se refaz a cada cinco minutos. Escolhida em vez de `force-dynamic` porque é a
  página mais visitada e a latência até o Neon é de 139 ms (task `19`);
  escolhida em vez de `revalidatePath("/")` porque o `db:seed:demo` escreve
  direto no banco, sem passar por rota nenhuma.
- **Todas as outras onze páginas de servidor que leem do banco** saem `ƒ`, por
  lerem a sessão. `src/lib/__tests__/rotas-que-leem-o-banco.test.ts` mantém a
  lista e falha quando uma página nova entra nela sem ser classificada.

A coluna `Revalidate` do `next build` é o lugar de conferir isto de relance.

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
| como a usuária usa a plataforma | [`manual/MANUAL_DE_USO.md`](manual/MANUAL_DE_USO.md) |
| inventário de telas | [`especificacao-de-telas.md`](especificacao-de-telas.md) |
| o que ainda falta | [`../TODO.md`](../TODO.md) |
| como cada correção foi medida | [`../.claude/fixes/INDEX.md`](../.claude/fixes/INDEX.md) |
