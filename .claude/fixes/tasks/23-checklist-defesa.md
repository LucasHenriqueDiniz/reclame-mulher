# [23] Checklist de prontidão para a demonstração da defesa

| Campo | Valor |
|---|---|
| **ID** | `23` |
| **Fase** | `8 — Documentação` |
| **Risco** | baixo |
| **Depende de** | `22` |
| **Estimativa** | curta |

## Objetivo

Ter um roteiro testado de demonstração que funciona ao vivo, e a certeza de que
nada quebra no meio.

## Contexto

Defesa prevista para novembro de 2026. A plataforma será demonstrada. O risco
não é ela estar incompleta — é ela quebrar na frente da banca.

## Passos

1. Escreva `docs/roteiro-demonstracao.md` com um percurso de 10 a 15 minutos:
   - abrir a home e explicar a proposta;
   - fazer login como usuária;
   - registrar uma reclamação completa;
   - trocar para a empresa e responder;
   - voltar como usuária e ver a resposta;
   - mostrar o perfil público da empresa;
   - mostrar a área administrativa, se fizer sentido.

2. **Execute o roteiro inteiro, do começo ao fim, sobre o build de produção**
   (`npm run start`). Cronometre. Anote todo tropeço.

3. Prepare o estado inicial: um script ou instrução de seed que deixe o banco
   num ponto bom para demonstrar — reclamações com histórico, empresas com
   perfil preenchido, nada de texto de teste na tela.

4. Plano B para o que costuma falhar ao vivo:
   - internet ruim → capturas ou gravação de tela como fallback;
   - upload de anexo dependendo de serviço externo (UploadThing) → tenha um
     caminho que não dependa dele, ou um vídeo curto do fluxo;
   - banco remoto (Neon) lento ou dormindo → aqueça antes, ou tenha instância
     local.

5. Liste as limitações conhecidas, com honestidade, em uma seção separada.
   Banca pergunta. É melhor ter a resposta pronta do que improvisar.

## Critérios de aceite

- [ ] `docs/roteiro-demonstracao.md` existe e foi executado integralmente ao
      menos uma vez sobre o build de produção.
- [ ] O tempo do percurso está cronometrado e cabe no tempo da apresentação.
- [ ] Existe plano B documentado para falha de rede e para o upload.
- [ ] A lista de limitações conhecidas está escrita.

## Verificação

Execução manual do roteiro completo, do início ao fim, sem pular etapa.
