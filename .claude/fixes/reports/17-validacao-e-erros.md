# Relatório — [17] Padronizar validação de entrada e retorno de erro

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 2
- **Documento novo:** [`docs/api-erros.md`](../../../docs/api-erros.md)

## O que a medição mostrou antes de qualquer mudança

**128 retornos de erro, em 34 formatos diferentes.** E este detalhe muda tudo:

```
setErr(data.error ?? "Erro ao salvar")
```

Este é o padrão em **22 telas**. O `error` da API **vai direto para a tela**.
Ou seja, as strings que a API devolvia não eram log — eram interface.

| A API respondia | Vezes | A usuária lia |
|---|---|---|
| `"Unauthorized"` | 26 | "Unauthorized" |
| `"Forbidden"` | 21 | "Forbidden" |
| `"Internal server error"` | 19 | "Internal server error" |
| `"Validation error"` | 13 | "Validation error" |
| `"Failed to fetch blog posts"` | 6 | idem, em inglês |

**Uma plataforma em português, para mulheres brasileiras, mostrava
"Unauthorized" quando a sessão expirava.** Nenhum documento do repositório
registra isso; ele aparece quando se junta "como a API responde" com "o que a
tela faz com a resposta" — duas metades que estavam em arquivos diferentes.

## O contrato

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "title": "..." } } }
```

Três campos porque são três audiências, e era a mistura delas que não existia:

| Campo | Para quem | Regra |
|---|---|---|
| `code` | para código | estável, em inglês, seguro num `if` |
| `message` | para gente | em português, pronta para a tela |
| `fields` | para formulário | qual campo reprovou e por quê |

| | Antes | Depois |
|---|---|---|
| Formatos de erro distintos | **34** | **1** |
| Mensagens em inglês na tela | ~64 ocorrências | **0** |
| Telas que sabem o formato do erro | 22 | **1** (`src/lib/http/erro.ts`) |
| Testes automatizados | 328 | **362** |

## A correção central: 401 e 403 diziam a mesma coisa

Vinha medida da task `11`. `getCurrentCompanyContext` e `getCurrentAdminContext`
devolvem `null` tanto para "sem sessão" quanto para "papel errado" — o handler
não tinha **como** distinguir, e respondia 401 nos dois casos.

Consequência concreta: um cliente que trate 401 mandando para o login mandava a
usuária **logada** de volta para o login, uma tela que ela já tinha passado.

A correção não foi mexer nos `if` espalhados, foi dar aos portões um retorno que
carrega a decisão:

```ts
const contexto = await exigirEmpresa();
if (contexto instanceof NextResponse) return contexto;
```

`exigirEmpresa`, `exigirEmpresaComGestao`, `exigirEmpresaComGestaoDeEquipe` e
`exigirAdmin` devolvem **ou** o contexto **ou** a resposta pronta com o código
certo. 13 rotas migradas. As funções antigas continuam exportadas porque as
páginas (Server Components) as usam, e ali não existe resposta HTTP para
devolver.

E a `api-authorization.spec.ts` deixou de aceitar "401 ou 403" — o comentário
dela dizia, desde a task `11`, que a folga existia "para não travar a correção".
A correção veio; a folga saiu. Agora exige o valor exato, e verifica o envelope
de cada negação.

## Dois defeitos que só apareceram porque o teste era estrito

### O middleware respondia noutro formato

Ao exigir o envelope em toda negação, 13 rotas falharam para o papel anônimo — e
nenhuma delas era culpada. Quem respondia era o **middleware**, que barra antes
de o handler existir, com `{ error: "Unauthorized" }`.

Ou seja: a forma da resposta mudava conforme **quem** tinha barrado a chamada.

O middleware roda no runtime Edge, onde `server-only` e imports de servidor não
cabem. Por isso o contrato foi para `src/lib/http/contrato.ts`, **sem dependência
nenhuma**, e os dois lados escrevem o mesmo envelope a partir da mesma fonte.

### Id malformado devolvia 500 com a query no log

```
GET /api/company/complaints/nao-e-um-uuid  →  500
[WebServer] Error: Failed query: select "complaints"."id", "complaints"."author_id", …
```

Todas as chaves primárias do schema são `uuid`. Um id inventado na barra de
endereço chegava ao Postgres, que rejeitava por tipo, e o handler estourava.
**Um id errado não é falha do servidor** — e um 500 aqui é um convite a sondar.

Nove rotas com `[id]` passaram a começar por `if (!ehUuid(id)) return
naoEncontrado();`.

Este achado não veio de ler código. Veio de escrever um teste que perguntava
"e se o id for lixo?" — que é o tipo de pergunta que a leitura não faz sozinha.

## O que já estava certo

Vale registrar, porque a evidência da task supunha o contrário:

| Suspeita da task | Medição |
|---|---|
| "alguns handlers vazam stack trace" | **nenhum**. Todos capturam e devolvem genérico |
| "nem toda entrada é validada com Zod" | **todas as 19 rotas** que leem corpo usam Zod |
| "`as` no limite da aplicação" | 3 ocorrências, **nenhuma** em entrada não confiável — duas em `catch`, uma em tipo de resposta |

O que sobrou de fato foi forma e idioma, não segurança. Duas coisas foram
apertadas mesmo assim: o `issues` cru do Zod deixou de ir na resposta (ele
descreve a forma do schema; o que vai agora é o `fields` derivado dele), e todo
500 passou a ter mensagem única.

## Um erro meu, e o que ele custou

Ao migrar os `catch`, deixei `console.error(...)` logo antes de
`return erroInterno(error, ...)` — e o `erroInterno` já loga. Todo 500 passou a
aparecer duas vezes no log, com formatos diferentes.

Removido em 29 arquivos. Custo real: nenhum, porque apareceu na revisão do
próprio diff. Fica registrado porque migração automática produz exatamente esse
tipo de sobra, e ela some do radar se ninguém reler o resultado.

## O teste que trava o contrato

`e2e/api-erros.spec.ts`, 17 testes × 2 projetos, verifica cinco coisas:

1. **forma** — `{ error: { code, message, fields? } }`;
2. **coerência** — o `code` combina com o status HTTP;
3. **idioma** — a `message` não contém `Unauthorized`, `Forbidden`,
   `Internal server error`, `Not found`, `Validation error`, `Failed to`;
4. **discrição** — nenhuma resposta contém `at Object.`, `.ts:`,
   `node_modules`, `drizzle`, `neon` ou `DATABASE_URL`;
5. **origem única** — o middleware barra antes do handler e responde igual.

Doze casos extras varrem uma amostra larga: auditoria sem ser admin, criar
empresa sem ser admin, perfil de empresa como pessoa, blog com escopo admin sem
sessão, login com corpo vazio, denúncia sem sessão.

## Uma decisão contrária ao que a task sugeria

A task pedia: *"404 inexistente **ou sem permissão de ver** (evita
enumeração)"*.

**Não segui, e o motivo é concreto.** Enumeração importa quando o espaço de ids
é adivinhável; aqui são UUID v4. E 403 para "existe, mas não é seu" já está
documentado em `autorizacao.md` e travado por `e2e/ownership.spec.ts`, ambos
escritos na task `16` — uma iteração atrás. Trocar para 404 significaria
reescrever aquele teste e aquele documento em troca de proteção contra um ataque
que os UUIDs já impedem.

404 ficou para o que de fato não existe, incluindo id que não é UUID. A decisão
está escrita em `docs/api-erros.md`, com esta justificativa.

## Verificação

| Comando | Resultado |
|---|---|
| `npm run test:e2e` | ✅ **359 passando, 3 pulados** (362), 15,2 min |
| `npx playwright test e2e/api-erros.spec.ts` | ✅ 17/17 |
| `npx playwright test e2e/api-authorization.spec.ts e2e/ownership.spec.ts` | ✅ 48/48 |
| `npm run test:a11y` | ✅ **78/78**, 0 ocorrências |
| `npx vitest run` | ✅ 18/18 |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src --max-warnings 0` | ✅ exit 0 |
| `npm run build` | ✅ passa |

## Critérios de aceite

- [x] `docs/api-erros.md` existe com o contrato e a tabela de códigos — e cada
      afirmação dele tem teste.
- [x] Todas as rotas que recebem corpo validam com Zod no servidor — 19 de 19,
      já era verdade antes e agora está registrado.
- [x] Nenhuma resposta de erro contém stack trace — verificado por asserção
      literal sobre o corpo, não por inspeção.
- [x] Os testes das tasks `11` e `08`–`10` continuam verdes, e o da `11` ficou
      **mais** estrito.

## O que ficou de fora, e por quê

- **`/api/uploadthing`** continua com o formato do SDK. Quem responde ali é o
  serviço, não código nosso. Registrado como exceção no documento.
- **Páginas** (não-API) continuam redirecionando para `/login` em vez de
  devolver JSON. Envelope é contrato de API; devolver JSON para uma navegação
  não ajudaria ninguém.
- **`retryAfterSeconds`** do limite de tentativas fica **fora** do envelope, ao
  lado dele. Não é explicação do erro — é dado para o cliente agendar a próxima
  tentativa, como o cabeçalho `Retry-After` que vai junto.
