# Relatório — [61] A plataforma não envia e-mail

- **Data:** 2026-08-27
- **Status:** done (opção 1 — assumir e documentar)
- **Iterações de debug:** 1

## A premissa central se confirma

Não existe envio de e-mail em lugar nenhum. Procurei por provedor, por
dependência e por variável:

```
grep -rniE "resend|nodemailer|sendgrid|mailgun|postmark|@aws-sdk/client-ses|smtp" package.json src/ scripts/
(nada)
```

Os quatro modelos HTML continuam lá, e o `scripts/sync-email-templates.ts`
continua só validando arquivo. `email-templates/verify-email.html` usa
`{{verifyUrl}}` — placeholder, sem rota fixa. Nada disso foi tocado: é trabalho
pela metade, não trabalho jogado fora.

## A lista de telas da task estava desatualizada — e incompleta

Conferi tela por tela antes de editar, como manda o protocolo. O que achei:

| Tela | O que a task dizia | O que eu encontrei |
|---|---|---|
| `/auth/verify/check-email` | *"diz 'confira seu e-mail'"* | **já não dizia.** Hoje é um cartão "Cadastro concluído!" com botão para `/onboarding/person/step2` — mudou na task de acessibilidade (`fbb9fb7`) |
| `/auth/verify` | redirecionamento vazio | **confirmado**, `useEffect` que só faz `router.push(next ?? "/app")` |
| `/forgot-password` | não existe | resolvido na task `59` |
| **`/register/success`** | **não estava na lista** | **"Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua conta"**, e logo abaixo *"Não recebeu o e-mail? Verifique sua caixa de spam"* |

A tela que a task não citou era a única que mentia com todas as letras.

E uma quinta, que só apareceu porque varri o texto da interface inteira em vez
de confiar na lista: `CompanyVerificationPanel.tsx:78`, no estado "Verificação em
análise" — *"Você será notificado por e-mail."* A empresa manda os documentos,
lê isso, e vai esperar um aviso que não existe.

## As três telas eram inalcançáveis

Este é o fato que decidiu o formato da correção. Nenhuma das três é linkada de
lugar nenhum da aplicação:

- `/register` leva a `/onboarding/person/step1` ou `/onboarding/company/step1`;
- nenhum `router.push`, `redirect()` ou `href` em `src/` cita
  `/register/success`, `/auth/verify` ou `/auth/verify/check-email`;
- as únicas menções no repositório inteiro eram as **listas de rota dos próprios
  testes** (`a11y.spec.ts` e `responsive.spec.ts`), que as visitam por URL
  direta, e um comentário do `middleware.ts` que usava `/auth/verify` como
  exemplo de prefixo.

## O que foi feito

**Apaguei as três telas em vez de reescrevê-las.** A task, na opção 1, pedia
*"trocar o texto de `/auth/verify/check-email`, tirar o redirecionamento vazio de
`/auth/verify`"*. Reescrever o texto de uma tela que ninguém alcança é escrever
para ninguém: sobraria uma página órfã, mantida, varrida por acessibilidade e
por responsividade, existindo só para não mentir. O critério de aceite é
*"nenhuma tela pede para a pessoa conferir um e-mail que a plataforma não
envia"* — e tela que não existe não pede nada.

| Arquivo | Mudança |
|---|---|
| `src/app/(auth)/register/success/page.tsx` | **removido** |
| `src/app/auth/verify/page.tsx` | **removido** |
| `src/app/auth/verify/check-email/page.tsx` | **removido** |
| `src/components/company/CompanyVerificationPanel.tsx` | *"Você será notificado por e-mail"* → *"Nesta versão não sai aviso por e-mail — volte a esta tela para ver o resultado"* |
| `src/middleware.ts` | o comentário usava `/auth/verify` como exemplo; passou a usar `/auth/callback`, que existe |
| `e2e/a11y.spec.ts`, `e2e/responsive.spec.ts` | as três rotas saíram das listas, com o motivo escrito |
| `docs/manual/MANUAL_DE_USO.md` | linha nova na tabela de limitações: **"Não confere se o e-mail é seu"** |
| `docs/roteiro-demonstracao.md` | duas linhas: a de e-mail ganhou a nota das telas removidas, e entrou **"Não verifica o endereço de e-mail"**, com o detalhe de que o `verifiedAt` do schema é de empresa |
| `docs/manual/MANUAL_DE_USO.html` | refeito |

Se o envio de e-mail for implementado, as três telas voltam com um `git revert`
— e voltam melhores, porque aí terão o que dizer.

## O manual já dizia quase tudo

O critério 3 estava **quase** cumprido antes desta task, pelas tasks `22` e `59`.
O manual já registra, na seção "O que esta versão ainda não faz":

> **Não envia e-mail** — Nenhum: nem confirmação de cadastro, nem aviso de
> resposta, nem recuperação de senha. Você precisa entrar e olhar

O que faltava era a pergunta que a própria task previu para a defesa: *"como a
plataforma verifica o e-mail da usuária?"*. Agora está escrita, na mesma tabela:
**não confere se o e-mail é seu**, e o roteiro de demonstração explica por quê —
não há campo de e-mail verificado para pessoa; o `verifiedAt` do schema é de
empresa e quem verifica é a administração.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo; `/register/success` e `/auth/verify*` sumiram da lista de rotas |
| varredura de texto da interface | ✅ nenhuma ocorrência de "enviamos", "verifique seu e-mail", "caixa de spam" ou "link de confirmação" em `src/` |
| `e2e/links-internos.spec.ts` | ✅ passa — nenhum link apontava para as rotas removidas, que é o que autorizou removê-las |
| `npx vitest run` | ✅ 18 de 18 |
| suíte inteira | ✅ **465 passando, 3 pulados** — 12 a menos que os 477 anteriores, e o desconto é exatamente o esperado: 3 rotas × 2 projetos de acessibilidade + 3 rotas × 2 projetos de responsividade |

### A iteração de debug

Depois de apagar as rotas, o `npx tsc --noEmit` acusou três erros:

```
.next/types/validator.ts(71,39): error TS2307: Cannot find module
  '../../src/app/(auth)/register/success/page.js'
```

Não era o meu código: era o `validator.ts` **do build anterior**, gerado quando
as rotas ainda existiam, apontando para arquivos que eu tinha acabado de apagar.
`rm -rf .next` e o `tsc` passou limpo. Vale como nota para quem apagar rota neste
projeto — é o mesmo tipo de resíduo de `.next` que o `LOOP.md` já documenta para
o build com o dev server de pé.

## Critérios de aceite

- [x] **Nenhuma tela pede para a pessoa conferir um e-mail que a plataforma não
      envia** — três removidas, uma reescrita, e a varredura de texto confirma.
- [ ] ~~Se implementado: provedor e variável no `.env.example` e no README, mais
      teste E2E~~ — condicional, e não foi implementado. É a opção 2/3, que
      depende de decisão.
- [x] **O manual diz o que a plataforma faz e o que não faz quanto a e-mail** —
      dizia quase tudo; ganhou a linha sobre não verificar o endereço.

## Decisões que precisam de humano

**A opção 2 (verificação de e-mail e recuperação de senha) e a opção 3
(notificação de nova mensagem) continuam abertas**, e continuam registradas em
"precisa de decisão sua" no `TODO.md`. O que mudou é que a plataforma parou de
prometer o que não faz enquanto a decisão não sai.

Vale repetir o que a task `59` já observou: **a recuperação de senha é a
primeira coisa que passa a caber** assim que houver provedor de e-mail. E a
notificação de nova mensagem (`complaint-new-message.html`) é a de maior valor
para quem usa — numa ferramenta cujo ponto é o diálogo acontecer, hoje a usuária
só descobre a resposta se voltar por conta própria.
