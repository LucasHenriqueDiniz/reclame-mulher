# Relatório — [59] "Esqueceu a senha?" leva a lugar nenhum

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## O que foi encontrado

O defeito, intacto: `src/app/(auth)/login/page.tsx:154` apontava para
`/forgot-password`, rota que não existe. Sem sessão o middleware devolvia 307
para o próprio `/login` — o clique recarregava a mesma tela, sem erro e sem
mensagem.

E uma premissa da task que **não se sustenta**. Ela dizia, ao descrever a opção
1 (implementar a recuperação):

> o projeto já tem infraestrutura de e-mail — ver `scripts/sync-email-templates.ts`

Não tem. A task `20` mediu isso e abriu o achado `61`: existem quatro modelos
HTML, um script que apenas **valida arquivos**, e nenhum envio em lugar nenhum
do código. Confirmei antes de escolher o caminho.

Logo, a escolha entre as duas opções da task não era escolha: **a opção 1 é
impossível hoje**, e continua impossível até a decisão sobre e-mail sair — que é
item aberto de "precisa de decisão sua" no `TODO.md`.

## O que foi feito — opção 2, a honesta

| Arquivo | Mudança |
|---|---|
| `src/app/(auth)/login/page.tsx` | O link saiu. No lugar, abaixo do campo de senha: *"Esqueceu a senha? Nesta versão não há recuperação automática — peça a quem administra a plataforma."* |
| `e2e/links-internos.spec.ts` (novo) | A varredura da task `18` virou teste permanente |
| `docs/manual/MANUAL_DE_USO.md` | Três trechos: o aviso do cadastro, a pergunta do FAQ e a linha da tabela de limitações |
| `docs/roteiro-demonstracao.md` | Linha da tabela de limitações conhecidas |
| `docs/manual/img/`, `MANUAL_DE_USO.html` | Capturas refeitas |

### Por que este texto, e não um endereço de e-mail

A task sugeria *"Escreva para contato@… para recuperar o acesso"*. Não escrevi
endereço nenhum, e a razão é o próprio espírito da task: **não prometer o que
não se pode cumprir.**

Procurei um canal real. O único endereço da plataforma no repositório inteiro é
`suporte@reclame-mulher.com.br`, citado uma vez, na tela de verificação de
empresa, num domínio que mais nada usa — nem a conta de administração do seed,
que é `@comunicamulher.com.br`. Não tenho como saber se essa caixa recebe
mensagem, e mandar quem está trancada para fora escrever para uma caixa
possivelmente inexistente seria trocar um link morto por um e-mail morto.

"Peça a quem administra a plataforma" é verdade verificável: existe conta de
administração, e quem a tem consegue devolver o acesso pelo banco.

O endereço não verificado virou a task `67`.

### Uma iteração de layout

A primeira versão pôs o aviso **ao lado** do rótulo "Senha", onde o link estava.
Fotografei para o Manual e o texto quebrava em duas linhas espremidas,
disputando espaço com o rótulo. Movi para baixo do campo, como dica do
formulário. Só vi porque olhei a captura — é o tipo de coisa que passa quando se
confere só o código.

## O teste que trava isso — e o resto

A task pedia, no critério 1, *"vale um teste que colete os `href` internos e
confira cada um contra o build"*. `e2e/links-internos.spec.ts` faz isso sem abrir
navegador, lendo o sistema de arquivos:

- **rotas que existem**: todo `src/app/**/page.tsx`, com grupos `(auth)`
  descartados e `[id]` virando coringa;
- **destinos usados**: todo literal de `src/**` que começa com `/`. É de
  propósito mais largo do que só `href=` — assim `router.push`, `redirect()` e
  `notFound()` entram pelo mesmo preço;
- comparação segmento a segmento.

Três coisas que só apareceram rodando, e que o teste precisou aprender:

1. **Comentário conta como uso.** A primeira execução acusou `/forgot-password`
   vindo da tela de login — de dentro do comentário que eu tinha acabado de
   escrever explicando por que o link saiu. O teste tira comentário antes de
   procurar literal, com `[^:]` protegendo `https://`.
2. **`src/middleware.ts` declara prefixo, não destino.** `/company/` cobre
   `/company/[slug]`; `/onboarding` cobre `/onboarding/role`. Conferi-los como
   destino acusaria falso positivo em toda linha da lista, então o arquivo fica
   de fora, com o motivo escrito.
3. **Pedaço de `data:` URI parece rota.** O SVG embutido de `SearchInput` gerava
   `/%3E%3C/svg%3E`.

**Verificado por mutação:** repondo `<Link href="/forgot-password">` na tela de
login, o teste falha apontando o arquivo. Restaurado em seguida.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `links-internos.spec.ts` | ✅ passa; e **falha** quando o link volta |
| `npx vitest run` | ✅ 18 de 18 |
| suíte inteira | ✅ **477 passando, 3 pulados** em 23,1 min — 475 antes desta task mais os 2 da varredura de links (um por viewport). A varredura de acessibilidade cobre `/login` e continuou limpa com o texto novo |
| âncoras do `MANUAL_DE_USO.html` | ✅ 0 sem destino |

## Critérios de aceite

- [x] **Nenhum link da aplicação aponta para rota inexistente** — e agora há
      teste permanente exigindo isso, não uma varredura de uma vez só.
- [ ] ~~Se a opção 1: fluxo completo com teste E2E~~ — não é a opção escolhida,
      e não podia ser: depende de e-mail, que o projeto não envia.
- [x] **Se a opção 2: o texto diz o que fazer de verdade, e some quando a
      funcionalidade chegar** — o comentário no código diz exatamente isso, e
      cita o achado `61` como a condição para voltar atrás.

## Pendências e achados fora de escopo

Task `67` aberta: `suporte@reclame-mulher.com.br` é a única menção a esse
endereço no repositório, e ninguém sabe se a caixa existe. Mesma família deste
defeito, e só quem tem o domínio pode responder.

## Decisões que precisam de humano

**A recuperação de senha continua não existindo.** O que mudou é que a tela
parou de fingir que existe. Implementá-la de verdade depende da decisão sobre
e-mail (achado `61`), já registrada em "precisa de decisão sua" no `TODO.md`.

Vale o registro de que este é o caminho mais curto entre as duas decisões
pendentes: resolvido o e-mail, a recuperação de senha é a primeira coisa que
passa a caber.
