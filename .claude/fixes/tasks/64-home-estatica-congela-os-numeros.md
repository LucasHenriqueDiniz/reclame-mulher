# [64] Os números da home congelam no build

| Campo | Valor |
|---|---|
| **ID** | `64` |
| **Fase** | `7 — Build e produção` |
| **Risco** | médio |
| **Depende de** | — |
| **Achado em** | task `23` (ensaio da demonstração) |
| **Estimativa** | pequena |

## O que foi encontrado

A rota `/` sai **estática** do `next build`:

```
Route (app)                    Size  First Load JS
┌ ○ /                       12.7 kB         269 kB
```

O `○` quer dizer pré-renderizada em tempo de build. Mas `src/app/page.tsx` é um
componente de servidor que consulta o banco:

```tsx
export default async function HomePage() {
  const stats = await ComplaintsRepo.getPlatformStats();
```

Como não há `dynamic`, `revalidate` nem nenhuma API dinâmica na rota, o Next
executa essa consulta **uma vez, durante o build**, e serve o resultado
congelado a partir dali.

Medido no ensaio da task `23`, com o servidor de produção de pé:

| | mulheres | taxa | empresas |
|---|---|---|---|
| gravado no HTML servido | 11 | **54%** | 4 |
| no banco, no mesmo instante | 11 | **52%** | 4 |

A diferença é de um relato resolvido criado depois do build. Em produção o
efeito é maior: **nenhum relato novo muda os números da home até alguém
reconstruir e publicar de novo.**

## Por que importa

A seção se chama "Nosso impacto em números". É a primeira prova social que a
visitante vê, e o argumento da plataforma é que ela mostra a realidade em vez de
inventá-la — foi por isso que a task `03` tirou dali os números fixos no código.

Um número que veio do banco mas parou no dia do build é uma terceira coisa, pior
que as duas: parece dado vivo e não é.

Isso também afeta a demonstração da defesa. O `pnpm db:seed:demo` popula o
cenário, e a home continua mostrando o que havia antes — a menos que se
reconstrua depois de semear. O roteiro já registra essa ordem, mas ela é
armadilha, não solução.

## O que fazer

Escolher entre três, e a escolha muda o custo por visita:

1. **Revalidação por tempo** — `export const revalidate = 300;` na home. A
   página continua estática e se refaz a cada cinco minutos. É o melhor
   equilíbrio para este caso: o número não precisa ser do último segundo.
2. **Dinâmica** — `export const dynamic = "force-dynamic";`. Sempre certa,
   sempre uma consulta ao banco por visita. Considerando os 139 ms de latência
   até o Neon medidos na task `19`, é caro para a página mais acessada.
3. **Sob demanda** — `revalidatePath("/")` quando um relato muda de situação.
   Mais preciso e mais código.

Vale conferir se outras rotas estáticas dependem do banco do mesmo jeito. O
`next build` lista todas com `○`.

## Critérios de aceite

- [ ] Criar um relato e resolvê-lo muda os números da home dentro do intervalo
      escolhido, sem novo build. Medir antes e depois.
- [ ] A decisão entre revalidação e dinâmica está escrita, com o motivo.
- [ ] Nenhuma outra rota estática lê do banco sem revalidação — ou, se ler,
      está registrado que é de propósito.

## Nota sobre a medição

O ensaio da task `23` (`scripts/ensaio-da-demonstracao.ts`, passo 1) lê os três
números direto da carga servida e espera a tela chegar neles. Quando esta task
for feita, esse passo passa a ser a verificação natural: com revalidação, o
valor servido acompanha o banco.

Um detalhe que apareceu no mesmo ensaio e não é defeito: a contagem é **animada
com mola bem amortecida e leva cerca de sete segundos** até parar no valor
final. Quem demonstra precisa saber disso para não passar a página antes.
