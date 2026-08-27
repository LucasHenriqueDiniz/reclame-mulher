# Relatório — [16] Documentar e endurecer o modelo de autorização

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1
- **Documento:** [`docs/autorizacao.md`](../../../docs/autorizacao.md) — 190 → 418 linhas

## O achado

**O nome real de quem escolheu o anonimato viajava no HTML da página.**

Todas as telas cumpriam a promessa: `CompanyComplaintList`,
`company-complaints-content` e `complaint-detail-content` escrevem "Anônima" em
vez do nome. Mas `ComplaintsRepo.findById` devolvia `author: { name }` sem olhar
`isAnonymous`, e a página serializa isso no payload do React.

Medido com uma terceira pessoa logada abrindo um relato anônimo público:

```
PROBE terceiro status: 200
PROBE terceiro contem 'Maria Silva'? true
PROBE trechos: ["...\"author\":{\"name\":\"Maria Silva\"},\"company\":..."]
```

A tela escrevia "Autor (anônimo)". O "ver código-fonte" escrevia o nome.

Isto é exatamente o que a task alertava — *"esconder um botão na UI não é
autorização"* — só que aplicado a dado em vez de ação. `findPublic` já fazia
certo (`isAnonymous ? null : ...`); `findById` e `findByCompany` não. Uma linha
em cada:

```ts
author: row.complaint.isAnonymous ? null : { name: row.authorName },
```

Nenhuma tela mudou, porque nenhuma tela mostrava o nome. O que mudou é que a
proteção deixou de depender de a tela lembrar.

> **Correção (task `18`).** O parágrafo acima está errado num ponto, e o erro
> torna o achado **mais** grave, não menos. Subindo o build de produção, a lista
> de reclamações do painel da empresa mostrava, na tela, o travessão onde antes
> aparecia **"Ana Santos"** — o nome real da autora de um relato anônimo do
> seed.
>
> A causa: `company-dashboard.tsx` monta as props da lista com um `.map` que
> **descartava `isAnonymous`**. O `CompanyComplaintList` tem a ramificação
> `isAnonymous ? "Autora anônima" : author?.name`, mas recebia `undefined` e
> caía no nome.
>
> Ou seja: o vazamento não era só de payload. Estava **impresso na tela** da
> empresa reclamada. A correção da `16` já o havia estancado; a `18` restaurou
> o rótulo certo, passando `isAnonymous` adiante.
>
> Eu havia concluído "nenhuma tela mostrava o nome" a partir dos `grep` por
> `author?.name`, que de fato mostraram a ramificação correta em todos os
> renderizadores. O que o grep não mostra é **quem esquece de passar a prop**.
> Ler o componente não bastava; foi preciso subir a aplicação e olhar.

### A prova de que o teste pega

Um teste que passa depois da correção não prova nada sozinho. Reapliquei o
defeito de propósito e rodei:

```
Error: o nome real da autora anônima veio no HTML da página pública
  1 failed
```

Depois reverti. O teste é uma trava, não um enfeite.

## O que a auditoria encontrou de resto: nada aberto

32 rotas de API e 4 Server Actions conferidas uma a uma.

| Grupo | Rotas | Proteção |
|---|---|---|
| `/api/admin/*` | 3 | `getCurrentAdminContext()` |
| `/api/company/*` | 9 | contexto de empresa + papel onde escreve + **posse por `companyId`** |
| `/api/complaints*`, `/api/user/*`, `change-password` | 5 | `getSession()` + posse |
| `/api/blog/posts*` | 2 | sessão + consulta inline a `profiles.role` |
| `/api/uploadthing` | 1 | `.middleware()` do próprio UploadThing |
| Públicas por design | 12 | só dado já público |

As três listas de relato filtram **na consulta**, não na apresentação:
`findByUser` por `authorId`, `findPublic` por `isPublic`, `findByCompany` por
`companyId`. Nenhuma Server Action aceita id de recurso vindo do cliente para
decidir a quem pertence a escrita — o `authorId` sai da sessão.

Ou seja: fora do anonimato, **o modelo estava correto e não documentado**. O
trabalho aqui foi mais de provar e escrever do que de consertar.

## O teste que faltava: posse, não papel

A `api-authorization.spec.ts` prova que um papel não entra na área de outro. Ela
**não** prova o caso mais perigoso, porque não parece perigoso: papel certo,
endpoint certo, **id errado**.

`e2e/ownership.spec.ts`, 6 testes × 2 projetos:

| Caso | Esperado | Medido |
|---|---|---|
| empresa lê relato de outra empresa | 403 | 403 |
| empresa muda status de relato de outra | 403 | 403 |
| empresa responde relato de outra | 403 | 403 |
| terceira pessoa escreve na conversa alheia | 403 | 403 |
| relato privado visto por terceira pessoa | sem conteúdo | sem conteúdo |
| nome em relato anônimo (página, API pública, empresa) | ausente | ausente |
| nome em relato **identificado** | presente | presente |
| 6 rotas de dado pessoal sem sessão | 401 | 401 |

O penúltimo existe porque, sem ele, "nulificar tudo" passaria. O último compara
o mapa inteiro de uma vez (`toEqual`), então o erro diz **qual** rota afrouxou,
e um 200 com corpo vazio também reprova — vazamento de existência é vazamento.

## Duas premissas da task que estavam erradas

A task dizia: *"em reclamação marcada como pública, **qualquer visitante** vê as
fotos e documentos anexados"*. Medido:

```
PROBE sem sessao terminou em: /login
```

`/app/complaints/[id]` está sob `/app`, que o middleware protege. **"Público"
neste produto quer dizer "visível a qualquer pessoa cadastrada", não "visível à
internet aberta".** A distinção muda o tamanho do problema, e estava faltando no
documento.

A segunda: os documentos do repositório falam num papel `PERSON`. Ele não
existe — o enum é `["USER", "COMPANY", "ADMIN"]`.

## Anexos: o que decidi, o que não decidi, e o que não dá para saber ainda

**Fiz** o que a task pedia sem depender de decisão: o formulário passou a avisar
a autora **antes** do envio, na etapa 3, com o que é verificável:

> Quem puder ver este relato também poderá abrir o que você anexar. Se você
> marcar o relato como público na próxima etapa, isso inclui qualquer pessoa
> cadastrada na plataforma. Anexe só o que puder ser visto por elas.

**Não decidi** se o anexo deve herdar a visibilidade do relato ou ter a própria.
Um documento pessoal anexado como prova não tem o mesmo regime de uma foto de
calçada quebrada, e essa é decisão de produto — da Paloma, não minha.

**Não consegui medir** a pergunta mais séria: os arquivos vão para o UploadThing
e são referenciados por URL (`file.ufsUrl`), sem ACL configurada em
`api/uploadthing/core.ts`. Se a URL for pública — que é o padrão do serviço —,
o anexo é acessível **sem sessão nenhuma** por quem tiver o link, e todo o
portão descrito acima protege só a *lista*, não o *arquivo*.

Não pude medir porque **o banco tem zero anexos**: o caminho nunca foi exercido
com dado real. Isso exige um upload de verdade, e está registrado como pendência
com a marca "antes de qualquer demonstração pública".

## O admin não vê a área das empresas — e isso fica registrado como intencional

A conta `ADMIN` recebe 401/403 em todo `/api/company/*`, porque
`getCurrentCompanyContext` só olha vínculo em `company_users` e o admin não tem
nenhum.

Registrei como intencional, com o motivo: o admin administra a *plataforma* —
verifica empresas, publica no blog, lê a auditoria. Ele não é supervisor das
conversas entre uma mulher e uma empresa. Numa plataforma que guarda denúncias
identificadas, "o admin vê tudo" é poder que precisa de justificativa, e nenhum
requisito pede isso.

A consequência prática está escrita no documento para quem for operar: **não há
como um administrador ler um relato para mediar um conflito.** Se essa
necessidade aparecer, vira requisito novo, com registro em auditoria — não um
`|| isAdmin` acrescentado a um `if`.

## O que decidi não centralizar

A checagem de admin existe em quatro trechos equivalentes:
`getCurrentAdminContext()` nos `/api/admin/*` e em `/api/companies`, e uma
consulta inline a `profiles.role` nos dois handlers de blog.

A task previa centralizar num helper. Não fiz, e o motivo é o que a própria task
avisa: é refatoração ampla, e o retorno aqui é baixo — os quatro trechos estão
corretos e agora estão cobertos por teste. Fica como pendência de qualidade, não
como risco. A rede que torna essa refatoração segura de fazer é justamente o que
esta task deixou pronto.

## Outras pendências registradas no documento

- `company_users.role` é `text` anulável, não enum. `"owner"` minúsculo vira
  negação silenciosa, porque as checagens comparam com `===`.
- `getCurrentCompanyContext` usa `memberships[0]`. Quem pertencer a duas
  empresas opera sempre na primeira, sem escolher e sem aviso.
- `syncProfileFromOAuth` é Server Action exportada, sem chamador, que só devolve
  `{ success: true }`. Sem acesso a dado, mas é superfície exposta à toa.

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test e2e/api-authorization.spec.ts e2e/ownership.spec.ts` | ✅ **96/96**, 4,2 min |
| `npm run test:e2e` | ✅ **325 passando, 3 pulados** (328), 14,6 min |
| `npm run test:a11y` | ✅ **78/78**, 0 ocorrências |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src e2e --max-warnings 0` | ✅ exit 0 |
| `npm run build` | ✅ passa |
| mutação: remover o `if` de anonimato | ✅ **o teste falha**, como tem que falhar |

### Um tropeço de ambiente, já documentado

Rodei `tsc` com a suíte E2E em segundo plano e recebi 60 erros em
`.next/types/validator.ts`. Não era regressão: os dois processos escrevem em
`.next`. É a armadilha que o `LOOP.md` documenta. `rm -rf .next` e o typecheck
volta limpo.

## Critérios de aceite

- [x] `docs/autorizacao.md` cobre todos os papéis e recursos — matriz de domínio
      com 20 linhas de recurso × operação, mais a tabela de posse com o arquivo
      de cada regra.
- [x] Toda rota de API tem checagem server-side, ou está documentada como
      pública por design — 32 de 32 classificadas.
- [x] Nenhum acesso por IDOR nas rotas testadas — 4 tentativas com papel certo e
      id errado, todas 403.
- [x] Os testes da task `11` continuam verdes.
- [ ] **Visibilidade de anexo** — decisão humana, registrada e pendente.
- [ ] **ACL do UploadThing** — não mensurável sem um upload real; registrado
      como bloqueio para demonstração pública.

## O que precisa de decisão humana

1. **Anexo herda a visibilidade do relato, ou tem a própria?** Hoje herda. A
   autora agora é avisada, mas o regime em si é escolha de produto.
2. **Verificar se o arquivo no UploadThing abre sem sessão.** É a diferença
   entre "visível a quem tem conta" e "visível a quem tem o link". Enquanto não
   se souber, não convém demonstrar a plataforma publicamente com anexo real.
3. **A empresa deve saber quem reclamou?** Decidi que não — é o que as telas já
   diziam. Se a intenção for outra, o texto do formulário precisa mudar junto,
   porque hoje ele promete anonimato sem ressalva.
