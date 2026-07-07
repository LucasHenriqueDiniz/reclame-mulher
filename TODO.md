# ReclameMulher TODO

Backlog operacional do projeto ReclameMulher / Comunica Mulher.

Status base: 91 tarefas pendentes.

## Resumo

- P1: 11 tarefas - MVP critico
- P2: 23 tarefas - core features
- P3: 35 tarefas - views e refinamentos
- P4: 5 tarefas - post-MVP
- Complementar: 17 tarefas - fechamento da contagem e saneamento

## P1 - MVP Critico

- [ ] Mensagens: consolidar modelo de thread entre usuaria e empresa.
- [ ] Mensagens: garantir permissao de leitura apenas para autora, empresa envolvida e admin.
- [ ] Mensagens: permitir resposta da empresa com atualizacao correta do status.
- [ ] Mensagens: permitir resposta da usuaria com reabertura quando aplicavel.
- [ ] Mensagens: tratar anexos na thread com regra de acesso.
- [ ] Blog publico: validar API de listagem com busca, tag e paginacao.
- [ ] Blog publico: alinhar pagina de lista, detalhe e posts em destaque.
- [ ] Projetos: fechar CRUD da empresa com validacao e ownership.
- [ ] Admin: revisar guards/middleware para rotas administrativas.
- [ ] Reclamacao: completar pagina de detalhe com estados e permissoes.
- [ ] Cadastro obra/mapa: criar fluxo minimo de area afetada e dados territoriais mock.

## P2 - Core Features

- [ ] Repos: revisar contratos dos repos principais.
- [ ] Repos: padronizar retorno de erro em operacoes server-side.
- [ ] Validacoes: revisar DTOs de reclamacao.
- [ ] Validacoes: revisar DTOs de empresa.
- [ ] Validacoes: revisar DTOs de projetos.
- [ ] Validacoes: revisar DTOs de mensagens.
- [ ] UI mensagens: criar composer reutilizavel.
- [ ] UI mensagens: adicionar estados de envio, erro e sucesso.
- [ ] UI reclamacoes: padronizar badges de status.
- [ ] UI reclamacoes: padronizar empty states.
- [ ] RLS/policies: decidir se o projeto manterá auth propria sem RLS ou camada equivalente.
- [ ] RLS/policies: documentar modelo de autorizacao real.
- [ ] RLS/policies: cobrir regras de empresa, reclamacao e admin.
- [ ] Company dashboard: consolidar cards principais.
- [ ] Company dashboard: ligar inbox a dados reais.
- [ ] Company dashboard: ligar projetos a dados reais.
- [ ] Company dashboard: ligar perfil a dados reais.
- [ ] Settings: implementar troca de senha completa.
- [ ] Settings: implementar edicao de conta/perfil.
- [ ] Notificacoes: definir eventos minimos.
- [ ] Notificacoes: criar estrutura de envio ou fila futura.
- [ ] Territorial data: definir contrato de dados de localidade.
- [ ] Territorial data: criar mock consistente para obra/mapa.

## P3 - Views e Refinements

- [ ] Perfil empresa: revisar layout publico.
- [ ] Perfil empresa: exibir projetos ativos.
- [ ] Perfil empresa: exibir reclamacoes publicas.
- [ ] Perfil empresa: exibir metricas principais.
- [ ] Perfil empresa: adicionar estados sem dados.
- [ ] Perfil pessoa: criar view de dados pessoais.
- [ ] Perfil pessoa: criar historico de reclamacoes.
- [ ] Perfil pessoa: criar preferencias de contato.
- [ ] Reclamacao usuaria: revisar listagem.
- [ ] Reclamacao usuaria: revisar filtros.
- [ ] Reclamacao usuaria: revisar detalhe.
- [ ] Reclamacao empresa: revisar inbox.
- [ ] Reclamacao empresa: revisar detalhe.
- [ ] Reclamacao empresa: revisar mudanca de status.
- [ ] Reclamacao reclamador: ajustar linguagem e acessibilidade.
- [ ] Acessibilidade: revisar contraste basico.
- [ ] Acessibilidade: revisar foco visivel.
- [ ] Acessibilidade: revisar textos de erro.
- [ ] Acessibilidade: revisar labels de formulario.
- [ ] Acessibilidade: criar modo alto contraste.
- [ ] Acessibilidade: avaliar TTS ou leitura assistida.
- [ ] Acessibilidade: revisar navegacao por teclado.
- [ ] OAuth: definir provedores desejados.
- [ ] OAuth: criar estrategia de callback.
- [ ] OAuth: reconciliar contas existentes por email.
- [ ] Blog CMS: revisar editor markdown.
- [ ] Blog CMS: revisar upload de imagem.
- [ ] Blog CMS: revisar tags.
- [ ] Blog CMS: revisar rascunho/publicacao.
- [ ] UX filtros: padronizar filtros por status.
- [ ] UX filtros: padronizar busca textual.
- [ ] UX filtros: preservar filtros na URL quando fizer sentido.
- [ ] UX empty states: revisar textos e CTAs.
- [ ] UX loading states: revisar skeletons.
- [ ] UX mobile: revisar telas criticas em viewport pequeno.

## P4 - Post-MVP

- [ ] Reports/feedback: fechar modelo de feedback do usuario.
- [ ] Reports/feedback: criar triagem administrativa.
- [ ] Auditoria avancada: adicionar filtros por acao e entidade.
- [ ] Auditoria avancada: exportar logs administrativos.
- [ ] Filtros avancados: adicionar filtros compostos em reclamacoes e empresas.

## Complementar - Saneamento e Fechamento

- [ ] Atualizar `docs/mvp-backlog.md` para refletir o que ja foi implementado.
- [ ] Corrigir referencias antigas a cookie `auth-token` na documentacao.
- [ ] Remover mencoes obsoletas a Supabase se nao houver runtime relacionado.
- [ ] Limpar warnings de imports nao usados.
- [ ] Revisar ocorrencias de `<img>` e migrar para `next/image` quando fizer sentido.
- [ ] Revisar encoding mojibake em textos renderizados.
- [ ] Padronizar package manager recomendado.
- [ ] Decidir se `package-lock.json` deve permanecer junto com `pnpm-lock.yaml`.
- [ ] Documentar fluxo de migrations Drizzle.
- [ ] Documentar fluxo de seed e contas de teste.
- [ ] Criar checklist de smoke test manual.
- [ ] Criar testes automatizados para auth.
- [ ] Criar testes automatizados para reclamacoes.
- [ ] Criar testes automatizados para empresas/projetos.
- [ ] Criar testes automatizados para blog.
- [ ] Criar testes automatizados para admin/auditoria.
- [ ] Revisar variaveis de ambiente obrigatorias em `.env.example`.
