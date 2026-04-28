# .opencodeshare

Este diretório ajuda o OpenCode a fazer alterações eficientes no projeto Reclame Mulher.

## Estrutura

```
context/        # Contexto do projeto (stack, URLs, logins de teste)
patterns/       # Padrões de UI, API e banco
skills/         # Workflows específicos (como adicionar página, API, componente)
snippets/       # Código reutilizável (boilerplates)
```

## Como usar

- **context/project.md** — Leia primeiro para entender o projeto
- **patterns/ui.md** — Consulte antes de criar/modificar telas
- **patterns/api.md** — Consulte antes de criar/modificar APIs
- **skills/** — Siga o workflow quando for fazer uma tarefa comum
- **snippets/** — Copie e cole como ponto de partida

## Regras gerais

1. Sempre use os shells (`AppPageShell`, `CompanyPageShell`) para novas páginas
2. Sempre use repositories para acesso a dados
3. Sempre serialize datas para ISO string ao enviar do server pro client
4. Nunca crie `<img>` — use `next/image`
5. Sempre teste o build antes de considerar pronto

## Stack resumida

Next.js 15 + React 19 + Tailwind 3 + shadcn/ui + Drizzle ORM + Neon Postgres + UploadThing

## Logins de teste

- maria@exemplo.com / senha123
- empresa@construtorax.com / senha123
- admin@comunicamulher.com.br / senha123
