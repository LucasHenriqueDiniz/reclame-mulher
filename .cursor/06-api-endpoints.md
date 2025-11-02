# API Endpoints e Server Actions

## Server Actions

### Complaints

- `createComplaint(input: CreateComplaintInput)`: Criar nova reclamação
- Localização: `src/app/app/complaints/actions.ts`

### Onboarding

#### Company

- `completeCompanyOnboarding(input)`: Completa onboarding de empresa (step2)
- Localização: `src/app/onboarding/company/step2/actions.ts`

#### Person

- `updateProfilePerson(input)`: Atualiza perfil de pessoa (step2)
- Localização: `src/app/onboarding/person/step2/actions.ts`

## API Routes

### `/api/companies`

- `GET`: Lista empresas públicas (query params: `search`, `verified`)
- `POST`: Cria empresa (requer autenticação)

### `/api/complaints`

- Endpoints relacionados a reclamações

### `/api/me`

- `GET`: Retorna dados do usuário autenticado e seu perfil

## Padrões de Error Handling

Todas as server actions devem:

1. Validar inputs com Zod
2. Retornar erros amigáveis
3. Não expor detalhes internos do sistema

```typescript
if (error) {
  // Mensagens amigáveis específicas
  if (error.message.includes("duplicate")) {
    throw new Error("Este [campo] já está cadastrado...");
  }
  throw new Error(error.message || "Erro ao processar solicitação.");
}
```
