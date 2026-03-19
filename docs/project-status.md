# Estado Atual do Projeto

## Resumo

O projeto atual nao roda em Supabase no runtime. A arquitetura real hoje e:

- Next.js App Router
- TypeScript
- Tailwind CSS + componentes shadcn/ui
- Drizzle ORM
- Postgres/Neon
- autenticacao propria com cookie HTTP-only + JWT assinado
- React Hook Form + Zod
- next-intl com provider customizado

Isso nao e necessariamente pior que o plano original. A troca de Supabase por Drizzle + auth propria da mais controle sobre schema, sessao e regras de dominio. O problema atual nao e a troca em si, e a coexistencia de legado antigo no repositorio.

## Estrutura

O workspace esta razoavelmente organizado:

- `src/app`: rotas App Router, layouts, paginas, APIs
- `src/components`: UI compartilhada, layout, landing, blog, empresa
- `src/server/repos`: camada de acesso a dados
- `src/server/dto`: validacao e contratos de entrada
- `src/db`: schema Drizzle, client e migrations
- `src/lib`: auth, env, utilitarios, constantes
- `src/messages` e `src/i18n`: internacionalizacao

A arquitetura geral e coerente. O principal problema estrutural e a mistura de duas historias tecnicas:

- a arquitetura real atual em `src/db` e `src/lib/auth`
- o legado de Supabase que existia em `supabase/`

## Setup e base tecnica

Pontos positivos:

- `tsconfig.json` esta com `strict: true`
- alias `@/*` esta configurado
- provider global esta montado em `src/app/layout.tsx` e `src/app/providers.tsx`
- `next-intl` esta funcional via `LocaleProvider`
- build de producao passa

Pontos inconsistentes:

- `components.json` estava apontando para caminhos errados do shadcn (`tailwind.config.js` e `app/globals.css`), enquanto o projeto usa `tailwind.config.ts` e `src/app/globals.css`
- parte da UI usa Tailwind/shadcn de forma padrao e outra parte usa muito estilo inline em telas de empresa

## Banco e persistencia

O schema atual cobre bem o dominio principal:

- `users`
- `profiles`
- `companies`
- `company_users`
- `projects`
- `complaints`
- `complaint_messages`
- `complaint_attachments`
- `blog_posts`
- `blog_tags`
- `blog_post_tags`
- `reports`

As migrations validas hoje sao as de `src/db/migrations`.

O repositorio tinha um conjunto antigo de migrations em `supabase/migrations` baseado em RLS, RPC e `auth.uid()`, mas isso nao refletia mais o runtime atual. Esse legado foi removido para manter uma unica fonte de verdade no banco.

## Auth e onboarding

Auth basico esta implementado:

- registro pessoa
- registro empresa
- login
- logout
- troca de senha
- senha temporaria para membros de empresa

O fluxo de sessao usa cookie `__session` com JWT assinado em `src/lib/auth/session.ts`.

O ponto mais fragil do projeto continua sendo o onboarding:

- existe campo `onboardingCompletedAt` no schema
- mas as server actions de onboarding nao o persistem de forma consistente
- o redirecionamento depende de heuristicas no `ProfilesRepo`

Conclusao: auth existe e funciona, onboarding ainda precisa ser consolidado como fluxo de estado explicito.

## Dominios principais

### Empresas

Ja existe:

- listagem publica
- perfil publico por slug
- dashboard da empresa
- edicao de perfil
- gestao de projetos
- gestao de membros
- denuncia de empresa

Pendencias reais:

- endurecer permissoes por papel em rotas sensiveis
- fechar fluxo administrativo de verificacao

### Reclamacoes

Ja existe:

- criacao
- listagem da usuaria
- detalhe
- mensagens
- status
- listagem publica por empresa

Pendencias reais:

- storage de anexos pronto para producao
- revisar autorizacao e download/consulta de anexos

### Blog

Ja existe:

- CRUD admin
- tags
- editor markdown
- upload de imagem com UploadThing
- listagem publica e detalhe

Pendencias reais:

- alinhar regra de publicacao entre lista e detalhe
- remover endpoint mock de destaque e usar dados reais

### Admin

Ja existe:

- layout protegido por role `ADMIN`
- painel inicial
- CRUD de blog admin

Nao existe de verdade:

- auditoria real
- moderacao/verificacao real de empresas

## Frontend

Telas com fluxo real:

- login e registro
- onboarding pessoa e empresa
- area da usuaria
- reclamacoes
- perfil publico de empresa
- dashboard da empresa
- blog
- settings

Telas ainda parciais ou placeholders:

- `app/admin/companies`
- `app/admin/audit`

O projeto esta visualmente avancado, mas com maturidade desigual entre as areas.

## Seguranca

Pontos bons:

- sessao via cookie HTTP-only
- checagem server-side para admin
- checagem de sessao nas APIs principais

Pontos que exigem ajuste:

- rotas da area empresa ainda aceitam qualquer membro em operacoes que deveriam exigir `OWNER` ou `ADMIN`
- upload de anexos de reclamacao grava em disco local, o que e aceitavel em dev, nao em deploy real

## Qualidade tecnica

Pontos bons:

- camada `repo` existe
- DTOs com Zod existem
- build passa

Divida tecnica relevante:

- onboarding ainda mal definido como estado
- legado documental antigo e contraditorio
- parte da UI de empresa usa padrao tecnico diferente do restante
- warnings de lint ainda existem

## Conclusao

O projeto esta mais proximo de um MVP navegavel do que de um prototipo vazio. A base principal existe, mas ainda faltam tres fechamentos importantes:

1. consolidar onboarding
2. endurecer autorizacao da area empresa
3. implementar admin real para verificacao e auditoria
