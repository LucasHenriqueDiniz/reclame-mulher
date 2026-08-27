# [08] E2E — autenticação nos três perfis

| Campo | Valor |
|---|---|
| **ID** | `08` |
| **Fase** | `3 — Testes` |
| **Risco** | baixo |
| **Depende de** | `07` |
| **Estimativa** | média |

## Objetivo

Login, redirecionamento por role e proteção de rota ficam cobertos por teste
automatizado, em vez de por afirmação em documento.

## Evidência

`STATUS_FINAL_PRODUCAO.md` lista três contas de seed como testadas:

| Perfil | E-mail |
|---|---|
| Pessoa | `maria@exemplo.com` |
| Empresa | `empresa@construtorax.com` |
| Admin | `admin@comunicamulher.com.br` |

As senhas estão em `scripts/seed.ts`. O teste foi manual — não existe artefato.

## Passos

1. `e2e/fixtures/auth.ts`: helper de login e storage state por role, para os
   testes seguintes não repetirem login.

2. `e2e/auth.spec.ts` cobrindo:
   - login válido de cada um dos 3 perfis;
   - redirecionamento correto após login (confirme o destino real de cada role
     lendo `middleware.ts` na raiz, não presuma);
   - login com senha errada → mensagem de erro visível, sem redirecionar;
   - acesso a rota protegida sem sessão → redireciona para `/login`;
   - **acesso cruzado**: pessoa logada tentando abrir `/app/company/inbox` e
     `/app/admin` → bloqueado. Isso é teste de segurança, não de UX;
   - logout → sessão encerrada, rota protegida volta a bloquear.

3. Não deixe senha fixa no spec: leia de variável de ambiente com fallback para
   o valor do seed, e documente.

## Critérios de aceite

- [ ] Os 3 logins passam.
- [ ] Os 2 casos de acesso cruzado passam (pessoa não entra em empresa/admin).
- [ ] Credencial inválida não redireciona e mostra erro.
- [ ] `npm run test:e2e` verde.

## Verificação

```bash
npm run db:seed
```

```bash
npx playwright test e2e/auth.spec.ts
```

## Riscos e armadilhas

Se o teste de acesso cruzado **falhar**, você encontrou uma falha de
autorização real. Não conserte o teste: registre como achado crítico, crie task
na faixa `50+` e conecte com a task `16`.
