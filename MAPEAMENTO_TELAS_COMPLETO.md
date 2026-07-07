# 🗺️ MAPEAMENTO COMPLETO DE TELAS - ReclameMulher MVP

**Data:** 2026-07-07  
**Total de Páginas:** 43  
**Status:** Em validação (testando cada tela)

---

## 🔐 LOGINS DE TESTE (do seed.ts)

```
Senha padrão: senha123

👤 PESSOA 1:
   Email: maria@exemplo.com
   Senha: senha123
   Role: USER
   Nome: Maria Silva
   Localidade: São Paulo, SP

👤 PESSOA 2:
   Email: ana@exemplo.com
   Senha: senha123
   Role: USER
   Nome: Ana Santos
   Localidade: Rio de Janeiro, RJ

🏢 EMPRESA:
   Email: empresa@construtorax.com
   Senha: senha123
   Role: COMPANY
   Nome: João Costa (representante)
   Empresa: Construtora X
   Localidade: São Paulo, SP

👮 ADMIN:
   Email: admin@comunicamulher.com.br
   Senha: senha123
   Role: ADMIN
   Nome: Admin
   Localidade: São Paulo, SP
```

---

## 📊 ESTRUTURA DE ROTAS

### 🏠 PÚBLICAS (sem autenticação)

| Rota | Arquivo | Propósito | Status |
|------|---------|----------|--------|
| `/` | `app/page.tsx` | Homepage principal | ⏳ Testando |
| `/login` | `app/(auth)/login/page.tsx` | Tela de login | ⏳ Testando |
| `/register` | `app/(auth)/register/page.tsx` | Cadastro de usuário | ⏳ Testando |
| `/register/success` | `app/(auth)/register/success/page.tsx` | Confirmação de cadastro | ⏳ Testando |
| `/auth/verify` | `app/auth/verify/page.tsx` | Verificação de email | ⏳ Testando |
| `/auth/verify/check-email` | `app/auth/verify/check-email/page.tsx` | Confirmar email | ⏳ Testando |
| `/auth/callback` | `app/auth/callback/page.tsx` | Callback OAuth | ⏳ Testando |
| `/privacy` | `app/privacy/page.tsx` | Política de Privacidade | ⏳ Testando |
| `/terms` | `app/terms/page.tsx` | Termos de Serviço | ⏳ Testando |
| `/companies` | `app/companies/page.tsx` | Listagem de empresas | ⏳ Testando |
| `/empresas` | `app/empresas/page.tsx` | Listagem (alt) | ⏳ Testando |
| `/company/:slug` | `app/company/[slug]/page.tsx` | Perfil público da empresa | ⏳ Testando |
| `/blog` | `app/blog/page.tsx` | Blog - homepage | ⏳ Testando |
| `/blog/all` | `app/blog/all/page.tsx` | Blog - todos posts | ⏳ Testando |
| `/blog/:slug` | `app/blog/[slug]/page.tsx` | Blog - post único | ⏳ Testando |
| `/search` | `app/search/page.tsx` | Busca geral | ⏳ Testando |
| `/ajuda` | `app/ajuda/page.tsx` | Página de ajuda | ⏳ Testando |
| `/onboarding/role` | `app/onboarding/role/page.tsx` | Escolher role (pessoa/empresa) | ⏳ Testando |

---

### 👤 PESSOA - Fluxos de Onboarding

| Rota | Arquivo | Propósito | Status |
|------|---------|----------|--------|
| `/onboarding/person/step1` | `app/onboarding/person/step1/page.tsx` | Onboarding Pessoa - Step 1 | ⏳ Testando |
| `/onboarding/person/step2` | `app/onboarding/person/step2/page.tsx` | Onboarding Pessoa - Step 2 | ⏳ Testando |

---

### 🏢 EMPRESA - Fluxos de Onboarding

| Rota | Arquivo | Propósito | Status |
|------|---------|----------|--------|
| `/onboarding/company/step1` | `app/onboarding/company/step1/page.tsx` | Onboarding Empresa - Step 1 | ⏳ Testando |
| `/onboarding/company/step2` | `app/onboarding/company/step2/page.tsx` | Onboarding Empresa - Step 2 | ⏳ Testando |

---

### 📝 PESSOA - App Autenticada

| Rota | Arquivo | Propósito | Status | Notas |
|------|---------|----------|--------|-------|
| `/app` | `app/app/page.tsx` | Dashboard pessoa | ⏳ Testando | Home após login |
| `/app/complaints/new` | `app/app/complaints/new/page.tsx` | Criar novo relato | ⏳ Testando | Wizard 4 etapas |
| `/app/complaints` | `app/app/complaints/page.tsx` | Meus relatos | ⏳ Testando | Listagem com filtros |
| `/app/complaints/:id` | `app/app/complaints/[id]/page.tsx` | Detalhe do relato | ⏳ Testando | Ver + responder |
| `/app/settings` | `app/app/settings/page.tsx` | Configurações | ⏳ Testando | Menu principal settings |
| `/app/settings/account` | `app/app/settings/account/page.tsx` | Editar conta | ⏳ Testando | Dados pessoais |
| `/app/settings/security` | `app/app/settings/security/page.tsx` | Segurança | ⏳ Testando | Mudar senha |

---

### 🏢 EMPRESA - App Autenticada

| Rota | Arquivo | Propósito | Status | Notas |
|------|---------|----------|--------|-------|
| `/app/company/dashboard` | `app/app/company/dashboard/page.tsx` | Dashboard empresa | ⏳ Testando | KPIs + resumo |
| `/app/company/inbox` | `app/app/company/inbox/page.tsx` | Inbox de relatos | ⏳ Testando | Relatos da empresa |
| `/app/company/complaints` | `app/app/company/complaints/page.tsx` | Todos relatos | ⏳ Testando | Lista completa |
| `/app/company/complaints/:id` | `app/app/company/complaints/[id]/page.tsx` | Detalhe + responder | ⏳ Testando | Chat com pessoa |
| `/app/company/profile` | `app/app/company/profile/page.tsx` | Perfil empresa | ⏳ Testando | Editar dados |
| `/app/company/projects` | `app/app/company/projects/page.tsx` | Projetos | ⏳ Testando | CRUD de projetos |
| `/app/company/verification` | `app/app/company/verification/page.tsx` | Verificação empresa | ⏳ Testando | Status de verificação |

---

### 👮 ADMIN - App Autenticada

| Rota | Arquivo | Propósito | Status | Notas |
|------|---------|----------|--------|-------|
| `/app/admin` | `app/app/admin/page.tsx` | Dashboard admin | ⏳ Testando | Overview sistema |
| `/app/admin/companies` | `app/app/admin/companies/page.tsx` | Gerenciar empresas | ⏳ Testando | CRUD companies |
| `/app/admin/audit` | `app/app/admin/audit/page.tsx` | Audit log | ⏳ Testando | Histórico de ações |
| `/app/admin/blog` | `app/app/admin/blog/page.tsx` | Gerenciar blog | ⏳ Testando | CRUD posts |
| `/app/admin/blog/help` | `app/app/admin/blog/help/page.tsx` | Ajuda blog | ⏳ Testando | Instruções |
| `/blog/:slug/edit` | `app/blog/[slug]/edit/page.tsx` | Editar post | ⏳ Testando | Editor de blog |

---

## 🎯 FLUXOS PRINCIPAIS A TESTAR

### ✅ Fluxo Pessoa
```
1. Homepage (/)
2. Login (/login) com maria@exemplo.com
3. Dashboard pessoa (/app)
4. Criar novo relato (/app/complaints/new)
5. Meus relatos (/app/complaints)
6. Detalhe de relato (/app/complaints/:id)
7. Settings (/app/settings)
8. Logout
```

### ✅ Fluxo Empresa
```
1. Homepage (/)
2. Login (/login) com empresa@construtorax.com
3. Dashboard empresa (/app/company/dashboard)
4. Inbox (/app/company/inbox)
5. Detalhe relato + responder (/app/company/complaints/:id)
6. Perfil empresa (/app/company/profile)
7. Projetos (/app/company/projects)
8. Settings (/app/settings)
9. Logout
```

### ✅ Fluxo Admin
```
1. Homepage (/)
2. Login (/login) com admin@comunicamulher.com.br
3. Dashboard admin (/app/admin)
4. Gerenciar empresas (/app/admin/companies)
5. Audit log (/app/admin/audit)
6. Blog management (/app/admin/blog)
7. Logout
```

### ✅ Fluxo Público
```
1. Homepage (/)
2. Ver blog (/blog)
3. Ler post (/blog/[slug])
4. Ver empresas (/companies)
5. Ver perfil empresa (/company/[slug])
6. Busca (/search)
7. Ajuda (/ajuda)
```

---

## 📋 CHECKLIST DE TESTES

### Autenticação
- [ ] Login com maria@exemplo.com funciona
- [ ] Login com empresa@construtorax.com funciona
- [ ] Login com admin@comunicamulher.com.br funciona
- [ ] Login com senha errada mostra erro
- [ ] Logout funciona e volta para homepage
- [ ] Página protegida sem login redireciona para /login

### Homepage
- [ ] Playfair Display + Inter carregando
- [ ] "Fale aqui" CTA visível
- [ ] 4 categorias de impacto visíveis
- [ ] Search form funciona
- [ ] Mobile responsive

### Pessoa - Criar Relato
- [ ] Wizard 4 etapas funciona
- [ ] Pode selecionar empresa
- [ ] Pode upload de arquivo
- [ ] Pode descrever problema
- [ ] Submissão funciona
- [ ] Confirmação de sucesso

### Pessoa - Meus Relatos
- [ ] Lista mostra relatos criados
- [ ] Filtros funcionam
- [ ] Busca funciona
- [ ] Clica em relato abre detalhe
- [ ] Pode responder se empresa respondeu

### Empresa - Inbox
- [ ] Lista mostra relatos da empresa
- [ ] Pode filtrar por status
- [ ] Abre detalhe
- [ ] Pode responder
- [ ] Pode mudar status

### Admin
- [ ] Dashboard mostra stats
- [ ] Pode gerenciar empresas
- [ ] Audit log mostra ações
- [ ] Blog management funciona

---

## 🔍 OBSERVAÇÕES ESPECÍFICAS

### Design & UX
- [ ] Fontes carregando corretamente
- [ ] Paleta de cores aplicada
- [ ] Acessibilidade em testes
- [ ] Mobile responsivo
- [ ] Dark mode (se implementado)

### Performance
- [ ] Carregamento rápido de telas
- [ ] Sem erros no console
- [ ] Sem warnings de hydration
- [ ] Cache funcionando

### Segurança
- [ ] Permissões respeitadas (pessoa não vê admin)
- [ ] Dados sensíveis não expostos
- [ ] CORS configurado
- [ ] Rate limiting (se implementado)

---

## 🚀 PRÓXIMAS ETAPAS

1. **Testar cada fluxo** com os logins fornecidos
2. **Documentar erros** encontrados
3. **Validar responsividade** em mobile
4. **Testar acessibilidade** com screen reader
5. **Performance audit** com DevTools
6. **Relatório final** com pontos críticos

---

**Status:** Pronto para testes manuais  
**Logins Válidos:** ✅ 4 usuários de teste disponíveis  
**Próximo Passo:** Começar testes do fluxo pessoa

