# [11] Testes de autorização das 32 rotas de API

| Campo | Valor |
|---|---|
| **ID** | `11` |
| **Fase** | `3 — Testes` |
| **Risco** | baixo (o teste); alto (o que ele pode revelar) |
| **Depende de** | `10` |
| **Estimativa** | longa |

## Objetivo

Toda rota de API tem teste provando **quem pode** e **quem não pode** chamá-la.

## Evidência

Existem 32 arquivos `route.ts` em `src/app/api/`. O `TODO.md` (P2) registra:

> RLS/policies: decidir se o projeto manterá auth propria sem RLS ou camada
> equivalente. Status: Decisão tomada - Auth própria sem RLS

Auth própria sem RLS significa que **toda** a proteção é código de aplicação.
Uma rota que esqueça de checar o role fica completamente aberta, sem rede de
segurança no banco. Nenhuma dessas checagens tem teste.

## Pré-condições

- [ ] O inventário de rotas produzido pela task `00` está disponível em
      `reports/00-investigacao.md`.

## Passos

1. Use o inventário da task `00`. Para cada rota, monte a matriz:
   `anônimo` / `pessoa` / `pessoa dona do recurso` / `empresa` /
   `empresa envolvida` / `admin` × `permitido` ou `negado`.

2. `e2e/api-authorization.spec.ts` usando o `request` do Playwright — chamada
   HTTP direta, sem passar pela UI.

3. Priorize as rotas que expõem dado de terceiro:
   - `/api/complaints/[id]` e `/api/complaints/[id]/messages`
   - `/api/company/complaints/[id]/status`
   - tudo sob `/api/admin/`
   - `/api/auth/change-password`

4. Asserção mínima por rota: anônimo recebe 401 ou 403 (nunca 200, nunca 500);
   role errado recebe 403; dono recebe 200.

5. Documente a matriz resultante em `docs/autorizacao.md` — é insumo direto da
   task `16`.

## Critérios de aceite

- [ ] Todas as 32 rotas aparecem na matriz, mesmo as marcadas como "pública por
      design".
- [ ] As rotas sensíveis listadas acima têm teste de negação passando.
- [ ] Nenhuma rota responde 500 para requisição anônima — 500 aqui costuma
      significar que a checagem de auth nem existe e o handler estourou.

## Verificação

```bash
npx playwright test e2e/api-authorization.spec.ts
```

## Se ficar bloqueado

Se aparecer rota realmente desprotegida: **pare a fila**. Crie task na faixa
`50+` com prioridade máxima, marque como achado de segurança no relatório, e
avise o usuário explicitamente na resposta da iteração.
