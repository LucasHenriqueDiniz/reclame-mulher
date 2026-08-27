# [16] Documentar e endurecer o modelo de autorização

| Campo | Valor |
|---|---|
| **ID** | `16` |
| **Fase** | `6 — Segurança e dados` |
| **Risco** | alto |
| **Depende de** | `11` |
| **Estimativa** | longa |

## Objetivo

Existe um documento único que descreve quem pode fazer o quê, o código
corresponde a ele, e a checagem está centralizada em vez de espalhada.

## Evidência

`TODO.md`, seção P2, três itens abertos e explicitamente marcados como
prioridade alta:

- "RLS/policies: documentar modelo de autorizacao real — Parcialmente
  documentado — **Prioridade: Alta para Fase 4**";
- "RLS/policies: cobrir regras de empresa, reclamacao e admin — Validação
  Fase 4";
- decisão registrada: **auth própria, sem RLS**.

Sem RLS, o banco não protege nada. Se um handler esquecer a checagem, o dado
vaza. Este é o risco mais sério do projeto — e é uma plataforma que armazena
denúncias identificadas de mulheres.

## Pré-condições

- [ ] `docs/autorizacao.md` com a matriz da task `11` existe.
- [ ] Os testes da task `11` passam.

## Passos

1. Complete `docs/autorizacao.md` com:
   - os papéis (`PERSON`, `COMPANY`, `ADMIN` — confirme os nomes reais no
     schema Drizzle);
   - os recursos (reclamação, mensagem, anexo, empresa, projeto, post de blog,
     log de auditoria, usuário);
   - a regra de cada par papel × recurso × operação;
   - a regra de **posse** (a autora da reclamação, a empresa envolvida) — que é
     onde mora o risco real, mais do que o papel em si.

2. Audite o código contra o documento. Para cada rota de API e cada Server
   Action, confirme que a checagem existe e é feita **no servidor**. Esconder
   um botão na UI não é autorização.

3. Se a checagem estiver duplicada em cada handler, centralize num helper
   (algo como `src/server/auth/guard.ts`) com funções explícitas —
   `requireRole`, `requireComplaintAccess`. Menos lugar para esquecer.

4. Confira também:
   - IDOR: trocar o id na URL dá acesso a recurso de outra pessoa?
   - a query do repositório filtra por dono, ou filtra só na camada de
     apresentação? Filtro só na apresentação é vazamento.
   - `src/server/repos/complaints.ts` está entre os arquivos modificados não
     commitados — revise com atenção redobrada.

5. Cada correção feita aqui vira um teste na task `11`.

## Critérios de aceite

- [ ] `docs/autorizacao.md` cobre todos os papéis e recursos, sem lacuna.
- [ ] Toda rota de API tem checagem server-side, ou está documentada como
      pública por design.
- [ ] Nenhum acesso por IDOR nas rotas testadas.
- [ ] Os testes da task `11` continuam verdes depois das mudanças.

## Verificação

```bash
npx playwright test e2e/api-authorization.spec.ts
```

```bash
npm run check
```

## Riscos e armadilhas

Centralizar guardas é refatoração ampla e pode quebrar rota que dependia de
comportamento implícito. Faça em lotes pequenos, com os testes da task `11`
rodando entre um lote e outro.

## Se ficar bloqueado

Achado de vazamento de dado pessoal é assunto de decisão humana: registre,
avise o usuário na resposta da iteração e **não** deixe a plataforma ser
demonstrada publicamente antes da correção.
