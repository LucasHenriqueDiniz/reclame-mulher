# Relatório — [22] Manual de Uso da Plataforma

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 3

## O que foi entregue

| Arquivo | O que é |
|---|---|
| [`docs/manual/MANUAL_DE_USO.md`](../../../docs/manual/MANUAL_DE_USO.md) | o manual, 8 seções, 16 telas ilustradas |
| `docs/manual/MANUAL_DE_USO.html` | versão distribuível — **arquivo único de 4,7 MB**, imagens embutidas |
| `docs/manual/img/` | 34 capturas: 17 telas × computador e celular |
| `scripts/capturas-do-manual.ts` | refaz todas as capturas (`pnpm manual:capturas`) |
| `scripts/manual-html.ts` | gera o HTML a partir do Markdown (`pnpm manual:html`) |

O `MANUAL_PLATAFORMA.md` virou
[`docs/especificacao-de-telas.md`](../../../docs/especificacao-de-telas.md),
com um aviso no topo dizendo o que ele é e para onde ir. O
`MANUAL_PLATAFORMA.html`, que era a versão navegável da mesma especificação, foi
para `docs/historico/`.

## As capturas não foram feitas à mão

`scripts/capturas-do-manual.ts` entra com as contas do seed, percorre os fluxos e
fotografa. Rodar o script de novo depois de mudar a interface regenera as 34
imagens em cerca de um minuto.

Três decisões que valem registro:

**Servidor de produção, não `npm run dev`.** O servidor de desenvolvimento
desenha um indicador do Next no canto da tela, e ele apareceria em toda captura.

**`deviceScaleFactor: 1`, não 2.** A 2× o conjunto passava de 12 MB, e o manual
precisa ser mandado por e-mail. A 1× ficou em 6,3 MB no total, 4,1 MB para as
imagens que o manual usa.

**As etapas do assistente são recortadas no cartão**, não na página inteira. A
página tem 1280 px de largura para um cartão de 800: fotografando a tela toda, o
texto sai pequeno demais para ser lido no manual. `locator.screenshot()` resolve.

## O que o manual diz que a plataforma não faz

Esta foi a parte que mais exigiu decisão. Escrevendo o passo a passo, seis coisas
que a plataforma **não** faz apareceram no meio de fluxos que o manual precisa
descrever:

| Onde aparece | O que o manual diz |
|---|---|
| criar conta | não há recuperação de senha — o link "Esqueceu a senha?" não leva a lugar nenhum ([`59`](../tasks/59-esqueceu-a-senha-nao-existe.md)) |
| anexar foto | a tela promete 3 arquivos de 5 MB, o envio aceita 1 de 4 MB ([`62`](../tasks/62-limites-de-upload-divergem.md)) |
| acompanhar | não chega aviso por e-mail. Nenhum ([`61`](../tasks/61-email-nao-existe.md)) |
| relato concluído | responder não reabre o caso; o manual ensina o que fazer no lugar ([`55`](../tasks/55-resolvido-nao-reabre.md)) |
| etiquetas | a mesma situação aparece como *Resolvida*, *Concluído* e *Em aberto* em telas diferentes ([`54`](../tasks/54-rotulos-de-status-divergentes.md)) |
| buscar ajuda | não existe canal de atendimento |

Tudo isso está numa tabela própria, "O que esta versão ainda não faz", e também
no ponto do texto onde a pessoa vai esbarrar.

A alternativa seria escrever um manual do produto pretendido. Num documento que
é insumo de dissertação e que uma banca vai ler ao lado da aplicação rodando,
isso não se sustenta.

## O achado que interrompeu a task

A seção 8 ia se chamar "Onde buscar ajuda" e apontar para `/ajuda`. Fotografei a
página **sem estar logado** e o que apareceu foi isto:

> **Página de Ajuda** — Logins de teste, links rápidos e informações úteis para
> desenvolvimento.

Não é uma página de ajuda. É uma tela de depuração que lista as contas do seed,
inclusive `admin@comunicamulher.com.br`, e imprime a senha padrão com botão de
copiar.

Confirmado no servidor de produção:

```
$ curl -s http://localhost:5000/ajuda | grep -o 'senha123'
senha123
senha123
```

Três fatos que fazem disto um problema:

1. `/ajuda` está na lista de exceções do `src/middleware.ts` — não exige sessão.
2. Não há trava de ambiente. Nenhum `NODE_ENV`, nenhum `notFound()`. Vai para
   produção como está.
3. **Nada em `src/` aponta para ela.** Ela não está em menu nenhum, o que
   significa que ninguém vai esbarrar nela navegando — e que ela ia continuar lá.

Registrado como [`63`](../tasks/63-pagina-ajuda-expoe-credenciais.md), risco
**alto**. Apaguei as duas capturas dessa página e tirei-as do script: fotografar
credencial dentro de um documento feito para distribuir seria trocar um problema
por outro.

A seção 8 do manual passou a dizer a verdade — que não há canal de atendimento —
e a recomendar defesa civil ou prefeitura quando o caso envolver risco. A
plataforma registra e cobra; não substitui fiscalização.

## Acessibilidade do próprio manual

O critério pedia legenda descritiva em toda imagem. Cada figura tem **duas**
coisas diferentes:

- **texto alternativo**, descrevendo a tela para quem não a vê. Não "tela de
  cadastro", e sim o que está escrito nela, na ordem em que aparece;
- **legenda visível**, dizendo o que olhar naquela imagem.

Medido no HTML gerado, nos dois viewports:

| | |
|---|---|
| figuras | 16 |
| figuras com legenda | **16** |
| imagens com texto alternativo abaixo de 30 caracteres | **0** |
| imagens quebradas | 0 |
| âncoras internas quebradas | 0 |
| rola para o lado em 375 px | **não** |

## O conversor de Markdown é caseiro

`scripts/manual-html.ts` converte o Markdown à mão, cobrindo só o que o manual
usa. Acrescentar uma dependência de Markdown ao projeto para gerar um documento
seria caro pelo que entrega.

Duas armadilhas apareceram, e as duas só apareceram porque conferi o HTML gerado
em vez de confiar nele:

- **O GitHub não remove acento das âncoras.** `#glossário` tem acento. Eu estava
  normalizando com `NFD` e removendo os diacríticos, o que quebrava seis links.
- **`\w` não casa com `á`.** Sem a flag `u`, a limpeza `[^\w\s-]` apagava
  justamente as letras acentuadas, e `glossário` virava `glossrio`. Corrigido
  com `[^\p{L}\p{N}\s-]/gu`.

O HTML tem folha de impressão: cada seção começa em página nova e figura, tabela
e citação não quebram no meio. Quem quiser PDF, imprime pelo navegador.

## Verificação

| O que | Resultado |
|---|---|
| `npm run check` (tsc + eslint + vitest) | ✅ 0 erros, 0 avisos, 18/18 |
| `npm run build` | ✅ `Compiled successfully in 9.7s` |
| links internos de toda a documentação | ✅ **183 conferidos, 0 quebrados** |
| HTML gerado, 1280 px e 375 px | ✅ sem rolagem lateral, sem imagem quebrada, sem resto de Markdown |
| contas usadas nas capturas | ✅ só as três do seed |
| arquivos `.md` na raiz | ✅ 4 |

### O teste prático que a task pede

A task pede: *"alguém que nunca viu a plataforma consegue registrar uma
reclamação seguindo só o manual?"* Isso é revisão humana, e não posso fazê-la
sozinho. O que posso afirmar é o que verifiquei: **todo passo do manual
corresponde a uma tela fotografada**, e o texto de cada botão citado é o texto
que está na imagem — porque as capturas vieram da aplicação, não de memória.

O teste com uma pessoa de fora continua valendo, e é o que vai encontrar o que
ficou implícito.

## Critérios de aceite

- [x] `docs/manual/MANUAL_DE_USO.md` cobre as 8 seções.
- [x] Todo passo de tarefa tem captura correspondente.
- [x] Nenhuma captura contém dado pessoal real — só contas do seed. E nenhuma
      contém credencial, o que exigiu descartar duas.
- [x] Nenhum jargão técnico sem explicação. "Assistente" no lugar de *wizard*,
      "painel" no lugar de *dashboard*, "primeiros passos" no lugar de
      *onboarding*, e um glossário no fim.
- [x] Toda imagem tem legenda descritiva — 16 de 16, medido.

## O que precisa de você

A task avisa que quatro decisões são suas e da Paloma, não minhas. Assumi um
padrão em cada uma para não travar, e todas são fáceis de mudar:

| Decisão | O que assumi | Como mudar |
|---|---|---|
| **Título** | "Manual de Uso — ComunicaMulher" | primeira linha do `.md` |
| **Formato de entrega** | HTML de arquivo único, com folha de impressão para virar PDF pelo navegador | — |
| **Inclui a área administrativa?** | **Não.** O manual cobre pessoa e empresa | precisaria de uma seção nova e de capturas da conta `admin` |
| **Identidade visual da UERGS** | **Não.** Sem logotipo, sem cores institucionais | acrescentar no `ESTILO` de `scripts/manual-html.ts` |

E uma que é urgente e não é de estilo:

> ⚠️ **Task [`63`](../tasks/63-pagina-ajuda-expoe-credenciais.md) antes de
> qualquer deploy.** Enquanto `/ajuda` estiver publicada, qualquer visitante lê
> o e-mail do administrador e a senha dele, e clica para copiar os dois.

Também vale saber, para a demonstração da defesa: a conta de empresa do seed é
`MEMBER`, então ela **responde relatos e muda status** — que é o que o manual
mostra — mas **não edita o perfil da empresa nem cadastra projeto**. É o achado
[`56`](../tasks/56-conta-empresa-do-seed-e-member.md), e é por isso que a seção 6
não cobre essas duas telas.
