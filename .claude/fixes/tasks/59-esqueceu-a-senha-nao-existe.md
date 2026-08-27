# [59] "Esqueceu a senha?" leva a lugar nenhum

| Campo | Valor |
|---|---|
| **ID** | `59` |
| **Fase** | `2 — Autenticação` |
| **Risco** | **alto** (de produto, não de segurança) |
| **Depende de** | — |
| **Achado em** | task `18` (build de produção) |
| **Estimativa** | média |

## O que foi encontrado

`src/app/(auth)/login/page.tsx:154`:

```tsx
<Link href="/forgot-password">Esqueceu a senha?</Link>
```

**A rota `/forgot-password` não existe.** Não há diretório em `src/app`, e ela
não aparece no output do `next build` (76 rotas listadas, nenhuma delas essa).

Medido no build de produção:

| Quem clica | O que acontece |
|---|---|
| **Sem sessão** — o único caso que importa | `307` → `/login`. Volta para a mesma tela, sem mensagem nenhuma |
| Com sessão | `404` |

O redirecionamento vem do middleware: `/forgot-password` não está na lista de
páginas públicas, então quem não tem sessão é mandada para o login. O efeito é
um botão que parece funcionar e não faz nada.

## Por que importa mais do que parece

Quem clica nesse link está trancada para fora da própria conta. Numa plataforma
onde a conta guarda denúncias que a pessoa fez contra uma empresa, perder o
acesso não é inconveniência de cadastro.

E o botão não falha com erro: ele **recarrega a mesma página**. A leitura
natural é "cliquei errado" ou "o site travou", e a tentativa se repete.

## O que fazer

Duas saídas, e a escolha é de produto:

1. **Implementar a recuperação de senha.** É o certo, e é o que o link promete.
   Envolve: rota `/forgot-password` (pública no middleware), token de uso único
   com validade curta, envio de e-mail (o projeto já tem infraestrutura de
   e-mail — ver `scripts/sync-email-templates.ts`), e tela de nova senha.
   Precisa de limite de tentativas, como o login já tem.
2. **Remover o link até existir a funcionalidade**, e trocar por uma orientação
   verdadeira ("Escreva para *contato@…* para recuperar o acesso").

A opção 2 é honesta e custa dez minutos. A opção 1 é a resposta de verdade.
**O que não pode continuar é a terceira, que é a de hoje: prometer e não
entregar.**

## Critérios de aceite

- [ ] Nenhum link da aplicação aponta para rota inexistente — vale um teste que
      colete os `href` internos e confira cada um contra o build.
- [ ] Se a opção 1: fluxo completo com teste E2E, e o token não pode ser
      reutilizável nem adivinhável.
- [ ] Se a opção 2: o texto diz o que fazer de verdade, e some quando a
      funcionalidade chegar.

## Nota

`/forgot-password` foi encontrado por acaso, ao ler a árvore de acessibilidade
da tela de login. Isso levantou a pergunta óbvia — "haverá outros?" — e ela foi
respondida na própria task `18`, com uma varredura de todos os `href` internos
contra as rotas que existem:

```
42 rotas existentes, 24 destinos internos usados
QUEBRADOS: 1
  /forgot-password  <- src/app/(auth)/login/page.tsx
```

**É o único.** Isso é bom e é ruim: bom porque a superfície está limpa, ruim
porque significa que este link solitário passou meses sem ser notado. Vale
transformar a varredura em teste permanente junto com a correção.
