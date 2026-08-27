# [09] E2E — fluxo de criação de reclamação (wizard de 4 etapas)

| Campo | Valor |
|---|---|
| **ID** | `09` |
| **Fase** | `3 — Testes` |
| **Risco** | baixo |
| **Depende de** | `08` |
| **Estimativa** | média |

## Objetivo

O fluxo central da plataforma — o que a dissertação vai demonstrar — fica
coberto de ponta a ponta.

## Evidência

`MANUAL_PLATAFORMA.md` documenta o wizard em 4 etapas:

1. Histórico de reclamações
2. Descrição da reclamação
3. Anexos (fotos e documentos)
4. Classificação e envio → tela de sucesso

Rota: `/app/complaints/new`. Upload via UploadThing, limite documentado de
10 MB por arquivo e 50 MB no total.

## Passos

1. `e2e/complaint-create.spec.ts`, autenticado como pessoa via storage state da
   task `08`.

2. Casos:
   - **caminho feliz**: preencher as 4 etapas → tela de sucesso → a reclamação
     aparece em `/app/complaints`;
   - **validação**: tentar avançar a etapa 2 com descrição vazia → erro
     visível, não avança;
   - **navegação**: voltar da etapa 3 para a 2 preserva o que foi digitado;
   - **anexo**: subir um arquivo pequeno de fixture (`e2e/fixtures/foto.jpg`)
     e confirmar que aparece na lista;
   - **limite**: arquivo acima do limite → rejeitado com mensagem clara.

3. Se o upload real depender de rede (UploadThing), marque esse caso com
   `test.skip` condicional a uma env var e documente. Não deixe teste
   intermitente na suíte principal.

## Critérios de aceite

- [ ] Caminho feliz passa e a reclamação criada é encontrada na listagem.
- [ ] Ao menos 2 casos de validação passam.
- [ ] Nenhum teste depende de estado deixado por outro teste — cada spec cria o
      que precisa.

## Verificação

```bash
npx playwright test e2e/complaint-create.spec.ts
```

## Riscos e armadilhas

Testes E2E que criam dados sujam o banco de seed. Ou limpe no `afterEach`, ou
gere identificadores únicos por execução para não colidir.
