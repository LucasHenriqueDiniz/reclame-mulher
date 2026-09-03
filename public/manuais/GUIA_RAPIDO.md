# Guia Rápido ReclameMulher

**Referência rápida para usuários e equipe**

---

## 🚀 Início Rápido

### Para Novos Usuários

#### Como Criar uma Reclamação?
1. Acesse reclamemulher.com.br
2. Clique em "Criar Reclamação" (no topo ou botão flutuante)
3. Faça login ou continue sem account
4. Siga 4 etapas simples:
   - ✅ Etapa 1: Histórico anterior?
   - ✅ Etapa 2: Descreva o problema
   - ✅ Etapa 3: Adicione fotos/documentos
   - ✅ Etapa 4: Classifique (empresa, urgência, categoria)
5. Clique em "Enviar Reclamação"
6. Compartilhe o link com outros!

#### Como Acompanhar Minha Reclamação?
- **Se logada**: Vá para `/app/complaints`
- **Se não logada**: Acesse o link recebido no email
- Veja status em tempo real (Aberta → Respondida → Resolvida)

---

### Para Empresas

#### Como Responder Reclamações?
1. Faça login em seu painel (`/app/company/dashboard`)
2. Acesse a aba **Reclamações** ou **Inbox**
3. Filtre por **"Abertas"** para ver pendentes
4. Clique na reclamação para ver detalhe
5. Clique em **"Responder"**
6. Escreva sua resposta explicando ações
7. Clique em **"Enviar Resposta"**
8. *(Opcional)* Marque como **"Resolvido"** quando pronto

#### Como Gerenciar Meu Perfil?
1. Acesse `/app/company/profile`
2. Atualize informações públicas
3. Faça upload de logo
4. Adicione descrição da empresa
5. Clique em **"Salvar"**

#### Como Adicionar Projetos?
1. Vá para `/app/company/projects`
2. Clique em **"+ Novo Projeto"**
3. Preencha nome, descrição, localização
4. Defina datas de início e fim
5. Clique em **"Criar"**
6. Reclamações podem ser vinculadas a projetos

---

## 📋 Checklist de Configuração

### Primeira Vez Como Pessoa
- [ ] Criar conta (email + senha)
- [ ] Confirmar email (clique no link)
- [ ] Escolher "Pessoa"
- [ ] Preencher dados pessoais (nome, telefone)
- [ ] Adicionar localização (cidade/estado)
- [ ] Pronto! Ir para dashboard

### Primeira Vez Como Empresa
- [ ] Criar conta (email + senha)
- [ ] Confirmar email
- [ ] Escolher "Empresa"
- [ ] Preencher dados empresa (nome, CNPJ, setor)
- [ ] Upload de logo
- [ ] Preencher endereço e website
- [ ] Solicitar verificação (opcional)
- [ ] Adicionar membros da equipe (opcional)
- [ ] Pronto! Ir para dashboard

---

## 🎯 Principais Funcionalidades

### Dashboard da Pessoa
```
/app/complaints
├── Minhas Reclamações (lista)
│   ├── Filtrar por status (Abertas/Respondidas/Resolvidas)
│   └── Buscar por título
├── Ver Detalhe
│   ├── Ler reclamação original
│   ├── Ver respostas da empresa
│   └── Marcar como resolvido
└── Criar Nova Reclamação [+ botão flutuante]
```

### Dashboard da Empresa
```
/app/company/dashboard
├── Métricas (cards)
│   ├── Total reclamações
│   ├── Resolvidas
│   ├── Tempo médio resposta
│   └── Taxa de resolução
├── Abas:
│   ├── [Painel] - Visão geral
│   ├── [Reclamações] - Inbox completo
│   ├── [Projetos] - Gerenciar obras
│   └── [Perfil] - Editar informações
└── Gerenciamento de Equipe
    └── Adicionar membros + permissões
```

---

## 🔐 Segurança & Privacidade

### Opções de Privacidade (ao criar reclamação)

| Opção | Significa | Visibilidade |
|-------|-----------|--------------|
| **Pública** ✓ | Todo mundo vê a reclamação | Perfil empresa + público |
| **Anônima** | Sua identidade é oculta | Apenas empresa vê anônimo |
| **Privada** | Só empresa vê | Não aparece em histórico público |

### Senhas Seguras
- Mínimo 8 caracteres
- Pelo menos 1 maiúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial (!@#$)

### Dados Pessoais
- Você pode ocultar seu email nas configurações
- Perfil pode ser privado
- Reclamações anônimas não revelam identidade

---

## 📊 Entendendo Status

### Status de Reclamação

```
🔴 ABERTA
   └─ Empresa ainda não respondeu
   └─ Você recebeu email de confirmação
   └─ Ação: Aguarde resposta ou compartilhe mais

🟡 RESPONDIDA
   └─ Empresa enviou resposta
   └─ Você recebeu email com resposta
   └─ Ação: Leia resposta, confirme resolução se pronto

🟢 RESOLVIDA
   └─ Problema foi solucionado
   └─ Você confirmou resolução
   └─ Ação: Geralmente fim do caso

🔵 CANCELADA (raro)
   └─ Duplicada ou fora de escopo
   └─ Não será mais processada
   └─ Ação: Nenhuma, arquivo histórico
```

---

## 🏢 Categorias de Impacto

Ao criar reclamação, escolha qual afetou você:

- **Saúde**: Acidentes, falta de segurança, machucados
- **Mobilidade**: Trânsito lento, ruas intransitáveis, acesso limitado
- **Patrimônio**: Danos a casa/carro/bem pessoal
- **Direitos Humanos**: Discriminação, assédio, falta de respeito
- **Ambiental**: Poluição, resíduos, impacto ecológico

---

## 📱 Funcionalidades por Tipo de Usuário

### 👩 Pessoa - Pode Fazer:
- ✅ Criar reclamações
- ✅ Ver histórico de reclamações
- ✅ Acompanhar status em tempo real
- ✅ Ler respostas de empresas
- ✅ Compartilhar reclamação (WhatsApp, email)
- ✅ Editar perfil pessoal
- ✅ Alterar senha
- ✅ Deletar conta

### 👩 Pessoa - NÃO Pode:
- ❌ Responder como empresa
- ❌ Acessar painel de admin
- ❌ Ver dados de outras pessoas
- ❌ Deletar reclamações (apenas cancelar)

### 💼 Empresa - Pode Fazer:
- ✅ Receber reclamações no painel
- ✅ Responder reclamações
- ✅ Gerenciar projetos de infraestrutura
- ✅ Editar perfil público
- ✅ Adicionar membros da equipe
- ✅ Ver métricas e dashboard
- ✅ Solicitar verificação
- ✅ Visualizar reputação/histórico

### 💼 Empresa - NÃO Pode:
- ❌ Deletar reclamações
- ❌ Ver dados pessoais de autoras
- ❌ Acessar painel de admin
- ❌ Ver reclamações de outras empresas

---

## 🆘 Troubleshooting Rápido

### "Não consigo criar reclamação"
- [ ] Verifique conexão internet
- [ ] Tente fazer login primeiro
- [ ] Limpe cache do navegador (Ctrl+Shift+Del)
- [ ] Tente navegador diferente

### "Empresa não respondeu em 3 dias"
- [ ] Verifique se reclamação foi recebida (email de confirmação)
- [ ] Tente compartilhar para aumentar visibilidade
- [ ] Procure empresa em `/companies` e contato direto
- [ ] Acesse `/ajuda` para dúvidas

### "Não recebo email de resposta"
- [ ] Verifique pasta de spam
- [ ] Atualize email em `/app/settings/account`
- [ ] Adicione suporte@reclamemulher.com.br à agenda
- [ ] Acesse painel direto para ler resposta

### "Esqueci minha senha"
- [ ] Na tela de login, clique em "Esqueci minha senha"
- [ ] Insira seu email
- [ ] Clique no link que receber
- [ ] Defina nova senha

### "Preciso deletar minha reclamação"
- [ ] Reclamações públicas não podem ser deletadas (histórico)
- [ ] Mas você pode marcá-la como **"Cancelada"**
- [ ] Ou criar nova sem compartilhar

---

## 📞 Canais de Suporte

| Canal | Acesso | Tempo Resposta |
|-------|--------|-----------------|
| **Email** | suporte@reclamemulher.com.br | 24-48h |
| **WhatsApp** | [11] 9XXXX-XXXX | 2-4h (dias úteis) |
| **FAQ** | /ajuda (público, sem login) | Imediato |
| **Redes Sociais** | @reclamemulher | 12-24h |

---

## 📚 Recursos Úteis

### Páginas Públicas (não precisa login)
- 🏠 **Homepage**: reclamemulher.com.br
- 📝 **Criar Reclamação**: /app/complaints/new (sem login)
- 🏢 **Ver Empresa**: /company/[nome-da-empresa]
- 📰 **Blog**: /blog (artigos e notícias)
- 🏪 **Catálogo Empresas**: /companies
- 🔍 **Busca Global**: /search
- 🆘 **Ajuda**: /ajuda
- 📋 **Privacidade**: /privacy
- ⚖️ **Termos**: /terms

### Páginas Autenticadas
- 📊 **Dashboard Pessoa**: /app/complaints
- 📊 **Dashboard Empresa**: /app/company/dashboard
- ⚙️ **Configurações**: /app/settings
- 📝 **Criar Reclamação**: /app/complaints/new

### Links de Redirecionamento
- `?company=ID` - Pré-seleciona empresa ao criar reclamação
- `?project=ID` - Pré-seleciona projeto
- Exemplo: `/app/complaints/new?company=xyz123`

---

## 🎓 Boas Práticas

### Ao Criar Reclamação
✅ **Faça:**
- Seja específico sobre data, hora e local
- Adicione fotos claras mostrando o problema
- Descreva como afetou você pessoalmente
- Use títulos descritivos
- Marque como "Pública" para pressão construtiva

❌ **Evite:**
- Linguagem ofensiva ou agressiva
- Dados pessoais de outras pessoas
- Reclamações vagas ("obra ruim")
- Spam ou duplicações
- Informações falsas

### Ao Gerenciar Como Empresa
✅ **Faça:**
- Responda no máximo 48h após reclamação
- Seja educado e construtivo
- Ofereça soluções ou cronograma
- Marque resolvida quando confirmado
- Monitorar regularmente reclamações

❌ **Evite:**
- Ignorar reclamações públicas
- Ser defensivo ou arrogante
- Prometer sem prazo definido
- Deletar dados (auditoria importa)
- Discutir com autoras na plataforma

---

## 🌍 Versões de Idioma

A plataforma está disponível em:
- 🇧🇷 **Português (Brasileiro)** - Padrão
- 🇬🇧 **Inglês**
- 🇪🇸 **Espanhol**

**Trocar idioma:** Clique no seletor de idioma no topo/rodapé da página

---

## 📈 Estatísticas Úteis (Dashboard)

### O que Acompanhar Como Pessoa
- Total de reclamações abertas
- Número que receberam resposta
- Reclamações resolvidas em quanto tempo
- Taxa de resolução pessoal

### O que Acompanhar Como Empresa
- **Taxa de Resolução**: % de resolvidas vs. total
- **Tempo Médio de Resposta**: velocidade em horas
- **Reclamações Abertas**: quantas aguardam resposta
- **Diálogos Ativos**: em conversa contínua
- **Reputação**: como você aparece para público

---

## ⚡ Dicas Especiais

### Para Aumentar Visibilidade da Reclamação
1. Marque como **"Pública"** (não anônima)
2. **Compartilhe** via WhatsApp/email/redes
3. Adicione **fotos claras** mostrando problema
4. Use **título descritivo** (não genérico)
5. Marque **urgência corretamente**

### Para Empresas Melhorarem Reputação
1. **Responda rápido** (meta: <24h)
2. **Ofereça soluções** concretas
3. **Marque resolvida** quando confirmado
4. **Monitore perfil público** em `/company/[slug]`
5. **Solicite verificação** para ganhar selo

### Para Encontrar Empresa Específica
1. Vá para `/companies` (catálogo)
2. Use barra de busca
3. Filtre por região/setor
4. Clique em empresa para ver perfil público
5. Veja histórico de reclamações dela
6. Depois crie sua reclamação vinculada

---

## 📋 Checklist de Segurança

- [ ] Senha com 8+ caracteres, maiúscula, número, símbolo
- [ ] Confirme email (acesse link de verificação)
- [ ] Nunca compartilhe sua senha
- [ ] Se reclamação anônima, guarde o link único
- [ ] Verifique email de confirmação antes de compartilhar
- [ ] Não use dados reais de outras pessoas em reclamações
- [ ] Atualize perfil regularmente
- [ ] Faça logout em computadores compartilhados

---

## 🚀 Próximos Passos

### Se é Primeira Vez
1. **Leia** este guia até o fim
2. **Acesse** reclamemulher.com.br
3. **Crie conta** (5 min)
4. **Crie primeira reclamação** (10 min)
5. **Compartilhe** para aumentar impacto

### Se é Empresa
1. **Crie perfil** (10 min)
2. **Adicione equipe** se necessário
3. **Monitore inbox** diariamente
4. **Responda rápido** (meta: 24h)
5. **Solicite verificação** para credibilidade

### Se é Admin
1. **Acesse** `/app/admin`
2. **Monitore métricas** globais
3. **Aprovar verificações** de empresas
4. **Revisar conteúdo** suspeito
5. **Gerar relatórios** regularmente

---

## 📞 Contato Direto

**Email**: suporte@reclamemulher.com.br  
**WhatsApp**: (11) 9XXXX-XXXX  
**Instagram**: @reclamemulher  
**Twitter**: @reclamemulher  

---

**Última atualização: 2025 | Versão 1.0**

Para dúvidas não abordadas, visite `/ajuda` ou entre em contato!
