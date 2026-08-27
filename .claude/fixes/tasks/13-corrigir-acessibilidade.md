# [13] Corrigir as violações de acessibilidade encontradas

| Campo | Valor |
|---|---|
| **ID** | `13` |
| **Fase** | `4 — Acessibilidade` |
| **Risco** | médio |
| **Depende de** | `12` |
| **Estimativa** | longa |

## Objetivo

Zero violações `critical` e `serious` do axe em todas as rotas, e o teste de
acessibilidade passa a falhar a suíte se alguém regredir.

## Evidência

Além do que a task `12` medir, `STATUS_FINAL_PRODUCAO.md` já aponta como
pendente:

- aria-labels em links de ícone (4 casos);
- revisão do formulário de login (2 casos);
- teste com leitor de tela real (nunca feito).

E `RELATORIO_AUDITORIA_FINAL.md` detalha 10 problemas na categoria
acessibilidade: 5 links sem texto visível, 4 inputs sem label, 1 botão sem
label, 6 páginas sem skip-to-main, 2 casos sem `h1`.

## Pré-condições

- [ ] `reports/12-a11y-baseline.json` existe.

## Passos

1. Trabalhe na ordem de impacto definida pela task `12`, em lotes por tipo de
   violação — não por página. Corrigir "todos os links de ícone" de uma vez é
   mais seguro e mais rápido que ir página a página.

2. Padrões a aplicar:
   - link ou botão só com ícone → `aria-label` descritivo (o que a ação faz,
     não o nome do ícone);
   - input → `<label htmlFor>` associado, ou `aria-label` quando o rótulo
     visual for impossível;
   - toda página → exatamente um `h1`, e hierarquia de headings sem pular
     nível;
   - skip-to-main no layout compartilhado, não repetido por página;
   - erro de formulário → `aria-describedby` ligando o input à mensagem, e
     `aria-invalid`.

3. Escreva os textos em **português**, na mesma voz do resto da interface. Um
   `aria-label` mal escrito é pior que nenhum para quem usa leitor de tela.

4. Ao final, **vire a chave**: altere `e2e/a11y.spec.ts` para falhar quando
   houver violação `critical` ou `serious`. A partir daqui é regressão barrada.

5. Teste manual de teclado em pelo menos 3 fluxos: login, criação de
   reclamação, resposta da empresa. Só teclado, sem mouse. Registre se dá para
   completar cada fluxo.

## Critérios de aceite

- [ ] 0 violações `critical` e 0 `serious` em todas as rotas varridas.
- [ ] `e2e/a11y.spec.ts` falha se uma violação for reintroduzida.
- [ ] Os 3 fluxos são completáveis só com teclado, com foco sempre visível.
- [ ] `npm run check` continua passando.

## Verificação

```bash
npx playwright test e2e/a11y.spec.ts
```

```bash
npm run check
```

## Riscos e armadilhas

- `aria-label` em elemento que já tem texto visível **substitui** o texto para
  o leitor de tela. Não adicione por adicionar.
- Adicionar `role` errado piora a situação. Se não tiver certeza do papel,
  prefira HTML semântico nativo (`button`, `nav`, `main`) a `role=`.

## Se ficar bloqueado

Violação vinda de biblioteca de terceiro (Radix/shadcn) pode não ser corrigível
no código do projeto. Documente, marque como aceita com justificativa, e siga.
