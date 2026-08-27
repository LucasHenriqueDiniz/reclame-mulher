# Acessibilidade

> Consolida o que as tasks `12` a `15` mediram e corrigiram, em agosto de 2026.
> Substitui o `RELATORIO_CORRECOES_ACESSIBILIDADE.md` e as afirmações do
> `TODO.md` de julho, que se contradiziam entre si.
>
> Este documento é sobre **conformidade WCAG**. Para as diretrizes de linguagem
> e desenho voltadas a baixa alfabetização e pouca familiaridade digital, veja
> [`acessibilidade-inclusiva.md`](acessibilidade-inclusiva.md) — outro assunto,
> igualmente obrigatório.

## Onde estamos

| | Antes (agosto/2026) | Agora |
|---|---|---|
| Ocorrências WCAG 2.1 A/AA | **523** | **0** |
| Combinações página × viewport sem violação | 16 de 78 | **78 de 78** |
| Violações `critical` | 50 | 0 |
| Violações `serious` | 473 | 0 |
| Páginas com scroll horizontal em 375px | 8 de 33 | **0** |
| Testes de acessibilidade | 0 | **78** |

Medido com `@axe-core/playwright`, tags `wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, em 39 páginas × 2 viewports (1280×800 e 375×812).

## O que a documentação de julho dizia

Três documentos, três respostas diferentes, todas otimistas:

| Documento | Afirmação | O que a varredura mediu |
|---|---|---|
| `RELATORIO_CORRECOES_ACESSIBILIDADE.md` | 14 problemas corrigidos | a auditoria cobria 6 páginas; a varredura cobriu 39 |
| `STATUS_FINAL_PRODUCAO.md` | acessibilidade em 87,5% | 62 das 78 combinações tinham violação |
| `TODO.md` | "VALIDADA", contraste em "WCAG AAA" | contraste era **88% de todas as violações** |

O `TODO.md` errava justamente no ponto pior. Os três estão em
[`historico/`](historico/), sem edição, como registro.

## As sete regras violadas, e como caíram

| Regra | Impacto | Ocorrências | Causa |
|---|---|---|---|
| `color-contrast` | sério | 461 | 33 pares de cor da paleta |
| `button-name` | crítico | 44 | botão só com ícone, sem nome acessível |
| `link-in-text-block` | sério | 6 | link identificável apenas pela cor |
| `label` | crítico | 4 | campo sem rótulo associado |
| `scrollable-region-focusable` | sério | 4 | região rolável inalcançável pelo teclado |
| `select-name` | crítico | 2 | `<select>` sem nome |
| `aria-progressbar-name` | sério | 2 | barra de progresso sem nome |

**461 ocorrências de contraste eram 33 pares de cor.** Corrigir a paleta — e não
elemento por elemento — foi o que fez o número cair. O detalhe de cada
substituição está em
[`13-corrigir-acessibilidade`](../.claude/fixes/reports/13-corrigir-acessibilidade.md).

## Regras que a plataforma segue

Não são aspiração: cada uma tem teste.

1. **Contraste mínimo 4,5:1** para texto normal. O tom de *hover* é sempre mais
   escuro que o de repouso, nunca mais claro.
2. **Todo controle tem nome acessível.** Botão de ícone leva `aria-label`; o
   ícone leva `aria-hidden`.
3. **Todo campo tem rótulo associado**, por `htmlFor`/`id` — não por placeholder.
4. **Alvo de toque de no mínimo 24×24 px** (WCAG 2.5.8), com as exceções que a
   norma prevê: espaçamento, alvo em linha de texto, e elemento escondido.
5. **Nenhuma página rola para o lado em 375px.**
6. **Os três fluxos principais funcionam só com teclado**, com foco visível.
7. **Nada fora de tela é focável** — as etapas ocultas do assistente de relato
   saem da ordem de tabulação (task `52`).

## Como isso se mantém

```bash
pnpm test:a11y
```

O baseline vive em `.claude/fixes/reports/12-a11y-baseline.json`, e a varredura
compara contra ele. **O piso é zero `critical` e zero `serious`**: reintroduzir
uma violação quebra a suíte. Regravar o baseline com `A11Y_BASELINE=1` só é
legítimo *depois* de corrigir, para registrar o novo zero.

Ver [`testes.md`](testes.md) para o resto da suíte.

## O que continua fora do escopo

- **Modo de alto contraste** — não implementado.
- **Leitura assistida (TTS)** — não implementada. A plataforma é compatível com
  leitor de tela, o que não é a mesma coisa.
- **Conformidade AAA** — a meta medida é AA. Nenhuma afirmação de AAA neste
  repositório foi verificada.
