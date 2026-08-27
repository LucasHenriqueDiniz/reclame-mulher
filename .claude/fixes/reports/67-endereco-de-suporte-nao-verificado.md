# Relatório — [67] O endereço de suporte não é verificável

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## A task esperava uma decisão. A pergunta tinha resposta

A task dizia, com razão, que só quem tem o domínio saberia se a caixa existe — e
por isso ficaria parada esperando alguém responder.

Mas antes de bloquear, fiz a pergunta ao DNS. **O domínio não existe.**

```
$ nslookup reclame-mulher.com.br 8.8.8.8
*** dns.google não encontrou reclame-mulher.com.br: Non-existent domain

$ nslookup reclame-mulher.com.br 1.1.1.1
*** one.one.one.one não encontrou reclame-mulher.com.br: Non-existent domain
```

NXDOMAIN no resolvedor local e em dois públicos. E o resolvedor funciona — o
controle responde normalmente:

```
$ nslookup -type=MX uergs.edu.br 8.8.8.8
uergs.edu.br   MX preference = 1, mail exchanger = aspmx.l.google.com
```

Sem domínio registrado não há servidor de e-mail, não há caixa, e a mensagem de
quem clicasse não sairia do lugar. O critério 1 — *"está registrado se
`suporte@reclame-mulher.com.br` recebe mensagem"* — está respondido: **não
recebe, e não pode receber.** Nenhuma decisão humana necessária.

## E não era um endereço, eram três domínios

Procurando o endereço da task, achei outros dois. Todos consultados, todos
NXDOMAIN:

| Domínio | Onde aparecia |
|---|---|
| `reclame-mulher.com.br` | `mailto:suporte@…` na tela de verificação — o da task |
| `comunicamulher.com.br` | `verificacao@…`, nas instruções de como pedir verificação |
| `reclamemulher.com.br` | `suporte@…` e uma página de ajuda, em `docs/especificacao-de-telas.md` |

O segundo é o que pesa. As instruções da tela de verificação diziam:

> 2. Envie e-mail para **verificacao@comunicamulher.com.br** com o assunto
>    *Verificação de empresa*
> 3. Anexe cópia do Cartão CNPJ e documento do responsável
> 4. Nossa equipe analisará em até 5 dias úteis

Esse é o **único caminho documentado** para uma empresa se verificar. Ele manda
anexar documentos — CNPJ e documento de identidade do responsável — a uma caixa
que não existe, e promete análise em cinco dias úteis que ninguém pode cumprir.
Não é um link morto: é um pedido de documento pessoal para lugar nenhum.

O caminho real é outro, e está no código: quem verifica é a administração, pelo
painel (`PATCH /api/admin/companies/[id]/verification`).

## Um detalhe que só aparece lendo o componente

O estado "Verificação rejeitada" dizia:

> Entre em contato pelo **e-mail abaixo** para mais informações.

Não havia e-mail abaixo. O endereço ficava no ramo `status === "none"`, que não
é renderizado quando a verificação foi rejeitada. A frase apontava para o vazio
antes mesmo de o domínio entrar na conversa.

## O que foi feito

| Onde | Antes | Agora |
|---|---|---|
| `src/app/app/company/verification/page.tsx` | *"Precisa de ajuda? [Entre em contato]"* com `mailto:` | *"Precisa de ajuda? Nesta versão não há canal de atendimento — fale com quem administra a plataforma."* |
| `CompanyVerificationPanel`, estado rejeitado | *"Entre em contato pelo e-mail abaixo"* | *"Peça mais informações a quem administra a plataforma."* |
| `CompanyVerificationPanel`, instruções | mandar documentos por e-mail, análise em 5 dias | *"Avise quem administra a plataforma. Nesta versão a verificação é feita direto pela administração: não há caixa de e-mail para onde mandar"* |
| `docs/especificacao-de-telas.md` | seção "Contato e Suporte" com e-mail, WhatsApp, redes e página de ajuda | a mesma seção dizendo que **nenhum** desses canais existe, com o resultado do DNS |

O prazo de cinco dias úteis saiu junto: não havia como cumpri-lo, e prometer
prazo é pior do que não prometer nada.

Nenhum endereço novo foi escrito, pela mesma razão da task `59`: não se troca um
canal morto por outro que ninguém verificou. *"Quem administra a plataforma"* é
verdade conferível — existe conta de administração, e é ela que verifica.

## O que ficou de propósito

`admin@comunicamulher.com.br`, no seed e nos testes. É **identificador de
login**, não promessa de contato: ninguém precisa que ele receba mensagem para
entrar na conta. Trocá-lo mexeria no seed, nos testes e no roteiro da
demonstração sem corrigir defeito nenhum.

E o único `mailto:` que sobrou em `src/`: `CompanyContactsCard.tsx:42`, que monta
`mailto:${company.email}` com o **e-mail da própria empresa**, cadastrado por
ela. Isso é dado do perfil, não canal da plataforma — se não funcionar, quem
respondeu errado foi a empresa, e a plataforma não prometeu nada.

## Verificação

| Comando | Resultado |
|---|---|
| consulta de DNS | ✅ três domínios, três NXDOMAIN, em três resolvedores, com controle positivo |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `npx vitest run` | ✅ 31 de 31 |
| suíte inteira | ✅ **469 passando, 3 pulados** — a varredura de acessibilidade cobre `/app/company/verification` e continuou limpa com o texto novo |
| varredura final | ✅ nenhum endereço de contato da plataforma em `src/`; o único `mailto:` restante é o da própria empresa, explicado acima |

## Critérios de aceite

- [x] **Está registrado se `suporte@reclame-mulher.com.br` recebe mensagem** —
      não recebe: o domínio não está registrado. Medido, não suposto.
- [x] **Se não recebe, nenhuma tela manda escrever para lá** — e nem para os
      outros dois domínios, que estavam no mesmo estado.

## Pendências e achados fora de escopo

Nenhuma task nova. Fica registrado que **a plataforma não tem nenhum canal de
contato** — o Manual de Uso já dizia isso na lista de limitações, e agora as
telas concordam com ele. Se um canal for criado, os três textos mudados aqui são
onde ele precisa aparecer.
