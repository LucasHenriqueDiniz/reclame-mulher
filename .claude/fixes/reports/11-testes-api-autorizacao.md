# Relatório — [11] Matriz de autorização das rotas de API

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## Resultado

**84 testes novos** (42 por projeto), cobrindo **40 endpoints** com cinco papéis
cada: anônimo, pessoa, outra pessoa, empresa e admin.

**Nenhuma rota aberta.** Nenhuma devolveu 200 para quem não podia, e nenhuma
devolveu 5xx sem sessão — o 5xx importa porque costuma ser checagem de
autorização que nem existe, com o handler estourando antes de decidir.

Isso merece ser dito com clareza, porque a task `50` encontrou o oposto no
middleware: **os route handlers estão corretos.** A proteção fina — papel, posse
do recurso — está onde deveria estar e funciona. O que faltava era prova.

A matriz medida está em [`docs/autorizacao.md`](../../../docs/autorizacao.md),
com os códigos HTTP reais de cada combinação. Não é leitura de código: é o que
o servidor respondeu.

## O teste não deixa rota nova passar despercebida

O último caso da spec não usa lista digitada à mão. Ele varre
`src/app/api/**/route.ts` no sistema de arquivos e exige que cada rota esteja na
matriz **ou** na lista de exceções com motivo escrito:

```ts
const semClassificacao = rotas(raiz).filter(
  (rota) => !naMatriz.has(rota) && !(rota in FORA_DA_MATRIZ)
);
expect(semClassificacao).toEqual([]);
```

Rota nova nasce quebrando o teste até alguém dizer quem pode chamá-la. Numa
aplicação sem RLS, esse é o único lugar onde essa pergunta pode ser obrigatória.

## O que não foi chamado, e por quê

Cinco rotas ficaram fora da execução — todas documentadas, nenhuma por
esquecimento: as quatro de `/api/auth/` (públicas, e chamar `register` criaria
conta a cada execução) e `/api/uploadthing`, cuja autorização vive no middleware
do UploadThing, não no route handler.

Dentro da matriz, várias combinações têm `—` em vez de código. São chamadas que
**funcionariam** e por isso não foram feitas:

- `DELETE /api/user/account` como pessoa apagaria a conta da demonstração;
- `POST /api/auth/change-password` com sessão trocaria a senha do seed e
  quebraria toda a suíte;
- `DELETE /api/company/profile` como empresa apagaria a Construtora X;
- `PATCH /api/admin/companies/[id]/verification` como admin mexeria na
  verificação de uma empresa do seed.

O lado da **negação** foi exercido em todas elas, que é o lado que importa para
segurança. Onde a negação usa um verbo que escreve, o corpo enviado é vazio de
propósito: se a autorização falhasse, a validação ainda barraria antes de tocar
no banco. O teste falharia alto, mas sem estrago.

## O que a matriz expôs: 401 e 403 misturados

Três padrões convivem para a mesma pergunta:

| Situação | Código devolvido |
|---|---|
| logada sem vínculo, em `/api/company/*` | **401** |
| logada sem papel de admin, em `/api/admin/*` | **403** |
| logada sem papel de admin, em `POST /api/companies` | **401** |
| anônima, em `GET /api/blog/posts?scope=admin` | **403** |

401 quer dizer "não sei quem é você, autentique-se". 403 quer dizer "sei quem é
você e você não pode". Um cliente que trate 401 mandando para o login vai mandar
a usuária **logada** de volta ao login em vez de dizer "sem permissão".

A causa é estrutural, não descuido: `getCurrentCompanyContext` e
`getCurrentAdminContext` devolvem `null` nos dois casos, e o handler não tem
como distinguir. Corrigir é dar a esses helpers um retorno que diferencie
"anônima" de "sem permissão".

Registrado na task `17`. A asserção aceita 401 **ou** 403 de propósito, para não
travar aquela correção — o que ela nunca aceita é 200 e 5xx.

## Achado `56` — a conta de empresa da demonstração é `MEMBER`

`empresa@construtorax.com` tem vínculo com papel `MEMBER`, e
`canManageCompany` exige `OWNER` ou `ADMIN`. Medido com a conta real:

| Rota | Resposta |
|---|---|
| `PATCH /api/company/profile` | **403** |
| `POST /api/company/projects` | **403** |
| `PATCH /api/company/projects/[id]` | **403** |
| `POST /api/company/users` | **403** |
| `PATCH /api/company/users/[userId]` | **403** |

A conta que vai ser usada na defesa **não consegue editar o perfil da empresa,
criar projeto nem convidar usuária** — e as telas com esses botões existem.

O código está certo; o dado do seed é que não serve para o uso pretendido. Há
ainda uma consequência de cobertura: a checagem de **posse** em
`/api/company/projects/[id]` (comparar o `companyId` do recurso com o da sessão)
é hoje **inalcançável**, porque a checagem de papel barra antes. Existe código
de autorização que nenhum teste consegue exercitar com este seed.

Registrado na task `56`, junto da `23`, porque é conserto de seed.

## Uma decisão de modelo que apareceu de graça

**O admin da plataforma recebe 401 em toda a área da empresa.**
`getCurrentCompanyContext` só olha vínculo, não papel de plataforma.

É coerente — administrar a plataforma não é administrar as empresas, e dar ao
admin acesso à caixa de entrada de relatos seria decisão de privacidade séria.
Mas hoje isso é consequência de implementação, não escolha registrada. A task
`16` precisa dizer que é intencional.

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test e2e/api-authorization.spec.ts` | ✅ 42/42 desktop, 42/42 mobile |
| `npx playwright test` (suíte inteira) | ✅ **214 passando, 2 pulados**, 10,1 min |
| `npm run check` | ✅ exit 0 |
| `npm run build` | ✅ `Compiled successfully in 18.0s` |
| Integridade do seed | ✅ 3 relatos, 2 empresas, 3 projetos, 4 posts, 4 perfis — intacto |

## Critérios de aceite

- [x] Todas as rotas de API aparecem na matriz — e o teste de varredura do
      sistema de arquivos garante que continuem aparecendo.
- [x] As rotas sensíveis (`/api/complaints/[id]/messages`,
      `/api/company/complaints/[id]/status`, tudo sob `/api/admin/`,
      `/api/auth/change-password`) têm teste de negação passando.
- [x] Nenhuma rota responde 5xx para requisição anônima.
- [x] Matriz documentada em `docs/autorizacao.md`, insumo direto da task `16`.

## Nota sobre o "se ficar bloqueado" da task

A task mandava parar a fila e avisar se aparecesse rota realmente desprotegida.
**Não apareceu.** A fila segue.
