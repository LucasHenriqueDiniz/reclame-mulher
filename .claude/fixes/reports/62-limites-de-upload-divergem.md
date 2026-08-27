# Relatório — [62] Cliente e servidor discordam do limite de anexo

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 2

## Não eram dois números. Eram quatro

A task apontava dois lugares. Procurando antes de editar, achei quatro — e o
mais importante deles não era nenhum dos dois citados:

| Onde | Quantidade | Tamanho |
|---|---|---|
| `upload-dropzone.tsx` — valores padrão | 3 | 5 MB |
| **`steps/step-three.tsx` — o chamador** | **3** | **5 MB** | 
| **`complaint-step-three-attachments.tsx`** | **3** | **5 MB** |
| `api/uploadthing/core.ts` (`complaintAttachment`) | 1 | 4 MB |

O terceiro é **código morto**: `ComplaintStepThreeAttachments` não é importado
por ninguém — é uma cópia antiga de `steps/step-three.tsx` que ficou para trás.
Foi removido.

O segundo é o que importa: `step-three.tsx` passava
`maxFiles={3} maxBytesPerFile={5 * 1024 * 1024}` **explicitamente**. Corrigir só
o valor padrão do componente não teria mudado nada na tela — o chamador vencia.
É o tipo de coisa que passa quando se corrige pela descrição do defeito em vez
de pelo caminho do código.

## A parte da task que não se sustenta: o "3 contra 1"

A task diz:

> A usuária anexa três fotos da obra e descobre no envio.

**Isso não acontece**, e vale registrar por quê. O envio é um arquivo por
requisição:

```ts
// new-complaint-content.tsx
const handleUpload = useCallback(async (file: File) => {
  const res = await uploadFiles("complaintAttachment", { files: [file] });
```

e o `addFiles` do dropzone chama `onUpload(file)` num laço, um por vez. O
`maxFileCount` do UploadThing é por requisição — três chamadas de um arquivo
cada satisfazem `maxFileCount: 1`. A divergência de **quantidade** era real no
papel e inerte na prática.

A de **tamanho** era real e reproduzível: 4,5 MB passava na tela, entrava na
lista com cara de aceito, e morria no envio.

Corrigi as duas assim mesmo — o critério 1 pede um único valor de quantidade,
e um `maxFileCount` que não bate com o que a tela oferece é uma armadilha
esperando quem um dia agrupar os envios numa chamada só.

## O número escolhido: 3 arquivos de 4 MB

- **Tamanho: 4 MB**, alinhando a tela para baixo. A task já dizia por quê: o
  teto do UploadThing é o real, e subir dependeria de mudar de plano.
- **Quantidade: 3**, alinhando a rota para cima. Três é o que a tela sempre
  ofereceu e o que o Manual de Uso promete; e `maxFileCount` é configuração de
  rota, sem implicação de plano.

## Onde o número mora agora

`src/lib/constants/anexos.ts`, e só ali:

```ts
export const ANEXO_TAMANHO_MAXIMO = "4MB" as const;   // formato do UploadThing
export const ANEXO_MAX_MB = Number(ANEXO_TAMANHO_MAXIMO.replace("MB", ""));
export const ANEXO_MAX_BYTES = ANEXO_MAX_MB * 1024 * 1024;
export const ANEXO_MAX_ARQUIVOS = 3;
```

Um literal só, as três formas derivadas dele: a string que o UploadThing exige
na configuração, os bytes que a tela compara e os MB que a mensagem mostra.

E **os dois `props` que permitiam sobrescrever o limite saíram do componente**.
Eram exatamente o mecanismo pelo qual a divergência entrou: um valor padrão
correto no componente e um valor solto no chamador. Quem precisar de outro
limite muda a constante, e os dois lados mudam juntos.

| Arquivo | Mudança |
|---|---|
| `src/lib/constants/anexos.ts` (novo) | os limites, os tipos aceitos e o `validarAnexo` |
| `src/app/api/uploadthing/core.ts` | `complaintAttachment` importa os dois valores |
| `src/app/app/complaints/new/_components/upload-dropzone.tsx` | usa o módulo; perdeu os `props` de limite; conta os arquivos excedentes para avisar |
| `src/app/app/complaints/new/_components/steps/step-three.tsx` | parou de passar limite na mão |
| `src/app/app/complaints/new/_components/complaint-step-three-attachments.tsx` | **removido** (código morto com o quarto par de números) |

## O arquivo que sobrava sumia sem avisar

Achado ao reescrever o `addFiles`: o laço parava no limite
(`i < files.length && next.length < maxFiles`) e os arquivos de sobra **eram
descartados em silêncio**. Quem selecionasse cinco fotos via três na lista e
nenhuma explicação. Agora eles são contados e viram mensagem:

> Você pode anexar até 3 arquivos.

A mensagem de recusa também ganhou `role="alert"`, para ser anunciada por leitor
de tela — é uma resposta a uma ação da usuária, não texto decorativo.

## Os testes

A task pedia *"teste que prova a recusa no cliente sem depender de chamada ao
UploadThing"*. São dois níveis.

**Unidade** (`src/lib/__tests__/anexos.test.ts`, roda em Node, 11 testes):
limite exato aceito, um byte acima recusado, o caso de 4,5 MB que era o defeito,
os quatro formatos, arquivo sem tipo — e, principalmente, **a trava**: lê
`core.ts`, `upload-dropzone.tsx` e `step-three.tsx` do disco e falha se algum
voltar a escrever `"5MB"` ou `5 * 1024 * 1024` na mão.

**Verificado por mutação:** pus um `5 * 1024 * 1024` de volta no dropzone e o
teste falhou apontando o arquivo. Restaurado em seguida.

**Ponta a ponta** (`e2e/complaint-create.spec.ts`): chega na etapa 3, anexa um
arquivo de 4,5 MB e exige três coisas — a mensagem na tela dizendo `4 MB`, o
arquivo **fora** da lista de anexos, e **nenhuma requisição ao UploadThing**.
Esta última é o ponto: prova que a recusa é do cliente, e não gasta cota.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `npx vitest run` | ✅ **29 de 29** (eram 18; a task trouxe 11) |
| trava por mutação | ✅ falha com o número de volta, passa sem ele |
| aplicação de produção | ✅ a tela diz *"PNG, JPG, JPEG ou PDF. Até 3 arquivos, máximo 4 MB cada."* |
| suíte inteira | ✅ **467 passando, 3 pulados** — 465 mais os 2 do teste novo (um por projeto) |
| capturas do Manual | ✅ só `32-etapa-3.png` e `32-etapa-3-celular.png` mudaram, que são as duas que mostram o limite |

### As duas iterações

1. A trava falhou na primeira execução, e com razão: `core.ts` também tem a rota
   `blogImage`, com o seu próprio `"4MB"`. Passei a checar só o bloco
   `complaintAttachment`. A `blogImage` é outra funcionalidade, com limite
   próprio — e, olhando, **sem validação de tamanho no cliente nenhuma**, o que
   é diferente de ter dois números discordando. Não abri task: é upload de
   admin, e não há promessa quebrada na tela.
2. O teste E2E falhou por modo estrito: `getByRole("alert")` acha também o
   anunciador de rota do Next (`#__next-route-announcer__`). Passou a ser
   `p[role="alert"]`. A recusa em si funcionou de primeira.

## Critérios de aceite

- [x] **Um único valor de tamanho e um único de quantidade, definidos em um
      lugar e usados nos dois lados** — e com teste que falha se voltarem a
      divergir.
- [x] **Arquivo acima do limite é recusado na tela, com mensagem que diz qual é
      o limite** — *"Arquivo muito grande. O máximo é 4 MB por arquivo."*
- [x] **Teste que prova a recusa no cliente sem depender de chamada ao
      UploadThing** — e que vigia a rede para provar que a chamada não aconteceu.
- [x] **`docs/arquitetura.md` atualizado com o número escolhido** — mais o
      Manual de Uso (texto e capturas) e o roteiro de demonstração, que
      listavam a divergência entre as limitações conhecidas.

## Pendências e achados fora de escopo

Nenhuma task nova. Duas observações registradas acima e sem ação:
`blogImage` não valida tamanho no cliente (upload de admin, sem promessa
quebrada), e a documentação de julho que falava em "10 MB por arquivo, 50 MB no
total" já tinha saído na task `21`.
