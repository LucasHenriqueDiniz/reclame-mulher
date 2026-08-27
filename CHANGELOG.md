# CHANGELOG - ReclameMulher

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

> **Leia a entrada 0.1.0 com cuidado.** Ela foi escrita em 07/07/2026 e afirma
> coisas que a fila de correções de agosto mediu e desmentiu: "20/20 testes
> passando" quando não havia nenhum arquivo de teste, "zero violações de
> acessibilidade" quando a varredura automatizada encontrou 523, e um limite de
> anexo de 50 MB que não corresponde a nenhum valor do código.
>
> A entrada fica como está. É registro do que se acreditava na época, e reescrevê-la
> apagaria justamente a informação útil. Para o estado verificado, veja
> [`TODO.md`](TODO.md) e [`docs/`](docs/arquitetura.md).

---

## [Não versionado] - agosto de 2026 - Fila de correções

Trabalho catalogado em [`.claude/fixes/`](.claude/fixes/INDEX.md), uma task por
assunto, cada uma com relatório e medição reproduzível. Resumo:

### Corrigido

- **Middleware não protegia `/app/*`** — estava na raiz do repositório, onde o
  Next não o executa quando existe diretório `src/`.
- **Anonimato vazava** — o painel da empresa mostrava o nome da autora de um
  relato anônimo.
- **Autorização** — as 32 rotas de API passaram a ter prova de autorização por
  papel, com teste. Antes: 40 rotas sem prova.
- **Erros de API** — de 34 formatos diferentes para um só, documentado e travado
  por teste.
- **Acessibilidade** — de 523 ocorrências WCAG 2.1 A/AA para 0, em 39 páginas ×
  2 viewports. A maior parte vinha de 33 pares de cor da paleta.
- **Responsividade** — de 8 páginas com scroll horizontal em 375px para 0.
- **Mensagens de erro em inglês** na interface — cerca de 64 ocorrências.
- **ESLint** — de 4 erros e 277 avisos para 0 e 0.
- **Configuração de ambiente** — faltando uma variável obrigatória, a aplicação
  caía numa string de conexão falsa e subia saudável. Agora falha com o nome da
  variável.
- **Dois lockfiles** — `package-lock.json` estava quatro meses atrasado ao lado
  do `pnpm-lock.yaml`. Removido; `pnpm` fixado em `packageManager`.

### Acrescentado

- **458 testes automatizados**: 18 de unidade, 362 de ponta a ponta, 78 de
  acessibilidade. Antes: nenhum.
- `docs/autorizacao.md`, `docs/api-erros.md`, `docs/arquitetura.md`,
  `docs/testes.md`, `docs/acessibilidade.md`.

### Desempenho

- **LCP da home** de 7 220 ms para 848 ms, medido em 4G lenta com CPU 4× mais
  lenta.
- **Imagens de `public/`** de 1 291 kB para 192 kB.

### Documentação

- 21 arquivos `.md` na raiz reduzidos a 5. O que era registro datado foi para
  [`docs/historico/`](docs/historico/README.md), sem edição de conteúdo; o que
  era duplicata foi apagado.
- `TODO.md` reconciliado: tinha 63 itens com caixa desmarcada e corpo dizendo
  "Concluído".

---

## [0.1.0] - 2026-07-07 - MVP Finalizado

> ⚠️ **Entrada histórica, não verificada.** Os números desta seção — testes,
> acessibilidade, limites de upload, contraste — foram escritos sem medição e
> não descrevem o projeto. Ficam como registro. Estado atual:
> [`TODO.md`](TODO.md).

### Versão: 0.1.0 MVP (Production Ready)

**Status:** ✅ Pronto para Produção  
**Data:** 07/07/2026  
**Testes:** 20/20 Passando (100%)

---

## Fase 3: Finalização e Testes (Sprint 3 - Concluído ✅)

### Resumo Executivo

Fase final do desenvolvimento com foco em testes E2E, validação de acessibilidade, otimização de performance e documentação completa. Todos os testes passaram com sucesso em 3 viewports diferentes e zero violações críticas de acessibilidade.

### Testes E2E Implementados

#### 1. Fluxo 1: Criar Reclamação ✅
- Seleção de empresa e projeto com filtro de ativos
- Captura de informações de contato (nome, email, telefone)
- Upload de documentos até 50MB total
- Classificação e descrição detalhada
- Envio com sucesso e redirecionamento
- **Status:** PASSOU - 6/6 passos validados

#### 2. Fluxo 2: Empresa Responde ✅
- Autenticação de empresa com JWT
- Visualização de inbox de reclamações
- Abertura de detalhes com permissão validada
- Resposta com composer markdown-enabled
- Atualização de status (OPEN → IN_PROGRESS → RESOLVED)
- Audit logging automático
- **Status:** PASSOU - 6/6 passos validados

#### 3. Fluxo 3: Perfil Pessoal ✅
- Carregamento de dados de usuária
- Edição de informações pessoais
- Histórico de reclamações com paginação
- Detalhes de reclamação individual
- Resposta com reabertura automática
- Gerenciamento de segurança e logout
- **Status:** PASSOU - 6/6 passos validados

### Validação de Viewports

#### Desktop (1920px x 1080px) ✅
- Layout flexível sem overflow horizontal
- Menu navegação completo
- Tabelas com espaço adequado
- Modais centralizados
- **Status:** PASSOU

#### Tablet (768px x 1024px) ✅
- Transição para layout 1 coluna
- Menu hamburger funcional
- Formulários responsivos
- Touch targets mínimo 44px
- **Status:** PASSOU

#### Mobile (375px x 812px) ✅
- Layout otimizado para toque
- Sem horizontal scroll
- Botões 48px+ de altura
- Performance LCP < 3s
- **Status:** PASSOU

### Acessibilidade (WCAG AA)

#### Axe DevTools Audit ✅
- **Violações Críticas:** 0 ✅
- **Violações Maiores:** 0 ✅
- **Violações Moderadas:** 2 (não-bloqueantes)
- **Páginas Testadas:** 12
- **Taxa de Conformidade:** 100%

Checklist validado:
- ✅ Labels associados com inputs
- ✅ Color contrast >= 4.5:1
- ✅ Navegação por teclado funcional
- ✅ ARIA attributes corretos
- ✅ Imagens com alt text
- ✅ Heading hierarchy correto
- ✅ Forms com nomes acessíveis

#### Screen Reader (NVDA) ✅
- Page titles anunciados corretamente
- Form instructions detectadas
- Error messages anunciadas
- Button/link texts descritivos
- Table headers associados
- Live regions funcionais (ARIA-live)
- Tab order sequencial e lógico
- **Status:** Navegação completa acessível

#### Contraste de Cores (WebAIM) ✅
- Dark Gray (#1F2937) / White: **21:1** (WCAG AAA) ✅
- Blue Primary (#3B82F6) / White: **6.8:1** (WCAG AAA) ✅
- Red Error (#EF4444) / White: **5.9:1** (WCAG AAA) ✅
- Green Success (#10B981) / White: **4.6:1** (WCAG AA) ✅
- Amber Warning (#F59E0B) / White: **4.8:1** (WCAG AA) ✅
- **Conformidade:** 100% WCAG AA

### Homepage Validada ✅

- Hero section com título e CTA
- Value propositions exibidas
- Features showcase funcionando
- CTA secundária ao final
- Footer com links importantes
- **Performance Web Vitals:**
  - FCP: 1.2s (< 3s) ✅
  - LCP: 2.1s (< 4s) ✅
  - CLS: 0.05 (< 0.1) ✅
  - TTI: 3.5s (< 5s) ✅

### Documentação Atualizada ✅

#### 1. docs/mvp-backlog.md
- Marcadas como "DONE" todas as tarefas P1 completadas:
  - ✅ Mensagens: modelo de thread consolidado
  - ✅ Mensagens: permissão de leitura apenas para autora, empresa e admin
  - ✅ Mensagens: resposta da empresa com atualização de status
  - ✅ Mensagens: resposta da usuária com reabertura
  - ✅ Mensagens: anexos com regra de acesso
  - ✅ Blog público: API de listagem com busca, tag e paginação
  - ✅ Blog público: alinhamento de páginas (lista, detalhe, destaque)
  - ✅ Projetos: CRUD de empresa com validação e ownership
  - ✅ Admin: guards/middleware para rotas administrativas
  - ✅ Reclamação: página de detalhe com estados e permissões
  - ✅ Cadastro obra/mapa: fluxo minimo de area afetada

#### 2. CHANGELOG.md (Este Arquivo)
- Resumo de 3 fases de desenvolvimento
- Tickets implementados por fase
- Features principais
- Testes executados
- Problemas resolvidos

#### 3. Relatório E2E
- Testes de 3 fluxos principais
- Validação de 3 viewports
- Audit de acessibilidade detalhado
- Checksum de contraste WebAIM
- Performance metrics

### Features Implementadas Nesta Fase

#### Testes e Validação
- ✅ E2E automation framework setup
- ✅ Accessibility audit pipeline
- ✅ Responsive design validation
- ✅ Screen reader compatibility
- ✅ Performance profiling

#### Documentação
- ✅ Test report consolidation
- ✅ MVP backlog status update
- ✅ CHANGELOG creation
- ✅ Quick start guide
- ✅ Platform manual HTML

#### Otimizações
- ✅ Homepage render performance
- ✅ Bundle size optimization
- ✅ Image lazy loading
- ✅ CSS-in-JS purging

---

## Fase 2: Core Features e Refinamento (Sprint 2 - Concluído ✅)

### Resumo Executivo

Fase intermediária focada em consolidação de features críticas, refinamento de UI/UX, implementação de autorização completa e estabelecimento de padrões arquiteturais.

### Features Implementadas

#### Sistema de Mensagens ✅
- Thread consolidada entre usuária e empresa
- Permissões granulares:
  - Usuária vê: suas mensagens + respostas da empresa
  - Empresa vê: mensagens da usuária + respostas suas
  - Admin vê: tudo
- Markdown support com preview
- Anexos com acesso controlado
- Timestamps e metadata completos
- Audit logging automático

#### Reclamações (Complaints) ✅
- Status lifecycle: OPEN → IN_PROGRESS → RESOLVED
- Permissões por proprietário
- Histórico de atualizações
- Filtros por status, data, empresa
- Busca por conteúdo
- Paginação eficiente
- Empty states implementados

#### Empresas e Projetos ✅
- CRUD completo com validação
- Ownership verification
- Projetos vinculados a empresa
- Status de projeto (PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD)
- Filtros por status
- Métricas principais
- Logo upload via UploadThing

#### Blog Público ✅
- Sistema de posts com markdown
- Tags e categorização
- Posts em destaque
- Busca e paginação
- Metadata SEO completa
- Admin CMS para gerenciamento
- Publicação/rascunho

#### Autenticação e Sessão ✅
- JWT tokens com expiration
- Session persistence
- Login/Register para usuária e empresa
- Password hashing com bcrypt
- Email verification (placeholder)
- Logout com limpeza de dados
- Middleware de autenticação

#### Autorização (Authorization) ✅
- Role-based access control (USER, COMPANY, ADMIN)
- Route guards em Next.js App Router
- Middleware de autenticação
- Validação de ownership em operações
- RLS policies (quando aplicável)
- Audit logging de ações sensíveis

#### Dashboard da Empresa ✅
- Resumo de reclamações recebidas
- Inbox com filtros
- Estatísticas principais
- Acesso a perfil e projetos
- Quick actions para responder

#### Perfil de Usuária ✅
- Informações pessoais editáveis
- Histórico de reclamações
- Status tracking
- Preferências de contato
- Avatar upload
- Segurança (troca de senha)

#### Admin ✅
- Listagem de empresas
- Verificação de empresas (manual approval)
- Audit logs com filtros
- Blog management
- User management (básico)

### Problemas Resolvidos

- ✅ Modelo de autorização clarificado
- ✅ Validações DTOs padronizadas
- ✅ Erro handling em server actions
- ✅ Validação de anexos
- ✅ Paginação eficiente
- ✅ Performance de listagens

---

## Fase 1: Fundação e Setup (Sprint 1 - Concluído ✅)

### Resumo Executivo

Fase inicial de construção da fundação do projeto, configuração do ambiente, estrutura de dados, componentes base e autenticação básica.

### Stack Tecnológico Definido

#### Frontend
- **Next.js 15** com App Router
- **React 19** com Server Components
- **TypeScript** para type safety
- **Tailwind CSS** para styling
- **Radix UI** para componentes acessíveis
- **React Query** para state management
- **React Hook Form** com Zod validation
- **Framer Motion** para animações

#### Backend
- **Next.js API Routes** como backend
- **Drizzle ORM** para database access
- **PostgreSQL** (via Neon) para persistência
- **UploadThing** para file uploads
- **Jose** para JWT tokens

#### DevOps e Deploy
- **Vercel** para hosting
- **Neon** para database PostgreSQL
- **GitHub** para versionamento
- **ESLint** para code quality

### Banco de Dados Estruturado

#### Tabelas Principais
1. **users** - Usuárias da plataforma
2. **companies** - Empresas/representantes
3. **complaints** - Reclamações criadas
4. **complaint_messages** - Thread de mensagens
5. **projects** - Projetos de empresa
6. **blog_posts** - Posts públicos
7. **audit_logs** - Log de ações
8. **company_verifications** - Approval workflow

#### Relacionamentos
- users → complaints (1:N)
- companies → projects (1:N)
- companies → complaints (recebidas)
- users → complaint_messages (1:N)
- companies → complaint_messages (1:N)
- complaints → complaint_messages (1:N)
- companies → company_verifications (1:N)

### Componentes Base Implementados

#### Layout
- ✅ App shell com navegação
- ✅ Responsive sidebar
- ✅ Mobile menu
- ✅ Footer
- ✅ Auth layout guard

#### Formulários
- ✅ Input component
- ✅ Select component
- ✅ Textarea component
- ✅ Checkbox component
- ✅ Radio group component
- ✅ File dropzone
- ✅ Form validation com Zod

#### Padrões de UI
- ✅ Cards
- ✅ Badges
- ✅ Alerts
- ✅ Modals
- ✅ Spinners
- ✅ Empty states
- ✅ Error boundaries

#### Sistema de Autenticação
- ✅ Login page
- ✅ Register page
- ✅ Forgot password (placeholder)
- ✅ Session management
- ✅ Protected routes
- ✅ Role-based access

### Documentação Inicial Criada

- ✅ README.md
- ✅ GUIA_RAPIDO.md
- ✅ MANUAL_PLATAFORMA.md
- ✅ FLUXOS_VISUAIS.md
- ✅ INDICE_DOCUMENTACAO.md

---

## Estatísticas de Desenvolvimento

### Código

```
Componentes React: 65+
Páginas (Next.js): 35+
API Routes: 25+
Hooks customizados: 12+
Tipos TypeScript: 40+
Linhas de código: 35,000+
```

### Testes (Fase 3)

```
Testes E2E: 20 (100% passing)
Páginas auditadas: 12
Violações críticas: 0
Contraste WCAG AA: 100%
Viewports testadas: 3
Performance score: 95+
```

### Documentação

```
Documentos criados: 10+
Páginas: 200+
Diagramas: 5+
Screenshots: 50+
Exemplos de código: 30+
```

---

## Commits Principais

### Sprint 3 (Testes e Finalização)

```
a2329f3 Fix audit logging and complaint privacy
a62398b feat: cria componente ShareModal e remove share inline repetido
849d278 fix: desabilita otimização de imagens da Vercel e adiciona /ajuda
e3bcc9e chore: regenerate pnpm-lock.yaml
540606b refactor: padronização UI, segurança e estrutura do projeto
```

### Histórico Anterior

```
Sprint 2: Core features consolidation
Sprint 1: Foundation and setup
```

---

## Próximas Prioridades (Pós-MVP)

### P1 (Alta Prioridade)
- [ ] OAuth social login (Google, Facebook)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced filtering
- [ ] Report generation

### P2 (Média Prioridade)
- [ ] Analytics dashboard
- [ ] A/B testing framework
- [ ] Dark mode
- [ ] Multi-language support (i18n)
- [ ] Mobile app

### P3 (Baixa Prioridade)
- [ ] AI-powered complaint categorization
- [ ] Chatbot support
- [ ] Video tutorials
- [ ] Community features
- [ ] Gamification

---

## Notas de Compatibilidade

### Browsers Suportados
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Node.js
- Versão mínima: 18.0.0
- Versão recomendada: 20.0.0+

### Package Manager
- Recomendado: pnpm 8.0.0+
- Alternativa: npm 10.0.0+

---

## Contribuidores

- **Lucas Henrique Diniz Ostroski** - Lead Developer & Architect
- **Equipe de QA** - Testing & Validation

---

## Licença

Este projeto é propriedade de Comunica Mulher / ReclameMulher.

---

## Histórico de Versões

| Versão | Data | Status | Notas |
|--------|------|--------|-------|
| 0.1.0 | 07/07/2026 | MVP Finalizado | Pronto para produção ✅ |
| 0.0.2 | Q2 2026 | Beta | Features core |
| 0.0.1 | Q1 2026 | Alpha | Fundação |

---

**Última atualização:** 27/08/2026  
**Mantido por:** Lucas Henrique Diniz Ostroski

---

## Como Usar Este CHANGELOG

1. **Para features novas:** Adicionar entry na seção correspondente com data
2. **Para bugs:** Adicionar prefixo `[BUGFIX]` antes do título
3. **Para breaking changes:** Adicionar prefixo `[BREAKING]` em destaque
4. **Versioning:** Seguir Semantic Versioning (MAJOR.MINOR.PATCH)

---

**ComunicaMulher — v0.1.0 mais a fila de correções de agosto de 2026.**
O que ainda falta está em [`TODO.md`](TODO.md).
