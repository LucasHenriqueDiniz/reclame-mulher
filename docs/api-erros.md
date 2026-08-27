# Contrato de erro da API

> Escrito na task `17`, a partir do que o repositório realmente fazia. Cada
> afirmação aqui tem teste em `e2e/api-erros.spec.ts` — se o documento e o
> código divergirem, a suíte quebra.

## O formato

Toda resposta de erro da API, sem exceção, tem esta forma:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Alguns dados não foram aceitos. Confira os campos e tente de novo.",
    "fields": { "title": "Escreva pelo menos 5 caracteres." }
  }
}
```

Três campos, três audiências diferentes — e era justamente a mistura delas que
não existia antes:

| Campo | Para quem | Regra |
|---|---|---|
| `code` | para **código** | estável, em inglês, seguro de comparar num `if`. Nunca muda por causa de texto |
| `message` | para **gente** | em português, pronta para a tela. É o que a usuária lê |
| `fields` | para **formulário** | opcional; só em `VALIDATION_ERROR`. Chave é o campo, valor é o que houve com ele |

`fields` é omitido quando não há nada por campo a dizer. `message` **nunca** é
omitido.

### Por que o `message` importa tanto

Todo `data.error` do front vai direto para a tela — foi assim que este projeto
sempre funcionou. Antes desta task, a API respondia `"Unauthorized"`,
`"Forbidden"`, `"Failed to fetch blog posts"`. **Uma plataforma em português,
para mulheres brasileiras, mostrava "Unauthorized" quando a sessão expirava.**

Por isso a `message` é obrigatória, é em português e é escrita para quem está do
outro lado da tela, não para quem programa.

## A tabela de códigos

| `code` | HTTP | Quando | Mensagem padrão |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | o corpo ou os parâmetros não passaram no Zod, ou a regra de negócio recusou | "Alguns dados não foram aceitos. Confira os campos e tente de novo." |
| `UNAUTHENTICATED` | 401 | **não há sessão** | "Você precisa entrar na sua conta para continuar." |
| `FORBIDDEN` | 403 | há sessão, e ela não dá esse direito | "Você não tem permissão para fazer isso." |
| `NOT_FOUND` | 404 | o recurso não existe, ou o id não é um UUID | "Não encontramos o que você procura." |
| `CONFLICT` | 409 | o dado já existe (e-mail, CNPJ, CPF, vínculo) | "Esses dados já estão em uso." |
| `RATE_LIMITED` | 429 | tentativas demais | "Muitas tentativas. Espere um pouco e tente de novo." |
| `INTERNAL_ERROR` | 500 | qualquer coisa não prevista | "Algo deu errado do nosso lado. Tente de novo em instantes." |

A mensagem padrão é usada quando o handler não tem nada mais específico a
dizer. Quando tem, ele passa a sua — e ela substitui a padrão, nunca o `code`.

### 401 e 403 dizem coisas diferentes

Esta é a correção central da task `17`, e vinha medida da task `11`.

- **401** = "não sei quem é você. Autentique-se."
- **403** = "sei quem é você, e você não pode."

Antes, boa parte das rotas respondia 401 nos dois casos, porque
`getCurrentCompanyContext` e `getCurrentAdminContext` devolviam `null` tanto
para "sem sessão" quanto para "papel errado" — o handler não tinha como
distinguir. Um cliente que trate 401 mandando para o login mandava a usuária
**logada** de volta para o login, numa tela que ela já tinha passado.

Agora existem `exigirEmpresa()`, `exigirEmpresaComGestao()`,
`exigirEmpresaComGestaoDeEquipe()` e `exigirAdmin()`, que devolvem **ou** o
contexto **ou** a resposta já pronta com o código certo:

```ts
const contexto = await exigirEmpresa();
if (contexto instanceof NextResponse) return contexto;
```

`e2e/api-authorization.spec.ts` deixou de aceitar "401 ou 403" e passou a exigir
o valor exato: 401 para anônima, 403 para logada sem direito.

### 403 e não 404 quando o recurso é de outra pessoa

A prática de responder 404 para "existe mas não é seu" serve para evitar
enumeração — impedir que alguém descubra quais ids existem testando um por um.

**Aqui não se usa isso, de propósito.** Os ids são UUID v4: não há espaço a
enumerar. E 403 é a resposta honesta, mais fácil de depurar, já documentada em
[`autorizacao.md`](autorizacao.md) e travada por `e2e/ownership.spec.ts`.

404 fica para o que de fato não existe — incluindo id que não é UUID.

### Id malformado é 404, não 500

Todas as chaves primárias do schema são `uuid`. Um id inventado na barra de
endereço chegava até o Postgres, que rejeitava por tipo, e o handler devolvia
**500** com a query inteira no log. Um id errado não é falha do servidor.

Hoje todo handler com `[id]` começa por:

```ts
if (!ehUuid(id)) return naoEncontrado();
```

## O 500 nunca conta o que deu errado

`erroInterno(causa, contexto)` escreve o detalhe no log do servidor e devolve
**só** a mensagem genérica:

```ts
export function erroInterno(causa: unknown, contexto: string) {
  console.error(`[${contexto}]`, causa);
  return erro("INTERNAL_ERROR");
}
```

Stack trace, nome de tabela, caminho de arquivo e string de conexão entregam a
estrutura interna para quem estiver sondando, e não ajudam em nada quem está do
outro lado da tela. A spec verifica isso literalmente: nenhuma resposta de erro
pode conter `at Object.`, `.ts:`, `node_modules`, `drizzle`, `neon` ou
`DATABASE_URL`.

Pelo mesmo motivo, o `issues` cru do Zod não vai na resposta. Ele descreve a
forma do schema. O que vai é o `fields`, derivado dele — o que interessa ao
formulário, sem o que interessa a quem quer mapear a API.

## Quem responde

Duas camadas produzem erro, e **as duas usam o mesmo envelope**:

| Camada | Arquivo | O que decide |
|---|---|---|
| Middleware | `src/middleware.ts` | "tem sessão ou não tem", antes de o handler existir |
| Route handler | `src/app/api/**/route.ts` | papel, posse, validação |

O contrato mora em `src/lib/http/contrato.ts`, que **não tem dependência
nenhuma** — nem `server-only`, nem `next/server`. É o que permite ao middleware,
que roda no runtime Edge, escrever o mesmo envelope que os handlers. Antes desta
task ele devolvia `{ error: "Unauthorized" }`, e a forma da resposta mudava
conforme **quem** tinha barrado a chamada.

| Arquivo | Papel |
|---|---|
| `src/lib/http/contrato.ts` | os códigos, os status, as mensagens padrão. Sem dependências |
| `src/server/http/respond.ts` | os atalhos do servidor: `naoAutenticada()`, `semPermissao()`, `naoEncontrado()`, `conflito()`, `invalido()`, `erroInterno()` |
| `src/lib/http/erro.ts` | o lado do cliente: `mensagemDeErro()`, `camposComErro()`, `precisaEntrar()` |

## No cliente

Nenhuma tela lê `data.error` na mão. O único lugar que conhece o formato é
`src/lib/http/erro.ts`:

```ts
const data = await resposta.json().catch(() => null);
setErro(mensagemDeErro(data, "Não foi possível salvar o perfil."));
```

O segundo argumento é o texto para quando a resposta **não** veio no formato —
rede caiu, proxy devolveu HTML, a rota morreu antes de responder. Escreva-o
específico da ação: "Não foi possível salvar o perfil." diz mais do que "Erro".

Para marcar campos num formulário, `camposComErro(data)` devolve o mapa
`campo → mensagem`.

## Exceções conhecidas

| Rota | Por quê |
|---|---|
| `GET\|POST /api/uploadthing` | quem responde é o SDK do UploadThing, não código nosso. A autorização acontece no `.middleware()` de `core.ts`, e o formato do erro é o do serviço |
| `429` de limite de tentativas | segue o envelope, **e** acrescenta `retryAfterSeconds` fora dele, ao lado do cabeçalho `Retry-After`. Não é explicação do erro; é dado para o cliente agendar a próxima tentativa |
| Páginas (não-API) | sem sessão, o middleware **redireciona** para `/login`. Envelope é só para `/api/**`; devolver JSON para uma navegação não ajudaria ninguém |

## Ao escrever uma rota nova

1. Use os atalhos de `respond.ts`. Não monte `NextResponse.json({ error: ... })`
   na mão.
2. Comece por `if (!ehUuid(id)) return naoEncontrado();` se a rota tem `[id]`.
3. Valide o corpo com Zod **antes** de tocar no banco, e devolva `invalido(erro)`
   no `catch` — ele já converte os `issues` em `fields`.
4. No `catch` final, `erroInterno(error, "caminho/da/rota")`. Nunca
   `error.message` na resposta.
5. Acrescente a rota a `e2e/api-authorization.spec.ts` — o teste de cobertura lê
   o sistema de arquivos e quebra se você esquecer.
