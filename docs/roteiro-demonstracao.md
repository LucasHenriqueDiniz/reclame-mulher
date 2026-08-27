# Roteiro da demonstração

Percurso de **12 a 15 minutos** para apresentar a plataforma ao vivo.

> Escrito na task `23` e **executado inteiro** sobre o build de produção. Os
> tempos abaixo não são estimativa: saíram do cronômetro. Ver
> [Números do ensaio](#números-do-ensaio).
>
> O cenário de demonstração também passou pela varredura de acessibilidade
> (**78 verificações, zero violações WCAG A/AA**) e pela de responsividade
> (**93 de 94**; a que falha é a task `65`, e só em 375 px).

---

## Antes de começar

### Uma hora antes

```bash
pnpm db:seed
```

```bash
pnpm db:seed:demo
```

```bash
pnpm build
```

**Nesta ordem, e o `build` por último.** A home é pré-renderizada: os números do
"Nosso impacto" são gravados durante o build. Construir antes de semear mostra
a plataforma vazia. Isso está registrado como task `64`.

```bash
pnpm start
```

### Quinze minutos antes

```bash
node --import tsx scripts/ensaio-da-demonstracao.ts
```

O ensaio percorre o roteiro inteiro e falha se algum passo tiver quebrado. Ele
também **aquece o banco** — o Neon suspende conexão ociosa, e a primeira
consulta depois disso é lenta. Rodar o ensaio elimina esse primeiro tropeço.

Depois do ensaio, rode `pnpm db:seed:demo` de novo para limpar o relato que ele
criou.

### Cinco minutos antes

- [ ] Abra `http://localhost:5000` e confirme que os números do impacto
      aparecem. **Espere sete segundos**: a contagem é animada e sobe devagar.
- [ ] Deixe **três abas** abertas e já logadas — trocar de aba é mais rápido e
      menos arriscado que digitar senha na frente da banca:
      1. anônima (janela privada) na home
      2. Helena Vasconcelos (usuária)
      3. Patrícia Meireles (empresa)
- [ ] Feche notificações do sistema.
- [ ] **Apresente em 1280 px ou mais.** Em 375 px a lista de empresas rola para
      o lado com o cenário de demonstração carregado — task `65`.
- [ ] Tenha a pasta `docs/manual/img/` aberta num visualizador — é o plano B.

### Contas

Senha de todas: `senha123`.

| Papel | E-mail | Para quê |
|---|---|---|
| Usuária | `helena.demo@exemplo.com` | registra o relato ao vivo |
| Empresa | `atendimento.norte.demo@exemplo.com` | responde. É `OWNER`, então alcança perfil e obras |
| Administração | `admin@comunicamulher.com.br` | painel administrativo |

> Não use `empresa@construtorax.com` na demonstração. Essa conta é `MEMBER` e
> recebe **403** ao tentar editar o perfil da empresa ou cadastrar obra — a tela
> existe, o botão existe, e a ação falha. É o achado `56`.

---

## O percurso

### Ato 1 — A plataforma vista de fora *(≈2 min)*

**1. A home.** Comece pela proposta: "Diálogo direto entre mulheres e
responsáveis por obras de infraestrutura."

Desça até **Nosso impacto em números** e deixe a contagem terminar. Fale por
cima dela — são sete segundos.

> **O que dizer:** estes números vêm do banco. Até agosto de 2026 eles eram
> fixos no código; a plataforma exibia impacto que não existia. Hoje ela exibe o
> que tem, mesmo quando é pouco. É uma escolha de projeto.

**2. Lista de empresas.** Menu **Empresas**. Cinco empresas, cada uma com sua
taxa de resolução visível.

**3. Perfil de uma empresa.** Abra a **Norte Engenharia**.

> **O que mostrar:** o selo VERIFICADA, a taxa de resolução, e os relatos
> públicos — **sem estar logada**. É a parte que muda o incentivo: a empresa
> sabe que quem não responde aparece.

### Ato 2 — A usuária registra *(≈4 min)*

**4. Entrar** como Helena (troque de aba).

**5. O relato, nas quatro etapas.** Comece pelo botão **Reclamar** na página da
empresa — é o caminho real de quem chegou pelo perfil.

| Etapa | O que fazer | O que dizer |
|---|---|---|
| **1. Histórico** | deixe "Não, é a primeira vez" | a plataforma pergunta se ela já tentou por outro canal. Isso muda como a empresa lê o caso |
| **2. Descrição** | escreva algo concreto | repare no subtítulo: *"Escreva de forma simples. Não precisa usar palavras difíceis."* e no aviso para não colocar CPF |
| **3. Fotos** | clique em **Continuar sem foto** | o botão diz "sem foto", não "pular". A tela avisa que quem vê o relato vê o anexo |
| **4. Finalizar** | escolha as três classificações e **pare nas duas chaves** | é aqui que ela decide se aparece com nome e se o relato é público |

> **As duas chaves são o momento mais importante da demonstração.** Anonimato e
> visibilidade são decisão da autora, tomadas antes de enviar. Ligue a chave do
> anonimato, mostre, e desligue de novo — a demonstração seguinte precisa do
> nome aparecendo.

Sugestão de texto, se quiser algo pronto:

- **Problema:** Máquina ligada antes das seis da manhã
- **Detalhes:** A obra liga as máquinas antes das seis, e a licença só permite a
  partir das sete. Moro na casa da frente e acordo com o barulho todos os dias.
- **Onde:** Rua do Hospício, 380 — Boa Vista

**6. A confirmação.** Mostre o **número do relato** (`#R-XXXX-XXXX`) e depois a
lista, com a etiqueta **Aberta**.

### Ato 3 — A empresa responde *(≈3 min)*

**7. Trocar para a aba da empresa.**

**8. O painel.** Cinco números; aponte para **Sem resposta**.

> **O que dizer:** este número é o que a empresa vê ao entrar, e a taxa de
> resolução dela é pública. O incentivo não é uma multa; é a exposição.

**9 e 10. Abrir o relato novo e responder.** Escreva uma resposta com prazo —
resposta vaga é o que a plataforma existe para combater.

**11. Mudar a situação** para **Resolvida**, em *Ações da empresa*, e **Salvar**.

### Ato 4 — A usuária vê *(≈2 min)*

**12. Voltar para a aba da Helena** e abrir o relato. A resposta está lá, com
nome de quem respondeu e data.

> **Diga a limitação antes que perguntem:** hoje não sai aviso por e-mail. Ela
> precisa entrar para ver. Está no manual e é a task `61`.

**13. O perfil público da empresa**, de novo. O caso encerrado aparece, e a taxa
de resolução mudou.

### Ato 5 — Administração *(≈2 min)*

**14. Entrar como administração.** Mostre o painel, a verificação de empresa e a
consulta de auditoria.

> **Seja preciso:** a auditoria existe e funciona, mas hoje **só registra
> verificação de empresa**. Mudança de situação de relato e moderação não deixam
> rastro. Está no `TODO.md`.

### Fechamento *(≈1 min)*

Volte à home. Feche com o que sustenta o resto:

- **458 testes automatizados** — 18 de unidade, 362 de ponta a ponta, 78 de
  acessibilidade.
- **Zero violações WCAG 2.1 A/AA** em 39 páginas, em duas larguras de tela.
  Eram 523 em agosto.
- **33 páginas conferidas em 375 px**, a tela de celular mais comum entre as
  usuárias. Eram 8 rolando para o lado; hoje é uma, e ela está registrada.
- **LCP da home de 848 ms** em 4G lenta com processador quatro vezes mais lento
  — era 7,2 s.

---

## Números do ensaio

Execução completa em 27/08/2026, build de produção, banco Neon remoto:

| Passo | Tempo |
|---|---|
| 1. Home e os números do impacto | 8,9 s |
| 2. Lista de empresas | 1,8 s |
| 3. Perfil público de uma empresa | 1,6 s |
| 4. Entrar como usuária | 1,0 s |
| 5. Registrar o relato (quatro etapas) | 6,0 s |
| 6. O relato aparece na lista | 2,1 s |
| 7. Entrar como empresa | 0,9 s |
| 8. Painel da empresa | 1,9 s |
| 9. Abrir o relato na caixa da empresa | 1,7 s |
| 10. Responder | 0,04 s |
| 11. Marcar como resolvido | 3,8 s |
| 12. Ver a resposta como usuária | 2,6 s |
| 13. Perfil público com o caso encerrado | 1,3 s |
| 14. Área administrativa | 2,0 s |
| **Total de máquina** | **36 s** |

**Nenhum tropeço.** Os 36 segundos são só o tempo do sistema. A regra que usei
para o roteiro é dobrar isso e somar o tempo de fala, o que dá os 12 a 15
minutos. O passo mais lento é a animação da contagem na home — e ela é
animação, não lentidão.

---

## Plano B

| Se acontecer | O que fazer |
|---|---|
| **Internet cai** | as 34 capturas de `docs/manual/img/` cobrem o percurso inteiro, em computador e celular. Abra o `docs/manual/MANUAL_DE_USO.html` — é um arquivo único, funciona sem rede |
| **Banco lento ou dormindo** | é o Neon suspendendo conexão ociosa. O ensaio, quinze minutos antes, evita. Se acontecer ao vivo, a primeira página demora e as seguintes vão normais — diga isso em voz alta em vez de clicar de novo |
| **Upload de anexo falha** | **não demonstre upload.** Ele depende do UploadThing, que é serviço externo, e a etapa 3 tem o botão **Continuar sem foto** justamente para seguir sem ele. Se perguntarem, mostre a captura `docs/manual/img/32-etapa-3.png` |
| **O login não passa** | troque para a aba já logada. É por isso que as três ficam abertas |
| **Algo quebra numa tela** | vá para a captura equivalente e siga falando. O manual tem o mesmo percurso, na mesma ordem |
| **Perguntam por um recurso que não existe** | responda pela lista abaixo. Ela está completa |

### Gravação de tela

Se quiser garantia total, grave o ensaio antes:

```bash
node --import tsx scripts/ensaio-da-demonstracao.ts --visivel
```

`--visivel` abre o navegador com os passos desacelerados. Grave a tela durante e
tenha o vídeo como último recurso.

---

## Limitações conhecidas

Banca pergunta. Melhor ter a resposta pronta do que improvisar — e admitir o que
falta é mais forte do que ser pego.

| Não faz | Resposta curta | Registro |
|---|---|---|
| **Não envia e-mail** | quatro modelos escritos, nenhum envio implementado. A usuária precisa entrar para ver resposta. As telas que prometiam e-mail saíram — nenhuma delas era alcançável pela aplicação | task `61` |
| **Não verifica o endereço de e-mail** | não há confirmação de cadastro nem campo de e-mail verificado no banco. O `verifiedAt` do schema é de **empresa**, e quem verifica é a administração | task `61` |
| **Não recupera senha** | depende de e-mail, que a plataforma não envia. A tela de entrada diz isso em vez de prometer um link que não existia | task `59` |
| **Relato concluído não reabre** | a resposta é registrada, a etiqueta não muda | task `55` |
| **Anexo: a tela promete mais do que o envio aceita** | tela diz 3 arquivos de 5 MB, servidor aceita 1 de 4 MB | task `62` |
| **Anexos não têm controle de acesso** | vão para o UploadThing por URL. Quem tem a URL abre | `docs/autorizacao.md` |
| **Auditoria registra só um tipo de ação** | verificação de empresa. O resto não deixa rastro | `TODO.md` |
| **Números da home congelam no build** | a rota é estática; a consulta roda no build | task `64` |
| **`/companies` rola para o lado em celular** | com cinco empresas no banco, a lista estoura 24 px em 375 px. Em 1280 px, que é a tela da apresentação, passa | task `65` |
| **Não há canal de atendimento** | sem telefone, e-mail ou chat | `MANUAL_DE_USO.md`, seção 8 |

### Se perguntarem "isso está pronto para produção?"

A resposta honesta é: **está pronto para ser usado por um piloto, e há duas
coisas a resolver antes de abrir ao público.**

1. A `DATABASE_URL` com pooler, hoje ausente do ambiente.
2. A decisão sobre e-mail (`61`), porque metade do fluxo de conta depende dela.

Tudo o mais que falta está catalogado, com medição, em
[`.claude/fixes/INDEX.md`](../.claude/fixes/INDEX.md). Essa catalogação é parte
do resultado: o que se sabe que falta está escrito, e o que se afirma está
medido.

---

## Depois da defesa

```bash
pnpm db:seed
```

Volta o banco ao estado que a suíte automatizada espera. Os dados de
demonstração são ficção — nomes, empresas e obras foram inventados — e não
devem sobreviver à apresentação.
