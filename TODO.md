# Backlog

Único backlog vivo do projeto. Reconciliado com a realidade medida na task `21`
(agosto de 2026).

> **O que aconteceu com a versão anterior.** O `TODO.md` de julho tinha 91
> itens, 63 deles com caixa `[ ]` desmarcada e corpo dizendo "Concluído". Não
> era descuido de digitação: os itens marcados como feitos incluíam "testes
> automatizados para auth", "para reclamações", "para blog" e "para
> admin/auditoria" — e o repositório não tinha **um único arquivo de teste**.
> Também descrevia a transição de status `OPEN → IN_PROGRESS → RESOLVED`, que
> nunca existiu, e "RLS policies implementadas" num projeto sem RLS.
>
> A versão antiga está em
> [`docs/historico/`](docs/historico/README.md) pelo histórico do git. Este
> arquivo recomeça do que foi medido.

## Como este arquivo funciona

- `[ ]` significa **não feito**. Se o corpo diz que está pronto, a caixa é `[x]`.
- Item sem verificação possível não entra. Se não dá para provar, é ideia, e
  ideia vive na seção "Sem data".
- Item que já tem task na fila de correções aponta para ela.

---

## Precisa de decisão sua

Não são de código — dependem de uma escolha que só quem toca o projeto pode
fazer.

- [ ] **Pôr `DATABASE_URL` no `.env`**, com a *pooled connection* do Neon. Hoje
      a aplicação roda na conexão direta e avisa no log a cada subida. Sob
      carga, isso esgota as conexões do banco.
- [ ] **Decidir onde hospedar.** Três coisas dependem disso: a região do banco
      (139 ms por consulta a partir do Brasil), se `images.unoptimized` pode ser
      desligado, e se `sharp` precisa ser instalado.
- [ ] **Decidir o que acontece quando a usuária discorda do encerramento** —
      [`55`](.claude/fixes/reports/55-resolvido-nao-reabre.md). Hoje a empresa
      marca *Resolvida*, a autora responde "não foi resolvido" e **nada
      acontece**. São três caminhos possíveis, e a escolha é da Paloma: é
      desenho da pesquisa. Duas coisas medidas que pesam na conversa: reabrir
      sempre **não** tira da empresa o poder de encerrar sozinha (ela reencerra
      quantas vezes quiser), e qualquer um dos caminhos mexe na **taxa de
      resolução que aparece no perfil público**.
- [ ] **Decidir sobre e-mail** — [`61`](.claude/fixes/tasks/61-email-nao-existe.md).
      Existem quatro modelos HTML e nenhum envio. A parte que não dependia de
      decisão já foi feita: **nenhuma tela promete mais e-mail**, e o manual diz
      que a plataforma não envia nem confere endereço
      ([relatório](.claude/fixes/reports/61-email-nao-existe.md)). O que falta é
      a escolha: implementar verificação de cadastro e recuperação de senha
      (que é o que destrava a task `59`), implementar também o aviso de nova
      mensagem — o de maior valor para quem usa — ou assumir que a versão não
      manda e-mail e parar por aqui.
- [ ] **Decidir a visibilidade dos anexos.** Vão para o UploadThing sem ACL:
      quem tiver a URL abre o arquivo. Ver "Visibilidade de anexos" em
      [`docs/autorizacao.md`](docs/autorizacao.md).

## Achados abertos

Encontrados durante a fila de correções, cada um com investigação escrita.

- [ ] [`66`](.claude/fixes/tasks/66-teste-de-teclado-instavel.md) — o teste
      de teclado do assistente falha de vez em quando no celular. É corrida do
      teste com a lista do Radix, não defeito do produto.
- [ ] [`68`](.claude/fixes/tasks/68-teste-de-erro-instavel.md) — um teste de
      formato de erro falhou uma vez e não se reproduz. O detalhe da falha se
      perdeu: a execução usava um reporter que não guarda o motivo.
- [ ] [`69`](.claude/fixes/tasks/69-schema-e-banco-discordam-do-cnpj.md) — o
      banco exige CNPJ (`NOT NULL`) e o `src/db/schema.ts` diz que é opcional.
      `PATCH /api/company/profile` com `{"cnpj": null}` bate nessa divergência
      e devolve 500.
- [ ] [`67`](.claude/fixes/tasks/67-endereco-de-suporte-nao-verificado.md) — a
      tela de verificação manda a empresa escrever para
      `suporte@reclame-mulher.com.br`. Ninguém sabe se essa caixa existe.

## Backlog de produto

Coisas que a plataforma não faz e que ninguém prometeu que faria até aqui.

### Auditoria

- [ ] Registrar em `audit_logs` mais do que verificação de empresa. Hoje é a
      única ação auditada — mudança de status de relato, moderação e alteração
      de perfil de empresa não deixam rastro.
- [ ] Exportar os registros de auditoria.

### Notificações

- [ ] Definir quais eventos geram notificação. Depende da decisão sobre e-mail.
- [ ] Escolher entre envio direto e fila.

### OAuth

- [ ] Decidir se entra. Nada foi implementado; a documentação de julho dizia
      "Google, Facebook definidos", o que significava escolhidos no papel.

### Relatórios e feedback

- [ ] Modelo de feedback da usuária sobre o atendimento.
- [ ] Triagem administrativa desse feedback.

### Filtros

- [ ] Filtros compostos em relatos e empresas. Os filtros por status e a busca
      textual já existem e preservam estado na URL.

## Fila de correções em andamento

O trabalho técnico está catalogado em
[`.claude/fixes/INDEX.md`](.claude/fixes/INDEX.md), com uma task por assunto e
um relatório medido por task. O que falta lá:

- [ ] `99` — relatório final.

## Feito, e verificado

Cada linha aqui tem medição em `.claude/fixes/reports/`. Não é "feito segundo
alguém": é feito segundo um número que dá para reproduzir.

- [x] **Um nome só para cada status** — cinco mapas de rótulo discordando
      viraram um. O mesmo relato lia *Em réplica* na lista, *Respondida* no
      detalhe e *Concluído* quando encerrado; hoje lê **Aberta**, **Respondida**,
      **Resolvida** ou **Cancelada** em toda tela. Ver
      [`54`](.claude/fixes/reports/54-rotulos-de-status-divergentes.md).
- [x] **O seed tem conta que administra a empresa** — antes só existia uma
      conta `MEMBER`, e as cinco rotas de administração respondiam 403 para a
      única conta que havia. Agora há `MEMBER` e `OWNER` na mesma empresa, mais
      uma `OWNER` numa segunda. Ao alcançar a rota pela primeira vez apareceu
      que ela **apagava o resto do cadastro** numa atualização parcial;
      corrigido junto. Ver
      [`56`](.claude/fixes/reports/56-conta-empresa-do-seed-e-member.md).
- [x] **A empresa não é mais convidada a reclamar de si mesma** — a tela do
      relato visto pela empresa mostrava "Está querendo fazer um relato sobre
      Construtora X?", com um botão cujo link ainda estava quebrado. Aquela
      página só abre para a própria empresa. Ver
      [`57`](.claude/fixes/reports/57-cta-de-relato-na-tela-da-empresa.md).
- [x] **O console de uma visita anônima está limpo** — `/api/me` devolvia 401
      em todo carregamento sem sessão, e o canário da suíte tinha uma lista de
      "ruído esperado" para conviver com isso. A rota passou a responder 200 com
      tudo nulo, a lista foi apagada, e no build de produção a home deslogada não
      imprime **mensagem nenhuma**. Ver
      [`58`](.claude/fixes/reports/58-api-me-401-em-toda-pagina.md).
- [x] **Nenhum link interno aponta para rota que não existe** — a tela de
      entrada prometia "Esqueceu a senha?" e recarregava a mesma página, porque
      `/forgot-password` nunca existiu. Hoje ela diz a verdade, e um teste
      permanente varre todo destino do código contra as rotas de `src/app`. Ver
      [`59`](.claude/fixes/reports/59-esqueceu-a-senha-nao-existe.md).
- [x] **ESLint zerado** — de 4 erros e 277 avisos para 0 e 0.
- [x] **Suíte de testes existe** — 503 testes: 31 de unidade, 400 de ponta a
      ponta, 72 de acessibilidade. Antes: nenhum.
- [x] **Acessibilidade WCAG 2.1 AA** — de 523 ocorrências para 0, em 39 páginas
      × 2 viewports. Ver [`docs/acessibilidade.md`](docs/acessibilidade.md).
- [x] **Responsividade em 375px** — de 8 páginas com scroll horizontal para 0,
      em 33 páginas.
- [x] **Navegação por teclado** nos três fluxos principais, com foco visível.
- [x] **Autorização das 32 rotas de API** provada por teste, por papel, e
      documentada em [`docs/autorizacao.md`](docs/autorizacao.md).
- [x] **Middleware protegendo `/app/*`** — estava na raiz do repositório, onde o
      Next nunca o executa.
- [x] **Anonimato** — o nome da autora não sai em nenhuma resposta quando o
      relato é anônimo. Havia uma tela que mostrava.
- [x] **Um formato de erro de API**, de 34 que havia, documentado em
      [`docs/api-erros.md`](docs/api-erros.md) e travado por teste.
- [x] **Mensagens de erro em português** — cerca de 64 apareciam em inglês.
- [x] **LCP da home** de 7 220 ms para 848 ms em 4G lenta com CPU 4× mais lenta.
- [x] **Imagens de `public/`** de 1 291 kB para 192 kB.
- [x] **Build de produção limpo**, reprodutível, e validação de ambiente que
      falha com o nome da variável faltando.
- [x] **Um gerenciador de pacotes só** — `package-lock.json` estava quatro meses
      atrasado ao lado do `pnpm-lock.yaml`.
- [x] **Onboarding persistido** — `onboardingCompletedAt` é gravado pelas server
      actions das duas trilhas.
- [x] **Nenhuma rota pública entrega credencial.** `/ajuda` imprimia a senha do
      administrador com botão de copiar; agora não existe em produção e não tem
      credencial em lugar nenhum, com 22 testes travando isso.
- [x] **Roteiro da demonstração** escrito e ensaiado inteiro sobre o build de
      produção, em 36 s de máquina e sem tropeço —
      [`docs/roteiro-demonstracao.md`](docs/roteiro-demonstracao.md).
- [x] **Manual de Uso** escrito, com 16 telas fotografadas em computador e
      celular — [`docs/manual/MANUAL_DE_USO.md`](docs/manual/MANUAL_DE_USO.md).
- [x] **Documentação consolidada** — de 21 arquivos na raiz que se contradiziam
      para 5, com o resto separado entre vivo (`docs/`) e histórico
      (`docs/historico/`).

## Sem data

Ideias registradas, sem compromisso.

- Modo de alto contraste.
- Leitura assistida (TTS) — diferente de compatibilidade com leitor de tela, que
  já existe.
- Banco por worker de teste, para poder rodar a suíte em paralelo.
- Internacionalização de fato: `next-intl` está montado, a plataforma é
  monolíngue.

---

**Reconciliado em:** 27/08/2026, task `21`.
**Como conferir qualquer linha desta página:** `.claude/fixes/reports/`.
