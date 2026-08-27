# [17] Padronizar validação de entrada e retorno de erro

| Campo | Valor |
|---|---|
| **ID** | `17` |
| **Fase** | `6 — Segurança e dados` |
| **Risco** | médio |
| **Depende de** | `16` |
| **Estimativa** | média |

## Objetivo

Toda entrada vinda do cliente é validada com Zod no servidor, e todo erro sai da
API no mesmo formato — o que torna a UI de erro previsível.

## Evidência

`TODO.md`, P2, itens abertos:

- "Repos: padronizar retorno de erro em operacoes server-side — **Parcialmente
  feito**";
- "Repos: revisar contratos dos repos principais — **Investigação necessária**";
- "Validacoes: revisar DTOs de reclamacao / empresa / projetos / mensagens" —
  todos abertos, todos descritos como "implementado" no corpo.

"Parcialmente feito" em tratamento de erro costuma significar: alguns handlers
devolvem JSON estruturado, outros vazam stack trace. Stack trace em resposta de
API entrega estrutura interna para quem estiver sondando.

## Passos

1. Levante como cada uma das 32 rotas devolve erro hoje. Classifique em: JSON
   padronizado / string solta / exceção não tratada (500 com stack).

2. Defina o contrato único e documente em `docs/api-erros.md`:

   ```json
   { "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": {} } }
   ```

   Códigos HTTP consistentes: 400 validação, 401 sem sessão, 403 sem permissão,
   404 inexistente **ou sem permissão de ver** (evita enumeração), 409
   conflito, 500 inesperado.

3. Crie um helper (`src/server/http/respond.ts` ou equivalente) e migre as
   rotas em lotes.

4. Garanta que **todo** corpo de requisição passa por `schema.safeParse` antes
   de tocar o banco. Sem `as` para forçar tipo — `as` no limite da aplicação é
   exatamente onde o dado não confiável entra.

5. Em produção, mensagem de erro 500 nunca inclui stack. Logue o detalhe no
   servidor, devolva o genérico.

## Critérios de aceite

- [ ] `docs/api-erros.md` existe com o contrato e a tabela de códigos.
- [ ] Todas as rotas que recebem corpo validam com Zod no servidor.
- [ ] Nenhuma resposta de erro em produção contém stack trace.
- [ ] Os testes das tasks `11` e `08`–`10` continuam verdes.

## Verificação

```bash
npm run test:e2e
```

```bash
npm run check
```

## Riscos e armadilhas

Mudar formato de erro quebra a UI que hoje lê o formato antigo. Procure por
`res.error`, `data.message` e afins no front antes de trocar, e migre os dois
lados no mesmo commit.
