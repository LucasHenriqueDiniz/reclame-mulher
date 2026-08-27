# Relatório — [21] Consolidar a documentação contraditória da raiz

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## O número

| | Antes | Agora |
|---|---|---|
| Arquivos `.md` na raiz | **21** (mais um `.txt`) | **5** |
| Arquivos em `docs/` | 8, misturando vivo e datado | **6 vivos** + `historico/` |
| Links internos quebrados | — | **0 de 154** |
| Itens do `TODO.md` com caixa `[ ]` e corpo "Concluído" | **63** | 0 |

## O que estava errado, e não era só desorganização

O `TODO.md` de julho tinha 91 itens. Sessenta e três deles com a caixa `[ ]`
desmarcada e o corpo dizendo, em texto, que estavam prontos. Isso é fácil de ler
como descuido de digitação. Não era.

Entre os itens **marcados** como feitos:

```
- [x] Criar testes automatizados para auth.        Status: ✅ E2E VALIDADO
- [x] Criar testes automatizados para reclamacoes. Status: ✅ E2E VALIDADO
- [x] Criar testes automatizados para blog.        Status: ✅ VALIDADO
- [x] Criar testes automatizados para admin/auditoria. Status: ✅ VALIDADO
```

O repositório não tinha **um único arquivo de teste**. Foi o que a task `07`
encontrou.

E mais três afirmações que o código desmente:

| Afirmação | O que o código diz |
|---|---|
| "Status transitions: OPEN → **IN_PROGRESS** → RESOLVED" | o enum de relato é `OPEN`, `RESPONDED`, `RESOLVED`, `CANCELLED`. `IN_PROGRESS` é status de **projeto** |
| "RLS policies implementadas" | não há RLS. Toda a autorização é código de aplicação |
| "10MB por arquivo, 50MB total" | o cliente aceita 5 MB, o servidor aceita 4 MB. Nenhum dos dois é 10 |

A terceira virou achado próprio — [`62`](../tasks/62-limites-de-upload-divergem.md).

## A classificação

Cada arquivo em um de três destinos.

### Vivo — 5 na raiz, 6 em `docs/`

```
README.md              porta de entrada
TODO.md                único backlog vivo
CHANGELOG.md           histórico de versões
AGENTS.md              instruções para agentes (fora do escopo, só links ajustados)
MANUAL_PLATAFORMA.md   insumo da dissertação (task 22)

docs/arquitetura.md              novo
docs/testes.md                   novo
docs/acessibilidade.md           novo
docs/autorizacao.md              da task 16
docs/api-erros.md                da task 17
docs/acessibilidade-inclusiva.md mantido
```

`docs/arquitetura.md` nasceu de `docs/project-status.md`, de março — o melhor
documento que o repositório tinha, e ainda assim desatualizado em dois pontos
que conferi contra o código, não contra a memória:

- **Onboarding.** Dizia que `onboardingCompletedAt` não era persistido. É: as
  server actions de `onboarding/person/step2` e `onboarding/company/step2`
  gravam o campo. O documento estava certo em março e envelheceu.
- **Admin.** Dizia que auditoria e verificação de empresa "não existem de
  verdade". Existem, com rota de API e tela. O que não existe é **abrangência**:
  `audit_logs` só é escrito pela verificação de empresa — mudança de status de
  relato, moderação e edição de perfil não deixam rastro. Isso virou linha de
  backlog, com o escopo certo.

### Histórico — 18 arquivos em `docs/historico/`

Movidos **sem uma edição de conteúdo**, cada um com uma linha no topo dizendo a
data e que não é atualizado. Onze deles foram escritos no mesmo dia, 07/07/2026:
é a sprint de documentação que originou as contradições.

`docs/historico/README.md` os indexa e diz, com todas as letras, o que ler
neles: **intenção, não medição.**

Três não são relatórios e sim insumos do manual — `GUIA_RAPIDO.md`,
`FLUXOS_VISUAIS.md`, `LEIA_ME_PRIMEIRO.md`. Vão para o histórico como material
de origem que a task `22` revisa.

### Apagados — 3

`GITHUB_PUSH_SUMMARY.md` (resumo de um push, que o git registra melhor),
`INDICE_DOCUMENTACAO.md` e `README_DOCUMENTACAO.txt` (índices da estrutura que
esta task desfez). Conferi seção por seção antes: nenhum tinha conteúdo único.

`LEIA_ME_PRIMEIRO.md` estava na lista de apagar da task e **não** apaguei. Tem
um glossário compacto de termos do domínio que o manual vai querer, e a seção de
riscos da própria task diz: na dúvida, mover em vez de apagar. Foi para o
histórico.

> Vale registrar o que **não** salvei dele: a seção "Canais Oficiais", com
> e-mail de suporte, WhatsApp `(11) 9XXXX-XXXX` e Instagram. Nenhum existe. É o
> tipo de conteúdo que, num manual de dissertação, viraria promessa a uma
> usuária.

## O `CHANGELOG.md`: anotar, não reescrever

A entrada `0.1.0` afirma "20/20 testes passando", "zero violações de
acessibilidade" e o limite de 50 MB. Reescrevê-la apagaria a informação mais
útil que ela carrega — o que se acreditava, e quando.

Ficou como está, com dois avisos: um no topo do arquivo e outro **dentro da
seção**, porque quem chega por busca não passa pelo topo. E ganhou uma entrada
nova, "Não versionado — agosto de 2026", com o que a fila de correções mediu.

## O `TODO.md` refeito

Não é o antigo com caixas corrigidas. As antigas categorias (P1 a P4,
"Complementar") descreviam um plano de sprint de julho que já não corresponde a
nada. A estrutura nova é por **quem consegue agir**:

1. **Precisa de decisão sua** — quatro itens que não são de código.
2. **Achados abertos** — `54` a `62`, cada um com investigação escrita.
3. **Backlog de produto** — o que a plataforma não faz e ninguém prometeu.
4. **Fila de correções** — `22`, `23`, `99`.
5. **Feito, e verificado** — cada linha com medição reproduzível.
6. **Sem data** — ideias, sem compromisso.

A regra ficou escrita no topo do arquivo: `[ ]` significa não feito, e item sem
verificação possível não entra.

## A exceção de escopo que eu abri

A task diz **não toca `AGENTS.md`**. Toquei em três linhas dele.

O motivo: `AGENTS.md` linkava `docs/project-status.md` e `docs/mvp-backlog.md`,
que esta task moveu. Deixar como estava significava entregar a task com dois
links quebrados, contra o critério de aceite 3. Troquei a lista de documentos
internos pela atual e não mexi em mais nada.

## Verificação

| Comando | Resultado |
|---|---|
| `ls -1 *.md \| wc -l` | ✅ **5** (o critério pede no máximo 5) |
| conferência de links (script) | ✅ **154 links internos, 0 quebrados** |
| `npm run check` (tsc + eslint + vitest) | ✅ 0 erros, 0 warnings, 18/18 |
| `npm run build` | ✅ `Compiled successfully in 9.9s` |
| `git status` fora de `.md`/`.txt` | ✅ vazio — nenhum arquivo de código tocado |

A conferência de links é mais forte que a que a task sugeria: em vez de `grep` e
olho, um script varre os 154 links de todos os documentos vivos, do histórico e
de `.claude/fixes/`, e resolve cada caminho no disco.

**Não rodei `test:e2e` nem `test:a11y`.** Nenhum arquivo de código mudou —
`git status` confirma que a mudança é inteiramente `.md`. Quinze minutos de
suíte não produziriam sinal nenhum aqui, e o portão rápido mais o build cobrem o
que havia para cobrir.

## Critérios de aceite

- [x] A raiz tem no máximo 5 arquivos `.md` — tem exatamente 5.
- [x] Nenhuma afirmação contraditória sobre estado do projeto sobrevive nos
      documentos vivos. As que restam no `CHANGELOG` estão dentro da entrada
      histórica, marcada como tal no topo do arquivo e no topo da seção.
- [x] Todo link interno continua funcionando — 154 conferidos, 0 quebrados.
- [x] O `TODO.md` reflete a realidade medida.

## Achado registrado

[`62`](../tasks/62-limites-de-upload-divergem.md) — o componente de anexo aceita
3 arquivos de 5 MB, a rota do UploadThing aceita 1 de 4 MB. Um arquivo de 4,5 MB
passa na validação da tela e é recusado no envio, depois de a usuária ter
preenchido o resto do formulário.
