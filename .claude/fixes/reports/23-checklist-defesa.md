# Relatório — [23] Checklist de prontidão para a demonstração da defesa

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 4

## O que foi entregue

| Arquivo | O que é |
|---|---|
| [`docs/roteiro-demonstracao.md`](../../../docs/roteiro-demonstracao.md) | o roteiro: 14 passos em 5 atos, com o que dizer, plano B e limitações |
| `scripts/seed-demonstracao.ts` | o cenário de demonstração (`pnpm db:seed:demo`) |
| `scripts/ensaio-da-demonstracao.ts` | percorre o roteiro inteiro e cronometra |

## O ensaio não é figura de linguagem

O critério da task pede o roteiro **executado integralmente sobre o build de
produção**, com tempo cronometrado. Em vez de executá-lo uma vez à mão e anotar
números que ninguém pode conferir, escrevi um ensaio que percorre os mesmos 14
passos pela interface e cronometra cada um. Ele roda de novo antes da defesa, e
falha se algum passo tiver quebrado no meio tempo.

```
  ok    8.9s  1. Home e os números do impacto — 11 mulheres · 54% de resolução · 4 empresas
  ok    1.8s  2. Lista de empresas — 5 empresas na tela
  ok    1.6s  3. Perfil público de uma empresa — 5 relatos públicos visíveis sem login
  ok    1.0s  4. Entrar como usuária — /app
  ok    6.0s  5. Registrar o relato (quatro etapas) — relato criado
  ok    2.1s  6. O relato aparece na lista da usuária — visível na lista, com etiqueta Aberta
  ok    0.9s  7. Entrar como empresa — /app
  ok    1.9s  8. Painel da empresa — 2 relatos sem resposta
  ok    1.7s  9. Abrir o relato novo na caixa da empresa — aberto
  ok    0.0s  10. Responder — resposta publicada
  ok    3.8s  11. Marcar como resolvido — situação agora é Resolvida
  ok    2.6s  12. Voltar como usuária e ver a resposta — a resposta está na conversa
  ok    1.3s  13. Perfil público mostra o caso encerrado
  ok    2.0s  14. Área administrativa — Área Administrativa

Tempo de máquina: 36s
Nenhum tropeço. O roteiro inteiro está de pé.
```

Trinta e seis segundos é só o tempo do sistema. Dobrando e somando a fala, o
roteiro cabe nos 12 a 15 minutos — é o que está escrito nele.

## O cenário: 2 mulheres viraram 11

A task já avisava que isto ficara urgente depois da `03`: a home deixou de
mostrar números inventados e passou a consultar o banco, e com o seed base ela
mostrava um retrato de abandono.

| | Antes | Agora |
|---|---|---|
| mulheres ouvidas | 2 | **11** |
| taxa de resolução | 33% | **52%** |
| empresas em diálogo | 1 | **4** |
| relatos | 3 | **23** |
| obras cadastradas | 3 | 9 |

O cenário é **ficção declarada** — nomes, empresas e obras inventados — e vive
num script separado. `pnpm db:seed` continua sendo o estado que a suíte espera;
`pnpm db:seed:demo` acrescenta por cima. O script é re-executável.

A distribuição foi montada como um cenário real se distribui: **relato antigo
resolvido, relato recente aberto**. Não inflei a taxa de resolução escolhendo
status a esmo; acrescentei casos antigos já encerrados, que é o que uma
plataforma com histórico tem.

Também promovi a conta de empresa da demonstração a `OWNER`. É a metade do
achado [`56`](../tasks/56-conta-empresa-do-seed-e-member.md) que a demonstração
precisa resolvida — sem isso, "a empresa edita o perfil" bate num 403. O seed
base continua com `MEMBER`, e a decisão sobre ele continua sendo da `56`.

## Três coisas que o ensaio encontrou

Era para isso que ele servia.

### 1. Os números da home congelam no build — task `64`

A rota `/` sai **estática** do `next build` (`○ /`), e ela consulta o banco. A
consulta roda **uma vez, durante o build**, e o resultado é servido congelado.

Medido, com o servidor de produção de pé:

| | mulheres | taxa | empresas |
|---|---|---|---|
| gravado no HTML servido | 11 | **54%** | 4 |
| no banco, no mesmo instante | 11 | **52%** | 4 |

Em produção o efeito é maior: relato novo não muda a home até alguém publicar de
novo. Registrado como [`64`](../tasks/64-home-estatica-congela-os-numeros.md).
O roteiro contorna mandando construir **depois** de semear — mas isso é
armadilha documentada, não solução.

### 2. `/companies` volta a rolar para o lado — task `65`

A suíte de responsividade rodando sobre o cenário de demonstração:

```
1 failed
  [chromium-mobile] › /companies não rola para o lado
```

Documento com 399 px numa tela de 375. **Todos os cinco cartões** estouram —
inclusive os dois do seed base, que passavam. É comportamento de grade: item
nasce com `min-width: auto`, e o conteúdo mais largo empurra todas as faixas.

A correção da task `14` estava certa para os dados que existiam: duas empresas
de nome curto. O teste continua certo e continua cego, porque o banco de teste
não tinha nome longo. Registrado como
[`65`](../tasks/65-companies-estoura-com-mais-empresas.md), com o caminho de
bissecção e a correção provável.

**Não corrigi aqui.** A `23` é checklist de demonstração; mexer no CSS de página
pública é outro escopo, e é regra do `LOOP.md`. Para a defesa o impacto é
pequeno — a apresentação é em projetor — e isso está no roteiro.

### 3. A contagem da home leva sete segundos

Não é defeito, é animação de mola bem amortecida. Mas quem demonstra precisa
saber: passar a página antes disso mostra números pela metade.

Isso me pegou. No primeiro ensaio li a tela cedo demais, o passo reportou
"1 mulheres ouvidas, 30%, 0 empresas" e por um momento achei que a home estava
quebrada. O ensaio agora lê os três números da carga servida e **espera a tela
chegar neles** — o que, de quebra, é a medição que expõe o achado `64`.

## O cenário de demonstração também foi verificado

Não basta o roteiro funcionar: as telas precisam continuar corretas com dados
diferentes. Rodei as duas varreduras **sobre o cenário de demonstração**, e não
sobre o seed base:

| Suíte | Resultado |
|---|---|
| acessibilidade (39 páginas × 2 viewports) | ✅ **78 de 78**, zero violações WCAG A/AA |
| responsividade (33 rotas × 2 viewports) | **93 de 94** — a que falha é o achado `65` |

Depois restaurei o seed base e rodei a suíte inteira, para provar que nada
regrediu: **359 passando, 3 pulados**.

## Plano B

O roteiro tem uma tabela para cada coisa que costuma falhar ao vivo. As três que
a task pedia:

- **Internet cai** → as 34 capturas da task `22` cobrem o percurso inteiro, e o
  `MANUAL_DE_USO.html` é arquivo único que abre sem rede.
- **Upload depende de serviço externo** → a recomendação é **não demonstrar
  upload**. A etapa 3 tem "Continuar sem foto" exatamente para seguir sem ele, e
  há captura da tela se perguntarem.
- **Banco dormindo** → é o Neon suspendendo conexão ociosa. Rodar o ensaio
  quinze minutos antes aquece; o roteiro diz isso e diz o que falar se acontecer
  mesmo assim.

E uma que não estava na lista: `--visivel` roda o ensaio com o navegador aberto e
desacelerado, para gravar um vídeo de reserva.

## Limitações conhecidas

Dez linhas, cada uma com a resposta curta e o registro onde ela vive. Inclui as
duas descobertas aqui e o aviso de **não abrir `/ajuda` na demonstração** — é a
task `63`, que expõe a senha do administrador.

O roteiro fecha com a resposta para "isso está pronto para produção?": está
pronto para um piloto, e há três coisas antes de abrir ao público — a `63`, a
`DATABASE_URL` com pooler, e a decisão sobre e-mail.

## Verificação

| O que | Resultado |
|---|---|
| roteiro executado inteiro, build de produção | ✅ 14 passos, **0 tropeços**, 36 s |
| tempo cronometrado e dentro da apresentação | ✅ 36 s de máquina → 12–15 min com fala |
| `pnpm db:seed:demo` re-executável | ✅ roda duas vezes seguidas com o mesmo resultado |
| acessibilidade sobre o cenário de demonstração | ✅ 78/78 |
| responsividade sobre o cenário de demonstração | 93/94 — achado `65` |
| suíte completa depois de restaurar o seed base | ✅ 359 passando, 3 pulados |
| `npx tsc --noEmit` / `eslint` | ✅ 0 / 0 |

## Critérios de aceite

- [x] `docs/roteiro-demonstracao.md` existe e foi executado integralmente sobre
      o build de produção.
- [x] O tempo está cronometrado, passo a passo, e cabe na apresentação.
- [x] Plano B documentado para rede e para upload — e para banco dormindo, login
      falhando e tela quebrando.
- [x] Lista de limitações conhecidas escrita, com dez itens e o registro de cada.

## O que precisa de você

1. **Ensaie você mesma, uma vez, em voz alta.** O ensaio automatizado prova que
   o caminho está de pé; não prova que a narrativa flui, nem quanto tempo a sua
   fala leva. É a única parte que eu não consigo fazer.
2. **Decida sobre a task `56`** — se a conta de empresa do seed base vira
   `OWNER` ou se ganha uma segunda conta. Na demonstração já está resolvido.
3. **A task `63` continua sendo a mais urgente** de tudo que está aberto.
