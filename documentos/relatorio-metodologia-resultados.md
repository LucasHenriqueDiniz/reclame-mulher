# Relatório de Bolsista de Iniciação Científica

Plataforma ComunicaMulher — registro e acompanhamento de reclamações de mulheres impactadas por obras de infraestrutura.

Seções **4. Material e Métodos** e **5. Resultados**.

### O que este documento contém

| Seção | Conteúdo |
|---|---|
| 4.1 a 4.3 | Natureza do trabalho, etapas e diretrizes de acessibilidade que orientaram o projeto |
| 4.4 a 4.6 | Tecnologias, arquitetura da aplicação e modelo de dados |
| 4.7 a 4.9 | Segurança e privacidade, procedimentos de verificação e obtenção das figuras |
| 5.1 a 5.8 | A plataforma entregue, percorrida na ordem de uso, com 15 figuras das telas |
| 5.9 a 5.11 | Produtos gerados, limitações e os dados técnicos para a Discussão |

---

## 4. Material e Métodos

### 4.1 Natureza do trabalho

O trabalho caracteriza-se como pesquisa aplicada de desenvolvimento tecnológico: o produto da investigação é um artefato de software em funcionamento, e não um experimento controlado. O desenvolvimento foi conduzido de forma incremental, em ciclos curtos, cada um deles entregando uma parte utilizável da plataforma — e não em uma única etapa de especificação seguida de uma única etapa de construção.

Essa escolha decorre do próprio objeto. A plataforma precisa ser usada por mulheres com perfis muito distintos de familiaridade com tecnologia, e a única forma de verificar se uma tela funciona para essa leitora é colocá-la em funcionamento e observá-la. Ciclos curtos permitem que um erro de concepção seja identificado enquanto ainda é barato corrigi-lo — princípio de entrega incremental e resposta a mudanças formulado no Manifesto Ágil (BECK et al., 2001).

O desenvolvimento ocorreu entre outubro de 2025 e setembro de 2026, registrado em um repositório de controle de versão com 80 revisões documentadas.

### 4.2 Etapas do trabalho

O trabalho foi organizado em cinco etapas, parcialmente sobrepostas:

1. **Levantamento de requisitos e definição dos perfis de uso.** Identificação dos três papéis que a plataforma precisa atender — a mulher que registra o relato, a empresa responsável pela obra e a administração da plataforma — e das ações que cada um precisa executar.
2. **Definição das diretrizes de acessibilidade e linguagem.** Documento próprio, descrito em 4.3, elaborado antes da prototipagem para condicionar as decisões de interface.
3. **Prototipagem da interface.** Construção de 20 telas de protótipo navegável em ferramenta de design, cobrindo os fluxos principais antes de qualquer implementação.
4. **Implementação.** Construção da aplicação, do banco de dados e das interfaces, em ciclos incrementais.
5. **Verificação.** Testes automatizados e verificação contínua a cada alteração, descritos em 4.8.

### 4.3 Diretrizes de acessibilidade e de linguagem

Antes da prototipagem foi elaborado um documento de diretrizes voltado especificamente à inclusão de pessoas com baixa escolaridade e pouca familiaridade com sistemas digitais. As diretrizes dialogam com os princípios de perceptibilidade, operabilidade e compreensibilidade das WCAG 2.1 (W3C, 2018) e com o direito de acesso à informação assegurado pela Lei Brasileira de Inclusão (BRASIL, 2015), mas vão além deles em um ponto: as WCAG tratam sobretudo de deficiência, e o obstáculo principal deste público é a escolaridade. O documento parte da caracterização do público — pessoas que leem pouco ou com dificuldade, pessoas mais velhas, usuárias que dependem quase inteiramente do telefone celular, pessoas que precisam da ajuda de outra pessoa para preencher seus dados, pessoas com deficiência visual parcial ou total — e estabelece cinco princípios de projeto:

- **Uma ação por tela.** Cada tela responde a uma pergunta simples. Havendo mais de uma decisão importante, o fluxo é dividido em etapas.
- **Menos texto, mais clareza.** Frases curtas, palavras concretas, verbos diretos, exemplos reais; sem jargão jurídico ou termos técnicos de produto.
- **Contexto sempre visível.** Quem está no meio de um fluxo precisa saber onde está, quanto falta, o que vem depois e como voltar.
- **Uma ação visível.** O botão principal tem cor consistente, tamanho generoso e rótulo direto.
- **Menos medo.** Muitas pessoas abandonam um sistema por acharem que vão errar; por isso o sistema informa que é possível voltar e mantém mensagens de erro calmas e não técnicas.

Esses princípios são verificáveis no produto final: a divisão do registro de reclamação em quatro etapas com barra de progresso, a possibilidade explícita de voltar e alterar o que já foi respondido, e a mensagem "Não se preocupe, você pode voltar e mudar essa informação depois" decorrem diretamente deles.

### 4.4 Tecnologias empregadas

A seleção das tecnologias privilegiou três critérios: maturidade e documentação em português, custo de operação compatível com um projeto acadêmico, e possibilidade de manutenção por uma equipe pequena.

| Camada | Tecnologia | Papel |
|---|---|---|
| Aplicação | Next.js 15.5 (App Router) | Framework web; renderiza as páginas e expõe as rotas de API |
| Interface | React 19.1 e TypeScript 5 | Construção das telas com verificação estática de tipos |
| Estilo | Tailwind CSS e Radix UI | Sistema de estilos e componentes de interface acessíveis |
| Banco de dados | PostgreSQL (Neon) | Persistência dos dados |
| Acesso a dados | Drizzle ORM 0.44 | Consultas tipadas e migrações versionadas do esquema |
| Validação | Zod 4 | Validação dos dados recebidos em cada rota |
| Formulários | React Hook Form | Controle dos formulários da interface |
| Estado remoto | TanStack Query 5 | Sincronização entre a interface e o servidor |
| Sessão | jose (JWT) e bcryptjs | Autenticação por token assinado e senhas armazenadas com hash |
| Internacionalização | next-intl 4 | Textos em português do Brasil, com estrutura pronta para outros idiomas |
| Anexos | UploadThing | Armazenamento das fotos anexadas às reclamações |
| Publicação | Vercel | Hospedagem e publicação automática |
| Testes | Vitest 4 e Playwright 1.62 | Testes unitários e testes de ponta a ponta |
| Integração contínua | GitHub Actions | Execução automática das verificações a cada alteração |

### 4.5 Arquitetura da aplicação

A aplicação é um sistema web único, publicado em ambiente de nuvem, organizado em quatro camadas:

- **Páginas e rotas de API** (`src/app/`) — 44 páginas e 32 rotas de API no mesmo diretório. Cada rota de API é o ponto de entrada de uma operação: lê a sessão da usuária, valida o corpo da requisição, aciona o acesso a dados e devolve a resposta.
- **Validação** (`src/server/dto/`) — um esquema de validação por operação, que descreve o formato esperado de cada requisição. Nenhum dado chega ao banco sem passar por ele.
- **Acesso a dados** (`src/server/repos/`) — um módulo por entidade, reunindo todas as consultas ao banco daquela entidade. É a única camada autorizada a tocar o esquema do banco, o que impede que uma consulta apareça espalhada pela interface.
- **Esquema de dados** (`src/db/schema.ts`) — a definição única do modelo de dados, a partir da qual as migrações são geradas.

O controle de acesso às rotas é feito por um interceptador (`middleware.ts`), executado antes de qualquer página: rotas públicas são liberadas, e o acesso a qualquer rota da área logada sem sessão válida é redirecionado ao login.

A base de código soma 26.602 linhas de TypeScript e 95 componentes de interface reutilizáveis.

### 4.6 Modelo de dados

O modelo compreende 13 tabelas, evoluídas ao longo do projeto por 13 migrações versionadas. As migrações são geradas a partir do esquema e nunca editadas à mão, de modo que o banco de qualquer ambiente pode ser reconstruído do zero na mesma sequência.

| Grupo | Tabelas | Finalidade |
|---|---|---|
| Pessoas | `users`, `profiles` | Contas de acesso e dados de perfil |
| Empresas | `companies`, `company_users`, `projects` | Empresas, seus responsáveis e as obras sob sua responsabilidade |
| Reclamações | `complaints`, `complaint_messages`, `complaint_attachments` | O relato, o histórico de mensagens e as fotos anexadas |
| Conteúdo | `blog_posts`, `blog_tags`, `blog_post_tags` | Materiais de orientação publicados na plataforma |
| Moderação | `reports`, `audit_logs` | Denúncias de abuso e registro de auditoria das ações |

A situação de uma reclamação é um valor controlado pelo banco, e não texto livre: **aberta**, **respondida** ou **resolvida**. Essa restrição é o que permite que os indicadores de atendimento das empresas sejam calculados de forma confiável.

### 4.7 Segurança e privacidade

Quatro mecanismos foram implementados:

- **Senhas nunca armazenadas em texto.** São gravadas apenas como hash, por função de derivação com sal.
- **Sessão por token assinado.** A sessão trafega em um cookie inacessível ao JavaScript da página (`httpOnly`), o que reduz o risco de roubo de sessão.
- **Limite de tentativas de login.** Cinco tentativas por endereço de origem a cada quinze minutos. A contagem é mantida na memória do processo que atende a requisição; como a aplicação é publicada em ambiente de execução distribuído, o limite vale por instância e não globalmente. Trata-se, portanto, de uma barreira contra tentativas automatizadas simples, e não de uma proteção completa contra força bruta distribuída — a substituição por um contador compartilhado é um trabalho futuro identificado.
- **Minimização de dados.** São coletados apenas os dados necessários ao registro e ao acompanhamento do relato, em linha com o princípio da necessidade previsto na Lei Geral de Proteção de Dados (BRASIL, 2018).
- **Anonimato como opção da autora.** A reclamação pode ser publicada sem identificação da autora. A empresa responsável recebe e responde normalmente; o que não é exibido publicamente é o nome de quem registrou. Trata-se de um requisito de segurança pessoal, não de uma preferência estética: a mulher que denuncia uma obra pode conviver com quem a executa.

### 4.8 Procedimentos de verificação

A verificação da plataforma é automatizada e executada a cada alteração do código, em dois níveis:

- **Testes unitários** (Vitest): 29 testes em 5 arquivos, cobrindo as regras de validação e as funções de apresentação de dados.
- **Testes de ponta a ponta** (Playwright): 25 testes em 8 roteiros, que executam a aplicação em um navegador real e percorrem os fluxos completos — autenticação e redirecionamento por perfil, painel da usuária, criação de reclamação nas quatro etapas, resposta da empresa, troca de senha, edição de publicações do blog e cadastro de projetos.

Os testes de ponta a ponta não usam dados de produção. A cada execução, um banco PostgreSQL descartável é criado, o esquema é aplicado, uma carga de dados de demonstração é inserida e o banco é destruído ao final. Isso torna cada execução independente da anterior e reprodutível em qualquer máquina.

Um fluxo de integração contínua executa, a cada alteração enviada ao repositório, a análise estática do código, os testes unitários e, em seguida, os testes de ponta a ponta.

### 4.9 Obtenção das figuras deste relatório

As figuras da seção 5 não são capturas manuais. Foram geradas por um roteiro automatizado que abre a aplicação em um navegador, autentica-se em cada um dos três perfis, percorre as telas na ordem em que aparecem no uso real e grava cada uma em resolução dupla. Cada figura tem sua legenda registrada junto da tela que a origina, de modo que uma nova execução do roteiro atualiza as imagens sem que o texto precise ser reescrito.

O procedimento foi adotado por dois motivos. O primeiro é a reprodutibilidade: qualquer pessoa com o repositório reproduz exatamente as mesmas figuras com um comando. O segundo é a consistência: capturas manuais variam em tamanho, recorte e resolução, e essa variação é visível quando as imagens são reunidas em um mesmo documento.

O procedimento também revelou defeitos. A captura sistemática das telas expôs um erro de exibição do identificador da reclamação na área da empresa, corrigido em seguida.

---

## 5. Resultados

### 5.1 Visão geral

A plataforma foi construída e está em funcionamento, publicada em ambiente de nuvem e acessível pela internet. O núcleo opera de ponta a ponta: uma mulher cria sua conta, registra uma reclamação com fotos e localização, recebe um identificador, acompanha a resposta da empresa e vê a situação do caso mudar até a resolução — e a empresa recebe, responde e encerra o atendimento pela mesma plataforma.

| Indicador | Quantidade |
|---|---|
| Perfis de acesso implementados | 3 (pessoa, empresa, administração) |
| Páginas da aplicação | 44 |
| Rotas de API | 32 |
| Componentes de interface | 95 |
| Tabelas do banco de dados | 13 |
| Migrações do esquema | 13 |
| Linhas de TypeScript | 26.602 |
| Testes automatizados | 54 (29 unitários e 25 de ponta a ponta) |
| Telas documentadas em figuras | 35 |

### 5.2 Página inicial e perfis de acesso

A página inicial é o primeiro contato de quem ainda não tem cadastro. Ela apresenta a proposta, os números da plataforma e o caminho direto para o registro de uma reclamação.

{{figura:01-home}}

No primeiro acesso, a plataforma pergunta qual perfil está sendo criado. A separação entre **pessoa** e **empresa** ocorre nesse ponto e determina toda a experiência subsequente: as duas contas veem áreas diferentes, com permissões diferentes.

{{figura:04-onboarding-perfil}}

### 5.3 Registro de uma reclamação

Este é o fluxo central da plataforma e o que mais recebeu atenção de projeto. Ele materializa o princípio de "uma ação por tela": está dividido em quatro etapas — **Histórico**, **Descrição**, **Fotos** e **Finalizar** — com barra de progresso permanentemente visível e possibilidade de retorno a qualquer etapa anterior antes do envio.

Na primeira etapa a autora localiza a empresa responsável pela obra e informa se já reclamou do mesmo problema por outro canal. A pergunta não é burocrática: saber que a pessoa já tentou resolver por outra via altera a forma como a empresa trata o caso.

{{figura:17-nova-reclamacao-etapa1}}

A segunda etapa reúne o relato em si — título, descrição livre e localização.

{{figura:17b-nova-reclamacao-etapa2}}

A terceira etapa é o envio de fotos, explicitamente opcional. A tela oferece o botão "Continuar sem foto", de modo que a ausência de imagens não interrompe o registro nem exige da usuária a interpretação de um campo vazio.

A quarta etapa classifica o relato em três dimensões: tipo do problema (saúde, mobilidade, patrimônio, direitos humanos ou ambiental), urgência e alcance do impacto — se atinge apenas a autora, sua família, a vizinhança ou a comunidade. É essa classificação que permite, mais adiante, agregar os relatos por natureza e por gravidade.

{{figura:17d-nova-reclamacao-etapa4}}

Concluído o envio, a plataforma confirma o registro e apresenta o identificador do relato, no formato `#R-XXXX-XXXX`, junto do prazo médio de resposta daquela empresa. O identificador é o elemento que dá à autora a segurança de que o relato existe e pode ser cobrado.

{{figura:17e-nova-reclamacao-protocolo}}

### 5.4 Acompanhamento pela autora

O painel da usuária reúne seus relatos com a situação de cada um, filtráveis por abas — últimas, não respondidas, respondidas e concluídas.

{{figura:15-painel-usuaria}}

Ao abrir um relato, a autora encontra os dados do caso, sua descrição, os anexos e o histórico completo de mensagens em ordem cronológica, além do campo para responder à empresa. Na figura abaixo o relato está em aberto: existe apenas a mensagem da autora, e a resposta da empresa ainda é aguardada.

{{figura:18-detalhe-reclamacao}}

### 5.5 Área da empresa

A empresa dispõe de um painel com cinco indicadores — reclamações recebidas, casos resolvidos, casos sem resposta, taxa de resolução e projetos ativos — e da lista de reclamações recebidas, filtrável por situação e pesquisável por texto.

{{figura:22-painel-empresa}}

A tela de atendimento reúne, em um único lugar, o relato, os anexos, o histórico da conversa, o campo de resposta e o controle de situação do caso. Responder e alterar a situação são ações deliberadamente separadas: a empresa pode manter uma conversa em andamento sem declarar o caso resolvido antes da hora, o que evita o encerramento prematuro que esvaziaria o indicador de resolução.

{{figura:25-resposta-empresa}}

O cadastro de obras permite vincular cada reclamação ao projeto correspondente, o que faz o relato chegar à equipe responsável em vez de a um canal genérico.

{{figura:27-projetos-empresa}}

### 5.6 Transparência pública

O perfil público de cada empresa é o resultado com maior potencial de efeito prático. Ele reúne, em uma página acessível sem cadastro, os dados da empresa, seus indicadores de atendimento — taxa de resolução, casos resolvidos, tempo médio de resposta — e as reclamações públicas que recebeu.

O efeito pretendido é assimétrico em favor de quem reclama: a empresa que responde bem tem esse comportamento registrado e visível; a que não responde também.

{{figura:10-perfil-publico-empresa}}

### 5.7 Área administrativa

A administração da plataforma conta com a gestão do cadastro e da verificação das empresas, a gestão das publicações e o registro de auditoria das ações realizadas.

{{figura:30-admin-empresas}}

O registro de auditoria guarda quem fez o quê e quando. Em uma plataforma que trata de denúncias, essa é uma exigência de confiabilidade: sem ele, não há como demonstrar que um relato não foi alterado ou removido indevidamente.

{{figura:32-admin-auditoria}}

### 5.8 Documentação de uso

Os manuais da plataforma foram publicados dentro da própria aplicação e são acessíveis **sem necessidade de login**. A decisão é deliberada: exigir sessão para ler a documentação exclui exatamente quem mais precisa dela — quem ainda está decidindo se vai se cadastrar e quem ficou preso na tela de login.

{{figura:13-manuais}}

### 5.9 Produtos gerados

O trabalho gerou quatro produtos:

1. **A plataforma em funcionamento**, publicada e acessível pela internet.
2. **O código-fonte**, versionado, documentado e acompanhado de 54 testes automatizados que verificam seu funcionamento a cada alteração.
3. **O Manual de Uso da Plataforma**, documento ilustrado com 35 figuras, organizado na ordem de utilização do sistema e escrito para a usuária final.
4. **O procedimento automatizado de documentação visual**, que regenera todas as figuras da plataforma com um comando, e que torna tanto o manual quanto este relatório atualizáveis sem retrabalho manual.

### 5.10 Limitações e trabalhos futuros

O relato honesto dos limites integra o resultado:

- **A plataforma não foi submetida a teste com usuárias reais.** As diretrizes de acessibilidade foram aplicadas no projeto das telas, mas sua eficácia junto ao público-alvo ainda não foi medida. Este é o próximo passo de maior valor.
- **Os dados exibidos são de demonstração.** Os relatos, empresas e indicadores que aparecem nas figuras foram criados para ilustrar o funcionamento; a plataforma ainda não recebeu uso em ambiente real.
- **O envio de notificações por correio eletrônico está implementado, mas não foi verificado em escala.**
- **A adaptação para telefone celular precisa de nova rodada de verificação.** Como boa parte do público-alvo depende quase inteiramente do celular, esse é um requisito central, e as figuras deste relatório foram capturadas em resolução de computador.
- **A seleção de empresa pelo usuário vinculado a mais de uma organização ainda não está implementada**; a plataforma assume, por ora, uma empresa por conta.

### 5.11 Dados técnicos para a Discussão

Reúnem-se aqui os dados apurados que sustentam a argumentação da seção seguinte, cuja redação cabe à orientação. Cada item traz o dado e o que ele permite afirmar.

**Sobre o desequilíbrio que a plataforma pretende corrigir.** Hoje, a mulher afetada por uma obra e a empresa que a executa negociam em condições assimétricas: o canal é privado, o histórico não fica registrado e o custo de não responder é zero. A plataforma altera três variáveis dessa relação — o registro passa a ser permanente e identificado por um protocolo, o histórico da conversa fica preservado, e a taxa de resolução de cada empresa torna-se pública. Nenhuma delas obriga a empresa a responder; todas elas tornam a ausência de resposta visível.

**Sobre a viabilidade técnica com equipe reduzida.** A plataforma foi construída e mantida com 26.602 linhas de código, 46 bibliotecas de produção e infraestrutura de custo próximo de zero em faixa gratuita de serviços de nuvem. O dado sustenta a afirmação de que uma plataforma cívica desse porte é viável fora do ambiente corporativo — em um laboratório universitário, por uma equipe pequena.

**Sobre a sustentabilidade da manutenção.** Os 54 testes automatizados e a verificação executada a cada alteração enviada ao repositório são o que permite que a plataforma seja mantida por pessoas que não participaram de sua construção. Em um projeto acadêmico, cujo corpo de bolsistas se renova, essa é uma condição de continuidade e não um refinamento técnico.

**Sobre a distância entre projetar para a inclusão e comprová-la.** As diretrizes de acessibilidade foram formuladas antes da prototipagem e são rastreáveis em decisões concretas da interface — a divisão em quatro etapas, o retorno permitido a qualquer etapa, a mensagem que informa que é possível voltar. Mas a eficácia dessas decisões junto ao público-alvo não foi medida. A distância entre a diretriz aplicada e a diretriz comprovada é, provavelmente, o ponto mais fértil da discussão e o que melhor justifica a continuidade da pesquisa.

**Sobre o alcance por telefone celular.** O público descrito nas diretrizes depende quase inteiramente do celular. A plataforma foi construída com layout adaptável, mas a verificação sistemática nessa condição ainda não foi feita, e as figuras deste relatório foram capturadas em resolução de computador. É uma lacuna entre o requisito declarado e a evidência disponível.

**Sobre a transparência como mecanismo.** O perfil público de cada empresa reúne taxa de resolução, casos resolvidos e tempo médio de resposta em página aberta, sem cadastro. O mecanismo é assimétrico em favor de quem reclama e não depende de sanção: opera por reputação. Sua eficácia real depende de volume de uso — com poucos relatos, os indicadores não distinguem empresas — o que liga esta discussão diretamente ao trabalho futuro de adoção.

---

## Referências citadas nestas seções

As referências abaixo são apenas as citadas nas seções 4 e 5. A bibliografia consolidada do relatório cabe à orientação.

BECK, K. et al. **Manifesto for Agile Software Development**. 2001. Disponível em: https://agilemanifesto.org.

BRASIL. **Lei nº 13.146, de 6 de julho de 2015**. Institui a Lei Brasileira de Inclusão da Pessoa com Deficiência (Estatuto da Pessoa com Deficiência).

BRASIL. **Lei nº 13.709, de 14 de agosto de 2018**. Lei Geral de Proteção de Dados Pessoais (LGPD).

W3C. **Web Content Accessibility Guidelines (WCAG) 2.1**. W3C Recommendation, 5 jun. 2018. Disponível em: https://www.w3.org/TR/WCAG21/.

---

## Observação para a montagem final do relatório

Este documento cobre a metodologia e os resultados **do desenvolvimento da plataforma**. As seções 4 e 5 foram atribuídas conjuntamente a três bolsistas, e as contribuições de Marina e Bruna precisam ser integradas antes da entrega ao orientador — em especial, o que couber a cada uma nas etapas de levantamento de requisitos (4.2), diretrizes de acessibilidade (4.3) e prototipagem da interface (4.4), além dos resultados correspondentes.
