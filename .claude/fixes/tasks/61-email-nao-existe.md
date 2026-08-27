# [61] A plataforma não envia e-mail — e três telas fingem que envia

| Campo | Valor |
|---|---|
| **ID** | `61` |
| **Fase** | `2 — Autenticação` |
| **Risco** | médio (de produto e de defesa, não de segurança) |
| **Depende de** | — |
| **Achado em** | task `20` (ambiente e deploy) |
| **Estimativa** | média |

## O que foi encontrado

**Não existe envio de e-mail em nenhum lugar do código.** Nenhuma dependência de
provedor (Resend, Nodemailer, SES), nenhuma variável de ambiente, nenhuma
chamada de envio.

O que existe:

| Arquivo | O que é |
|---|---|
| `email-templates/welcome.html` | modelo, nunca enviado |
| `email-templates/verify-email.html` | modelo, nunca enviado |
| `email-templates/password-reset.html` | modelo, nunca enviado |
| `email-templates/complaint-new-message.html` | modelo, nunca enviado |
| `scripts/sync-email-templates.ts` | **lista e valida** os arquivos acima. Não envia nada; o cabeçalho do próprio script diz isso |

E três telas dependem de um e-mail que nunca chega:

| Rota | O que faz hoje |
|---|---|
| `/auth/verify` | `useEffect` que faz `router.push(next ?? "/app")`. **Redirecionamento vazio** — não verifica nada |
| `/auth/verify/check-email` | diz "confira seu e-mail" |
| `/forgot-password` | **não existe** — ver task `59` |

O `verifiedAt` do schema é de **empresa**, verificada pela administração. Não há
campo de e-mail verificado para pessoa.

## Por que importa

1. **Na defesa.** "Como a plataforma verifica o e-mail da usuária?" é pergunta
   provável. A resposta honesta hoje é "não verifica", e é melhor que ela esteja
   escrita antes de ser perguntada.
2. **Na notificação.** `complaint-new-message.html` existe porque alguém pensou
   em avisar a usuária quando a empresa responde. Sem isso, ela só descobre se
   voltar à plataforma por conta própria — numa ferramenta cujo valor é
   justamente o diálogo acontecer.
3. **No cadastro.** A tela "confira seu e-mail" manda a pessoa esperar por algo
   que não vem.

## O que fazer

Escolha de produto, em ordem de custo:

1. **Assumir e documentar.** Trocar o texto de `/auth/verify/check-email`, tirar
   o redirecionamento vazio de `/auth/verify`, e registrar no manual que a
   verificação de e-mail não faz parte do escopo atual. Custa uma hora.
2. **Implementar o mínimo:** verificação de e-mail no cadastro e recuperação de
   senha (task `59`). Precisa de provedor, variável de ambiente, token de uso
   único e as duas telas de verdade.
3. **Implementar também a notificação** de nova mensagem, que é a de maior valor
   para a usuária e a mais fácil de justificar na dissertação.

**A opção 1 não pode ser pulada**, seja qual for a escolha: telas que prometem
e-mail sem enviar são pior do que não ter a funcionalidade.

## Critérios de aceite

- [ ] Nenhuma tela pede para a pessoa conferir um e-mail que a plataforma não
      envia.
- [ ] Se implementado: o provedor e a variável entram no `.env.example` e no
      README, e existe teste E2E do fluxo.
- [ ] O manual da plataforma (task `22`) diz o que a plataforma faz e o que não
      faz quanto a e-mail.

## Nota

Os modelos HTML são bons e estão prontos. Isto não é trabalho jogado fora — é
trabalho pela metade, que precisa da outra metade ou de um aviso.
