# Sistema de Reports e Feedback

## Tabela `reports`

A tabela `reports` foi criada para gerenciar feedback, bugs, solicitações e denúncias dos usuários.

## Estrutura

### Campos Principais

- `id`: UUID (PK)
- `reporter_id`: FK para `profiles` - quem criou o report
- `type`: Enum do tipo de report

  - `BUG`: Bug no sistema
  - `FEATURE_REQUEST`: Solicitação de nova funcionalidade
  - `FEEDBACK`: Feedback geral sobre a plataforma
  - `ABUSE`: Denúncia de abuso/conteúdo inapropriado
  - `OTHER`: Outros tipos

- `status`: Status do report

  - `PENDING`: Aguardando revisão
  - `REVIEWING`: Em revisão por admin
  - `RESOLVED`: Resolvido
  - `REJECTED`: Rejeitado

- `title`: Título do report (obrigatório)
- `description`: Descrição detalhada (obrigatório)

### Campos de Relacionamento (Opcionais)

- `related_complaint_id`: FK para `complaints` - se o report está relacionado a uma reclamação
- `related_company_id`: FK para `companies` - se o report está relacionado a uma empresa

### Campos de Moderação

- `admin_notes`: Observações internas do admin
- `resolved_at`: Timestamp de quando foi resolvido
- `resolved_by`: FK para `profiles` - qual admin resolveu

### Timestamps

- `created_at`: Quando o report foi criado
- `updated_at`: Última atualização

## Use Cases

### Bug Report

Usuário encontra um bug no sistema:

```typescript
{
  type: "BUG",
  title: "Erro ao salvar reclamação",
  description: "Ao tentar salvar uma reclamação, recebo erro 500...",
  status: "PENDING"
}
```

### Feature Request

Usuário sugere nova funcionalidade:

```typescript
{
  type: "FEATURE_REQUEST",
  title: "Notificações por email",
  description: "Gostaria de receber notificações quando minha reclamação for respondida",
  status: "PENDING"
}
```

### Feedback Geral

Usuário dá feedback sobre a experiência:

```typescript
{
  type: "FEEDBACK",
  title: "Experiência positiva",
  description: "Adorei a plataforma, muito fácil de usar!",
  status: "PENDING"
}
```

### Denúncia de Abuso

Usuário reporta conteúdo inapropriado:

```typescript
{
  type: "ABUSE",
  title: "Conteúdo ofensivo",
  description: "A empresa X respondeu com linguagem ofensiva",
  related_company_id: "uuid-da-empresa",
  related_complaint_id: "uuid-da-reclamacao",
  status: "PENDING"
}
```

## Fluxo de Trabalho

1. Usuário cria report → `status: PENDING`
2. Admin revisa → `status: REVIEWING`
3. Admin resolve ou rejeita → `status: RESOLVED` ou `REJECTED`
4. Admin pode adicionar notas em `admin_notes`

## Próximos Passos (TODO)

- [ ] Criar DTO para reports (`src/server/dto/reports.ts`)
- [ ] Criar repositório para reports (`src/server/repos/reports.ts`)
- [ ] Criar server action para criar report
- [ ] Criar página/componente para usuários reportarem
- [ ] Criar painel admin para gerenciar reports
- [ ] Adicionar notificações quando report é resolvido
