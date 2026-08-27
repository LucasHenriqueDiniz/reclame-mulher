# [62] Cliente e servidor discordam do limite de anexo

| Campo | Valor |
|---|---|
| **ID** | `62` |
| **Fase** | `2 — Correções pontuais` |
| **Risco** | baixo |
| **Depende de** | — |
| **Achado em** | task `21` (consolidação da documentação) |
| **Estimativa** | pequena |

## O que foi encontrado

Três números diferentes para a mesma coisa.

| Onde | Arquivos | Tamanho por arquivo |
|---|---|---|
| `src/app/app/complaints/new/_components/upload-dropzone.tsx` | **3** | **5 MB** |
| `src/app/api/uploadthing/core.ts` (`complaintAttachment`) | **1** | **4 MB** |
| `TODO.md` de julho (agora no histórico) | — | "10 MB por arquivo, 50 MB total" |

O terceiro não corresponde a nenhum dos dois: era afirmação sem medição, e saiu
da documentação na task `21`. Os dois primeiros estão no código, e é o problema.

## Por que importa

A validação da tela é o que a usuária vê. Um arquivo de 4,5 MB **passa** no
`upload-dropzone`, entra na lista de anexos com a aparência de aceito, e só é
recusado quando o envio chega ao UploadThing — depois de a usuária ter
preenchido o resto do formulário.

E o segundo e o terceiro anexo são pior: o componente aceita três, a rota aceita
um. A usuária anexa três fotos da obra e descobre no envio.

Isto tem peso extra nesta plataforma. A pessoa que registra o relato pode estar
com pouca familiaridade digital e pouca paciência com formulário — é exatamente
o cenário que [`docs/acessibilidade-inclusiva.md`](../../../docs/acessibilidade-inclusiva.md)
descreve. Um erro que só aparece no fim é o tipo de coisa que faz abandonar o
relato.

## O que fazer

1. Escolher **um** limite. O do UploadThing é o teto real, então o cliente deve
   se alinhar a ele, não o contrário — a menos que se decida subir o plano.
2. Conferir se `maxFileCount: 1` é intencional. O componente foi escrito
   esperando três; se três é o desejado, é a rota que muda.
3. Deixar o número num lugar só, importado pelos dois lados, para não voltar a
   divergir.
4. A mensagem de recusa precisa dizer o limite, não só que falhou.

## Critérios de aceite

- [ ] Um único valor de tamanho e um único de quantidade, definidos em um lugar
      e usados nos dois lados.
- [ ] Arquivo acima do limite é recusado **na tela**, com mensagem que diz qual
      é o limite.
- [ ] Teste que prova a recusa no cliente sem depender de chamada ao
      UploadThing.
- [ ] `docs/arquitetura.md` atualizado com o número escolhido.

## Nota

O teste de upload real (`E2E_UPLOAD=1`) consome cota do UploadThing e é pulado
por padrão. A verificação do limite deve ficar no lado do cliente, justamente
para não depender dele.
