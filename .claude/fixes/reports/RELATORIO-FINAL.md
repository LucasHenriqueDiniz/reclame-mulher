# Relatório final da fila de correções

- **Período:** 26 e 27 de agosto de 2026
- **Ramo:** `master`, do commit `18c75b2` até `f003736`
- **Commits:** 59
- **Tasks:** 45 — **42 feitas**, 1 pulada, 1 bloqueada, esta

> **Regra deste documento.** Todo número aqui foi medido, e medido de novo ao
> escrever. Onde não houve medição, está escrito *não medido*. Nada foi
> arredondado para cima e nenhuma afirmação de relatório antigo foi repetida sem
> reverificação — foi exatamente esse hábito que criou o problema que esta fila
> veio consertar.

---

## Resumo executivo

**O que o projeto era.** A plataforma funcionava: dava para entrar, criar um
relato, a empresa respondia. O problema não era o que estava quebrado, era o que
ninguém sabia. Não havia **um único teste automatizado**, então nenhuma
afirmação sobre o sistema podia ser conferida — e a documentação tinha se
soltado da realidade a ponto de o `TODO.md` listar 63 itens marcados como
concluídos que não existiam no código, incluindo "testes automatizados" num
repositório sem nenhum arquivo de teste. Duas falhas sérias estavam abertas sem
que ninguém soubesse: **três telas dentro da área logada abriam sem sessão**, e
o limitador de tentativas de login juntava usuárias diferentes no mesmo balde,
de modo que uma pessoa podia trancar a outra para fora. Nenhuma das duas foi
descoberta por sorte: apareceram quando alguém foi medir.

**O que o projeto é agora.** Existem **503 verificações automáticas** — 31 de
unidade e 472 de ponta a ponta — que rodam contra a aplicação de verdade, com
banco de verdade, e falham quando algo regride. Toda rota de API tem prova
escrita de quem pode chamá-la. A varredura de acessibilidade saiu de 523
ocorrências para zero. A home carrega em 848 ms na conexão lenta simulada, contra
7 220 ms antes. As telas não estouram mais a largura do celular. E há um Manual
de Uso com capturas geradas a partir do sistema em execução, o que significa que
ele não pode envelhecer em silêncio. Talvez o mais importante: **quinze
problemas que ninguém tinha visto apareceram durante o trabalho** — de uma
página pública que entregava a senha da conta de administração até um campo que
devolvia erro de servidor quando devia devolver erro de preenchimento — e todos
menos um foram corrigidos.

**O que falta.** Uma decisão de produto sobre o que acontece quando a usuária
discorda do encerramento de um relato — é a única task bloqueada, e o bloqueio é
correto: a escolha é da pesquisa, não do código. Quatro decisões de configuração
e escopo estão listadas na seção própria, e a mais consequente é sobre e-mail: a
plataforma não envia nenhum, e hoje é honesta sobre isso em todas as telas, mas
não confere endereço de cadastro nem recupera senha. Para a defesa de novembro,
o veredito está na última seção, e ele é positivo com ressalvas nomeadas.

---

## Antes e depois

| Métrica | Antes (2026-08-26) | Depois (2026-08-27) |
|---|---|---|
| Erros de TypeScript | 0 | **0** |
| Erros de ESLint | 4 (em `.claude/worktrees`; `eslint src` já era 0) | **0** |
| Warnings de ESLint | 277 no total, 45 fora das worktrees | **0** |
| Testes automatizados | **0** | **503** (31 de unidade + 472 E2E/a11y) |
| Cobertura E2E dos fluxos principais | nenhuma | 13 arquivos: login dos 3 papéis, criação de relato, resposta da empresa, autorização de 32 rotas, acessibilidade, responsividade, teclado, segredos, links |
| Ocorrências de acessibilidade (axe, `critical`+`serious`) | 523, em 39 páginas | **0**, em 78 varreduras (39 páginas × 2 viewports) |
| Rotas com scroll horizontal em 375 px | não medido → medido: **8 de 33** (18 públicas + 15 autenticadas) | **0 de 33**, nos dois viewports |
| Build de produção | não verificado → verificado: passa | **passa**, sem `ignoreBuildErrors` |
| Arquivos não commitados | 18 (+260 / −91) | **0** |
| Formatos de resposta de erro da API | 34 diferentes | **1** |
| Rotas de API com prova de autorização | 0 de 32 | **32 de 32** |
| LCP da home (Slow 4G, CPU 4×) | 7 220 ms | **848 ms** |
| CLS de `/blog/all` no celular | 0,0378 | **0,0000** |
| Arquivos `.md` na raiz | 21 | **4** |
| Manual de uso | não existia | 8 seções, 16 capturas geradas do sistema |

**Duas ressalvas sobre esta tabela, para que ela não seja lida melhor do que é.**

A linha de acessibilidade diz *ocorrências de axe*, não *conformidade*. O
próprio arquivo de medição registra: a varredura automática cobre entre 30% e
40% dos critérios WCAG, e **zero violação nela não é conformidade AA**. O que se
pode afirmar é que 523 problemas detectáveis por máquina foram corrigidos e que
a suíte impede que voltem.

A linha de ESLint muda de sentido conforme o que se conta. O número original de
277 warnings incluía as worktrees em `.claude/`, que não são código da
aplicação; medindo só `src/`, o começo eram 45 warnings e 0 erros. Ambos os
números estão na tabela porque esconder qualquer um deles distorceria: o
trabalho real foi de 45 → 0, não de 277 → 0.

---

## Tasks executadas

### Fase 0–1 — Retrato e higiene

| id | Título | Status | Commit | Resultado |
|---|---|---|---|---|
| `00` | Investigação: retrato real do projeto | done | — | mediu o estado inicial e **achou duas falhas sérias** que viraram as tasks `50` e `51` |
| `01` | Higiene do repositório | done | — | 277 → 45 warnings ao parar de varrer as worktrees; nenhuma worktree com commit exclusivo removida |
| `02` | Scripts de verificação | done | — | `npm run typecheck` e `npm run check` passam a existir |
| `03` | Triagem do trabalho não commitado | done | `9a78077` `95563c0` `86161ad` | 18 arquivos soltos viraram 3 commits temáticos; `git status` limpo |
| `50` | O middleware não protegia `/app/*` | done | — | **3 telas da área logada abriam sem sessão**; 17 de 17 rotas passam a redirecionar |
| `51` | Rate limiter com balde compartilhado | done | — | uma usuária podia trancar outra fora do login; login bem-sucedido deixa de consumir cota |
| `04` | Zerar erros de ESLint em `src/` | **skipped** | — | sem objeto: `eslint src` já era 0 erros antes da task existir |
| `05` | Remover código morto | done | — | 235 ocorrências de `no-unused-vars` → 0, sem silenciar nenhuma |
| `06` | Migrar `<img>` para `next/image` | done | — | 42 ocorrências; prova visual adiada para a `14` |

### Fase 2 — Testes

| id | Título | Status | Commit | Resultado |
|---|---|---|---|---|
| `07` | Infraestrutura de testes | done | — | Vitest + Playwright do zero; o projeto sai de 0 testes |
| `08` | E2E de autenticação | done | — | 3 logins, acesso cruzado nos dois sentidos; **pegou uma regressão da `50`** |
| `09` | E2E do assistente de relato | done | — | 8 testes na primeira execução; achados `52` e `53` abertos |
| `10` | E2E de resposta da empresa | done | — | 9 testes; descobriu que **reabrir relato não funciona** (achado `55`) |
| `11` | Matriz de autorização das rotas | done | — | 32 rotas mapeadas; **nenhuma rota aberta**, nenhum 5xx anônimo |
| `52` | Etapas fora de tela focáveis | done | — | corrigido dentro da `13` |
| `53` | Selects sem rótulo associado | done | — | corrigido dentro da `13` |

### Fase 3 — Acessibilidade e responsividade

| id | Título | Status | Commit | Resultado |
|---|---|---|---|---|
| `12` | Varredura de acessibilidade | done | — | 523 ocorrências em 39 páginas, ordenadas por severidade × alcance |
| `13` | Correção das violações | done | — | **523 → 0**; os 3 fluxos completáveis só com teclado |
| `14` | Responsividade das públicas | done | — | **8 de 33** páginas rolavam para o lado → 0; o teste cobriu as autenticadas junto |
| `15` | Responsividade das autenticadas | done | — | o overflow já tinha sido fechado pela `14`; aqui foram alvo de toque, menu de celular e tabelas que não rolavam |

### Fase 4–5 — Autorização, erros, build e desempenho

| id | Título | Status | Commit | Resultado |
|---|---|---|---|---|
| `16` | Modelo de autorização | done | — | **vazamento de nome em relato anônimo** corrigido; matriz completa em `docs/autorizacao.md` |
| `17` | Validação e erros | done | — | 34 formatos de erro → 1; 19 de 19 rotas validam com Zod; ~64 mensagens em inglês → 0 |
| `18` | Build de produção | done | — | build em 31 s, 0 erro de hidratação em 4 telas; achados `58` e `59` |
| `19` | Desempenho | done | — | **LCP da home 7 220 → 848 ms**; imagens de 1 291 → 192 kB; achado `60` |
| `20` | Ambiente e deploy | done | — | validação de variáveis religada; `package-lock.json` de abril removido; achado `61` |

### Fase 6–7 — Documentação e defesa

| id | Título | Status | Commit | Resultado |
|---|---|---|---|---|
| `21` | Consolidar documentação | done | — | 21 → 5 `.md` na raiz; **`TODO.md` reescrito** (63 itens mentiam); 154 links conferidos |
| `22` | Manual de uso | done | — | 8 seções, capturas geradas do build de produção; achado `63` |
| `23` | Roteiro de demonstração | done | — | roteiro executado inteiro em 36 s sobre produção; achados `64` e `65` |

### Fase 8 — Achados corrigidos

| id | Título | Status | Commit | Resultado |
|---|---|---|---|---|
| `63` | `/ajuda` expunha credenciais | done | — | **a senha do admin saía no HTML de uma rota pública**; rota some em produção, 22 testes travam 10 rotas |
| `54` | Rótulos de status divergentes | done | `bbd03c3` | o mesmo status tinha 4 nomes; 5 mapas viraram 1 |
| `56` | Conta de empresa do seed era MEMBER | done | `a921253` | a demonstração não conseguia administrar a própria empresa; revelou **perda de dado em atualização parcial** |
| `57` | CTA de relato na tela da empresa | done | `6132233` | cartão que convidava a empresa a reclamar de si mesma, com link quebrado |
| `58` | `/api/me` 401 em toda página | done | `c4203d9` | console da home anônima: 1 erro por carregamento → nenhum |
| `59` | "Esqueceu a senha?" não existia | done | `724a20e` | link morto virou texto verdadeiro; varredura de links virou teste permanente |
| `60` | CLS do `/blog` | done | `d3a9530` | 0,0378 → 0,0000 no celular; header e footer deixam de ser desmontados |
| `61` | A plataforma não envia e-mail | done | `55b5b1b` | nenhuma tela promete mais e-mail; o manual diz o que a plataforma não faz |
| `62` | Limites de anexo divergentes | done | `bb58fad` | 4 valores diferentes → 1, com trava automatizada |
| `64` | Home estática congelava os números | done | `86c4cd3` | os números vinham do dia do build; revalidação de 300 s, convergência medida em 309 s |
| `65` | `/companies` estourava em 375 px | done | `8a5190a` | não era texto longo, era `min-width: auto` de item de grade; `min-w-0` em 3 lugares |
| `66` | Teste de teclado instável | done | `a99bdb6` | **a janela da corrida foi medida antes de fechada**: 27–46 ms; 30 de 30 depois |
| `67` | Endereço de suporte não verificado | done | `3390ff1` | **três domínios inexistentes**, um deles recebendo documento pessoal no único caminho de verificação |
| `68` | Falha intermitente no login da suíte | done | `ea14566` | 664 logins dirigidos não reproduziram; a suíte passa a sobreviver **e a avisar** |
| `69` | Schema e banco discordavam do CNPJ | done | `f4577d6` | `null` em campo obrigatório: 500 → 400; defeito irmão em `name` e um terceiro no onboarding |

---

## O que ficou bloqueado

Uma task, e o bloqueio é o correto.

### `55` — Depois de RESOLVED, a usuária não consegue reabrir o relato

**O que acontece hoje.** A empresa marca o relato como *Resolvida*. A autora
responde "não foi resolvido". **Nada acontece** — o status não muda, ninguém é
avisado, e a taxa de resolução no perfil público da empresa continua contando
aquele caso como resolvido.

**Por que está bloqueada.** Não é falta de código, é falta de decisão. São três
desenhos possíveis (reabrir sempre que a autora discordar; permitir uma
reabertura; exigir concordância das duas partes para encerrar), e a escolha
muda o que a pesquisa vai medir. Isso é da Paloma.

**O que já foi tentado, para o bloqueio não ser passivo.** Duas coisas foram
medidas e entram na conversa:

1. **Reabrir sempre não resolve sozinho.** Testado: a empresa reencerra quantas
   vezes quiser, sem limite. A opção 1 não tira dela o encerramento unilateral,
   só adia.
2. **As três opções mexem na taxa de resolução pública** — o número que aparece
   no perfil da empresa. Não é detalhe de tela: é o indicador que a plataforma
   publica.

**O que destrava.** Uma frase: qual dos três desenhos. A implementação está
descrita nos dois handlers e o teste da task `10` já existe para ser atualizado.

---

## Achados novos

Quinze problemas que **não estavam no plano** apareceram durante a execução.
Nenhum foi encontrado por leitura de código à toa: cada um apareceu porque
alguma medição foi feita.

| Achado | Onde apareceu | O que era | Estado |
|---|---|---|---|
| `50` | investigação `00` | 3 telas logadas abrindo sem sessão | corrigido |
| `51` | investigação `00` | uma usuária trancava a outra fora do login | corrigido |
| `52` `53` | E2E do assistente `09` | etapas fora de tela focáveis; selects sem rótulo | corrigidos na `13` |
| `54` | E2E da empresa `10` | o mesmo status com 4 nomes | corrigido |
| `55` | E2E da empresa `10` | encerramento sem direito de resposta | **bloqueado** |
| `56` | autorização `11` | a conta da demonstração não administrava a própria empresa | corrigido |
| `57` `58` `59` | build de produção `18` | CTA quebrado; 401 no console; link morto | corrigidos |
| `60` | desempenho `19` | deslocamento de conteúdo no blog | corrigido |
| `61` | ambiente `20` | quatro modelos de e-mail, nenhum envio | assumido e documentado |
| `62` | documentação `21` | limite de anexo com 4 valores diferentes | corrigido |
| `63` | manual `22` | **senha do admin no HTML de rota pública** | corrigido |
| `64` `65` | demonstração `23` | números congelados no build; `/companies` estourando | corrigidos |
| `66` `68` | suíte de testes | dois testes instáveis | corrigidos |
| `67` | manual `22` | três domínios de contato inexistentes | corrigido |
| `69` | responsividade `65` | schema e banco discordando, com caminho para 500 | corrigido |

**O padrão que isso desenha, e que vale mais que a lista.** Os achados mais
graves — a senha exposta, as telas desprotegidas, o vazamento de nome anônimo —
não vieram de auditoria de segurança. Vieram de tentar **escrever um manual**,
**rodar o roteiro da demonstração** e **medir tempos de carregamento**. Foi o
ato de olhar de perto, com qualquer propósito, que os revelou.

---

## Decisões que dependem de você

Cinco, formuladas para que cada uma dê para responder sem escrever código.

1. **Pôr `DATABASE_URL` no `.env` com a conexão *pooled* do Neon?**
   Hoje a aplicação roda na conexão direta e avisa no log a cada subida. Sob
   carga, esgota as conexões do banco. *(sim/não — e se sim, é só colar a URL)*

2. **Onde a plataforma vai ser hospedada?**
   Três coisas dependem disso: a região do banco (**139 ms por consulta** a
   partir do Brasil hoje), se `images.unoptimized` pode ser desligado, e se
   `sharp` precisa entrar. *(não é sim/não — é um nome)*

3. **O que acontece quando a usuária discorda do encerramento?**
   Reabrir sempre, permitir uma reabertura, ou exigir concordância das duas
   partes. É a task `55`. *(escolher 1, 2 ou 3)*

4. **A plataforma vai enviar e-mail nesta versão?**
   Existem quatro modelos HTML e nenhum envio. Se **não**, está tudo pronto:
   nenhuma tela promete e-mail e o manual registra a limitação. Se **sim**, há
   três níveis: só verificação de cadastro e recuperação de senha (é o que
   destrava a `59`), mais o aviso de nova mensagem (o de maior valor para quem
   usa), ou os dois. *(não / nível 1 / nível 2)*

5. **Os anexos podem ser abertos por quem tiver a URL?**
   Vão para o UploadThing sem controle de acesso. Quem receber o link abre o
   arquivo, mesmo sem conta. Para relatos que podem conter documento pessoal,
   isso merece uma resposta explícita. *(aceitar / não aceitar — e se não, vira
   task)*

---

## Prontidão para a defesa

**Veredito: dá para defender em novembro de 2026, e a demonstração foi ensaiada
de ponta a ponta.** O roteiro da task `23` foi executado inteiro sobre o build
de produção, cronometrado, em **36 segundos**, sem tropeços, com um cenário de
23 relatos preparado por script.

### O que dá para mostrar com segurança

Cada item abaixo tem teste automatizado que roda hoje:

- entrar como pessoa, como empresa e como administração;
- criar um relato pelo assistente, inclusive anônimo;
- a empresa receber, responder e mudar o status;
- o perfil público da empresa, com relatos e taxa de resolução;
- busca, blog e páginas institucionais;
- a área de administração, com verificação de empresa e auditoria;
- tudo isso em celular de 375 px, sem barra horizontal, e navegável por teclado.

### O que é melhor não mostrar

- **Reabrir um relato encerrado** — não funciona, e é a task `55`. Se a pergunta
  vier, a resposta honesta é melhor que a demonstração: *"está identificado,
  medido, e a decisão é de desenho da pesquisa."*
- **Qualquer coisa que dependa de e-mail** — recuperação de senha, verificação
  de cadastro, aviso de mensagem nova. A plataforma não envia e-mail e nenhuma
  tela promete que envia; a demonstração não deve criar a expectativa.
- **Upload de anexo em rede desconhecida** — depende do UploadThing, que é
  serviço externo. O roteiro já traz plano B.

### Risco remanescente, nomeado

| Risco | Tamanho | Mitigação existente |
|---|---|---|
| Banco Neon "dormindo" na primeira consulta | **alto** se a apresentação começar fria | plano B no roteiro: uma requisição de aquecimento antes de começar |
| Latência de 139 ms por consulta (banco fora do Brasil) | médio | a home cacheia por 300 s; as demais telas ficam perceptivelmente lentas |
| Rede da apresentação | médio | plano B documentado, incluindo demonstração local |
| Serviço externo de upload fora do ar | baixo | plano B: pular o passo do anexo |
| Um tropeço de conexão na suíte (`ECONNRESET`) | **baixo, e não afeta a defesa** | causa não identificada em 664 tentativas; a suíte sobrevive e registra quando acontece |

### O que este relatório não pode afirmar

Para que a lista acima não seja lida como mais do que é:

- **Conformidade WCAG AA não está provada.** Zero violação de axe cobre 30–40%
  dos critérios. Não houve teste com pessoa usando leitor de tela.
- **Não houve teste de carga.** Nada aqui diz como a plataforma se comporta com
  muitas usuárias ao mesmo tempo.
- **Não houve auditoria de segurança externa.** O que existe é a matriz de
  autorização, com todas as 32 rotas testadas — o que é bem diferente, e menos,
  do que um teste de invasão.
- **O manual e o roteiro descrevem o sistema de hoje.** Se algo mudar depois
  desta data, as capturas envelhecem — e o script que as gera é o remédio.

---

## Como continuar

Três caminhos, em ordem de retorno:

1. **Responder as cinco decisões acima.** Quatro delas destravariam trabalho já
   descrito e estimado.
2. **Rodar `npm run check` e a suíte antes de cada mudança.** É o que impede que
   este relatório envelheça igual ao `TODO.md` de julho.
3. **Rodar `scripts/conferir-schema-vs-banco.ts` sempre que o schema mudar.** O
   projeto usa `db:push`, que sincroniza sem gerar migração — foi assim que a
   divergência da task `69` nasceu sem deixar rastro.
