# [67] A tela de verificação manda escrever para uma caixa que talvez não exista

| Campo | Valor |
|---|---|
| **ID** | `67` |
| **Fase** | `2 — Correções pontuais` |
| **Risco** | baixo |
| **Depende de** | — |
| **Achado em** | task `59` ("Esqueceu a senha?") |
| **Estimativa** | pequena, depois de uma resposta |

## O que foi encontrado

`src/app/app/company/verification/page.tsx:89`:

```tsx
<a href="mailto:suporte@reclame-mulher.com.br">Entre em contato</a>
```

É a **única** menção a esse endereço no repositório. Ele não aparece no rodapé,
nem nos termos, nem na política de privacidade, nem no `README.md`. E o domínio
`reclame-mulher.com.br` não é usado em mais lugar nenhum — nem sequer é o
domínio da conta de administração do seed, que é `@comunicamulher.com.br`.

Some-se o que já está medido: a plataforma **não envia e-mail** (achado `61`), e
o próprio Manual de Uso registra, na lista do que a versão não faz, que ela
**não tem canal de atendimento**.

## Por que importa

É a mesma família do defeito que a task `59` corrigiu: **promessa que o produto
não pode cumprir**. A diferença é que ali dava para provar o defeito lendo a
árvore de rotas, e aqui não — só quem tem o domínio sabe se a caixa existe.

Quem clica está numa situação específica: é uma empresa cuja verificação
emperrou, procurando ajuda. Se a mensagem cai no vazio, ela não recebe nem erro:
recebe silêncio.

## O que fazer

Depende de uma resposta que só quem toca o projeto tem:

- **Se a caixa existe e alguém lê**, não há nada a corrigir no código. Vale só
  registrar o endereço no `README.md`, para deixar de ser um literal solitário
  no meio de uma tela.
- **Se não existe**, o texto vira o mesmo tipo de verdade que a task `59`
  escreveu na tela de login, ou aponta para um canal que exista de fato.

## Critérios de aceite

- [ ] Está registrado se `suporte@reclame-mulher.com.br` recebe mensagem.
- [ ] Se não recebe, nenhuma tela manda escrever para lá.

## Nota

Nenhum teste pega isto, e vale dizer por quê: a varredura de
`e2e/links-internos.spec.ts` confere destino **interno** contra rota que existe.
`mailto:` sai do produto, e se uma caixa de e-mail responde ou não é fato do
mundo, não do repositório. Achado deste tipo se resolve perguntando.
