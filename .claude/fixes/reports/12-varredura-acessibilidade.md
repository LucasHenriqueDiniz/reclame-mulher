# Relatório — [12] Varredura automatizada de acessibilidade

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0
- **Baseline bruto:** [`12-a11y-baseline.json`](12-a11y-baseline.json)

## O número

**523 ocorrências de violação WCAG A/AA**, em 39 páginas × 2 viewports.

| | |
|---|---|
| Páginas varridas | **39** de 42 (as 3 restantes só redirecionam) |
| Combinações página × viewport | 78 |
| Combinações **sem nenhuma violação** | **16** de 78 |
| Ocorrências no desktop | 284 |
| Ocorrências no mobile | 239 |
| Regras violadas | 7 |

Isto substitui as três afirmações que se contradiziam no repositório:

| Documento | O que dizia |
|---|---|
| `RELATORIO_CORRECOES_ACESSIBILIDADE.md` | 14 problemas corrigidos |
| `STATUS_FINAL_PRODUCAO.md` | acessibilidade em 87,5% |
| `TODO.md` | **VALIDADA**, "WCAG AAA" no contraste |

A auditoria que gerou esses números cobriu **6 páginas**. Esta cobriu 39. E o
`TODO.md` erra justamente no ponto que a varredura mais reprova: contraste.

## As 7 regras, em ordem de prioridade

Ordenadas por severidade e depois por número de páginas afetadas. **Esta é a
fila da task `13`.**

| # | Regra | Impacto | Páginas | Ocorrências | O que é |
|---|---|---|---|---|---|
| 1 | `button-name` | **crítico** | 22 | 44 | botão sem texto discernível |
| 2 | `select-name` | **crítico** | 2 | 2 | `<select>` sem nome acessível |
| 3 | `label` | **crítico** | 2 | 4 | campo de formulário sem rótulo |
| 4 | `color-contrast` | sério | **61** | **461** | contraste abaixo do mínimo |
| 5 | `link-in-text-block` | sério | 4 | 6 | link identificável só pela cor |
| 6 | `aria-progressbar-name` | sério | 2 | 2 | barra de progresso sem nome |
| 7 | `scrollable-region-focusable` | sério | 2 | 4 | região rolável sem acesso por teclado |

### Contraste: 88% de tudo

461 das 523 ocorrências são `color-contrast`, em **61 das 78** combinações. É o
oposto do "WCAG AAA" do `TODO.md`, e é o item que sozinho decide se o número
final fica alto ou baixo.

A boa notícia é que provavelmente são poucas cores repetidas muitas vezes — a
paleta está espalhada em literais hexadecimais pelos componentes (`#607D8B`,
`#1E88E5`, `#2A3F54`). A task `13` deve começar medindo **quais pares de cor**
reprovam, não quais elementos: corrigir 4 ou 5 valores na paleta pode derrubar
centenas de ocorrências de uma vez.

### `button-name`: 22 páginas

44 ocorrências, quase sempre botão só com ícone. Concentração:

| Páginas | Ocorrências |
|---|---|
| `/app/complaints/new`, `/app/settings`, `/app/settings/account`, `/app/settings/security` | 3 cada |
| `/onboarding/person/step1`, `/onboarding/company/step1`, `/blog/:slug/edit` | 2 cada |
| `/login`, `/onboarding/person/step2`, `/onboarding/company/step2`, `/auth/verify` | 1 cada |

É crítico porque um botão sem nome é anunciado como "botão" e nada mais. Numa
tela de cadastro, isso é o mostrar/ocultar senha virando um botão anônimo.

## As páginas limpas, e as piores

**Sem nenhuma violação (desktop):** `/register`, `/register/success`,
`/privacy`, `/terms`, `/auth/verify/check-email`.

Vale notar o padrão: são as páginas mais simples, de texto corrido. Onde há
interface de verdade, há violação.

**Piores (desktop):**

| Ocorrências | Página |
|---|---|
| 23 | `/app/complaints` |
| 23 | `/app/company/complaints` |
| 16 | `/app/company/dashboard` |
| 16 | `/app/company/inbox` |
| 15 | `/ajuda` |
| 14 | `/company/:slug` |
| 14 | `/app/settings`, `/app/settings/account`, `/app/settings/security` |

`/app/complaints` é a primeira tela que a usuária vê depois de entrar. Ela lidera
a lista, com 23 ocorrências, todas de contraste.

## O achado que a varredura NÃO pegou

Isto merece destaque, porque eu previ o contrário na iteração anterior.

Na task `09` registrei dois defeitos de acessibilidade no wizard, e escrevi que
a varredura os reencontraria. **Ela pegou nenhum dos dois:**

| Achado | O axe viu? | Por quê |
|---|---|---|
| `52` — 11 controles fora da tela continuam focáveis | **não** | os elementos existem, são visíveis e têm nome; nenhuma regra do axe pergunta "isso está na etapa certa do wizard" |
| `53` — os 3 selects da etapa 4 sem rótulo associado | **não** | a regra `select-name` só olha `<select>` nativo. O Radix renderiza `<button role="combobox">` com o texto "Escolha uma opção" — para o axe, tem nome acessível; só que o nome é o placeholder, não o rótulo |

`/app/complaints/new` aparece no relatório com 11 ocorrências: 3 de
`button-name` e 8 de contraste. Os dois defeitos que eu conhecia, encontrados
lendo o DOM na task `09`, **não estão ali**.

O `select-name` que a varredura acusou é outro: o `<select>` nativo de mudar
status em `/app/company/complaints/:id`, que tem `<label>` sem `for`.

Este é o argumento concreto contra tratar "axe limpo" como "acessível". A
varredura automática cobre entre **30% e 40%** dos critérios WCAG. Ela não julga
ordem de foco, ordem de leitura, se o texto alternativo *descreve* a imagem, se
a mensagem de erro é compreensível, nem contraste sobre gradiente. Numa
plataforma cujo público-alvo é justamente quem costuma ser deixada de fora,
declarar conformidade a partir só disto seria repetir o erro dos documentos
antigos — em escala maior, porque agora com aparência de rigor.

## Como a varredura roda

Ela **não** entra na suíte rápida: são 78 páginas carregadas e analisadas, cerca
de 8 minutos. Fica em projetos próprios do Playwright, e os projetos da suíte
rápida a ignoram:

```bash
npm run test:a11y
```

A escolha de projeto em vez de variável de ambiente é proposital: funciona igual
no PowerShell e no bash, e `npx playwright test` continua sendo só a suíte
rápida.

**Ela já é uma trava, não só um relatório.** Cada página é comparada com o
baseline gravado: se alguma piorar, o teste falha dizendo qual e quanto. Página
nova não falha — entra no baseline na próxima gravação.

Para regravar depois de corrigir (task `13`):

```bash
A11Y_BASELINE=1 npm run test:a11y
```

## Verificação

| Comando | Resultado |
|---|---|
| `npm run test:a11y` | ✅ **78/78** — nenhuma página acima do baseline, 7,0 min |
| `npx playwright test --list` | ✅ 216 testes na suíte rápida, 78 nos projetos de a11y |
| `npm run check` | ✅ exit 0 |
| `npm run build` | ✅ `Compiled successfully in 16.5s` |
| `git status -- src/` | ✅ vazio — nenhum arquivo de aplicação tocado |

## Critérios de aceite

- [x] Todas as rotas varridas: 39 de 42, com as 3 exceções nomeadas e
      justificadas no próprio código (`NAO_VARRIDAS`) — as três só redirecionam.
- [x] Baseline JSON existe e o resumo em markdown está preenchido.
- [x] Nenhum arquivo de `src/` modificado.
- [x] As violações estão ordenadas por severidade × páginas afetadas, e essa
      ordem é a fila da task `13`.

## Recomendação para a task `13`

Nesta ordem, por retorno sobre esforço:

1. **Contraste da paleta** — medir os pares de cor reprovados antes de tocar em
   qualquer componente. 461 ocorrências provavelmente saem de meia dúzia de
   valores.
2. **`button-name`** — 44 botões de ícone, quase todos resolvidos com
   `aria-label`. Crítico e mecânico.
3. **`53`** (selects do wizard) — não aparece no axe, e é o que a usuária
   encontra na tela mais importante do produto.
4. **`52`** (etapas fora de tela) — mais arriscado, mexe na renderização do
   wizard; deixar por último e com a suíte de `complaint-create` como rede.
5. O resto (`label`, `link-in-text-block`, `aria-progressbar-name`,
   `scrollable-region-focusable`) soma 16 ocorrências em 6 páginas.
