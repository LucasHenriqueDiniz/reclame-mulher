# Modelo de autorização

> **Documento em construção.** Este arquivo nasceu na task `51` para registrar a
> decisão sobre persistência do limitador de tentativas. A task `11` acrescentou
> a matriz medida de rotas de API. Falta a task `16` decidir as questões de
> modelo que a matriz deixou expostas.

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

| Rota | anônimo | pessoa | outra pessoa | empresa | admin | Observação |
|---|---|---|---|---|---|---|
| `GET /api/company/complaints` | 401 | 401 | 401 | 200 | 401 | |
| `GET /api/company/complaints/[id]` | 401 | 401 | 401 | 200 | 401 | 403 se o relato for de outra empresa (task `10`) |
| `POST /api/company/complaints/[id]/messages` | 401 | 401 | 401 | — | 401 | resposta coberta em `complaint-response.spec.ts` |
| `PATCH /api/company/complaints/[id]/status` | 401 | 401 | 401 | — | 401 | idem |
| `GET /api/company/profile` | 401 | 401 | 401 | 200 | 401 | |
| `PATCH /api/company/profile` | 401 | 401 | 401 | **403** | 401 | exige OWNER/ADMIN — ver achado `56` |
| `DELETE /api/company/profile` | 401 | 401 | 401 | — | 401 | destrutivo |
| `GET /api/company/projects` | 401 | 401 | 401 | 200 | 401 | |
| `POST /api/company/projects` | 401 | 401 | 401 | **403** | 401 | exige OWNER/ADMIN |
| `PATCH /api/company/projects/[id]` | 401 | 401 | 401 | **403** | 401 | exige OWNER/ADMIN |
| `DELETE /api/company/projects/[id]` | 401 | 401 | 401 | — | 401 | destrutivo |
| `GET /api/company/users` | 401 | 401 | 401 | 200 | 401 | |
| `POST /api/company/users` | 401 | 401 | 401 | **403** | 401 | exige OWNER/ADMIN |
| `PATCH /api/company/users/[userId]` | 401 | 401 | 401 | **403** | 401 | exige OWNER/ADMIN |
| `DELETE /api/company/users/[userId]` | 401 | 401 | 401 | — | 401 | destrutivo |

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

## A completar

- [ ] Matriz papel × recurso × operação, na visão de **domínio** e não de rota
      (task `16`)
- [ ] Visibilidade de anexos em reclamação pública (task `16`)
- [ ] Registrar como intencional (ou corrigir) o admin da plataforma não ter
      acesso à área das empresas (task `16`)
- [ ] Unificar 401 e 403 (task `17`)
