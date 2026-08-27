# [56] A conta de empresa da demonstração não pode administrar a própria empresa

| Campo | Valor |
|---|---|
| **ID** | `56` |
| **Fase** | `9 — Fechamento` |
| **Risco** | médio (para a defesa, não para a segurança) |
| **Depende de** | — |
| **Achado em** | task `11` (matriz de autorização) |
| **Estimativa** | pequena |

## O que foi encontrado

`empresa@construtorax.com` é a única conta de empresa do seed, e o vínculo dela
tem papel **`MEMBER`**:

```
company_users: { company_id: Construtora X, role: MEMBER, email: empresa@construtorax.com }
```

`canManageCompany` e `canManageCompanyUsers` exigem `OWNER` ou `ADMIN`. Medido
com a conta real:

| Rota | Resposta |
|---|---|
| `PATCH /api/company/profile` | **403** |
| `POST /api/company/projects` | **403** |
| `PATCH /api/company/projects/[id]` | **403** |
| `POST /api/company/users` | **403** |
| `PATCH /api/company/users/[userId]` | **403** |

Ou seja: a conta que vai ser usada na demonstração **não consegue editar o
perfil da empresa, criar projeto nem convidar usuária**. Ela só lê e responde
relatos.

O código está certo — é o dado do seed que está errado para o uso pretendido.

## Por que importa

Duas consequências, uma prática e uma de cobertura:

1. **Na defesa**, qualquer tentativa de mostrar "a empresa edita o perfil" ou
   "a empresa cadastra um projeto" bate num 403 silencioso. Pior: a tela existe
   e o botão existe.
2. **Nos testes**, a checagem de *posse* em `/api/company/projects/[id]` e
   `/api/company/users/[userId]` — a que compara `companyId` do recurso com o da
   sessão — **é inalcançável**, porque a checagem de papel barra antes. Existe
   código de autorização sem cobertura possível com o seed atual.

## O que fazer

Em `scripts/seed.ts`, decidir entre:

1. **Promover a conta a `OWNER`** — um caractere, resolve a demonstração e
   destrava os testes de posse. É o que a maioria dos projetos faz: a conta que
   cria a empresa é dona dela.
2. **Criar uma segunda conta `OWNER`** e manter a `MEMBER` — melhor ainda,
   porque permite demonstrar *e* testar a diferença entre os dois papéis, que é
   uma funcionalidade real do produto.

A opção 2 custa poucas linhas a mais e é a única que deixa a distinção de papéis
visível na defesa.

## Critérios de aceite

- [ ] Existe conta de empresa com papel `OWNER` no seed.
- [ ] `PATCH /api/company/profile` responde 200 para ela.
- [ ] `e2e/api-authorization.spec.ts` atualizado: as linhas hoje marcadas como
      negadas para `empresa` passam a distinguir OWNER (permitido) de MEMBER
      (negado).
- [ ] Acrescentar teste de **posse** em `/api/company/projects/[id]`: OWNER de
      uma empresa não altera projeto de outra.
- [ ] `docs/autorizacao.md` atualizado com a coluna nova.

## Nota

Isto não é falha de segurança — é o contrário, a proteção está funcionando. É
falha de dado de demonstração, e por isso está na fase de fechamento, junto da
task `23`.
