# Reclame Mulher

Plataforma para conectar mulheres impactadas por obras de infraestrutura com empresas responsaveis, permitindo registro, reclamacoes, respostas, perfil publico de empresas, blog e administracao.

## Stack real atual

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Drizzle ORM
- Postgres/Neon
- autenticacao propria com cookie HTTP-only
- React Hook Form + Zod
- next-intl

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

O projeto roda na porta `5000` em desenvolvimento.

## Banco

A fonte de verdade atual do banco esta em:

- `src/db/schema.ts`
- `src/db/migrations`
- `drizzle.config.ts`

O legado antigo baseado em Supabase foi removido para evitar ambiguidade arquitetural.

## Documentacao interna

- `docs/project-status.md`: estado tecnico atual do projeto
- `docs/mvp-backlog.md`: backlog tecnico priorizado a partir do estado atual
- `docs/acessibilidade-inclusiva.md`: diretrizes para baixa alfabetizacao e baixa familiaridade digital

## Logins de teste

Senha para todos: `senha123`

- `maria@exemplo.com` (pessoa)
- `empresa@construtorax.com` (empresa)
- `ana@exemplo.com` (pessoa)
- `admin@comunicamulher.com.br` (admin)
