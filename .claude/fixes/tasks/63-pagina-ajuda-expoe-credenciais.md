# [63] `/ajuda` entrega a senha do administrador a quem não está logado

| Campo | Valor |
|---|---|
| **ID** | `63` |
| **Fase** | `2 — Correções pontuais` |
| **Risco** | **alto** |
| **Depende de** | — |
| **Achado em** | task `22` (capturas do manual) |
| **Estimativa** | pequena |

## O que foi encontrado

`src/app/ajuda/page.tsx` é uma página de depuração. Ela lista as contas do seed
e imprime a senha padrão, com botão de copiar:

```tsx
Todos os usuários de teste usam a mesma senha: <strong>senha123</strong>
...
<code>senha123</code>
<CopyButton text="senha123" />
```

Entre as contas listadas está `admin@comunicamulher.com.br`, marcada `ADMIN`.

Três fatos que, juntos, fazem disto um problema e não uma inconveniência:

1. **É pública.** `/ajuda` está na lista de exceções do `src/middleware.ts`
   (linha 36). Não exige sessão. A captura desta task foi feita **deslogada**.
2. **Não tem gate de ambiente.** Não há `NODE_ENV`, nem `notFound()`, nem
   qualquer condição. Ela entra no `next build` exatamente como está e é
   servida em produção.
3. **Ninguém a linka.** Nenhum arquivo de `src/` aponta para `/ajuda`. Ela não
   aparece em menu nenhum — o que significa que ela não vai ser notada por
   quem navegar pelo produto, e vai continuar lá.

## Por que importa

Um deploy que tenha rodado `db:seed` — que é o que a documentação manda fazer
para popular a demonstração — publica um endereço onde qualquer visitante lê o
e-mail do administrador e a senha dele, e clica para copiar os dois.

Mesmo sem o seed aplicado, a página revela a convenção de nomes das contas e a
senha padrão que o `scripts/seed.ts` usa.

Vale dizer o que **não** é: não é uma falha de autorização. O modelo de
autorização documentado em `docs/autorizacao.md` está correto e testado. É uma
página de depuração que ficou num caminho público.

## O que fazer

Uma decisão de produto, três caminhos:

1. **Apagar a página.** O `README.md` já lista as contas de teste, e é lá que
   quem desenvolve procura. É o caminho mais simples e o que eu recomendaria.
2. **Fechar por ambiente**, se a conveniência valer: `if (process.env.NODE_ENV
   === "production") notFound()` no topo do componente de servidor. Cuidado
   para não deixar isso só no cliente — precisa ser decidido no servidor, senão
   o conteúdo vai no HTML mesmo sem ser exibido.
3. **Transformar em ajuda de verdade** — uma página voltada à usuária, sem
   credencial nenhuma. Isso resolve de quebra o vazio que a task `22` encontrou:
   o manual precisa de um lugar para onde apontar em "onde buscar ajuda", e hoje
   não existe.

Escolhida a opção, tirar `/ajuda` da lista de páginas públicas do middleware se
ela deixar de precisar ser pública.

## Critérios de aceite

- [ ] Nenhuma senha aparece em resposta HTTP de rota pública. Conferir com
      `curl -s http://localhost:5000/ajuda | grep -i senha123` no build de
      produção — tem que voltar vazio.
- [ ] Se a página continuar existindo, ela não lista credencial.
- [ ] Teste que trava o comportamento, para não voltar.

## Nota sobre o manual

A task `22` planejava usar `/ajuda` na seção "onde buscar ajuda" do Manual de
Uso. Não usou, justamente por isto. O manual registra que a plataforma **não
tem** canal de ajuda para a usuária — o que se conecta ao achado
[`61`](61-email-nao-existe.md), já que também não há e-mail.
