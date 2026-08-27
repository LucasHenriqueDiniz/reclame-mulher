# Modelo de autorização

> **Documento em construção.** Este arquivo nasceu na task `51` para registrar a
> decisão sobre persistência do limitador de tentativas. As tasks `11` e `16`
> vão completá-lo com a matriz de papéis × recursos × operações.

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

## A completar

- [ ] Matriz papel × recurso × operação (task `16`)
- [ ] Matriz de teste por rota de API (task `11`)
- [ ] Visibilidade de anexos em reclamação pública (task `16`)
