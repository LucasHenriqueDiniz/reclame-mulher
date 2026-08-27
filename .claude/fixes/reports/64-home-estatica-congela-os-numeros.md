# Relatório — [64] Os números da home congelam no build

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## O defeito, reproduzido

Build de produção limpo, servidor de pé, e um script que lê os dois lados: os
números que o servidor entrega (da carga do React no HTML) e os que o banco diz
naquele instante — `.claude/fixes/reports/64-perf/medir.mts`.

```
== antes de mexer ==
banco:     mulheres   2   taxa  33%   empresas   1
servido:   mulheres   2   taxa  33%   empresas   1
  => batem
```

Criei um relato aberto, o que faz a taxa de resolução cair:

```
== logo depois ==
banco:     mulheres   2   taxa  25%   empresas   2
servido:   mulheres   2   taxa  33%   empresas   1
  => DIVERGEM
```

E acompanhei por dois minutos e meio, a cada 15 segundos:

```
   0s  banco taxa 25%  servido taxa 33%  divergem
  ...
 139s  banco taxa 25%  servido taxa 33%  divergem

>>> o tempo acabou e os dois lados nunca bateram
```

Nunca bateriam: a rota saía `○` do `next build`, então a consulta de
`getPlatformStats` rodou uma vez, durante a compilação, e o resultado ficou
gravado no HTML. Sem novo build, o número não muda por mais relatos que cheguem.

## A escolha: revalidação por tempo, 300 s

A task oferecia três caminhos. Escolhi o primeiro, que é o que ela recomenda, e
os motivos ficaram escritos no próprio `src/app/page.tsx`:

**Por que não `force-dynamic`.** A home é a página mais visitada e a latência
até o Neon medida na task `19` é de 139 ms. Pagar isso em toda visita para
adiantar um número que ninguém confere ao segundo é caro no lugar errado.

**Por que não `revalidatePath("/")` nas rotas que mexem em relato.** Seria mais
preciso para relato criado pela aplicação — e cego justamente no caso que a task
levanta: `db:seed:demo` escreve **direto no banco**, sem passar por rota
nenhuma. O cenário da defesa é exatamente esse, e só a revalidação por tempo o
cobre.

Cinco minutos é o intervalo, e mudar é uma linha. Se na hora de demonstrar
parecer demais, `revalidate = 60` custa quatro consultas a mais por cinco
minutos — nada perto de uma por visita.

## O depois

Mesmo script, mesmo método, com a correção no lugar:

```
== estado inicial ==
banco:     mulheres 2   taxa 33%   empresas 1
servido:   mulheres 2   taxa 33%   empresas 1
  => batem

(cria o relato: o banco cai para 25%)

   0s  banco taxa 25%  servido taxa 33%  divergem
  ...
 293s  banco taxa 25%  servido taxa 33%  divergem
 309s  banco taxa 25%  servido taxa 25%  <- bateram

>>> alcançaram o mesmo valor depois de 309s
```

**309 segundos**, e os nove a mais são o comportamento certo do Next, não erro
de medição: passados os 300 s, a primeira requisição ainda recebe a página
velha e dispara a reconstrução em segundo plano; quem chega depois recebe a
nova. A leitura seguinte, 15 s à frente, pegou o valor novo.

O `next build` também passou a dizer isso na cara:

```
Route (app)                    Size  First Load JS  Revalidate  Expire
┌ ○ /                       12.7 kB         269 kB          5m      1y
```

O relato de medição foi apagado ao fim de cada rodada — a marca é `[e2e]`, a
mesma da suíte, então `limparRelatosDeTeste()` também o alcança se algo morrer
no meio.

## As outras rotas estáticas

Critério 3. Conferi as **onze** páginas de servidor que consultam o banco e as
doze rotas que saem `○` do build. O cruzamento é simples: só a home aparecia nos
dois lados.

| Rota estática (`○`) | Lê do banco? |
|---|---|
| `/` | **sim** — era o defeito |
| `/ajuda`, `/login`, `/register`, `/search`, `/privacy`, `/terms`, `/auth/callback`, `/onboarding/*` (5) | não — componentes de cliente ou texto fixo |

As outras dez páginas de servidor que leem do banco (`/app/**`, `/companies`,
`/company/[slug]`) já saem `ƒ`, por lerem a sessão. Nenhuma precisa declarar
nada.

### A trava

`src/lib/__tests__/rotas-que-leem-o-banco.test.ts` faz duas coisas:

1. **Mantém a lista das onze.** Se alguém criar uma página de servidor nova que
   lê do banco, o teste falha e manda conferir a coluna `Revalidate` do build
   antes de somar o caminho à lista. Não é o Next decidindo — é o conjunto
   parando de crescer em silêncio.
2. **Exige que a home declare** `revalidate` ou `dynamic`.

**Verificado por mutação:** comentei o `export const revalidate = 300` e o
segundo teste falhou. Restaurado em seguida.

Vale ser explícito sobre o limite disto: **nenhum teste de arquivo sabe se uma
rota vai sair estática** — quem decide é o Next, no build, olhando o que a
página usa. O que dá para travar é o conjunto, e a conferência de verdade é a
coluna `Revalidate`. Está escrito em `docs/arquitetura.md`, numa seção nova
sobre renderização das páginas públicas.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo; `/` agora com `Revalidate 5m` |
| medição antes/depois | ✅ nunca convergia; agora converge em 309 s |
| `npx vitest run` | ✅ **31 de 31** (eram 29) |
| trava por mutação | ✅ falha sem a declaração, passa com ela |
| suíte inteira | ✅ **467 passando, 3 pulados** — sem mudança (ver abaixo) |

### A suíte falhou uma vez, e desta vez com evidência

A primeira execução deu 466 passando e uma falha:

```
[chromium-desktop] › e2e/auth.spec.ts:115:7 › empresa não entra na administração
Error: apiRequestContext.post: read ECONNRESET
  → POST http://localhost:5000/api/auth/login
  at entrarViaApi (e2e/fixtures/auth.ts:41)
```

Não é asserção: é a conexão sendo derrubada no login do preparo da sessão. A
execução seguinte, sem tocar em nada, voltou aos 467.

Não tem relação com esta task — `revalidate` na home não passa perto de
`/api/auth/login`. Mas **é a evidência que a task `68` pedia**: ela registrava a
suspeita de que o problema estava no preparo da sessão e não tinha como provar,
porque o reporter antigo não guardava o motivo. O reporter mudou na task `62`, e
foi ele que capturou isto. A `68` foi atualizada com o erro completo e com a
pergunta que sobra: por que o servidor derruba uma conexão de login sob a carga
da suíte.

## Critérios de aceite

- [x] **Criar um relato muda os números da home dentro do intervalo escolhido,
      sem novo build. Medir antes e depois** — antes: 150 s sem nunca bater;
      depois: 309 s até bater, com o build sendo o mesmo.
- [x] **A decisão entre revalidação e dinâmica está escrita, com o motivo** —
      no `src/app/page.tsx`, onde quem for mexer vai olhar, e em
      `docs/arquitetura.md`.
- [x] **Nenhuma outra rota estática lê do banco sem revalidação** — auditadas as
      doze rotas `○` e as onze páginas que leem do banco; só a home estava nas
      duas listas, e agora declara.

## Pendências e achados fora de escopo

Nenhum achado novo. Duas notas:

O roteiro de demonstração pede para reconstruir depois de `db:seed:demo` — isso
deixa de ser obrigatório, mas continua sendo o caminho mais rápido, porque o
build já nasce com os números certos em vez de esperar até cinco minutos. Não
mexi no roteiro: a instrução continua correta, só deixou de ser armadilha.

A observação da task sobre a **animação de contagem levar cerca de sete
segundos** para parar no valor final continua valendo, e continua registrada no
ensaio — não é defeito, é o que quem demonstra precisa saber para não passar a
página cedo demais.
