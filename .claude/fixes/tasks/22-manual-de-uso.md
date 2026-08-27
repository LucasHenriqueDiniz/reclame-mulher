# [22] Manual de Uso da Plataforma — produto da dissertação

| Campo | Valor |
|---|---|
| **ID** | `22` |
| **Fase** | `8 — Documentação` |
| **Risco** | baixo |
| **Depende de** | `15`, `21` |
| **Estimativa** | longa |

## Objetivo

Entregar a primeira versão do **Manual de Uso** — documento voltado à usuária
final, com telas ilustradas — que é produto da dissertação da Paloma.

## Contexto

Prazo combinado com o Prof. Marc (UERGS, orientador): primeira versão até o
fim de setembro de 2026. Defesa prevista para novembro de 2026.

O `MANUAL_PLATAFORMA.md` que existe hoje (999 linhas) **não é um manual de
uso**: é uma especificação de telas. Ele descreve elementos de interface
("Header Principal", "Hero Section", "Carrossel de Processo") em linguagem de
quem construiu o sistema. Serve de base para o inventário de telas, mas precisa
ser reescrito em outra voz.

## Diferença que define esta task

| Especificação (o que existe) | Manual de uso (o que falta) |
|---|---|
| "Hero Section com CTA" | "Para registrar sua primeira reclamação, clique em X" |
| Lista de elementos da tela | Passo a passo numerado de uma tarefa |
| Organizado por tela | Organizado por objetivo da usuária |
| Sem imagens | Uma captura por passo, com destaque no ponto de clique |
| Voz técnica | Voz direta, segunda pessoa, sem jargão |

## Pré-condições

- [ ] Task `15` fechada — não faz sentido fotografar telas que ainda vão mudar.
- [ ] O banco tem dados de seed que rendem capturas apresentáveis (sem
      `lorem ipsum`, sem "Empresa Teste 1").

## Passos

1. **Estrutura por objetivo**, não por tela:
   - O que é a plataforma e para quem
   - Criar sua conta
   - Registrar uma reclamação (passo a passo do wizard)
   - Acompanhar sua reclamação e conversar com a empresa
   - Quando a reclamação é resolvida
   - Para empresas: receber e responder
   - Perguntas frequentes
   - Onde buscar ajuda

2. **Capturas de tela**: uma por passo relevante. Salve em
   `docs/manual/img/` com nome descritivo. Use as ferramentas de preview sobre
   o build de produção. Faça as capturas em desktop **e** as principais em
   mobile — o público usa celular.

3. **Anonimize.** Nenhuma captura pode conter dado pessoal real. Use as contas
   de seed.

4. **Linguagem.** Segunda pessoa, frases curtas, sem termo técnico. Nada de
   "wizard", "dashboard", "onboarding" — escreva "formulário em etapas",
   "painel", "primeiros passos".

5. **Acessibilidade do próprio manual**: toda imagem com legenda descritiva. O
   manual de uma plataforma que se propõe acessível não pode ser inacessível.

6. Gere `docs/manual/MANUAL_DE_USO.md` e uma versão distribuível. Já existe um
   `MANUAL_PLATAFORMA.html` — reaproveite o estilo se ele estiver bom.

7. Não apague o `MANUAL_PLATAFORMA.md`: mova para
   `docs/especificacao-de-telas.md`. Ele continua útil como especificação.

## Critérios de aceite

- [ ] `docs/manual/MANUAL_DE_USO.md` cobre as 8 seções acima.
- [ ] Todo passo de tarefa tem captura de tela correspondente.
- [ ] Nenhuma captura contém dado pessoal real.
- [ ] Nenhum jargão técnico não explicado no corpo do texto.
- [ ] Toda imagem tem legenda descritiva.

## Verificação

Revisão manual. Teste prático: alguém que nunca viu a plataforma consegue
registrar uma reclamação seguindo só o manual?

## Se ficar bloqueado

Decisões que são do usuário e da Paloma, não suas: título do documento,
formato final de entrega (PDF, impresso, online), se inclui a área
administrativa, e se leva identidade visual da UERGS. Pergunte antes de assumir.
