# Documentação do Projeto Reclame Mulher

Esta pasta contém toda a documentação do projeto organizada em arquivos markdown.

## Estrutura

- **[01-architecture.md](./01-architecture.md)** - Arquitetura, stack tecnológica e padrões de código
- **[02-database.md](./02-database.md)** - Schema do banco de dados, tabelas, enums e constraints
- **[03-business-rules.md](./03-business-rules.md)** - Regras de negócio, workflows e validações
- **[04-brand-guidelines.md](./04-brand-guidelines.md)** - Guia de marca, cores, tipografia e componentes
- **[05-conventions.md](./05-conventions.md)** - Convenções de nomenclatura e padrões de código
- **[06-api-endpoints.md](./06-api-endpoints.md)** - Documentação de API routes e server actions
- **[07-reports-feedback.md](./07-reports-feedback.md)** - Sistema de reports, feedback e bugs

## Como Usar

Esta documentação serve como referência para:

- Novos desenvolvedores no projeto
- Decisões de arquitetura
- Padrões de código
- Regras de negócio

## Mantendo Atualizada

Quando fizer mudanças significativas:

1. Atualize o arquivo relevante
2. Se criar nova feature, documente em arquivo apropriado
3. Mantenha exemplos de código atualizados

## Migrations do Banco

**IMPORTANTE:**

- Schema (`src/db/schema.ts`) é a fonte de verdade
- Sempre usar Drizzle para gerar migrations
- Nunca criar migrations SQL manuais
- Fluxo: editar schema → `pnpm db:generate` → revisar → `pnpm db:migrate`
