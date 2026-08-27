# Relatório — [13] Correção das violações de acessibilidade

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 2

## O número

| | Antes (task `12`) | Agora |
|---|---|---|
| Ocorrências WCAG A/AA | **523** | **0** |
| Combinações página × viewport limpas | 16 de 78 | **78 de 78** |
| Violações `critical` | 50 | 0 |
| Violações `serious` | 473 | 0 |

E a varredura deixou de ser relatório: **o piso agora é zero `critical` e zero
`serious`**, verificado em toda página varrida. Reintroduzir uma quebra a
suíte.

## Contraste: 33 pares de cor, não 461 elementos

A hipótese do relatório da task `12` se confirmou. As 461 ocorrências de
contraste vinham de **33 pares de cor distintos**, e os cinco primeiros
respondiam por 152 delas. Corrigir a paleta — não os elementos — foi o que fez
o número cair.

| Antes | Depois | Contraste sobre branco | Usos |
|---|---|---|---|
| `#1E88E5` | `#1565C0` | 3,68 → **5,75** | 223 |
| `#2189E5` (`companyTheme.primary`) | `#1565C0` | 3,63 → **5,75** | via tema |
| `#1976D2` (hover) | `#0D47A1` | — | 52 |
| `#3BA5FF` | `#1976D2` | 2,62 → **4,60** | 45 |
| `#607D8B` | `#546E7A` | 4,37 → **5,40** | 106 |
| `#1CA85B` (verde do tema) | `#146C43` | 3,09 → **6,00** | |
| `#E0A800` (amarelo do tema) | `#7A5C00` | 1,94 → **6,25** | |
| `#E07B00` (laranja do tema) | `#9A5400` | 3,00 → **5,77** | |
| `#F57C00` (badge "Aberta") | `#8A4B00` | 2,47 → **6,20** | |
| `#2E7D32` (badge "Resolvida") | `#1B5E20` | 3,81 → **5,85** | |
| `#F97316`, `#AD92FF`, `#EF4444` | `#9A4B00`, `#6B4EE6`, `#DC2626` | todos abaixo de 3,8 → acima de 4,8 | |
| `text-gray-400` | `text-gray-500` | 2,53 → **4,83** | 17 |

Total: **440 substituições em 63 arquivos**, mais 17 trocas de classe.

O `#1976D2` era o tom de *hover* — virou `#0D47A1` para que hover continue
sendo o passo mais escuro, e não o contrário. E o `#3BA5FF` foi para `#1976D2`
em vez de colapsar no azul base, para preservar a distinção entre dois tons de
azul da identidade.

`src/components/company/theme.ts` ganhou o contraste de cada valor no comentário
e um aviso para rodar `npm run test:a11y` antes de commitar mudança de cor.

### Quatro casos que só apareceram na segunda medição

A primeira rodada derrubou 523 → 27. Os 27 restantes eram efeitos que a
substituição de hex não alcança:

| Onde | Causa | Correção |
|---|---|---|
| Botão destrutivo | `--destructive` era red-500; branco em cima dá 3,76 | red-600 → **4,83** |
| Carrossel da home | `opacity-70` sobre o roxo derrubava para 3,64 | opacidade removida → **7,75** |
| Badges sobre o azul | fundo `rgba(255,255,255,0.2)` **clareia** o azul; branco em cima dá 3,49 | `rgba(0,0,0,0.2)` → **7,87** |
| Números do passo a passo | `#1976D2` sobre `#EFF6FF` = 4,22 (negrito 14px não é "texto grande") | `#1565C0` → **5,28** |

O terceiro é o mais instrutivo: a intuição diz que um véu branco sobre azul
"destaca" o badge, mas ele aproxima o fundo do branco do texto. Escurecer o véu
resolve sem mudar o desenho.

## Nomes acessíveis: 50 violações críticas, 6 componentes

As 44 ocorrências de `button-name` não eram 44 lugares — eram **três
componentes** repetidos:

| Componente | Ocorrências | Correção |
|---|---|---|
| `PasswordField` | 8 | `aria-label` que muda com o estado ("Mostrar senha" / "Ocultar senha"), `aria-pressed`, ícone `aria-hidden` |
| Campo de senha das configurações | 9 | idem — é uma segunda implementação do mesmo controle |
| `ComplaintSelect` (Radix) | 3 | `id` casando com o `htmlFor` do campo — **achado `53`** |
| Remover tag no editor de blog | 2 | `aria-label={`Remover a tag ${tag}`}` |

Os `aria-label` dizem **o efeito da ação**, não o nome do ícone, e mudam com o
estado — quem usa leitor de tela precisa saber o que o clique vai fazer agora,
não que ali existe um olho desenhado.

Os demais:

- **`label`** — os dois campos de data da auditoria ganharam rótulo **visível**
  ("De" e "Até"). `aria-label` resolveria o axe, mas um campo de data sem rótulo
  não diz qual ponta do intervalo é para ninguém, com ou sem leitor de tela.
- **`select-name`** — o `<select>` de mudar status tinha `<label>` sem `for`.
- **`link-in-text-block`** — 3 links inline que só se distinguiam pela cor:
  `hover:underline` virou `underline`.
- **`aria-progressbar-name`** — barra do carrossel com `aria-label`.
- **`scrollable-region-focusable`** — 3 blocos `<pre>` e a tabela de auditoria
  ganharam `tabIndex={0}`; a tabela ganhou também `role="region"` e rótulo. Sem
  isso, quem navega só por teclado não alcança a rolagem e perde as colunas da
  direita.

## O achado `52`, que o axe não vê

As quatro etapas do wizard coexistem no DOM. Agora as que estão fora da vez
saem do Tab e do leitor de tela:

```tsx
<div
  role="group"
  aria-label={`Etapa ${indice + 1} de ${TOTAL_STEPS}`}
  inert={foraDaVez}
  aria-hidden={foraDaVez}
>
```

De quebra, os quatro painéis viraram um `map` sobre uma lista, em vez de quatro
blocos repetidos — o que evita que alguém acrescente uma etapa e esqueça o
`inert`.

**Nenhuma regra do axe teria pedido isso.** Continua sendo o exemplo de que
varredura automática cobre 30–40% dos critérios.

## Correção do relatório da task `12`

A versão original daquele relatório afirmava que a varredura não pegou
**nenhum** dos dois achados do wizard. Estava errado quanto ao `53`: ao abrir o
detalhe nó a nó, as 3 ocorrências de `button-name` em `/app/complaints/new` —
que eu tinha atribuído a botões de ícone — são exatamente os três gatilhos do
Radix.

Eu havia deduzido a partir da contagem agregada por regra, sem ler os nós. A
conclusão certa não é "o axe é fraco", é **"contagem agregada não substitui ler
o detalhe"**. O relatório da `12` foi corrigido com a nota; a parte sobre o `52`
continua valendo.

## Teclado: os três fluxos, sem um único clique

`e2e/keyboard.spec.ts` percorre entrar, criar relato e a empresa responder
usando **só** Tab, Enter e setas. Não há um `click()` no arquivo: se um controle
só funcionasse com mouse, o teste travaria no Tab e falharia dizendo onde o foco
parou.

```
✅ fluxo 1: entrar na plataforma só com teclado
✅ fluxo 2: criar um relato só com teclado
✅ fluxo 3: a empresa responder só com teclado
```

O fluxo 2 é a prova independente do achado `52`: ele chega em `#complaint-title`
dentro do limite de Tabs justamente porque os campos das outras etapas não estão
mais na ordem de foco.

O teste também verifica que **o foco é visível** em cada controle-chave — foco
que não se vê é o mesmo que foco perdido.

Isto **não substitui** alguém sentado na frente da tela com um leitor de tela
ligado, e isso está escrito no topo do arquivo. Substitui o "teste manual de
teclado" da task no que ele tem de verificável: dá para completar cada fluxo sem
mouse.

## O que zero significa, e o que não significa

Zero violação do axe **não é** conformidade WCAG AA. A varredura automática
cobre entre 30% e 40% dos critérios. Continuam fora do alcance dela:

- se o texto alternativo **descreve** a imagem ou só repete o nome do arquivo;
- se a ordem de leitura faz sentido;
- se a mensagem de erro é compreensível para quem não é técnica;
- contraste sobre gradiente ou imagem de fundo;
- tudo que depende de navegar de fato com leitor de tela.

O que se pode afirmar com honestidade: **nenhuma violação detectável por máquina
em 39 páginas, nos dois viewports, e os três fluxos principais completáveis só
com teclado.** É bem mais do que o repositório podia afirmar antes — e bem menos
do que "WCAG AA compliant".

## Verificação

| Comando | Resultado |
|---|---|
| `npm run test:a11y` | ✅ **78/78**, 0 ocorrências, 5,8 min |
| `npm run test:e2e` | ✅ **220 passando, 2 pulados** (222 no total) |
| `npx playwright test` (tudo junto) | ✅ 298 passando, 2 pulados, 14,6 min |
| `npm run check` | ✅ exit 0 |
| `npm run build` | ✅ `Compiled successfully in 9.6s` |

### Um erro meu de configuração, achado pela contagem

A suíte fechou em **298 testes e 14,6 min** quando eu esperava 222. O relatório
da task `12` afirmava que `npx playwright test` continuaria sendo só a suíte
rápida — falso. O `testIgnore` que coloquei nos projetos rápidos impede que
**eles** rodem a spec de acessibilidade, mas não impede que os projetos de
acessibilidade rodem quando ninguém passa `--project`.

Corrigido aqui: `npm run test:e2e` e `npm run test:e2e:ui` passaram a filtrar os
projetos explicitamente, e o `playwright.config.ts` avisa que a chamada sem
filtro roda tudo. O relatório da `12` recebeu a nota de correção.

Vale registrar como isso apareceu: não foi por ler o código, foi porque o número
de testes não bateu com o esperado. Conferir a contagem é barato e pega o que a
leitura não pega.

## Critérios de aceite

- [x] 0 violações `critical` e 0 `serious` em todas as rotas varridas.
- [x] `e2e/a11y.spec.ts` falha se uma violação for reintroduzida — o piso é
      zero, não "não piorar".
- [x] Os 3 fluxos são completáveis só com teclado, com foco visível.
- [x] `npm run check` continua passando.
