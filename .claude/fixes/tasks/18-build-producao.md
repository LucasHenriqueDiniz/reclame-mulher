# [18] Build de produção limpo e reprodutível

| Campo | Valor |
|---|---|
| **ID** | `18` |
| **Fase** | `7 — Build e produção` |
| **Risco** | médio |
| **Depende de** | `17` |
| **Estimativa** | média |

## Objetivo

`npm run build` passa do zero, sem warning suprimido, e o que o build gera é o
que roda em produção.

## Evidência

O `npm run build` usa `next build --turbopack`. O `next.config.ts` está entre os
18 arquivos modificados **não commitados** — ou seja, a configuração de build
atual não está versionada e ninguém sabe o que mudou nela.

Verifique também se o `next.config.ts` contém alguma escapatória do tipo:

```ts
typescript: { ignoreBuildErrors: true }
eslint:     { ignoreDuringBuilds: true }
```

Se contiver, o build está passando por decreto, não por mérito.

## Passos

1. Leia o `next.config.ts` inteiro. Remova qualquer supressão de erro de
   TypeScript ou de ESLint no build. Se ao remover o build quebrar, **isso é o
   trabalho da task** — conserte os erros.

2. Build limpo do zero:

   ```bash
   rm -rf .next && npm run build
   ```

3. Confira o output: rotas marcadas como estáticas versus dinâmicas fazem
   sentido? Página que deveria ser estática virou dinâmica por causa de um
   `cookies()` mal colocado?

4. Suba o build de produção e teste os fluxos principais:

   ```bash
   npm run start
   ```

   Diferenças entre `dev` e `build` são comuns em App Router — hidratação,
   `remotePatterns` de imagem, variáveis de ambiente que só existem em dev.

5. Registre no relatório o tempo de build e o tamanho dos bundles das rotas mais
   pesadas.

## Critérios de aceite

- [ ] `npm run build` termina com sucesso, sem `ignoreBuildErrors` nem
      `ignoreDuringBuilds`.
- [ ] A app sobe com `npm run start` e os 3 logins funcionam nela.
- [ ] Nenhum erro de hidratação no console em produção.
- [ ] `next.config.ts` está commitado.

## Verificação

```bash
npm run build
```

```bash
npm run start
```

## Riscos e armadilhas

Erro de hidratação só aparece no console do navegador, não no terminal do build.
Verifique com `read_console_messages` sobre o build de produção, não sobre o dev.
