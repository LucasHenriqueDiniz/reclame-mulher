# Modelo de autorização

> **Como este documento foi feito.** Nasceu na task `51`, com a decisão sobre
> persistência do limitador de tentativas. A task `11` acrescentou a matriz de
> rotas medida com chamadas reais. A task `16` acrescentou a matriz de domínio,
> a regra de posse, a auditoria das 32 rotas e das 4 Server Actions, e as
> decisões de anonimato e de anexo.
>
> Nada aqui é aspiracional: cada afirmação foi medida contra o código ou contra
> a aplicação rodando. O que não foi medido está dito como não medido.

## Modelo geral

O projeto usa **autenticação própria, sem RLS** no banco. Consequência direta:
**toda a autorização é código de aplicação**. Não existe rede de segurança na
camada de dados — se um handler esquecer a checagem, o dado fica exposto.

As camadas, da mais grossa para a mais fina:

| Camada | Onde | O que decide |
|---|---|---|
| Middleware | `src/middleware.ts` | só "tem sessão ou não tem", para páginas e APIs não listadas como públicas |
| Página / Server Component | `src/app/**/page.tsx` | papel e acesso ao recurso; redireciona para `/login` quando não há sessão |
| Route handler | `src/app/api/**/route.ts` | papel, posse do recurso, validação de entrada |

O middleware **precisa ficar em `src/middleware.ts`**. O projeto usa diretório
`src/`, e nesse caso o Next ignora um `middleware.ts` na raiz — ele é compilado
e nunca executado. Isso já aconteceu neste projeto (task `50`).

A lista de rotas públicas do middleware **falha fechado**: rota nova nasce
protegida e só vira pública se alguém a incluir de propósito.

## Limite de tentativas (`src/lib/rate-limit.ts`)

### Como funciona

| Escopo | Chave principal | Cota | Camada extra por IP |
|---|---|---|---|
| `login` | e-mail tentado | 5 falhas / 15 min | 20 falhas / 15 min |
| `register` | e-mail sendo cadastrado | 5 / 15 min | 20 / 15 min |
| `register-company` | e-mail sendo cadastrado | 5 / 15 min | 20 / 15 min |
| `change-password` | `userId` da sessão | 5 / 15 min | 20 / 15 min |

Três regras que valem registro:

1. **Só falha conta.** Tentativa bem-sucedida zera o contador daquela chave.
2. **A chave é a identidade, não o IP.** Requisição sem header de proxy não cai
   mais numa chave `"unknown"` compartilhada por todo mundo.
3. **Sem identidade e sem IP, deixa passar.** Melhor que juntar usuárias sem
   relação no mesmo balde. A credencial válida continua sendo exigida.

A resposta 429 traz o header `Retry-After` e o tempo restante na mensagem, que
a tela de login já exibe.

### Persistência — decisão em aberto para deploy

O estado vive num `Map` **em memória do processo**. Portanto:

- **perde-se a cada restart** — reiniciar o servidor zera todos os contadores;
- **não é compartilhado entre instâncias** — em deploy serverless cada instância
  tem o próprio mapa, e o limite efetivo vira (nº de instâncias × a cota).

**Isto é aceitável enquanto o deploy for de instância única.**

> ⚠️ **Se o projeto migrar para serverless (Vercel e afins), o limitador precisa
> ir para o Postgres ou para um KV antes da migração.** Caso contrário a
> proteção contra força bruta fica proporcionalmente mais fraca quanto mais a
> aplicação escalar — exatamente ao contrário do desejado.

## Matriz de autorização das rotas de API

Medida em 27/08/2026 pela task `11`, executando cada chamada com cada papel.
Não é leitura de código: são os códigos HTTP que o servidor devolveu.

O teste que produz esta tabela é `e2e/api-authorization.spec.ts`, e ele falha se
uma rota nova aparecer em `src/app/api/` sem entrada aqui.

Legenda: `—` = não chamado de propósito (motivo na última coluna).

### Públicas por design

| Rota | anônimo | pessoa | outra pessoa | empresa | admin |
|---|---|---|---|---|---|
| `GET /api/blog/featured` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/blog/tags` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/blog/posts` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/blog/posts/[id]` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/companies` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/companies/top` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/companies/[id]/projects` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/complaints` | 200 | 200 | 200 | 200 | 200 |
| `GET /api/search` | 200 | 200 | 200 | 200 | 200 |

`GET /api/complaints` sem parâmetro devolve **só** relatos públicos
(`ComplaintsRepo.findPublic`). Com `?mine=1` exige sessão.

### Exigem sessão, sem exigir papel

| Rota | anônimo | pessoa | outra pessoa | empresa | admin | Observação |
|---|---|---|---|---|---|---|
| `GET /api/me` | 401 | 200 | 200 | 200 | 200 | |
| `GET /api/complaints?mine=1` | 401 | 200 | 200 | 200 | 200 | devolve só os relatos de quem chama |
| `POST /api/complaints` | 401 | — | — | — | — | criação coberta em `complaint-create.spec.ts` |
| `POST /api/complaints/[id]/messages` | 401 | — | **403** | — | — | só autora e empresa envolvida escrevem na conversa |
| `POST /api/company/report` | 401 | — | — | — | — | criaria denúncia no banco de demonstração |
| `PATCH /api/user/profile` | 401 | — | — | — | — | destrutivo |
| `DELETE /api/user/account` | 401 | — | — | — | — | destrutivo |
| `POST /api/auth/change-password` | 401 | — | — | — | — | destrutivo: trocaria a senha do seed |

### Área da empresa — exigem vínculo com a empresa

A coluna **empresa** é a conta `MEMBER` e **dona da empresa** é a `OWNER` da
*mesma* empresa. Elas existem separadas no seed desde a task `56`: antes só
havia a `MEMBER`, e por isso toda linha de administração aqui só sabia dizer
"nega", sem nunca provar que alguém consegue.

| Rota | anônimo | pessoa | outra pessoa | empresa (MEMBER) | dona da empresa (OWNER) | admin | Observação |
|---|---|---|---|---|---|---|---|
| `GET /api/company/complaints` | 401 | 401 | 401 | 200 | 200 | 401 | |
| `GET /api/company/complaints/[id]` | 401 | 401 | 401 | 200 | 200 | 401 | 403 se o relato for de outra empresa (task `10`) |
| `POST /api/company/complaints/[id]/messages` | 401 | 401 | 401 | — | — | 401 | resposta coberta em `complaint-response.spec.ts` |
| `PATCH /api/company/complaints/[id]/status` | 401 | 401 | 401 | — | — | 401 | idem |
| `GET /api/company/profile` | 401 | 401 | 401 | 200 | 200 | 401 | |
| `PATCH /api/company/profile` | 401 | 401 | 401 | **403** | **200** | 401 | exige OWNER/ADMIN |
| `DELETE /api/company/profile` | 401 | 401 | 401 | **403** | — | 401 | destrutivo para a OWNER: apagaria a empresa |
| `GET /api/company/projects` | 401 | 401 | 401 | 200 | 200 | 401 | |
| `POST /api/company/projects` | 401 | 401 | 401 | **403** | **201** | 401 | exige OWNER/ADMIN |
| `PATCH /api/company/projects/[id]` | 401 | 401 | 401 | **403** | **200** | 401 | 403 se o projeto for de outra empresa |
| `DELETE /api/company/projects/[id]` | 401 | 401 | 401 | **403** | **200** | 401 | 403 se o projeto for de outra empresa |
| `GET /api/company/users` | 401 | 401 | 401 | 200 | 200 | 401 | |
| `POST /api/company/users` | 401 | 401 | 401 | **403** | — | 401 | destrutivo para a OWNER: convidar cria conta |
| `PATCH /api/company/users/[userId]` | 401 | 401 | 401 | **403** | — | 401 | destrutivo: mudaria o papel da conta MEMBER |
| `DELETE /api/company/users/[userId]` | 401 | 401 | 401 | **403** | — | 401 | destrutivo |

As linhas com `201`/`200` para a OWNER e as duas que dizem "403 se o projeto for
de outra empresa" são medidas em `e2e/ownership.spec.ts`, com projeto criado e
apagado dentro do teste — o seed é o banco da demonstração e não pode acumular
lixo.

**O admin da plataforma não enxerga a área da empresa.** Ele recebe 401 em tudo
aqui, porque `getCurrentCompanyContext` só olha vínculo, não papel de
plataforma. É coerente com o modelo — administrar a plataforma não é administrar
as empresas — mas é decisão que a task `16` precisa registrar como intencional.

### Administração da plataforma

| Rota | anônimo | pessoa | outra pessoa | empresa | admin | Observação |
|---|---|---|---|---|---|---|
| `GET /api/admin/audit` | 401 | 403 | 403 | 403 | 200 | |
| `GET /api/admin/companies` | 401 | 403 | 403 | 403 | 200 | |
| `GET /api/blog/posts?scope=admin` | **403** | 403 | 403 | 403 | 200 | anônimo recebe 403, não 401 |
| `PATCH /api/admin/companies/[id]/verification` | 401 | 403 | 403 | 403 | — | destrutivo |
| `POST /api/companies` | **401** | **401** | **401** | **401** | — | mesma guarda das de cima, código diferente |
| `POST /api/blog/posts` | 401 | 403 | 403 | 403 | — | criaria post no seed |
| `PUT /api/blog/posts/[id]` | 401 | 403 | 403 | 403 | — | destrutivo |
| `DELETE /api/blog/posts/[id]` | 401 | 403 | 403 | 403 | — | destrutivo |

### Fora da matriz executável

| Rota | Por quê |
|---|---|
| `POST /api/auth/login` | pública; caminho feliz e senha errada em `auth.spec.ts` |
| `POST /api/auth/logout` | pública; coberta em `auth.spec.ts` |
| `POST /api/auth/register` | pública; chamar criaria conta a cada execução |
| `POST /api/auth/register-company` | pública; criaria conta e empresa a cada execução |
| `GET\|POST /api/uploadthing` | a autorização vive no middleware do UploadThing (`core.ts`), não no route handler |

### Nenhuma rota aberta

Nenhuma rota devolveu 200 para quem não podia, e nenhuma devolveu 5xx sem
sessão. O 5xx importa porque costuma indicar checagem de autorização que nem
existe — o handler estoura antes de decidir.

### O que a matriz expôs: 401 e 403 misturados

Três padrões convivem no repositório para a mesma pergunta:

| Situação | O que o código faz |
|---|---|
| logada sem vínculo, em `/api/company/*` | **401** |
| logada sem papel de admin, em `/api/admin/*` | **403** |
| logada sem papel de admin, em `POST /api/companies` | **401** |
| anônima, em `GET /api/blog/posts?scope=admin` | **403** |

401 quer dizer "não sei quem é você — autentique-se". 403 quer dizer "sei quem é
você e você não pode". Um cliente que trate 401 mandando para o login vai
mandar a usuária logada de volta para o login, em vez de mostrar "sem
permissão".

A causa é estrutural: `getCurrentCompanyContext` e `getCurrentAdminContext`
devolvem `null` tanto para anônimo quanto para papel errado, e o handler não tem
como distinguir. Corrigir é dar a eles um retorno que diferencie os dois casos.

Registrado na task `17`. O teste aceita 401 ou 403 de propósito, para não travar
a correção.

## Papéis reais

Dois eixos independentes, e confundi-los é a origem de metade das dúvidas.

### Papel na plataforma — `app_role` (`src/db/schema.ts:16`)

```ts
pgEnum("app_role", ["USER", "COMPANY", "ADMIN"])
```

Guardado em `profiles.role`, com padrão `USER`. É um enum do Postgres: valor
inválido é rejeitado pelo banco.

> Atenção ao nome. Vários documentos deste repositório falam em `PERSON`. **Esse
> papel não existe.** O valor real é `USER`.

### Papel dentro de uma empresa — `company_users.role` (`src/db/schema.ts:158`)

```ts
role: text("role").default("MEMBER")
```

Valores usados no código: `OWNER`, `ADMIN`, `MEMBER`. **Não é enum, é texto
livre e anulável** — o banco aceita `"owner"`, `"admin "` ou qualquer outra
coisa, e as checagens comparam com `===`, então qualquer divergência de
maiúsculas vira negação silenciosa. Vale enumerar isso numa migração futura;
está registrado como pendência ao final.

Quem decide o quê:

| Função | Onde | Aceita |
|---|---|---|
| `isPlatformAdmin` | `src/server/auth/admin.ts` | `profiles.role === "ADMIN"` |
| `canManageCompany` | `src/server/auth/company.ts` | `OWNER` ou `ADMIN` |
| `canManageCompanyUsers` | `src/server/auth/company.ts` | `OWNER` ou `ADMIN` |

`getCurrentCompanyContext` usa **o primeiro vínculo** (`memberships[0]`). Quem
pertence a duas empresas opera sempre na primeira, sem escolher. Hoje não
acontece; se acontecer, é bug de dado silencioso.

> **O que uma rota inalcançável esconde.** Até a task `56` nenhuma conta do seed
> era `OWNER`, então `PATCH /api/company/profile` nunca tinha respondido outra
> coisa senão 403. Na primeira vez que uma OWNER a chamou, ela devolveu **500**:
> `UpdateCompanyProfileDto` transformava chave ausente em `null`, e mandar só a
> descrição apagava nome, CNPJ e o resto — com `name` sendo `NOT NULL`, virava
> erro de servidor. Corrigido junto, e travado por teste. A lição fica: *rota que
> conta nenhuma alcança não está protegida, está sem testar*.

## Matriz papel × recurso × operação

Visão de domínio. A visão por rota, com os códigos HTTP medidos, está mais
acima.

Legenda: **✔** pode · **✖** não pode · **dona** só sobre o próprio recurso ·
**—** não se aplica.

| Recurso | Operação | anônima | `USER` | membro da empresa | `ADMIN` |
|---|---|---|---|---|---|
| Relato | criar | ✖ | ✔ | ✔ | ✔ |
| Relato | ler, público | ✖ ¹ | ✔ | ✔ | ✔ |
| Relato | ler, privado | ✖ | dona | ✖ ² | ✖ ² |
| Relato | listar os próprios | ✖ | dona | dona | dona |
| Relato | listar os da empresa | ✖ | ✖ | só a própria empresa | ✖ ³ |
| Relato | mudar status | ✖ | ✖ | só a própria empresa | ✖ ³ |
| Mensagem | escrever | ✖ | dona do relato | só a própria empresa | ✖ ³ |
| Mensagem | ler a conversa | ✖ | dona do relato | só a própria empresa | ✖ ³ |
| Anexo | enviar | ✖ | ✔ | ✔ | ✔ |
| Anexo | ler | ✖ | segue o relato ⁴ | segue o relato ⁴ | segue o relato ⁴ |
| Empresa | criar | ✖ | ✖ | ✖ | ✔ |
| Empresa | editar perfil | ✖ | ✖ | `OWNER`/`ADMIN` da própria | ✖ ³ |
| Empresa | verificar | ✖ | ✖ | ✖ | ✔ |
| Projeto | criar, editar, apagar | ✖ | ✖ | `OWNER`/`ADMIN` da própria | ✖ ³ |
| Usuária da empresa | convidar, alterar, remover | ✖ | ✖ | `OWNER`/`ADMIN` da própria | ✖ ³ |
| Post de blog | ler publicado | ✔ | ✔ | ✔ | ✔ |
| Post de blog | criar, editar, apagar | ✖ | ✖ | ✖ | ✔ |
| Log de auditoria | ler | ✖ | ✖ | ✖ | ✔ |
| Perfil próprio | ler, editar, apagar a conta | ✖ | dona | dona | dona |

¹ A página `/app/complaints/[id]` está sob `/app`, que o middleware protege.
  Relato "público" quer dizer **visível a qualquer pessoa cadastrada**, não
  visível à internet aberta. Quem não tem sessão é mandada para `/login`. A
  lista `GET /api/complaints`, essa sim, é aberta e devolve só os públicos.

² O portão é `if (!isPublic && !isAuthor) notFound()`. Nem a empresa reclamada
  nem o admin abrem um relato privado por essa página.

³ **O admin da plataforma não tem acesso à área das empresas.** Ver a seção
  própria abaixo.

⁴ Ver "Visibilidade de anexos".

## A regra de posse, que é onde mora o risco

Sem RLS, a posse é verificada por um `if` dentro de cada handler. Se o `if`
sumir, o banco entrega o dado sem reclamar. As regras, e onde cada uma vive:

| Recurso | Regra | Arquivo |
|---|---|---|
| Relato, lado da empresa | `complaint.companyId !== context.companyId` → 403 | `api/company/complaints/[id]/route.ts`, `.../status/route.ts`, `.../messages/route.ts` |
| Mensagem, lado da pessoa | `!isAuthor && !isCompanyMember` → 403 | `api/complaints/[id]/messages/route.ts` |
| Relato privado | `!isPublic && !isAuthor` → `notFound()` | `app/app/complaints/[id]/page.tsx` |
| Lista da pessoa | filtro na **query**: `where(eq(complaints.authorId, userId))` | `repos/complaints.ts` `findByUser` |
| Lista pública | filtro na **query**: `where(eq(complaints.isPublic, true))` | `repos/complaints.ts` `findPublic` |
| Lista da empresa | filtro na **query**: `where(eq(complaints.companyId, companyId))` | `repos/complaints.ts` `findByCompany` |

Os três filtros de lista são feitos na consulta, não na apresentação. Isso
importa: filtro na apresentação significa que o dado saiu do banco e chegou ao
processo — e às vezes ao navegador — antes de ser descartado.

Estas regras têm teste próprio em **`e2e/ownership.spec.ts`**. Ele não checa
papel; checa id errado com papel certo, que é o caso que passa despercebido.
Foi verificado por mutação: removendo o `if` de anonimato, o teste falha.

## Anonimato: corrigido na task `16`

`complaints.isAnonymous` é a promessa que o formulário faz — "Seu nome não
aparecerá publicamente". Todas as telas cumpriam: `CompanyComplaintList`,
`company-complaints-content` e `complaint-detail-content` escrevem "Anônima" em
vez do nome.

**Mas o nome real viajava assim mesmo.** `ComplaintsRepo.findById` devolvia
`author: { name }` sem olhar `isAnonymous`, e a página serializa isso no payload
do React. Medido: uma terceira pessoa logada abrindo um relato anônimo público
recebia, no HTML, literalmente:

```
"author":{"name":"Maria Silva"}
```

A tela escrevia "Autor (anônimo)"; o "ver código-fonte" escrevia o nome.

Corrigido em `findById` e `findByCompany`, que agora seguem a mesma regra que
`findPublic` já seguia:

```ts
author: row.complaint.isAnonymous ? null : { name: row.authorName },
```

Nenhuma tela mudou, porque nenhuma tela mostrava o nome. O que mudou é que a
proteção deixou de depender de a tela lembrar.

A decisão embutida: **nem a empresa reclamada recebe o nome.** É o que as telas
dela já diziam, e é a leitura conservadora da promessa. Se a intenção for outra
— a empresa saber com quem fala, e "publicamente" excluir a empresa —, é decisão
de produto, não de código, e o texto do formulário precisa mudar junto.

## Visibilidade de anexos — decisão pendente

O que está medido hoje:

| Fato | Situação |
|---|---|
| O anexo herda a visibilidade do relato | sim, não há visibilidade própria |
| Quem alcança um relato público | qualquer pessoa **cadastrada**; não a internet aberta |
| A autora é avisada antes de enviar | **sim, desde a task `16`** — aviso na etapa 3 do formulário |
| Anexos gravados no banco hoje | **zero** — o caminho nunca foi exercido com dado real |
| O arquivo em si é protegido? | **não verificado** — ver abaixo |

O aviso acrescentado ao formulário diz o que é verdade e verificável: quem puder
ver o relato poderá abrir o anexo, e num relato público isso inclui qualquer
pessoa cadastrada.

**O que falta decidir, e é decisão humana:** anexo herda a visibilidade do
relato, ou tem visibilidade própria? Um documento pessoal anexado como prova não
tem o mesmo regime de uma foto de calçada quebrada.

**O que falta verificar antes de qualquer demonstração pública:** os arquivos vão
para o UploadThing e são referenciados por URL (`file.ufsUrl`). Não há ACL
configurada em `api/uploadthing/core.ts`. Se a URL for pública — o padrão do
serviço —, então o anexo é acessível **sem sessão nenhuma** por quem tiver o
link, e o portão descrito acima protege só a *lista*, não o *arquivo*. Como não
existe nenhum anexo gravado, isto não pôde ser medido: exige um upload real.

## O admin da plataforma não vê a área das empresas

Medido na task `11` e confirmado aqui: a conta `ADMIN` recebe 401/403 em todo
`/api/company/*`. `getCurrentCompanyContext` só olha vínculo em `company_users`,
e o admin não tem nenhum.

**Isto é intencional e fica registrado como tal.** O admin administra a
*plataforma* — verifica empresas, publica no blog, lê a auditoria. Ele não é
supervisor das conversas entre uma mulher e uma empresa. Numa plataforma que
guarda denúncias identificadas, "o admin vê tudo" é um poder que precisa de
justificativa, e não existe requisito que peça isso.

Consequência prática, que precisa estar clara para quem for operar: **não há
como um administrador ler um relato para mediar um conflito.** Se essa
necessidade aparecer, ela vira requisito novo — com registro em auditoria — e
não um `||  isAdmin` acrescentado a um `if`.

## Onde a checagem vive — auditoria das 32 rotas

Toda rota de API foi conferida. Nenhuma depende de a interface esconder o botão.

| Grupo | Rotas | Como protege |
|---|---|---|
| `/api/admin/*` | 3 | `getCurrentAdminContext()` |
| `/api/company/*` | 9 | `getCurrentCompanyContext()`, mais `canManageCompany`/`canManageCompanyUsers` onde escreve, mais posse por `companyId` |
| `/api/complaints*`, `/api/user/*`, `/api/auth/change-password` | 5 | `getSession()` mais posse |
| `/api/blog/posts*` | 2 | `getSession()` mais consulta a `profiles.role === "ADMIN"` inline |
| Públicas por design | 10 | ver a tabela mais acima |
| `/api/uploadthing` | 1 | `.middleware()` do próprio UploadThing, com sessão e papel |
| `/api/me` | 1 | `getSession()`; devolve 401 sem sessão |
| `/api/search`, `/api/companies/top`, `/api/companies/[id]/projects` | 3 | públicas; só dado já público |

As quatro Server Actions do repositório (`"use server"`) também foram
conferidas:

| Ação | Checagem |
|---|---|
| `createComplaint` | `getSession()`, e o `authorId` vem da sessão — não do corpo |
| `completeCompanyOnboarding` | `getSession()`, escreve só sob `session.userId` |
| `updateProfilePerson` | `getSession()`, escreve só sob `session.userId` |
| `syncProfileFromOAuth` | **nenhuma** — mas o corpo é `return { success: true }`, sem acesso a dado. É código morto sem chamador; ver pendências |

Nenhuma delas aceita id de recurso vindo do cliente para decidir a quem
pertence a escrita, que é o erro clássico de Server Action.

### Duplicação que sobrou

A checagem de admin aparece de duas formas: `getCurrentAdminContext()` nos
`/api/admin/*` e `/api/companies`, e uma consulta inline a `profiles.role` nos
dois handlers de blog. São quatro trechos equivalentes copiados. Não foram
unificados aqui de propósito: a task avisa que centralizar guardas é refatoração
ampla, e a suíte de autorização é a rede que a torna segura de fazer. Fica como
pendência, não como risco — os quatro trechos estão corretos e cobertos por
teste.

## Pendências

- [ ] Verificar, com um upload real, se o arquivo no UploadThing é acessível sem
      sessão. **Antes de qualquer demonstração pública.**
- [ ] Decidir se anexo herda a visibilidade do relato ou tem a própria — decisão
      de produto (task `16`, aguardando).
- [ ] Enumerar `company_users.role` numa migração, em vez de `text` anulável.
- [ ] Unificar 401 e 403 (task `17`).
- [ ] Unificar as quatro checagens de admin num helper só.
- [ ] Remover `syncProfileFromOAuth`, que é Server Action exportada sem chamador.
- [ ] Decidir o que fazer quando alguém pertencer a duas empresas —
      `getCurrentCompanyContext` hoje usa a primeira, em silêncio.
