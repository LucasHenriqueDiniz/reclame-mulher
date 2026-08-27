# [20] Ambiente, variáveis e prontidão para deploy

| Campo | Valor |
|---|---|
| **ID** | `20` |
| **Fase** | `7 — Build e produção` |
| **Risco** | médio |
| **Depende de** | `18` |
| **Estimativa** | média |

## Objetivo

Alguém que clone o repositório consegue subir o projeto seguindo o README, e o
deploy não depende de conhecimento que só está na cabeça do desenvolvedor.

## Evidência

Existem `.env` (400 bytes, ignorado pelo git — correto) e `.env.example`
(781 bytes, versionado). O `.env.example` sendo **maior** que o `.env` sugere
divergência: ou o `.env` local está incompleto, ou o example descreve variáveis
que não são mais usadas.

O projeto depende de serviços externos: Neon (PostgreSQL), UploadThing
(anexos) e envio de e-mail (existe `email-templates/` e
`scripts/sync-email-templates.ts`). Nenhum deles está documentado como
pré-requisito de setup.

## Passos

1. Levante todas as variáveis realmente lidas pelo código:

   ```bash
   grep -rn "process.env." src middleware.ts scripts drizzle.config.ts | grep -o "process\.env\.[A-Z_]*" | sort -u
   ```

2. Reconcilie com o `.env.example`: toda variável usada precisa estar lá, com
   comentário dizendo para que serve e se é obrigatória. Variável do example que
   ninguém usa, remova.

3. **Nunca** copie valor real do `.env` para o `.env.example`. Use
   placeholders.

4. Valide as variáveis na inicialização, com um schema Zod — falhar no boot com
   mensagem clara é muito melhor que quebrar em runtime numa rota qualquer.

5. Atualize o `README.md` com a seção de setup, na ordem exata:
   pré-requisitos → `npm install` → copiar `.env.example` → `npm run db:push`
   ou `db:migrate` → `npm run db:seed` → `npm run dev` → contas de teste.

6. Verifique se as variáveis `NEXT_PUBLIC_*` não expõem nada sensível — tudo
   com esse prefixo vai para o bundle do cliente.

## Critérios de aceite

- [ ] Toda `process.env.*` usada no código consta do `.env.example`.
- [ ] `.env.example` não tem nenhum segredo real.
- [ ] O README descreve o setup do zero e foi seguido literalmente para
      confirmar que funciona.
- [ ] Falta de variável obrigatória produz erro claro no boot, não 500 opaco.

## Verificação

```bash
grep -rn "process.env." src middleware.ts scripts | grep -o "process\.env\.[A-Z_]*" | sort -u
```

```bash
npm run build
```

## Riscos e armadilhas

Se durante a auditoria você encontrar um segredo real commitado no histórico do
git, **pare**: isso exige rotação de credencial e é decisão do usuário. Não
tente reescrever histórico por conta própria.
