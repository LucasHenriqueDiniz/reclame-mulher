# Relatório — [08] E2E de autenticação

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 2

## Resultado

**96 testes E2E passando** (48 por projeto, desktop e mobile), em 3,4 min.

| Bloco | Testes |
|---|---|
| Login pela tela (3 papéis + senha errada) | 4 |
| Rotas protegidas sem sessão | 16 |
| Páginas públicas continuam abertas | 11 |
| APIs públicas continuam abertas | 6 |
| Acesso cruzado entre papéis | 4 |
| APIs negam quem não tem permissão | 2 |
| Sessão (logout, login com sessão ativa) | 2 |
| Smoke (da task `07`) | 3 |

## A suíte encontrou uma regressão que eu tinha introduzido

Este é o retorno concreto do investimento em testes, na primeira execução.

O teste "anônimo recebe 401 ou 403, nunca 200 nem 500" falhou:

```
Error: /api/company/complaints devolveu 200 para requisição anônima
```

Investiguei com `curl`, sem seguir redirect:

```
/api/company/complaints   307 -> http://localhost:5000/login
/api/company/profile      307 -> http://localhost:5000/login
/api/admin/audit          307 -> http://localhost:5000/login
```

**Causa: a task `50`.** Antes dela o middleware estava morto, então as rotas de
API devolviam `401 JSON` dos próprios handlers. Ao fazer o middleware funcionar,
ele passou a interceptar **também** as rotas de API e a devolver um redirect
307 para a tela HTML de login.

Por que isso é defeito, e não detalhe:

- o cliente pede JSON e recebe HTML — `response.json()` estoura;
- o status final vira **200** (depois do redirect), então nenhum tratamento de
  erro do front reconhece a falha de autenticação;
- o Playwright segue redirect por padrão, que foi exatamente como o 200
  apareceu no teste.

A aplicação não quebrou de forma visível porque `/api/me` está na lista de
rotas públicas e continuava devolvendo 401 corretamente — era o único caminho
que o front exercitava sem sessão. Qualquer outra chamada autenticada teria o
problema.

### Correção

`src/middleware.ts` passou a distinguir os dois casos:

```ts
if (pathname.startsWith("/api/")) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
// páginas continuam indo para /login
```

Verificado depois da correção:

```
/api/company/complaints   401   {"error":"Unauthorized"}
/api/company/profile      401   {"error":"Unauthorized"}
/api/admin/audit          401   {"error":"Unauthorized"}
/api/company/users        401   {"error":"Unauthorized"}
/app/complaints           307 -> /login     (página segue redirecionando)
```

Corrigi aqui em vez de abrir task nova porque é regressão minha, de duas tasks
atrás, e o conserto é de cinco linhas. Deixar a aplicação devolvendo HTML no
lugar de JSON enquanto eu "registrava um achado" seria a escolha errada.

## Um erro meu no próprio teste

A outra falha era do teste, não do produto: eu afirmava
`not.toHaveURL(/\/login$/)` para **toda** página pública — e `/login` é
`/login`. Assertiva sem sentido para aquela rota.

Troquei por algo mais forte e correto: o caminho final tem que ser exatamente o
pedido, o que pega qualquer desvio indevido em qualquer das 11 páginas.

## Detalhe de implementação que vale registrar

`entrarViaApi` precisa receber **`page.request`**, não o fixture `request`
avulso. Só o primeiro compartilha cookies com o contexto do navegador; com o
avulso, a sessão fica num jar separado e a página continua deslogada. Isso está
documentado no fixture, porque o sintoma (teste que "deveria estar logado" mas
não está) não aponta para a causa.

Os testes que só falam com a API usam o fixture avulso de propósito, e fazem
login por ele mesmo.

O login dos helpers é **pela API**, não pela tela: o objetivo é *ter* sessão
para testar outra coisa. O fluxo de login pela interface é testado
explicitamente — assim, se ele quebrar, aparece uma falha apontando para o
lugar certo, e não trinta testes vermelhos ao mesmo tempo.

A senha vem de `E2E_SENHA` com fallback para a do seed — nenhum segredo fixo no
spec.

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test` | ✅ **96/96** (desktop + mobile), 3,4 min |
| `npm run check` | ✅ exit 0 (typecheck + lint + 18 testes de unidade) |
| `npm run build` | ✅ `Compiled successfully in 16.8s` |

## Critérios de aceite

- [x] Os 3 logins passam.
- [x] Os 2 casos de acesso cruzado passam — e mais dois no sentido positivo
      (empresa acessa a própria área, admin acessa a administração), para o
      teste não passar por bloquear tudo.
- [x] Credencial inválida não redireciona e mostra erro.
- [x] `npm run test:e2e` verde.

## Isto fecha a pendência da task `50`

O critério que ficou em aberto lá — "teste de regressão cobrindo a lista inteira
de rotas `/app/*`" — está cumprido: 16 rotas protegidas e 17 públicas
(11 páginas + 6 APIs) asseridas nos dois sentidos.

A conta dedicada `ninguem@exemplo.com` no teste de senha errada é proposital: o
limitador da task `51` conta falhas por e-mail, e usar uma conta real gastaria
a cota dela nos testes seguintes.
