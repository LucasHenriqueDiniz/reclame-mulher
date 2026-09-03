# Diagramas de Fluxo - ReclameMulher

Representação visual dos principais processos da plataforma.

---

## 1. Fluxo Geral da Plataforma

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        HOMEPAGE RECLAMEMULHER                           │
└─────────────────────┬───────────────────────────────┬───────────────────┘
                      │                               │
             ┌────────▼─────────┐          ┌──────────▼──────────┐
             │ NÃO AUTENTICADO  │          │    AUTENTICADO      │
             └────────┬─────────┘          └──────────┬──────────┘
                      │                               │
        ┌─────────────┼─────────────┐                 │
        │             │             │                 │
    ┌───▼──┐  ┌──────▼─────┐  ┌───▼──┐      ┌────────▼─────────┐
    │Login │  │ Registrar  │  │Ajuda │      │   Qual é seu     │
    │      │  │            │  │/Blog │      │    perfil?       │
    └──────┘  └────────────┘  └──────┘      └────────┬─────────┘
                                                       │
                                    ┌──────────────────┼──────────────────┐
                                    │                  │                  │
                            ┌───────▼───────┐  ┌──────▼──────┐  ┌────────▼────────┐
                            │     PESSOA    │  │  EMPRESA   │  │     ADMIN       │
                            └───────┬───────┘  └──────┬──────┘  └────────┬────────┘
                                    │                  │                  │
                        ┌───────────▼────┐  ┌─────────▼────┐  ┌──────────▼────┐
                        │ DASHBOARD      │  │ DASHBOARD    │  │ PAINEL ADMIN  │
                        │ RECLAMAÇÕES    │  │ EMPRESA      │  │               │
                        └────────────────┘  └──────────────┘  └───────────────┘
```

---

## 2. Fluxo de Criação de Reclamação (Wizard)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    INICIAR RECLAMAÇÃO                                    │
│                 (De qualquer lugar da plataforma)                         │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │  Usuária Logada?    │
            └──────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    ┌───▼───┐                    ┌───▼────┐
    │ NÃO   │                    │  SIM   │
    └───┬───┘                    └───┬────┘
        │                            │
    Login/Reg                   Ir para ETAPA 1
        │
        ▼
    Email Anônimo?
        │
    ┌───┴────┐
    │         │
   SIM      NÃO
    │         │
    ▼         ▼
  Email    Login/Reg
    │         │
    └────┬────┘
         │
         ▼
    ┌─────────────────────────────────────────┐
    │     WIZARD - ETAPA 1 HISTÓRICO          │
    ├─────────────────────────────────────────┤
    │ Você já reclamou sobre isso?            │
    │  ○ Sim                                  │
    │  ○ Não                                  │
    │ Se SIM → Onde? [Select dropdown]       │
    │ [◄ Anterior] [Próximo ►]               │
    └──────────────┬──────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │     WIZARD - ETAPA 2 DESCRIÇÃO          │
    ├─────────────────────────────────────────┤
    │ Título (máx. 100 caracteres)            │
    │ [___________________________________]   │
    │                                         │
    │ Descrição (detalhes completos)          │
    │ [_________________________________]     │
    │ [_________________________________]     │
    │                                         │
    │ Localização (onde ocorreu)              │
    │ [___________________________________]   │
    │ [◄ Anterior] [Próximo ►]               │
    └──────────────┬──────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │      WIZARD - ETAPA 3 ANEXOS            │
    ├─────────────────────────────────────────┤
    │ Arraste arquivos aqui (máx. 5)          │
    │ ┌───────────────────────────────────┐   │
    │ │         📁 DROP ZONE              │   │
    │ │  ou clique para selecionar        │   │
    │ └───────────────────────────────────┘   │
    │                                         │
    │ Formatos: JPG, PNG, PDF, DOC (10MB c/) │
    │ [◄ Anterior] [Próximo ►]               │
    └──────────────┬──────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │   WIZARD - ETAPA 4 CLASSIFICAÇÃO        │
    ├─────────────────────────────────────────┤
    │ Empresa alvo:                           │
    │ [🔍 Pesquisar empresa______________]    │
    │                                         │
    │ Projeto (se múltiplos):                 │
    │ [Select projeto______________]         │
    │                                         │
    │ Urgência:                               │
    │ ○ Baixa  ○ Média  ○ Alta  ○ Crítica    │
    │                                         │
    │ Categoria de Impacto:                   │
    │ ○ Saúde  ○ Mobilidade  ○ Patrimônio   │
    │ ○ Direitos Humanos  ○ Ambiental       │
    │                                         │
    │ Alcance:                                │
    │ ○ Pessoal  ○ Familiar  ○ Comunidade   │
    │ ○ Regional                              │
    │                                         │
    │ Privacidade:                            │
    │ ☐ Anônima          ☐ Pública           │
    │ [◄ Anterior] [ENVIAR RECLAMAÇÃO ✓]    │
    └──────────────┬──────────────────────────┘
                   │
                   ▼ (Enviando...)
    ┌─────────────────────────────────────────┐
    │     ✅ RECLAMAÇÃO ENVIADA COM SUCESSO   │
    ├─────────────────────────────────────────┤
    │                                         │
    │ ID da Reclamação: RM-2024-0001234      │
    │                                         │
    │ Link de Acompanhamento:                 │
    │ https://reclamemulher.com/comp/abc123  │
    │                                         │
    │ [Compartilhar ►]                        │
    │ [Ir para Dashboard]                     │
    │ [Nova Reclamação]                       │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## 3. Fluxo de Resposta da Empresa

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   RECLAMAÇÃO RECEBIDA PELA EMPRESA                       │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │  📧 EMAIL NOTIF     │
            │  Com resumo e link  │
            └──────────┬──────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Empresa clica link  │
            │   ou faz login no    │
            │      painel          │
            └──────────┬───────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │     DASHBOARD EMPRESA                   │
    ├─────────────────────────────────────────┤
    │ [Painel] [Reclamações] [Projetos]       │
    │                                         │
    │ 📊 Total: 150  ✅ Resolvidas: 85       │
    │ 💬 Ativos: 45  ⏱️ Resposta Média: 12h  │
    │                                         │
    │ [RECLAMAÇÕES] → Mostra "Abertas" em    │
    │ destaque com nova reclamação           │
    └──────────────┬──────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │     LISTA DE RECLAMAÇÕES - INBOX        │
    ├─────────────────────────────────────────┤
    │ Filtros: [Todas] [Abertas] [Respond]   │
    │ Busca: [🔍________________]             │
    │                                         │
    │ 🔴 ABERTA - Título Reclamação #123     │
    │    Autor: Maria Silva | 2 horas atrás │
    │    Urgência: ⚡ Crítica                │
    │                                         │
    │ 🟡 RESPONDIDA - Outro Título           │
    │    Autor: Ana Costa | 5 horas atrás    │
    │    Urgência: ⚡ Alta                   │
    └──────────────┬──────────────────────────┘
                   │
            Clica em reclamação ABERTA
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │    DETALHE DA RECLAMAÇÃO (LEITURA)      │
    ├─────────────────────────────────────────┤
    │ 📌 Título: Buraco perigoso na rua      │
    │ 👤 Autor: Maria Silva                  │
    │ 📍 Local: Rua X, n° 123, São Paulo    │
    │ 📅 Data: 15/01/2025 às 10:30          │
    │ 🏷️ Status: 🔴 ABERTA                  │
    │ ⚡ Urgência: Crítica                   │
    │ 🎯 Impacto: Mobilidade (Pessoal)      │
    │                                         │
    │ DESCRIÇÃO:                              │
    │ "Um grande buraco na calçada causou    │
    │  minha queda e machucado na perna..."  │
    │                                         │
    │ ANEXOS: 📸 foto1.jpg 📸 foto2.jpg      │
    │         📄 atestado_medico.pdf         │
    │                                         │
    │ [Marcar como Lida] [RESPONDER ►]      │
    └──────────────┬──────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │    ESCREVER RESPOSTA                    │
    ├─────────────────────────────────────────┤
    │ Sua Resposta (mín. 20 caracteres):     │
    │ ┌─────────────────────────────────────┐ │
    │ │Agradecemos o relato. Enviamos uma  │ │
    │ │equipe para avaliar o local. Será   │ │
    │ │reparado em até 5 dias úteis.       │ │
    │ │Contato: (11) 3000-0000             │ │
    │ └─────────────────────────────────────┘ │
    │                                         │
    │ Formatar: [B] [I] [•] [---]            │
    │                                         │
    │ ☐ Resolver este caso                   │
    │   (se problema foi solucionado)         │
    │                                         │
    │ [Salvar como Rascunho] [ENVIAR ✓]    │
    └──────────────┬──────────────────────────┘
                   │
                   ▼ (Enviando...)
    ┌─────────────────────────────────────────┐
    │  ✅ RESPOSTA ENVIADA COM SUCESSO        │
    ├─────────────────────────────────────────┤
    │                                         │
    │ Status da reclamação: 🟡 RESPONDIDA    │
    │                                         │
    │ Maria Silva recebeu sua resposta       │
    │ via email e pode acompanhar via link    │
    │                                         │
    │ [Ir para Inbox] [Responder Outra]      │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## 4. Fluxo de Acompanhamento (Pessoa)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   PESSOA ACOMPANHA RECLAMAÇÃO                            │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │    DASHBOARD - MINHAS RECLAMAÇÕES       │
    ├─────────────────────────────────────────┤
    │ 👤 Maria Silva                          │
    │    São Paulo, SP                        │
    │                                         │
    │ Filtros:                                │
    │ [Todas] [Abertas] [Respondidas] [Resol]│
    │ Busca: [🔍________________]             │
    │                                         │
    │ RECLAMAÇÕES:                            │
    │                                         │
    │ 🔴 ABERTA - Buraco na calçada #RM-123 │
    │    Empresa: Prefeitura São Paulo       │
    │    📅 Criado: 15/01/2025               │
    │    ⚡ Urgência: Crítica                │
    │    🔒 Status: Pública                  │
    │    [Ver Detalhe ►]                     │
    │                                         │
    │ 🟡 RESPONDIDA - Ruído Obra #RM-122    │
    │    Empresa: Construtora XYZ            │
    │    📅 Criado: 10/01/2025               │
    │    ⚡ Urgência: Alta                   │
    │    🔒 Status: Pública                  │
    │    [👁️ Nova Resposta!] [Ver ►]       │
    │                                         │
    │ 🟢 RESOLVIDA - Falta Iluminação #RM-1 │
    │    Empresa: Prefeitura São Paulo       │
    │    📅 Criado: 05/01/2025               │
    │    ✅ Resolvido em: 8 dias             │
    │    [Ver Histórico ►]                   │
    │                                         │
    └──────────────┬──────────────────────────┘
                   │
            Clica em Respondida
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │   DETALHE - RESPOSTA RECEBIDA           │
    ├─────────────────────────────────────────┤
    │ 📌 Título: Ruído da Obra               │
    │ 🏢 Empresa: Construtora XYZ            │
    │ 📅 Criado: 10/01/2025                  │
    │ 🟡 Status: RESPONDIDA                  │
    │                                         │
    │ MINHA RECLAMAÇÃO:                       │
    │ "A obra faz barulho até 22:00 toda     │
    │  noite, violando horário permitido..."  │
    │                                         │
    │ ─────────────────────────────────────  │
    │                                         │
    │ 💬 RESPOSTA DA EMPRESA (13/01/2025):   │
    │ "Agradecemos a reclamação. A partir    │
    │  de amanhã as obras finalizarão até    │
    │  21:00. Continuamos à disposição."     │
    │                                         │
    │ ─────────────────────────────────────  │
    │                                         │
    │ ☐ Marcar como Resolvido                │
    │   (quando confirmar que solucionou)    │
    │                                         │
    │ [Compartilhar 📤] [Voltar ◄]           │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## 5. Onboarding - Fluxo de Cadastro

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    REGISTRO NOVO USUÁRIO                                 │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │     TELA DE REGISTRO                    │
    ├─────────────────────────────────────────┤
    │ Email:  [_____________________]         │
    │ Senha:  [_____________________]         │
    │ Confirmar: [_____________________]      │
    │                                         │
    │ Requisitos de Senha:                    │
    │ ✓ 8+ caracteres                         │
    │ ○ Maiúscula                             │
    │ ○ Número                                │
    │ ○ Caractere especial                    │
    │                                         │
    │ ☐ Li e concordo com Termos e Privacid.│
    │                                         │
    │ [Criar Conta ►]                        │
    │                                         │
    └──────────────┬──────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │   VERIFICAR EMAIL                       │
    ├─────────────────────────────────────────┤
    │ Enviamos um link para seu email         │
    │ usuario@email.com                       │
    │                                         │
    │ Clique no link para confirmar           │
    │ Não recebeu? [Reenviar]                 │
    │                                         │
    │ [Voltar]                                │
    │                                         │
    └──────────────┬──────────────────────────┘
                   │
        (Usuária clica no email)
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │   ESCOLHER PAPEL                        │
    ├─────────────────────────────────────────┤
    │ Você é?                                 │
    │                                         │
    │  ┌──────────────┐  ┌──────────────┐    │
    │  │ 👩 Pessoa    │  │ 💼 Empresa   │    │
    │  │              │  │              │    │
    │  │ Para mulheres│  │ Para empresas│    │
    │  │ impactadas   │  │ responder    │    │
    │  │              │  │              │    │
    │  │  [Continuar] │  │  [Continuar] │    │
    │  └──────────────┘  └──────────────┘    │
    │                                         │
    └──────────────┬─────────────┬────────────┘
                   │             │
              PESSOA          EMPRESA
                   │             │
                   ▼             ▼
    ┌──────────────────┐  ┌─────────────────────┐
    │ PERSON STEP 1    │  │ COMPANY STEP 1      │
    ├──────────────────┤  ├─────────────────────┤
    │ Nome Completo    │  │ Nome da Empresa     │
    │ [_____________]  │  │ [_____________]     │
    │                  │  │                     │
    │ Telefone         │  │ CNPJ                │
    │ [_____________]  │  │ [_____________]     │
    │                  │  │                     │
    │ Avatar (Foto)    │  │ Logo                │
    │ [Upload]         │  │ [Upload]            │
    │                  │  │                     │
    │ [Próximo ►]      │  │ Setor               │
    │                  │  │ [Select]            │
    └────────┬─────────┘  │                     │
             │            │ [Próximo ►]        │
             │            └────────┬────────────┘
             │                     │
             ▼                     ▼
    ┌──────────────────┐  ┌─────────────────────┐
    │ PERSON STEP 2    │  │ COMPANY STEP 2      │
    ├──────────────────┤  ├─────────────────────┤
    │ Cidade           │  │ Website             │
    │ [_____________]  │  │ [_____________]     │
    │                  │  │                     │
    │ Estado           │  │ Descrição           │
    │ [Select Estado]  │  │ [_____________]     │
    │                  │  │                     │
    │ Endereço (Opt.)  │  │ Endereço            │
    │ [_____________]  │  │ [_____________]     │
    │                  │  │                     │
    │ [Finalizar ✓]    │  │ [Solicitar Verif.]  │
    └────────┬─────────┘  │                     │
             │            │ [Finalizar ✓]      │
             │            └────────┬────────────┘
             │                     │
             └──────────┬──────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────┐
    │  ✅ BEM-VINDA À RECLAMEMULHER!          │
    ├─────────────────────────────────────────┤
    │                                         │
    │ Seu cadastro foi concluído com sucesso │
    │                                         │
    │ [Ir para Dashboard ►]                   │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## 6. Fluxo de Segurança e Privacidade

```
┌──────────────────────────────────────────────────────────────────────────┐
│                  ACESSAR CONFIGURAÇÕES DE SEGURANÇA                      │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │    MENU CONFIGURAÇÕES (/app/settings)   │
    ├─────────────────────────────────────────┤
    │ [Conta] [Segurança]                     │
    │                                         │
    │ Email: usuario@email.com                │
    │ Perfil: Pessoa                          │
    │ Cadastro: Jan/2025                      │
    │                                         │
    └──────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    [CONTA]             [SEGURANÇA]
        │                     │
        │                     ▼
        │      ┌──────────────────────────────┐
        │      │ ALTERAR SENHA                │
        │      ├──────────────────────────────┤
        │      │ Senha Atual:                 │
        │      │ [_____________________]      │
        │      │                              │
        │      │ Nova Senha:                  │
        │      │ [_____________________]      │
        │      │ ✓ 8+ chars ○ MAIÚS ○ № ○ ! │
        │      │                              │
        │      │ Confirmar:                   │
        │      │ [_____________________]      │
        │      │                              │
        │      │ [Alterar Senha ✓]           │
        │      └──────────────────────────────┘
        │
        ▼
    ┌─────────────────────────────────────────┐
    │    DADOS PESSOAIS                       │
    ├─────────────────────────────────────────┤
    │ Nome: [___________________] [Editar]   │
    │ Email: usuario@email.com                │
    │ Telefone: [______________] [Editar]   │
    │ Cidade: [__________________] [Editar] │
    │ Estado: [SP] [Editar]                  │
    │ Endereço: [_______________] [Editar]  │
    │                                         │
    │ PRIVACIDADE:                            │
    │ ☑ Perfil Público                       │
    │ ☑ Email Visível para Empresas          │
    │ ☑ Receber Notificações                 │
    │ ☐ Compartilhar Dados com Parceiros     │
    │                                         │
    │ [Salvar Alterações ✓]                  │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## 7. Fluxo de Administração

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       PAINEL ADMINISTRATIVO                              │
│                    (/app/admin - ADMIN ONLY)                            │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
                       ▼
    ┌─────────────────────────────────────────┐
    │    DASHBOARD ADMIN                      │
    ├─────────────────────────────────────────┤
    │ [Painel] [Empresas] [Blog] [Auditoria] │
    │                                         │
    │ 📊 Estatísticas Globais:                │
    │ Total Usuárias: 1,250                  │
    │ Empresas Cadastradas: 180               │
    │ Reclamações Processadas: 5,400          │
    │ Taxa Resolução Geral: 73%               │
    │                                         │
    │ ⚠️ Alertas:                             │
    │ • 3 empresas não respondidas            │
    │ • 2 reclamações com conteúdo suspeito  │
    │ • 1 solicitação verificação pendente    │
    │                                         │
    └──────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┬─────────┐
        │          │          │         │
        ▼          ▼          ▼         ▼
    [EMPRESAS] [BLOG] [AUDIT] [USER]
        │
        ▼
    ┌─────────────────────────────────────────┐
    │    GERENCIAR EMPRESAS                   │
    ├─────────────────────────────────────────┤
    │ Filtros: [Todas] [Verificadas] [Novo]  │
    │ Busca: [🔍________________]             │
    │                                         │
    │ EMPRESA | CNPJ | STATUS | RECL. | ►   │
    │────────────────────────────────────────│
    │ Const. XYZ | 1234... | ✅ Verif. | 45 │
    │ ├─ [Editar] [Deletar] [Verificar]     │
    │                                         │
    │ Obra ABC | 5678... | ⏳ Pendente | 12 │
    │ ├─ [Editar] [Deletar] [Verificar]     │
    │                                         │
    │ Engenharia 123 | 9999... | 🔴 Novo | 0 │
    │ ├─ [Editar] [Deletar] [Verificar]     │
    │                                         │
    └─────────────────────────────────────────┘
```

---

## 8. Estados de Reclamação - Máquina de Estados

```
                         CRIADA
                           │
                ┌──────────▼──────────┐
                │   Enviada para      │
                │    Empresa          │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │                     │
            ┌───▼────────────────────▼───┐
            │   ABERTA (sem resposta)    │
            │   [esperando resposta]      │
            └────┬──────────────────────┘
                 │
       [Empresa responde]
                 │
                 ▼
            ┌──────────────────────┐
            │   RESPONDIDA         │
            │ [em conversa]        │
            └────┬─────────────┬────┘
                 │             │
        [Resolvida]    [Reabre]
             │             │
             ▼             ▼
        ┌────────┐   ┌──────────┐
        │RESOLVIDA  │ ABERTA    │
        │[fechada] │ [novamente]│
        └──────────┘ └──────────┘

        OU EM QUALQUER MOMENTO:
                 │
                 ▼
            ┌──────────────────────┐
            │   CANCELADA          │
            │ [duplicada/invalida] │
            └──────────────────────┘
```

---

## 9. Fluxo de Permissões e Acesso

```
┌──────────────────────────────────────────────────────────────────────────┐
│                     CONTROLE DE ACESSO                                   │
└──────────────────────┬───────────────────────────────────────────────────┘
                       │
            ┌──────────▼──────────┐
            │  Usuária Logada?    │
            └──────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
       NÃO                           SIM
        │                             │
    [Público]                 [Verificar Papel]
        │                             │
    ├─ Homepage          ┌────────────┼────────────┐
    ├─ Blog              │            │            │
    ├─ Empresas Pub.     │            │            │
    ├─ Ajuda             │            │            │
    └─ Login/Registro   PESSOA      EMPRESA      ADMIN
                         │            │            │
                         ▼            ▼            ▼
                    ┌──────────┐ ┌───────────┐ ┌─────────┐
                    │ /app/*   │ │/app/comp.*│ │/app/adm*│
                    │          │ │           │ │         │
                    │-Recl.    │ │-Dashboard │ │-Empresas│
                    │-Settings │ │-Inbox     │ │-Blog    │
                    │-Empresas │ │-Projects  │ │-Audit   │
                    └──────────┘ │-Perfil    │ └─────────┘
                                 │-Settings  │
                                 └───────────┘
```

---

## 10. Ciclo de Vida de uma Reclamação

```
TIMELINE DE UMA RECLAMAÇÃO:

┌────────────────────────────────────────────────────────────────────────┐
│                                                                        │
│  Dia 0 - 15/01 10:30                                                 │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 📝 Maria cria reclamação                                     │    │
│  │ Título: "Buraco perigoso na rua"                            │    │
│  │ Status: 🔴 ABERTA                                            │    │
│  │ Urgência: Crítica                                            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                            │                                          │
│  Dia 0 - 15/01 10:35                                                 │
│                            │                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 📧 Email enviado para empresa                               │    │
│  │ Link para painel: /app/company/complaints/:id              │    │
│  │ Status: 🔴 ABERTA                                            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                            │                                          │
│  Dia 0 - 15/01 17:00                                                 │
│                            │                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 👀 João (empresa) lê reclamação no painel                   │    │
│  │ Marca como lida                                              │    │
│  │ Status: 🔴 ABERTA (lida)                                     │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                            │                                          │
│  Dia 1 - 16/01 08:00                                                 │
│                            │                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 💬 Empresa responde no painel                               │    │
│  │ "Obrigado. Equipe foi avaliar. Reparo em 5 dias."          │    │
│  │ Status: 🟡 RESPONDIDA (aguardando feedback)                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                            │                                          │
│  Dia 1 - 16/01 08:05                                                 │
│                            │                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 📧 Email enviado para Maria com resposta                    │    │
│  │ Link para acompanhar (token único)                          │    │
│  │ Status: 🟡 RESPONDIDA                                        │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                            │                                          │
│  Dia 3 - 18/01 15:00                                                 │
│                            │                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 👤 Maria vê resposta no dashboard                           │    │
│  │ Atualiza: "Reparo realizado com sucesso! Obrigada"         │    │
│  │ Marca como RESOLVIDA                                         │    │
│  │ Status: 🟢 RESOLVIDA (em 3 dias)                            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                            │                                          │
│  Dia 3 - 18/01 15:05                                                 │
│                            │                                          │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 📊 Estatísticas Atualizadas:                                │    │
│  │ Empresa: +1 resolvida, tempo resposta = 22 horas           │    │
│  │ Maria: +1 resolvida, experiência positiva                  │    │
│  │ Plataforma: +1 caso resolvido, taxa = 73%                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Legenda de Ícones

```
🏠 Homepage/Página inicial
👤 Usuária/Perfil
💼 Empresa
🔐 Admin/Segurança
📝 Criar/Escrever
📋 Lista/Visualizar
📧 Email
💬 Chat/Mensagem
📊 Dashboard/Estatísticas
⚙️ Configurações
🔍 Busca
🔴 Aberto/Ativo
🟡 Respondido/Pendente
🟢 Resolvido/Sucesso
🔒 Privado/Seguro
🌐 Público
⚡ Urgência
📅 Data/Tempo
📁 Arquivo/Anexo
✅ Confirmar/Sucesso
❌ Cancelado/Erro
► Próximo/Avançar
◄ Anterior/Voltar
```

---

**Documento criado em 2025 | ReclameMulher Platform Flows**
