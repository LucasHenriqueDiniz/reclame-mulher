# 🚀 PLANO DE IMPLEMENTAÇÃO - Sprint Integrado

**Status:** Em Andamento  
**Data Início:** 2026-07-07  
**Estimativa Total:** 11-15 horas  
**Meta:** Implementar insights dos agents + revisar tudo

---

## 📋 Fases de Implementação

### **FASE 1: Homepage Redesign + Copy** (4-6h)
**Objetivo:** Novo visual, paleta, copy acolhedor, representatividade

- [ ] Criar/atualizar theme.ts com nova paleta (#D4A5A5→#5C4B73)
- [ ] Ajustar tipografia (Georgia headings + Inter body)
- [ ] Reescrever copy hero + CTAs ("Sua voz importa")
- [ ] Atualizar stats para linguagem humanizada
- [ ] Preparar estrutura para imagens representativas
- [ ] Revisar mobile responsiveness

**Arquivos principais:**
- `src/components/company/theme.ts`
- `src/app/(landing)/page.tsx`
- `src/components/landing/` (Hero, Stats, Journey, Categories)

**Resultado esperado:** Homepage visualmente nova, acolhedora, representativa

---

### **FASE 2: Rebrand Reclamação → Fale Aqui/Relato** (2-3h)
**Objetivo:** Mudança terminológica (SEM banco de dados)

- [ ] Atualizar `src/messages/pt-BR/complaints.json` (10+ strings)
- [ ] Renomear componentes React (prefixos)
- [ ] Atualizar labels em formulários
- [ ] Revisar MainHeader e navegação
- [ ] Atualizar email templates
- [ ] Atualizar TypeScript types/DTOs
- [ ] Testes de strings i18n

**Estratégia:** Manter BD como `complaints` (compatibilidade), mudar apenas UI

**Resultado esperado:** Usuária vê "Relato" e "Fale Aqui" em vez de "Reclamação"

---

### **FASE 3: Acessibilidade WCAG AA** (3-4h)
**Objetivo:** Conformidade total com 32 correções mapeadas

- [ ] Ajustar contraste de cores (4.5:1 mínimo)
- [ ] Conectar labels em formulários (htmlFor/aria)
- [ ] Adicionar aria-labels em botões/ícones
- [ ] Implementar focus-visible:ring em tudo
- [ ] Adicionar roles semânticos (tab, status, etc)
- [ ] Testar navegação por teclado
- [ ] Validar alt-text em imagens

**Arquivos principais:**
- `src/components/company/theme.ts` (paleta)
- `src/components/ui/` (form inputs, select, buttons)
- `src/components/company/SearchCompany.tsx`
- `src/components/landing/` (componentes visuais)

**Resultado esperado:** Projeto passa Axe/WAVE com WCAG AA

---

### **FASE 4: Contatos de Suporte + Recursos** (1-2h)
**Objetivo:** Adicionar links de abuso e defensoria

- [ ] Pesquisar/compilar contatos (Defensoria, DEAM, Disque Denúncia)
- [ ] Criar componente SupportResources
- [ ] Integrar na footer + página de contatos
- [ ] Testar acessibilidade dos links

**Resultado esperado:** Usuária vê recursos de ajuda relevantes

---

### **FASE 5: Testes + Documentação** (1-2h)
**Objetivo:** Validação e documento final

- [ ] Testes E2E em staging
- [ ] Verificar em mobile/tablet
- [ ] Validar contraste com Axe DevTools
- [ ] Revisar com screen reader
- [ ] Atualizar `docs/mvp-backlog.md`
- [ ] Criar changelog

**Resultado esperado:** Tudo validado e documentado

---

## 🎯 Sequência de Execução

```
PARALELO:
├─ Fase 1 (Homepage) → Agent 1
├─ Fase 2 (Rebrand) → Agent 2
└─ Fase 3 (Acessibilidade) → Agent 3

DEPOIS:
├─ Fase 4 (Contatos) → Manual
└─ Fase 5 (Testes + Docs) → Revisão final
```

---

## 📊 Métricas de Sucesso

| Métrica | Target | Status |
|---------|--------|--------|
| **Contraste WCAG AA** | 100% | 🔲 |
| **Labels conectadas** | 100% | 🔲 |
| **Focus visível** | Todos interativos | 🔲 |
| **Copy atualizado** | 100% das strings P1 | 🔲 |
| **Mobile OK** | 1920/768/375px | 🔲 |
| **Axe violations** | 0 críticas | 🔲 |
| **Testes E2E** | Passing | 🔲 |

---

## 🔗 Documentação de Referência

- Agent Homepage: Proposta visual, paleta, copy
- Agent Rebrand: Mapeamento 130+ ocorrências
- Agent Acessibilidade: 32 problemas + snippets
- Agent Manual: 7 arquivos documentação
- TODO.md: Backlog geral do projeto

---

**Início:** ▶️ Lançando agents para Fases 1, 2, 3 em paralelo...
