# Acessibilidade e Inclusao para Baixa Alfabetizacao

Este documento define diretrizes para tornar a plataforma utilizavel por pessoas com pouca experiencia digital, baixa alfabetizacao, leitura lenta, pouco letramento visual e medo de errar.

O objetivo nao e apenas cumprir acessibilidade tecnica. O objetivo e reduzir barreiras reais de uso:

- entender a tela sem esforco
- concluir uma tarefa sem ler textos longos
- sentir seguranca para continuar
- pedir ajuda sem vergonha
- conseguir usar no celular, com pressa, na rua ou com conexao ruim

## Publico-alvo

A plataforma precisa funcionar bem para perfis muito diferentes:

- pessoas que nunca usaram um sistema parecido
- pessoas que leem pouco ou com dificuldade
- usuarias que dependem quase totalmente do celular
- pessoas mais velhas
- pessoas com pressa, ansiedade ou pouca paciencia para formular cadastro
- pessoas com baixa escolaridade
- pessoas que precisam de apoio de terceiros para preencher dados
- pessoas com deficiencia visual parcial ou total

## Principios de design

### 1. Uma acao por tela

Cada tela deve responder a uma pergunta simples:

- quem voce e
- o que voce quer fazer
- qual e o proximo passo

Evitar telas com muitos caminhos ao mesmo tempo. Se houver mais de uma decisao importante, divida em etapas.

### 2. Menos texto, mais clareza

Texto curto funciona melhor que texto bonito.

Prefira:

- frases curtas
- palavras concretas
- verbos diretos
- exemplos reais

Evite:

- jargao juridico
- termos de produto como "onboarding" ou "fluxo"
- frases longas com varias subordinadas
- paragrafos grandes em tela de cadastro

### 3. Sempre mostrar contexto

Se a pessoa estiver numa etapa, ela precisa saber:

- onde esta
- o que falta
- o que acontece depois
- como voltar

### 4. Aacao visivel

O botao principal precisa ser obvio:

- cor consistente
- tamanho generoso
- label direto
- sem ambiguidade

### 5. Reducao de medo

Muita gente abandona um sistema porque acha que vai errar.

Por isso:

- explicar que pode voltar
- mostrar salvamento automatico quando existir
- usar mensagens tranquilas
- evitar erros agressivos ou tecnicos

## Diretrizes de linguagem

### Nivel de escrita

Escrever para leitura basica.

Regras:

- uma ideia por frase
- evitar voz passiva
- evitar paragrafos longos
- evitar abreviacoes internas
- evitar siglas sem explicar

### Exemplos de reformulacao

Ruim:

- "Preencha seus dados para concluir o onboarding"

Melhor:

- "Vamos montar sua conta em poucos passos"

Ruim:

- "Autorizacao insuficiente para executar a operacao"

Melhor:

- "Voce nao tem permissão para fazer isso"

Ruim:

- "Campo invalido"

Melhor:

- "Digite um email valido"

### Padrão de tom

O tom deve ser:

- respeitoso
- simples
- direto
- acolhedor
- sem infantilizar

## Fluxos prioritarios

### Entrada na plataforma

Fluxo ideal:

1. escolher perfil
2. criar conta
3. confirmar acesso
4. entrar

Melhorias:

- botao de login e cadastro muito claros
- nao esconder a diferenca entre pessoa e empresa
- deixar o usuario avancar sem ler muito

### Cadastro

Cadastro precisa ser o menor possivel.

Regras:

- pedir apenas o necessario
- usar exemplos abaixo dos campos
- dividir em etapas
- mostrar progresso visual
- permitir voltar sem perder dados

Sugestao:

- etapa 1: quem voce e
- etapa 2: dados basicos
- etapa 3: confirmar e seguir

### Reclamar

O fluxo de reclamacao precisa ser guiado:

- escolher empresa
- descrever o problema
- anexar prova se tiver
- revisar
- enviar

Se possivel:

- permitir salvar e continuar depois
- explicar em linguagem simples o que vai acontecer apos o envio

### Acompanhar

Depois de enviar, a pessoa precisa entender:

- se a reclamacao foi recebida
- se a empresa respondeu
- o que falta
- quando voltar

Isso pode ser feito com:

- status simples
- cores consistentes
- linha do tempo
- mensagens curtas

## Componentes de interface

### Botao principal

O botao principal deve ter:

- altura generosa
- texto curto
- contraste alto
- label de acao clara

Boas labels:

- "Continuar"
- "Enviar reclamacao"
- "Entrar"
- "Ver resposta"
- "Salvar e continuar"

Evitar labels vagas como:

- "Prosseguir"
- "Confirmar"
- "Avancar"
- "Submeter"

### Botao secundario

Usar para:

- voltar
- cancelar
- editar
- saber mais

### Cards de escolha

Cards de escolha sao importantes para publicos com baixa alfabetizacao porque reduzem leitura.

Diretrizes:

- usar icone grande
- usar titulo muito curto
- usar descricao de uma linha, no maximo duas
- deixar a acao clara no final

Exemplo:

- "Sou uma pessoa"
- "Sou uma empresa"

Nao usar:

- "Pessoa fisica"
- "Entidade corporativa"
- "Perfil de uso da plataforma"

### Campos de formulario

Para formulários:

- label sempre visivel
- placeholder como exemplo, nao como unica explicacao
- altura generosa para toque
- erro logo abaixo do campo
- um erro por vez quando possivel

Boas praticas:

- mostrar exemplo: "Ex: maria@email.com"
- informar quando um campo e opcional
- evitar mascaras complicadas sem necessidade

### Mensagens de erro

Mensagem boa:

- aponta o problema
- diz como corrigir
- usa linguagem simples

Exemplo:

- "Digite seu email"
- "A senha precisa ter 6 caracteres ou mais"
- "Esse CPF ja foi usado"

Mensagem ruim:

- "Erro ao processar sua requisicao"
- "Validation failed"
- "Unexpected server response"

## Acessibilidade visual

### Contraste

Garantir contraste forte entre:

- texto e fundo
- botao e fundo
- erro e resto da interface

### Tipografia

Regras:

- fonte legivel
- tamanhos generosos
- sem pesos muito fracos
- linhas com espacamento suficiente

### Hierarquia

Cada tela deve ter ordem clara:

1. logo ou titulo
2. objetivo da tela
3. acao principal
4. ajuda ou alternativas

### Tamanho de toque

Alvos de toque devem ser grandes o suficiente para:

- dedos grandes
- uso com uma mao
- uso em celular pequeno

### Estado de foco

Todo elemento interativo deve mostrar foco visivel.

Isso inclui:

- links
- botoes
- inputs
- menus

### Nao depender so de cor

Estados como erro, sucesso e aviso devem ter:

- cor
- icone
- texto explicativo

## Acessibilidade para baixa leitura

### Texto alternativo ao texto

Para pessoas que nao leem bem, a interface deve falar por outros meios:

- icones
- layout consistente
- exemplos
- audio
- ajuda humana

### Leitura guiada

Adicionar opcao de:

- ouvir a tela
- ouvir a explicacao da etapa
- ouvir instrucoes do formulario

Isso e muito util em:

- login
- cadastro
- inicio de reclamacao
- confirmacao de envio

### Repeticao util

Para reduzir erros:

- repetir o contexto quando necessario
- mostrar o nome da empresa selecionada
- mostrar o que foi preenchido
- mostrar o que falta

## Ajuda e suporte

### Ajuda humana

Para esse publico, ajuda humana nao e extra. E parte do produto.

Sugestoes:

- botao "Preciso de ajuda"
- canal rapido para atendimento
- opcao de falar com alguem por WhatsApp
- respostas simples e padronizadas

### Ajuda contextual

O ideal e ajudar no momento em que a pessoa trava.

Exemplos:

- dica ao lado do campo
- botao "O que e isso?"
- mini explicacao logo abaixo do titulo

### Ajuda sem vergonha

O texto precisa deixar claro que pedir ajuda e normal.

Exemplo:

- "Se quiser, voce pode pedir ajuda para continuar"

## Sugestoes de produto

### Modo simples

Um modo com:

- poucos textos
- botoes grandes
- exemplos visuais
- linguagem ainda mais curta

Pode ser o padrao para mobile.

### Modo audio

Funcionalidades:

- ouvir titulo da tela
- ouvir campo por campo
- ouvir mensagens de ajuda
- ouvir resumo final

### Fluxo assistido

Uma experiencia em passos, com:

- uma decisao por vez
- confirmacao visual forte
- botao de ajuda sempre visivel

### Rascunho automatico

Salvar automaticamente evita abandono.

Principalmente para:

- reclamacoes longas
- cadastro com documentos
- formulários de empresa

### Recuperacao facil

Se a pessoa sair no meio:

- avisar que o progresso foi salvo
- permitir continuar de onde parou

## Orientacoes por tela

### Home

Objetivo:

- explicar o que a plataforma faz sem exigir leitura longa

Melhorias:

- hero curto
- tres beneficios principais
- botao claro para comecar

### Login

Objetivo:

- entrar rapido

Melhorias:

- menos texto
- campo email com exemplo
- senha clara
- erro direto
- botao forte

### Registro

Objetivo:

- escolher perfil sem confusao

Melhorias:

- cards muito visuais
- pouco texto
- acao muito clara

### Onboarding

Objetivo:

- concluir cadastro sem sobrecarga

Melhorias:

- dividir em passos
- mostrar progresso
- salvar rascunho

### Criar reclamacao

Objetivo:

- registrar um problema com o minimo de atrito

Melhorias:

- linguagem simples
- exemplos em cada campo
- anexos opcionais com ajuda
- revisao final antes do envio

### Blog

Objetivo:

- informar com leitura facil

Melhorias:

- titulos curtos
- destaque visual
- cards com resumo pequeno

## Critérios de sucesso

A plataforma esta melhor para esse publico quando:

- a pessoa entende o proximo passo sem pedir ajuda
- o cadastro pode ser feito em poucas telas
- os botões principais sao obvios
- os erros dizem exatamente o que fazer
- a interface continua compreensivel mesmo sem leitura fluente
- o usuario consegue concluir tarefas no celular sem frustração

## Priorizacao recomendada

### Curto prazo

- simplificar textos de login, cadastro e onboarding
- adicionar exemplos em inputs
- liberar ajuda visivel
- melhorar estados de erro
- garantir botões grandes e consistentes

### Medio prazo

- modo simples
- suporte a audio
- salvamento automatico
- fluxo guiado de reclamacao

### Longo prazo

- revisao completa da linguagem da plataforma
- testes com usuarias reais de baixa alfabetizacao
- iteracao baseada em observacao de uso

## Como testar com usuarias reais

Teste com tarefas simples:

- entrar na conta
- escolher perfil
- criar uma reclamacao
- voltar para editar algo
- achar a empresa certa

Observe:

- onde a pessoa hesita
- o que ela ignora
- que parte ela le em voz alta
- onde ela pede ajuda
- em que tela ela desiste

## Conclusao

Se a plataforma quer atender pessoas que nao dominam tecnologia ou leitura, a regra principal e:

**menos interface, mais orientacao**

Isso significa reduzir texto, dividir passos, deixar escolhas obvias e assumir que a pessoa pode estar com medo de errar.

Esse documento deve servir como base para as proximas decisoes de UX, copy e frontend.
