# [52] As quatro etapas do wizard ficam no DOM ao mesmo tempo

| Campo | Valor |
|---|---|
| **ID** | `52` |
| **Fase** | `4 — Acessibilidade` |
| **Risco** | médio |
| **Depende de** | — |
| **Achado em** | task `09` (E2E do wizard) |
| **Estimativa** | pequena |

## O que foi encontrado

O wizard de `/app/complaints/new` é um carrossel: os quatro painéis são
renderizados juntos, lado a lado, e `transform: translateX(-N%)` desliza o
trilho. O que esconde as etapas fora da vez é só o `overflow-hidden` do pai.

Medido no navegador, na etapa 1:

```
PAINEIS: [
  {"etapa":1,"focaveis":3,"ariaHidden":null,"inert":false},
  {"etapa":2,"focaveis":3,"ariaHidden":null,"inert":false},
  {"etapa":3,"focaveis":2,"ariaHidden":null,"inert":false},
  {"etapa":4,"focaveis":6,"ariaHidden":null,"inert":false}
]
FOCO: {"focado":"complaint-title","visivelParaPlaywright":true}
```

Ou seja: estando na etapa 1, **11 controles das etapas 2, 3 e 4 continuam
focáveis**, nenhum painel tem `aria-hidden` nem `inert`, e o campo de título da
etapa 2 aceita foco normalmente.

## Por que isso importa

- **Teclado**: quem navega por Tab sai do botão "Continuar" e cai em campos que
  não estão na tela. O foco some da vista — a pessoa digita às cegas.
- **Leitor de tela**: o conteúdo das quatro etapas é anunciado de uma vez. A
  ideia de "etapa" desaparece; vira um formulário só, longo e confuso.
- É falha de WCAG 2.4.3 (ordem de foco) e 2.4.7 (foco visível), e é
  exatamente o tipo de coisa que a task `12` vai apontar na varredura.

Vale registrar o contexto: a plataforma existe para mulheres relatarem
problemas, muitas em celular e algumas com pouca familiaridade com formulário
na web. Um formulário que "pula" para campos invisíveis é abandono garantido.

## O que fazer

Marcar os painéis fora da etapa atual como inertes. O caminho mais direto, em
`src/app/app/complaints/new/_components/new-complaint-content.tsx`:

```tsx
<div
  className="w-full flex-shrink-0 px-1"
  style={{ width: "100%" }}
  {...(step !== 2 ? { inert: "", "aria-hidden": true } : {})}
>
```

`inert` tira do Tab e do leitor de tela de uma vez só, e é suportado nos
navegadores atuais. Alternativa se der problema: `tabIndex={-1}` em cada
controle mais `aria-hidden`.

Marcar também o trilho com `role="group"` e `aria-label` da etapa atual, para
que a mudança de etapa seja anunciada.

## Critérios de aceite

- [ ] Na etapa 1, `document.querySelectorAll` dentro dos painéis 2–4 não
      encontra nenhum elemento focável (ou todos estão sob `inert`).
- [ ] Tab a partir do botão "Continuar" não entra em campo fora da tela.
- [ ] A suíte `e2e/complaint-create.spec.ts` continua verde — inclusive o
      helper `etapaAtual`, que lê o deslocamento do trilho.
- [ ] A animação de transição continua funcionando.

## Armadilha

`e2e/complaint-create.spec.ts` preenche campos da etapa 2 **estando na etapa
2**, então não depende do defeito. Mas o helper `etapaAtual` lê o `style` do
trilho: se a correção trocar o carrossel por renderização condicional, o helper
precisa mudar junto — e aí o teste fica mais simples, não mais complicado.
