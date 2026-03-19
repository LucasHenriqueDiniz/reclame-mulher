# Backlog Tecnico Prioritario

## P0

- Persistir `onboardingCompletedAt` no final dos fluxos de onboarding de pessoa e empresa.
- Revisar `ProfilesRepo.getRequiredOnboardingStep()` para virar uma regra simples e previsivel.
- Restringir rotas sensiveis da empresa para `OWNER` ou `ADMIN` quando aplicavel:
  - criacao/edicao/remocao de projetos
  - edicao de perfil da empresa
  - exclusao/soft delete da empresa
- Implementar backend administrativo minimo para verificacao de empresas:
  - listar pendencias
  - aprovar
  - rejeitar
  - registrar quem executou a acao

## P1

- Implementar auditoria real:
  - tabela
  - repo
  - endpoint
  - tela admin ligada a dados reais
- Trocar `/api/blog/featured` mock por consulta real ao banco.
- Alinhar regra de publicacao do blog:
  - lista publica
  - detalhe publico
  - filtros por tag
- Definir storage de producao para anexos de reclamacoes.
- Expor leitura/download de anexos de forma controlada.

## P2

- Corrigir `components.json` para refletir o setup real.
- Reduzir inconsistencia tecnica entre telas de empresa e restante da app.
- Limpar warnings de lint e pequenos pontos de codigo morto.
- Revisar uso de `<img>` e migrar o que fizer sentido para `next/image`.

## Fora do caminho critico

- Melhorar i18n alem do provider atual, se o produto realmente precisar de rotas por locale.
- Expandir SEO e metadados do blog.
- Refinar dashboard com metricas mais confiaveis.

## Itens removidos nesta limpeza

Os itens abaixo foram retirados do repositorio por nao refletirem mais o estado real do projeto:

- migrations antigas de `supabase/`
- docs antigos de implementacao do blog
- troubleshooting legado
- script `dev-clean.bat`

Esses arquivos nao eram mais fonte de verdade nem parte do runtime atual.
