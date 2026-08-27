# Relatório — [03] Triagem do trabalho não commitado

- **Data:** 2026-08-26
- **Status:** done
- **Commits:** `9a78077`, `95563c0`, `86161ad`
- **Iterações de debug:** 0
- **Arquivos "incerto":** **nenhum**

## O que foi encontrado

19 arquivos modificados, parados desde julho/2026. Ao ler os diffs um por um,
ficou claro que **não era rascunho**: é um trabalho coerente, com um tema
dominante que nenhum documento do repo menciona.

### Classificação

| Classificação | Arquivos |
|---|---|
| **Manter** | 18 |
| **Descartar** | 1 (`next.config.ts`) |
| **Incerto** | 0 |

O `next.config.ts` aparecia como modificado, mas `git diff` e `git diff -w`
saíam **os dois vazios**, com o arquivo diferindo em 29 bytes — exatamente o
número de linhas. Era conversão de fim de linha CRLF/LF, sem nenhuma mudança
semântica. Descartado com `git checkout -- next.config.ts`.

Isso também **corrige a evidência que a task `18` carregava**, que dizia que a
configuração de build estava modificada sem ninguém saber o que mudou. Não
estava.

## O tema principal: a interface exibia dados inventados

Mais da metade das mudanças faz a mesma coisa — trocar valor fixo no front por
consulta ao banco. O que estava hardcoded:

| Onde | O que era exibido |
|---|---|
| Homepage | `3247` mulheres ouvidas, `87%` "satisfação e confiança", `156` "comunidades transformadas" |
| Seção de parceiros | logos de **Starbucks, Pepsi, Walmart e Azendoo** |
| Detalhe da reclamação (empresa) | `92%` de resolução, `27` diálogos ativos, `143` casos resolvidos, `3` projetos |
| Detalhe da reclamação (empresa) | selo `VERIFICADA` fixo, exibido para qualquer empresa |
| Mensagens da empresa | assinatura `— Coordenador de Relações Comunitárias`, inventada |

Para um produto de dissertação, exibir métricas fabricadas e usar marcas reais
como parceiras sem autorização não é detalhe estético. Este trabalho estava
parado sem commit há quase dois meses.

## Os três commits

### `9a78077` — `fix: substitui dados falsos por dados reais do banco`

`src/app/page.tsx`, `ImpactStats.tsx`, `PartnersSection.tsx`,
`src/server/repos/complaints.ts`, `company-complaint-detail-content.tsx`,
`app/company/complaints/[id]/page.tsx`

Novo `ComplaintsRepo.getPlatformStats()` alimenta a homepage;
`CompaniesRepo.getStats()` alimenta o painel de detalhe; os logos falsos viram
slots "Sua empresa aqui" com chamada para cadastro.

### `95563c0` — `feat: exibe anexos no detalhe da reclamação`

`app/complaints/[id]/page.tsx`, `complaint-detail-content.tsx`

Lacuna real de produto: o wizard aceitava fotos e documentos, mas a tela de
detalhe nunca os mostrava — o anexo entrava e sumia. Agora imagens viram
miniaturas clicáveis e outros arquivos viram link com o nome original.

### `86161ad` — `style: padroniza tipografia, ícones e navegação do perfil público`

As 6 páginas com `font-heading`, `theme.ts`, `CompanyRecentComplaintsCard.tsx`,
`company-dashboard.tsx`, `company-profile-content.tsx`

Inclui a substituição de `font-['Poppins']` hardcoded pelo token, emoji `📍`
virando ícone `lucide`, e o `PublicProfileTabs` com `overflow-x` — que já
resolve por antecipação um dos pontos da task `15`.

## Verificação

| Comando | Resultado |
|---|---|
| `git status --porcelain` | ✅ limpo (só `.claude/fixes/STATE.json`, desta task) |
| `npm run check` | ✅ exit 0 — 0 erros, 45 warnings (igual ao baseline, sem regressão) |
| `npm run build` | ✅ `Compiled successfully in 15.1s` |
| Homepage em runtime | ✅ HTTP 200, sem exceção |

Como as mudanças introduzem uma query SQL nova que roda **na renderização da
home**, não bastava o build passar. Verifiquei o runtime:

- nenhum dos valores antigos sobrou na página (`3247`, `Starbucks`, `Pepsi`,
  `Walmart`, "satisfação e confiança", "comunidades transformadas" → 0 ocorrências);
- os textos novos aparecem ("mulheres ouvidas", "taxa de resolução",
  "empresas em diálogo", "Sua empresa aqui");
- o que parecia erro no HTML era `"error":null,"digest":"$undefined"`, payload
  normal do RSC — conferido, não é exceção.

## Uma consequência que precisa da sua atenção

Extraí os valores reais do payload RSC da homepage:

```
womenHeard: 2 · resolutionRate: 13 · companiesEngaged: 1
```

A home agora anuncia **2 mulheres ouvidas, 13% de taxa de resolução e 1 empresa
em diálogo**. Está correto — é o que o banco tem. Mas o efeito prático é que a
página inicial ficou visivelmente vazia, e para a banca em novembro isso pesa
mais do que pesava o número falso.

**Voltar ao número inventado não é opção.** A saída é um seed de demonstração
mais rico. Registrei isso como item urgente na task `23`.

## Critérios de aceite

- [x] `git status --porcelain` limpo — verificado.
- [x] Cada commit tem mensagem que descreve o que mudou — três commits temáticos.
- [x] `npm run check` passa depois dos commits — exit 0.
- [x] Nenhum arquivo ficou "incerto" — a task não precisou ser bloqueada.

## Achados propagados para outras tasks

| Task | O que mudou |
|---|---|
| `16` | Novo item: anexo em reclamação pública fica visível para qualquer visitante. Foto de calçada tudo bem; documento pessoal anexado como prova, não. Precisa de decisão sobre visibilidade e de aviso na tela de upload. |
| `18` | Evidência corrigida: `next.config.ts` não tinha mudança real. Escopo da task reduzido. |
| `23` | Seed de demonstração virou item urgente, pelo motivo acima. |

## Decisões que precisam de humano

Nenhuma bloqueante nesta task. As duas que ficaram registradas — visibilidade
de anexos (task `16`) e riqueza do seed de demonstração (task `23`) — são
decisões de produto, e as tasks correspondentes já as carregam.
