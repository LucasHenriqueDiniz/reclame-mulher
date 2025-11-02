# Regras de Negócio

## Autenticação e Usuários

### Separação Pessoas vs Empresas

- **Pessoas (USER role):**

  - Sempre têm CPF (obrigatório, único)
  - Podem fazer reclamações
  - Podem receber respostas de empresas

- **Empresas (COMPANY role):**
  - Sempre têm CNPJ (obrigatório, único)
  - Podem responder reclamações
  - Têm projetos vinculados

### Onboarding

1. **Pessoa:**

   - Step 1: Dados básicos (nome, CPF, email, senha)
   - Step 2: Endereço, telefone, como ficou sabendo
   - CPF e email validados para unicidade antes de criar conta

2. **Empresa:**
   - Step 1: Dados básicos (nome empresa, CNPJ, email, senha)
   - Step 2: Endereço, telefone, contato responsável, como ficou sabendo
   - CNPJ e email validados para unicidade antes de criar conta

### Email Verification

- Usuários com email precisam confirmar email antes de continuar onboarding
- Botão "Já verificou? Avançar" na página de check-email verifica status e redireciona apropriadamente

## Reclamações (Complaints)

### Criação

- Apenas usuários autenticados podem criar reclamações
- Deve estar vinculada a uma empresa
- Pode estar vinculada a um projeto (opcional)
- Pode ser anônima ou pública

### Status Flow

```
OPEN → RESPONDED → RESOLVED
  ↓
CANCELLED
```

### Mensagens

- Usuários podem enviar mensagens nas reclamações
- Empresas podem responder
- Admins podem intervir
- Mensagens automáticas podem ser criadas (author_id = null)

## Reports (Feedback/Bugs)

### Tipos

- **BUG**: Problema técnico no sistema
- **FEATURE_REQUEST**: Solicitação de nova funcionalidade
- **FEEDBACK**: Feedback geral sobre a plataforma
- **ABUSE**: Denúncia de abuso/conteúdo inapropriado
- **OTHER**: Outros tipos de report

### Workflow

1. Usuário cria report (status: PENDING)
2. Admin revisa (status: REVIEWING)
3. Admin resolve ou rejeita (status: RESOLVED/REJECTED)
4. Admin pode adicionar notas em `admin_notes`

### Relacionamentos

- Reports podem estar relacionados a uma reclamação (`related_complaint_id`)
- Reports podem estar relacionados a uma empresa (`related_company_id`)
- Útil para rastrear contexto do problema/feedback

## Validações de Unicidade

### CPF

- Validado antes de criar conta (step1 pessoa)
- Validado antes de atualizar perfil (step2 pessoa)
- Mensagem de erro: "Este CPF já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte."

### CNPJ

- Validado antes de criar conta (step1 empresa)
- Validado antes de criar/atualizar empresa (step2 empresa)
- Mensagem de erro: "Este CNPJ já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte."

### Email

- Validado pelo Supabase Auth automaticamente
- Mensagem de erro: "Este email já está cadastrado. Por favor, faça login ou use outro email."
- Tratamento especial para diferentes tipos de erro de email

## Mensagens de Erro

Todas as mensagens de erro devem ser:

- **Claras e específicas**: indicar qual campo está com problema
- **Ações sugeridas**: orientar o usuário sobre o que fazer
- **Amigáveis**: usar linguagem acessível

Exemplos:

- ✅ "Este CPF já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte."
- ❌ "Erro: duplicate key"
