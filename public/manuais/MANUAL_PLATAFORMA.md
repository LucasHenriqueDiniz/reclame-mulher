# Manual da Plataforma ReclameMulher

**Guia Completo de Fluxos e Funcionalidades**

---

## Índice

1. [Homepage e Navegação](#homepage-e-navegação)
2. [Fluxo de Criação de Reclamação](#fluxo-de-criação-de-reclamação)
3. [Fluxo de Resposta da Empresa](#fluxo-de-resposta-da-empresa)
4. [Dashboards](#dashboards)
5. [Perfis e Configurações](#perfis-e-configurações)
6. [Recursos Adicionais](#recursos-adicionais)

---

## Homepage e Navegação

A homepage é o ponto de entrada da plataforma, acessível por usuários não autenticados e como hub central após login.

### Elementos Principais

#### 🎯 Header Principal
- Logo ReclameMulher
- Menu de navegação
- Botões de Login/Registro
- Seletor de idioma (PT/EN/ES)

#### ✨ Hero Section
- Mensagem impactante sobre empoderamento de mulheres
- Call-to-action para criar reclamação
- Imagens inspiradoras de infraestrutura

#### 📈 Estatísticas de Impacto
- Número de reclamações processadas
- Empresas verificadas na plataforma
- Taxa de resoluções alcançadas
- Mulheres impactadas

#### 🔄 Carrossel de Processo
Visual dos 4 passos principais:
- Criar reclamação
- Empresa responde
- Acompanhar progresso
- Resolver problema

#### 🏢 Categorias de Impacto
- **Saúde**: Acidentes, falta de segurança
- **Mobilidade**: Trânsito, acessibilidade
- **Patrimônio**: Danos a imóvel/bem pessoal
- **Direitos Humanos**: Discriminação, assédio
- **Ambiental**: Poluição, resíduos

#### 🤝 Seção de Parcerias
- Logos de empresas parceiras
- Links para organizações
- Manifesto de comprometimento

### Navegação Pós-Login

Após autenticação, a plataforma oferece diferentes caminhos conforme perfil:

**👩 Usuária Pessoa**
- Redirecionada para `/app/complaints`
- Lista de reclamações pessoais
- Opção de criar nova reclamação
- Acesso a configurações

**💼 Usuária Empresa**
- Redirecionada para `/app/company/dashboard`
- Dashboard com estatísticas
- Inbox de reclamações
- Gerenciamento de projetos e equipe

**🔐 Admin**
- Acesso a `/app/admin`
- Painel administrativo
- Controles globais
- Auditoria de ações

### Fluxo de Autenticação

```
1. LOGIN/REGISTRO → 2. VERIFICAÇÃO → 3. PAPEL (Pessoa/Empresa) → 4. ONBOARDING
```

**Detalhes:**

| Etapa | Ação | Dados Coletados |
|-------|------|-----------------|
| Login | Email + Senha | Credenciais de acesso |
| Verificação | Confirmar email (se novo) | Token de verificação |
| Escolher Papel | Pessoa ou Empresa | Role do perfil |
| Onboarding | Preencher dados | Nome, localização, contato |

---

## Fluxo de Criação de Reclamação

O processo para registrar uma reclamação é estruturado em **4 etapas intuitivas**, permitindo documentação completa do caso.

### Visão Geral do Wizard

```
ETAPA 1: HISTÓRICO → ETAPA 2: DESCRIÇÃO → ETAPA 3: ANEXOS → ETAPA 4: CLASSIFICAÇÃO
```

### Etapa 1: Histórico de Reclamações

**Objetivo:** Identificar se há histórico anterior do problema

**Elementos:**
- **Pergunta Principal**: "Você já reclamou sobre esse problema em outro local?"
- **Opções**: Sim / Não
- **Se Sim**: Selecionar canal (chat, polícia, prefeitura, ouvidoria, outro)

**Benefícios:**
- Rastrear padrões de problemas
- Conectar reclamações relacionadas
- Priorizar casos crônicos

### Etapa 2: Descrição da Reclamação

**Objetivo:** Capturar detalhes completos do problema

**Campos:**

| Campo | Limite | Descrição |
|-------|--------|-----------|
| **Título** | 100 caracteres | Resumo do problema |
| **Descrição** | Sem limite | Detalhes completos do ocorrido |
| **Localização** | 200 caracteres | Endereço ou referência geográfica |

**Dicas:**
- Descrever quando, onde e como aconteceu
- Incluir impacto pessoal
- Mencionar tentativas anteriores de resolver

### Etapa 3: Anexos (Fotos e Documentos)

**Objetivo:** Fornecer evidências visuais/documentais

**Especificações:**
- **Formatos**: JPG, PNG, PDF, DOC, DOCX
- **Tamanho máximo**: 10MB por arquivo
- **Limite**: 5 arquivos por reclamação
- **Interface**: Drag & drop ou clique para selecionar

**Dicas:**
- Fotos devem mostrar claramente o problema
- Datas e contexto ajudam
- Documentos oficiais aumentam credibilidade

### Etapa 4: Classificação e Envio

**Objetivo:** Contextualizar a reclamação para a empresa

**Campos Obrigatórios:**

| Campo | Opções | Impacto |
|-------|--------|--------|
| **Empresa Alvo** | Busca de banco de dados | Define destinatário |
| **Projeto** | Dropdown (se múltiplos) | Localiza problema em projeto específico |
| **Urgência** | Baixa / Média / Alta / Crítica | Prioriza resposta |
| **Categoria de Impacto** | 5 categorias | Classifica tipo de dano |
| **Alcance do Impacto** | Pessoal / Familiar / Comunidade / Regional | Dimensiona problema |

**Campos de Privacidade:**
- 🔒 **Anônima?** (Sim/Não) - Não revela identificação
- 🌐 **Pública?** (Sim/Não) - Aparece no perfil da empresa

### Após Envio: Tela de Sucesso

**Exibido:**
- ✅ Confirmação de envio
- 🆔 ID da reclamação
- 📧 Referência para acompanhamento
- 📤 Botão de compartilhamento
- 🔗 Link único (se anônima) para acompanhar

**Ações Disponíveis:**
- Compartilhar via WhatsApp, email, rede social
- Copiar link de acompanhamento
- Retornar ao dashboard
- Criar nova reclamação

### Opções Iniciais (Antes da Autenticação)

Usuária não autenticada pode iniciar reclamação, com dois caminhos:

1. **Prosseguir com Email Anônimo**
   - Insere apenas email
   - Recebe link único para acompanhamento
   - Recomendado para casos sensíveis

2. **Fazer Login/Registro**
   - Dados preenchidos automaticamente
   - Histórico vinculado ao perfil
   - Melhor para seguimento futuro

**Banner de Autenticação** aparece sugerindo login, mas não obriga.

---

## Fluxo de Resposta da Empresa

As empresas recebem notificações e respondem através de interface estruturada no painel administrativo.

### Recebimento de Reclamação

```
USUÁRIA ENVIA → EMAIL NOTIFICAÇÃO → EMPRESA FAZ LOGIN → ACESSA INBOX
```

**Email de Notificação:**
- Enviado para contatos cadastrados da empresa
- Contém resumo da reclamação
- Link direto para detalhe no painel
- Urgência indicada no assunto

### Fluxo de Resposta

```
1. LOGIN → 2. INBOX → 3. DETALHE → 4. RESPONDER → 5. MARCAR RESOLVIDO
```

### Tela de Inbox da Empresa

**Localização:** `/app/company/inbox` ou `/app/company/complaints`

**Elementos Principais:**

#### Filtros
- **Todas**: Todas as reclamações
- **Abertas**: Sem resposta
- **Respondidas**: Resposta enviada
- **Resolvidas**: Caso fechado

#### Barra de Busca
- Buscar por título
- Buscar por ID
- Buscar por autor (se não anônimo)

#### Informações Listadas por Reclamação
- 📌 Título
- 📅 Data de recebimento
- 👤 Autor (ou "Anônimo")
- 🏷️ Status com badge colorido
- ⚡ Nível de urgência
- 🏢 Projeto relacionado (se aplicável)

#### Ordenação
- Mais recentes primeiro (padrão)
- Por urgência
- Por data
- Por status

### Tela de Detalhe de Reclamação

**O que é Exibido:**

#### Informações do Autor
- Nome (se público e não anônimo)
- Localização/cidade
- Contato (se permitido)
- Indicação se reclamação é anônima

#### Conteúdo Completo
- **Título** da reclamação
- **Descrição** completa
- **Localização** do problema
- **Categorias** de impacto selecionadas
- **Urgência** e alcance
- **Data** de criação

#### Anexos
- Galeria de fotos
- Links para download de documentos
- Indicação de tipos de arquivo

#### Histórico
- Timeline de todas as interações
- Datas e horários de respostas
- Indicação de quem respondeu

#### Classificação
- Badge de urgência (Baixa/Média/Alta/Crítica)
- Badge de impacto
- Badge de status

### Resposta Estruturada

**Campo de Resposta:**
- Área de texto richformat
- Suporte a formatação básica (negrito, itálico, listas)
- Limite de caracteres razoável
- Botões de enviar/salvar rascunho

**Conteúdo Esperado:**
- Explicação das ações tomadas
- Cronograma de resolução
- Contato de responsável
- Próximos passos

**Validações:**
- Resposta não pode estar vazia
- Requer pelo menos 20 caracteres
- Impede envio acidental

### Privacidade da Resposta

| Cenário | Resposta Visível Para | Notas |
|---------|----------------------|-------|
| Reclamação Pública | Autor + Público no perfil da empresa | ↑ Transparência |
| Reclamação Anônima | Apenas o autor (via link único) | 🔒 Segurança |
| Reclamação Privada | Apenas autor e empresa | 🔐 Máxima privacidade |

**Acesso Anônimo:**
- Usuária recebe email com link único
- Link valida acesso sem login
- Não revela dados da empresa diretamente

### Status de Reclamação

```
ABERTA → RESPONDIDA → RESOLVIDA (ou CANCELADA)
```

| Status | Definição | Ação |
|--------|-----------|------|
| 🔴 **ABERTA** | Sem resposta da empresa | Aparece em "Abertas" |
| 🟡 **RESPONDIDA** | Empresa respondeu | Aguarda feedback do autor |
| 🟢 **RESOLVIDA** | Problema solucionado | Removida de ativos |
| 🟣 **CANCELADA** | Duplicada ou fora de escopo | Arquivo inativo |

**Quem Marca como Resolvida?**
- Empresa (ao resolver)
- Autor (ao confirmar resolução - futuro)
- Admin (se necessário)

### Métricas de Desempenho da Empresa

Rastreadas automaticamente:

| Métrica | Cálculo | Benefício |
|---------|---------|-----------|
| **Tempo Médio de Resposta** | Média de horas entre recebimento e resposta | Avaliação de responsividade |
| **Taxa de Resolução** | % de resolvidas vs. total | Indicador de efetividade |
| **Total de Reclamações** | Todas recebidas | Visibilidade de impacto |
| **Casos em Diálogo Ativo** | Respondidas mas não resolvidas | Acompanhamento contínuo |

---

## Dashboards

Cada tipo de usuário tem dashboard personalizado com informações e ações relevantes.

### Dashboard da Usuária Pessoa

**Rota:** `/app/complaints`

#### Card de Perfil (Topo)
```
┌─────────────────────────────┐
│ 👤 [Avatar] Maria Silva    │
│    São Paulo, SP            │
│    Membro desde Jan/2024   │
└─────────────────────────────┘
```

**Informações:**
- Avatar/foto
- Nome completo
- Cidade e estado
- Data de cadastro
- Link para editar perfil

#### Abas/Filtros

| Aba | Exibe | Ações |
|-----|-------|-------|
| **Todas** | Todas as reclamações | Buscar por título |
| **Abertas** | Sem resposta | Visualizar |
| **Respondidas** | Com resposta empresa | Ler resposta |
| **Resolvidas** | Casos fechados | Ver histórico |

#### Lista de Reclamações

Cada item mostra:
- 📌 **Título** (link para detalhe)
- 🏢 **Empresa** (com logo se disponível)
- 📅 **Data** de criação
- 🏷️ **Status** (badge colorido)
- 🔒 **Ícone de privacidade** (anônimo/público)
- ⚡ **Urgência** (sutil)

#### Botões de Ação

- ➕ **Criar Nova Reclamação** (botão flutuante)
- 🔍 **Buscar** (barra de busca)
- ⚙️ **Filtros avançados** (opcional)
- 📱 **Compartilhar** (por reclamação)

#### Informações Adicionais

```
Estatísticas Rápidas:
├─ Total de Reclamações: X
├─ Abertas: X
├─ Respondidas: X
└─ Resolvidas: X
```

### Dashboard da Empresa

**Rota:** `/app/company/dashboard`

#### Cartões de Métricas Principais

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 📊       │  │ ✅       │  │ 💬       │  │ ⏱️       │
│ 150      │  │ 85       │  │ 45       │  │ 12h      │
│ Recl.    │  │ Resolvid │  │ Ativos   │  │ Resposta │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Métricas Exibidas:**

| Métrica | Cálculo | Formato |
|---------|---------|---------|
| Total de Reclamações | Sum(all) | Número grande + ícone |
| Casos Resolvidos | Count(status='RESOLVIDA') | Número + percentual |
| Diálogos Ativos | Count(status='RESPONDIDA') | Número destacado |
| Tempo Médio Resposta | AVG(response_time) | Horas com ícone de relógio |
| Taxa de Resolução | (resolvidas/total)*100 | Percentual com barra |
| Projetos Ativos | Count(status='IN_PROGRESS') | Número com ícone de pasta |

#### Tabs de Navegação

| Tab | Rota | Função |
|-----|------|--------|
| **Painel** | `/app/company/dashboard` | Visão geral e métricas |
| **Reclamações** | `/app/company/complaints` | Inbox completo |
| **Projetos** | `/app/company/projects` | Gerenciar projetos |
| **Perfil** | `/app/company/profile` | Editar dados públicos |

#### Gráficos (Futuro)

- Tendência de reclamações (últimas 30 dias)
- Distribuição por categoria de impacto
- Taxa de resposta vs. tempo
- Comparativa com outras empresas (benchmarking)

#### Atalhos Rápidos

- 🚀 Visualizar perfil público
- 📝 Responder primeira pendência
- 🔔 Ver notificações
- ⚙️ Gerenciar equipe

### Telas Complementares do Dashboard

#### Tab: Reclamações
- Inbox completo com todos os filtros
- Busca avançada
- Ações em massa (futuro)

#### Tab: Projetos
- Lista de projetos
- Criar novo projeto
- Editar/deletar existentes
- Ativar/desativar

#### Tab: Perfil
- Formulário de edição
- Logo da empresa
- Descrição e informações públicas
- Preview rápido

---

## Perfis e Configurações

Cada usuária gerencia seu perfil, segurança e preferências de privacidade.

### Onboarding Inicial

```
1. ESCOLHER PAPEL (Pessoa/Empresa)
   ↓
2. PREENCHER DADOS PESSOAIS
   ├─ Nome, Email, Telefone
   └─ Foto/Avatar
   ↓
3. ADICIONAR LOCALIZAÇÃO
   ├─ Cidade
   └─ Estado
   ↓
4. CONFIRMAÇÃO
   └─ "Bem-vinda!"
```

### Perfil da Pessoa

**Rota:** `/app/settings/account` (pessoa)

#### Dados Pessoais

| Campo | Tipo | Obrigatório | Atualizável |
|-------|------|-------------|------------|
| **Nome Completo** | Texto | ✓ | ✓ |
| **Email** | Email | ✓ | ✗ |
| **Telefone** | Telefone | ✗ | ✓ |
| **Avatar** | Imagem | ✗ | ✓ |
| **Cidade** | Texto | ✓ | ✓ |
| **Estado** | Select | ✓ | ✓ |
| **Endereço** | Texto | ✗ | ✓ |

#### Privacidade

- 👁️ **Perfil Público?** - Outros veem histórico de reclamações?
- 📧 **Email Visível?** - Empresas conseguem contato direto?
- 🔔 **Receber Notificações?** - Alertas por email?
- 📊 **Compartilhar Dados?** - Com parceiros e ONGs?

### Perfil da Empresa

**Rota:** `/app/company/profile`

#### Dados Públicos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Nome** | Texto | Nome legal/comercial |
| **Logo** | Imagem | Upload de marca |
| **Setor** | Select | Construção, Engenharia, etc. |
| **Website** | URL | Link do site oficial |
| **Descrição** | Textarea | Sobre a empresa (até 500 chars) |
| **Endereço** | Texto | Rua, número |
| **Cidade** | Texto | Localidade |
| **Estado** | Select | UF |

#### Selo de Verificação

- 🔍 **Status**: Não verificada / Aguardando / Verificada
- 📋 **Documentos**: Upload de CNPJ, certificados
- ✅ **Badges**: Aparece no perfil e reclamações

#### Visibilidade

- Perfil público em `/company/:slug`
- Aparecem em buscas e catálogo
- Histórico de reclamações visível

### Configurações de Segurança

**Rota:** `/app/settings/security`

#### Alterar Senha

- Campo de senha atual
- Novo campo de senha
- Confirmação de novo campo
- Validação em tempo real
- Requisitos: 8+ chars, maiúscula, número, especial

#### Sessões Ativas

- Lista de dispositivos/navegadores
- Último acesso
- Localização (IP)
- Opção de "sair de todas as sessões"

#### Autenticação 2FA (Futuro)

- Ativar/desativar
- Backup codes
- App authenticator
- SMS de confirmação

#### Histórico de Segurança

- Tentativas de login falhadas
- Alterações de senha
- Alterações de email
- Acessos de locais desconhecidos

### Gerenciamento de Equipe (Empresa)

**Rota:** `/app/company/profile` ou `/app/company/settings`

#### Convidar Membros

```
EMAIL → ROLE (Admin/Gestor/Leitor) → ENVIAR CONVITE
```

**Roles e Permissões:**

| Role | Permissões | Uso |
|------|-----------|-----|
| **Admin** | Tudo (gerenciar equipe, deletar) | Líderes |
| **Gestor** | Responder, editar projetos | Operacional |
| **Leitor** | Apenas visualizar | Consultoria |

#### Listar Membros

- Nome e email
- Role atual
- Data de adição
- Última atividade
- Botão de remover

#### Notificações de Equipe

- Receber cópia de respostas
- Alertas de reclamações críticas
- Relatório semanal/mensal

### Projetos (Empresa)

**Rota:** `/app/company/projects`

#### Criar Projeto

| Campo | Tipo | Descrição |
|-------|------|-----------|
| **Nome** | Texto | Nome do projeto de infraestrutura |
| **Descrição** | Textarea | Resumo e objetivos |
| **Localização** | Texto/Maps | Endereço ou coordenadas |
| **Data Início** | Date | Início planejado |
| **Data Fim** | Date | Fim planejado |
| **Status** | Select | Planejamento / Em Andamento / Finalizado |

#### Associar Reclamações

- Ao criar reclamação, usuária pode vincular a projeto
- Empresa pode editar vínculos após
- Facilita rastreamento por projeto

#### Editar/Deletar

- Atualizar informações
- Ativar/desativar (soft delete)
- Histórico de mudanças

#### Visualização

- Cards com informações resumidas
- Data de início/fim
- Número de reclamações associadas
- Status visual (progresso)

---

## Recursos Adicionais

### Páginas Públicas

#### 🏢 Página de Empresa
**Rota:** `/company/:slug`

**Exibe:**
- Logo e informações públicas
- Descrição e setor
- Contato (se disponível)
- Selo de verificação
- Estatísticas públicas:
  - Total de reclamações
  - Taxa de resolução
  - Tempo médio de resposta
- Projetos ativos
- Histórico de reclamações (se públicas)
- Respostas e comentários públicos

#### 📰 Blog
**Rota:** `/blog`

**Funcionalidades:**
- Listagem de artigos
- Busca e filtros
- Categorias (Saúde, Mobilidade, Patrimônio, etc.)
- Comentários (futuro)
- Compartilhamento social

#### 🏪 Catálogo de Empresas
**Rota:** `/companies`

**Recursos:**
- Lista/grid de empresas
- Busca por nome ou setor
- Filtros por região
- Ordenação (nome, reclamações, resolução)
- Empresa cards com informações resumidas

#### 🔍 Busca Global
**Rota:** `/search`

**Busca em:**
- Empresas
- Reclamações públicas
- Artigos do blog
- Resultados agregados com categorias

#### 📋 Termo de Privacidade
**Rota:** `/privacy`

**Conteúdo:**
- Coleta e uso de dados
- Direitos do usuário
- Retenção de dados
- Terceiros e cookies

#### ⚖️ Termo de Uso
**Rota:** `/terms`

**Conteúdo:**
- Direitos e responsabilidades
- Comportamento esperado
- Violações e consequências
- Disputas e jurisdição

### Funcionalidades de Compartilhamento

#### 📤 Compartilhar Reclamação

Após criar reclamação, modal com opções:

```
┌─────────────────────────────────┐
│ COMPARTILHAR RECLAMAÇÃO         │
├─────────────────────────────────┤
│ Link: https://reclamemulher...  │ [Copiar]
│                                 │
│ Compartilhar em:                │
│ 🟢 WhatsApp                     │
│ 📘 Facebook                     │
│ 🐦 Twitter                      │
│ 📧 Email                        │
│ 🔗 Copiar Link                  │
└─────────────────────────────────┘
```

**Benefícios:**
- Aumenta visibilidade
- Pressão positiva em empresa
- Mobilização comunitária
- Rastreamento de origem

### Suporte e Ajuda

#### 🆘 Página de Ajuda
**Rota:** `/ajuda` (pública, sem login)

**Seções:**
- **FAQ**: Perguntas frequentes
- **Guias**: Como usar plataforma
- **Tutoriais**: Videos (futuro)
- **Contato**: Formulário de dúvida

#### 📧 Email de Suporte
- Formulário no site
- Resposta humana em até 48h
- Ticket rastreável

#### 💬 Redes Sociais
- WhatsApp Business
- Instagram DM
- Twitter/X
- Links no footer

### Internacionalização

**Idiomas Suportados:**
- 🇧🇷 Português (Brasileiro) - Padrão
- 🇬🇧 English (Americano)
- 🇪🇸 Español

**Implementação:**
- Uso de `next-intl`
- Seletor no header/footer
- Baseado em `/locale/page` na URL
- Preferência salva no localStorage

**Exemplo de URLs:**
- `/pt/complaints` (Português)
- `/en/complaints` (Inglês)
- `/es/complaints` (Espanhol)

---

## Mapa de Navegação Geral

### Estrutura Completa de Rotas

```
HOMEPAGE (/)
│
├─ PÚBLICAS (Sem login)
│  ├─ /login ............................ Login
│  ├─ /(auth)/register ................ Novo registro
│  ├─ /ajuda ............................ Página de ajuda
│  ├─ /companies ....................... Catálogo de empresas
│  ├─ /search .......................... Busca global
│  ├─ /company/[slug] .................. Perfil empresa (público)
│  ├─ /blog ............................. Blog (listagem)
│  ├─ /blog/all ........................ Blog (todos artigos)
│  ├─ /blog/[slug] ..................... Artigo específico
│  ├─ /privacy ......................... Política de privacidade
│  └─ /terms ........................... Termo de uso
│
├─ AUTENTICADAS - PESSOA
│  ├─ /onboarding/role ............... Escolher papel
│  ├─ /onboarding/person/step1 ...... Dados pessoais
│  ├─ /onboarding/person/step2 ...... Localização
│  │
│  ├─ /app ............................ Dashboard (redireciona)
│  ├─ /app/complaints ................ Minhas reclamações
│  │  ├─ /new ........................ Criar reclamação (wizard)
│  │  └─ /[id] ....................... Detalhe reclamação
│  │
│  └─ /app/settings .................. Configurações
│     ├─ /account .................... Dados pessoais
│     └─ /security ................... Segurança
│
├─ AUTENTICADAS - EMPRESA
│  ├─ /onboarding/company/step1 .... Dados empresa
│  ├─ /onboarding/company/step2 .... Verificação
│  │
│  ├─ /app/company/dashboard ........ Painel empresa
│  ├─ /app/company/inbox ............ Notificações inbox
│  ├─ /app/company/complaints ....... Reclamações
│  │  └─ /[id] ....................... Detalhe + resposta
│  ├─ /app/company/projects ......... Gerenciar projetos
│  ├─ /app/company/profile .......... Editar perfil
│  ├─ /app/company/verification .... Solicitar verificação
│  │
│  └─ /app/settings ................. Configurações
│     └─ /account, /security
│
└─ AUTENTICADAS - ADMIN
   └─ /app/admin ..................... Painel administrativo
      ├─ /companies .................. Gerenciar empresas
      ├─ /blog ....................... Gerenciar artigos
      ├─ /blog/help .................. Help system
      └─ /audit ....................... Auditoria e logs
```

---

## Fluxos Visuais Resumidos

### Fluxo Completo: Pessoa Faz Reclamação

```
1. HOMEPAGE
   ↓
2. LOGIN/REGISTRO
   ├─ Email
   ├─ Senha
   └─ Verificação
   ↓
3. ESCOLHER PAPEL → "Pessoa"
   ↓
4. ONBOARDING
   ├─ Dados pessoais
   └─ Localização
   ↓
5. DASHBOARD PESSOA
   ├─ Visualizar reclamações anteriores
   └─ "Criar Nova Reclamação"
   ↓
6. WIZARD (4 ETAPAS)
   ├─ Etapa 1: Histórico
   ├─ Etapa 2: Descrição
   ├─ Etapa 3: Anexos
   └─ Etapa 4: Classificação
   ↓
7. SUCESSO
   ├─ ID de reclamação
   ├─ Link de acompanhamento
   └─ Opções de compartilhamento
   ↓
8. ACOMPANHAMENTO
   └─ Dashboard mostra status em tempo real
```

### Fluxo Completo: Empresa Responde

```
1. RECEBE NOTIFICAÇÃO
   ├─ Email com alerta
   └─ Link para painel
   ↓
2. EMPRESA FAZ LOGIN
   ↓
3. DASHBOARD EMPRESA
   └─ Vê métricas e "Abertas" destacadas
   ↓
4. CLICA EM RECLAMAÇÃO ABERTA
   ├─ Visualiza detalhe completo
   ├─ Lê descrição e vê anexos
   └─ Pode marcar como lida
   ↓
5. CLICA "RESPONDER"
   ├─ Abre editor de texto
   ├─ Escreve resposta
   └─ Revisa formatação
   ↓
6. ENVIA RESPOSTA
   ├─ Email vai para autora
   ├─ Status muda para "RESPONDIDA"
   └─ Reaparece em "Respondidas"
   ↓
7. OPCIONALMENTE: MARCAR COMO RESOLVIDA
   ├─ Se caso foi resolvido
   └─ Status → "RESOLVIDA"
```

---

## Dicas de UX e Acessibilidade

### Para Usuárias Pessoas

✅ **Faça:**
- Use títulos descritivos (empresa entende melhor)
- Adicione fotos claras mostrando o problema
- Seja específico sobre localização e data
- Marque "Pública" para aumentar pressão construtiva
- Acompanhe respostas regularmente

❌ **Evite:**
- Reclamações genéricas ou vagas
- Insultos ou linguagem agressiva
- Spam ou múltiplas reclamações idênticas
- Dados pessoais de terceiros

### Para Empresas

✅ **Faça:**
- Responda em até 24-48 horas
- Seja claro e construtivo
- Ofereça próximos passos ou cronograma
- Marque como "Resolvida" quando confirmado
- Monitore reputação regularmente

❌ **Evite:**
- Ignorar reclamações (aumenta visibilidade negativa)
- Defensividade excessiva
- Promessas vagas sem prazos
- Deletar dados (auditoria é importante)

### Acessibilidade Geral

- Alto contraste de cores
- Fontes legíveis (Poppins)
- Navegação por teclado
- Labels descritivos
- Sem dependência apenas de cor

---

## FAQ Rápido

**P: Como acompanho minha reclamação?**
R: Você recebe email de confirmação com link único. Pode também acessar seu dashboard de reclamações.

**P: Posso fazer reclamação anônima?**
R: Sim, ao criar reclamação, marque "Anônimo" na etapa 4. Você receberá link único para acompanhar sem login.

**P: A empresa sempre vai responder?**
R: Esperamos que sim, mas não há obrigatoriedade legal. A plataforma transparenta não-respostas aumentando consciência pública.

**P: Posso deletar minha reclamação?**
R: Reclamações públicas geram histórico, então não podem ser deletadas, mas podem ser canceladas/marcadas como irrelevante.

**P: Como empresas conseguem selo de verificação?**
R: Através da página `/app/company/verification`, enviando documentos (CNPJ, certificados). Admin valida.

**P: Posso mudar de "Pessoa" para "Empresa"?**
R: Atualmente não (1 role por conta). Crie segunda conta se necessário.

---

## Contato e Suporte

- **Email**: suporte@reclamemulher.com.br
- **WhatsApp**: (11) 9XXXX-XXXX
- **Redes Sociais**: @reclamemulher (Instagram, Twitter)
- **Página de Ajuda**: https://reclamemulher.com.br/ajuda

---

**Documento criado em 2025 | ReclameMulher Platform Manual**

Para sugestões ou correções, entre em contato com a equipe de desenvolvimento.
