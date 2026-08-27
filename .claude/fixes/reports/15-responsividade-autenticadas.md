# Relatório — [15] Responsividade das áreas autenticadas em 375px

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1
- **Capturas:** [`15-celular/`](15-celular)

## O que faltava, e o que sobrou

A metade "overflow" desta task já tinha sido fechada pela `14`, que estendeu
`e2e/responsive.spec.ts` para as 15 rotas autenticadas. O que restava era o que
o overflow não mede: alvo de toque, menu de celular, tabs que não rolam, e a
conversa do relato — a tela onde a plataforma acontece.

| | Antes | Depois |
|---|---|---|
| Testes de responsividade | 66 | **94** |
| Alvos abaixo de 24×24 sem espaçamento | 3 | **0** |
| Barras de abas que empurrariam a página | 2 (`FilterTabs`, `SubTabs`) | 0 |
| Menu de celular verificado | não | **sim** |
| Suíte rápida | 288 | **316** |

## Alvos de toque: medir com as exceções, não sem elas

O piso do WCAG 2.5.8 é 24×24 CSS px. Uma medição ingênua reprova meia interface
e não serve para nada: reprovou o link "Pular para conteúdo principal" (1×1 por
design, é `sr-only`), o "Esqueceu a senha?" solto embaixo do formulário, e todo
link dentro de frase.

O critério tem exceções e são elas que o tornam útil. Implementadas:

- **espaçamento** — alvo pequeno passa se um círculo de 24px centrado nele não
  encostar no círculo de nenhum outro alvo. É a que absolve o "Esqueceu a
  senha?": pequeno, mas sozinho;
- **inline** — link no meio de um bloco de texto;
- **escondido** — `aria-hidden`, `inert`, `display:none`, e o padrão `sr-only`
  de 1px que só existe até receber foco.

Com as exceções aplicadas, **12 páginas amostradas, um único defeito**:

```
button "Ir para etapa 2" mede 8x8 e encosta em "Ir para etapa 3"
button "Ir para etapa 3" mede 8x8 e encosta em "Ir para etapa 2"
button "Ir para etapa 4" mede 8x8 e encosta em "Ir para etapa 3"
```

São os pontinhos do carrossel do passo a passo da home — a primeira coisa que
alguém vê ao chegar. Oito pixels, colados uns nos outros: no celular a pessoa
erra e pula para a etapa errada.

A correção **não** foi aumentar o ponto. O ponto continua com 8px; quem recebe o
toque virou um botão de 24×24 com o ponto dentro:

```tsx
<button className={`group flex h-6 items-center justify-center rounded-full ${
  index === currentStep ? "w-10" : "w-6"}`}>
  <span aria-hidden="true" className={`block h-2 rounded-full ...`} />
</button>
```

O desenho não mudou. A área de toque triplicou.

## As duas barras de abas que faltavam

A task `14` corrigiu o `PageTabs`. `FilterTabs` e `SubTabs` são o mesmo
componente escrito duas vezes mais, e tinham o mesmo defeito — barra horizontal
sem `overflow-x-auto`. Hoje elas não estouram porque têm poucos itens; passariam
a estourar no dia em que alguém acrescentasse um filtro.

Receberam o mesmo tratamento: `overflow-x-auto` no contêiner, `shrink-0` e
`whitespace-nowrap` nos itens, `tabIndex={0}` e `aria-label` porque região
rolável precisa ser alcançável por teclado. O `SubTabs` era um `div`; virou
`nav`, que é o que ele sempre foi.

## Tabelas: já estava feito

O escopo pedia "tabelas viram cards ou ganham wrapper `overflow-x: auto`".
Conferido nas quatro que existem:

| Tabela | Situação |
|---|---|
| `src/components/ui/table.tsx` | wrapper `overflow-auto` desde sempre |
| `/app/admin/audit` | ganhou wrapper + `tabIndex` + `role="region"` na task `13` |
| `/blog/[slug]` e `/blog/[slug]/edit` | wrapper `overflow-x-auto` já existia |

As duas do blog não eram alcançáveis por teclado. Ganharam `tabIndex={0}` e
rótulo, pela mesma razão da auditoria. Não estavam falhando no axe porque
nenhum artigo do seed tem tabela — era defeito latente, não ausente.

## A conversa do relato

As duas telas de detalhe não entram nas listas de rota porque precisam de um
relato existindo. Ganharam teste próprio, que cria o relato, abre os dois lados
e mede a caixa de resposta:

- o campo precisa ocupar mais de metade da largura da tela — menos que isso é
  sintoma de layout de duas colunas que não desmontou no celular;
- o botão "Enviar resposta" precisa estar dentro da tela, não cortado.

Ambos passam. E o `keyboard.spec.ts` fluxo 3 já provava, rodando em
`chromium-mobile`, que a empresa consegue escrever e enviar sem mouse.

## O rodapé do wizard

A captura da etapa 4 mostrou o problema que nenhum teste pegou: os três blocos
do rodapé lado a lado em 375px espremiam "Informações privadas" em duas linhas
por cima do próprio ícone, e encolhiam "Voltar" e "Enviar relato".

Não é overflow — cabe, tecnicamente. É só ruim de usar. No celular os blocos
agora empilham; de `sm:` para cima o desenho original continua idêntico.

Compare [`wizard-etapa-4.png`](15-celular/wizard-etapa-4.png) com a etapa 2, que
tem o mesmo rodapé.

## Dois riscos da task que, medidos, não existem

A task avisava sobre `100vh` e sobre composer fixo cobrindo o conteúdo quando o
teclado virtual abre. Ambos foram conferidos, e nenhum se aplica:

| Risco previsto | Medição |
|---|---|
| `height: 100vh` cortando conteúdo no celular | **31 ocorrências, todas `min-h-screen` / `minHeight: 100vh`.** Zero altura fixa. `min-height` no máximo sobra scroll; não corta. Trocar por `dvh` seria churn sem defeito. |
| Composer fixo tapando o conteúdo | **Zero `fixed bottom-0` ou `sticky bottom-0` no repositório.** A caixa de resposta rola com a página, então o navegador a traz para a vista sozinho ao focar. |

O segundo reduz bastante — mas não elimina — a limitação de teclado virtual
descrita abaixo.

## O que continua não coberto

O Chromium headless **não** abre teclado virtual. Um teclado real come cerca de
40% da altura da tela. Como não há composer fixo, o caso perigoso (botão de
enviar preso embaixo do teclado) é improvável, mas *improvável não é medido*.
Isto exige conferência num aparelho de verdade e está registrado como limitação
no cabeçalho da spec, não como coberto.

## Um susto que não era defeito

A captura da conversa mostrava um círculo escuro com um "N" cortado na margem
esquerda. Escrevi um detector de estouro *para a esquerda* — que o teste da task
`14` não faz, porque só mede `right > clientWidth` — e ele achou um único
elemento: o banner azul do cabeçalho, que sangra 8px de cada lado de propósito e
não gera rolagem.

O "N" era o indicador de desenvolvimento do Next.js, fixo no canto inferior
esquerdo, que a captura `fullPage` reposiciona. Não é da aplicação.

Fica registrado por dois motivos: para ninguém mais perder tempo com ele, e
porque o detector de estouro à esquerda foi escrito e não achou nada — o que é
um resultado, não um desperdício.

## Achado novo: task `57`

Na tela `/app/company/complaints/[id]` o card lateral convida a empresa a fazer
um relato **sobre si mesma**, e o link passa o *nome* da empresa onde o wizard
espera o *id* — o único dos seis call sites fora do padrão. Está visível em
[`conversa-empresa.png`](15-celular/conversa-empresa.png).

Fora do escopo desta task (é regra de negócio, não responsividade). Registrado
como [`57`](../tasks/57-cta-de-relato-na-tela-da-empresa.md).

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test e2e/responsive.spec.ts` | ✅ **93 passando, 1 pulado** (94), 4,9 min |
| `npm run test:e2e` | ✅ **313 passando, 3 pulados** (316), 13,9 min |
| `npm run test:a11y` | ✅ **78/78**, 0 ocorrências, 5,8 min |
| `npx playwright test e2e/complaint-create.spec.ts e2e/keyboard.spec.ts` | ✅ 22 passando — rodado de novo **depois** do ajuste no rodapé do wizard, que a suíte grande não tinha visto |
| `npx tsc --noEmit` | ✅ exit 0 |
| `npx eslint src` | ✅ 0 erros, 0 warnings |
| `npm run build` | ✅ passa |

## Critérios de aceite

- [x] Nenhuma rota autenticada tem scroll horizontal em 375px — 15 rotas, fechado
      pela `14` e mantido aqui.
- [x] O wizard completo é concluível em 375px, comprovado por
      `complaint-create.spec.ts` e `keyboard.spec.ts` no projeto
      `chromium-mobile`.
- [x] A thread de mensagens é legível e o composer utilizável — com teste
      próprio que mede a largura do campo e a posição do botão.
- [x] Screenshots do wizard (4 etapas) e do inbox da empresa anexados.
- [x] **Menu de celular abre, navega e fecha** — o item que ficou aberto no
      aceite da task `14`. Testado inclusive o reabrir na página seguinte e o
      fechar com Escape.
- [x] Alvos de toque medidos com as exceções do critério, e o único defeito real
      corrigido.
- [ ] **Teclado virtual em aparelho real** — não coberto, e não dá para cobrir
      com Playwright headless. Registrado como limitação.

## Nota sobre o inbox

`/app/company/inbox` é apenas um `redirect` para
`/app/company/dashboard?tab=complaints`, e `complaints` já é a aba padrão do
dashboard. As duas capturas saíram byte a byte idênticas — foi assim que
percebi. Não é defeito; é alias. Mantive só uma captura.
