#!/usr/bin/env tsx
/**
 * Seeds the database with test data: people, companies, projects, complaints.
 *
 * Usage: pnpm db:seed
 * Requires: DATABASE_URL in .env
 */

import "dotenv/config";
import { createDatabase } from "../src/db/driver";
import * as schema from "../src/db/schema";
import crypto from "crypto";
import { promisify } from "util";

// Uses DATABASE_URL (pooled) or DIRECT_URL (direct) — either one works for seeding
const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL;
if (!connectionString || connectionString.includes("build")) {
  console.error("❌ Set DATABASE_URL or DIRECT_URL in .env (a real Neon/Postgres URL).");
  process.exit(1);
}

// Same driver choice the app makes: Neon over HTTP, or wire-protocol Postgres
// when E2E_LOCAL_DB=1 points the seed at the throwaway E2E container.
const db = createDatabase(connectionString);

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = ((await promisify(crypto.scrypt)(password, salt, 64)) as Buffer).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Seeding...\n");

  // Wipe existing data (dev only)
  console.log("🗑️  Clearing existing rows...");
  // Audit rows first: they point at profiles, and they are the one table the
  // seed writes that nothing else deletes. Left in place they would pile up
  // one more copy of the same history on every re-seed of a reused database,
  // and the admin audit figure would grow a new set of duplicates each run.
  await db.delete(schema.auditLogs);
  await db.delete(schema.complaintMessages);
  await db.delete(schema.complaints);
  await db.delete(schema.reports);
  await db.delete(schema.blogPostTags);
  await db.delete(schema.blogPosts);
  await db.delete(schema.blogTags);
  await db.delete(schema.projects);
  await db.delete(schema.companyUsers);
  await db.delete(schema.companies);
  await db.delete(schema.profiles);
  await db.delete(schema.users);
  console.log("✓ Rows cleared\n");

  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const defaultPassword = "senha123";
  const passwordHash = await hashPassword(defaultPassword);

  // ─── Users ─────────────────────────────────────────────────────────────
  const usersInserted = await db
    .insert(schema.users)
    .values([
      {
        email: "maria@exemplo.com",
        passwordHash,
      },
      {
        email: "empresa@construtorax.com",
        passwordHash,
      },
      {
        email: "ana@exemplo.com",
        passwordHash,
      },
      {
        email: "admin@comunicamulher.com.br",
        passwordHash,
      },
      // The two accounts below stopped halfway through the sign-up: they have
      // a session but no finished onboarding, which is the only state in which
      // step 2 of either wizard can be seen. `screens/catalog.ts` captures
      // those two screens with them; without a signed-in account the page
      // bounces to /login and the figure came out as a copy of the login one.
      {
        email: "julia@exemplo.com",
        passwordHash,
      },
      {
        email: "contato@obrasaurora.com",
        passwordHash,
        // What POST /api/auth/register-company stores for a company that has
        // only finished step 1. The step 2 screen reads company_name from here.
        metadata: JSON.stringify({ company_name: "Obras Aurora", cnpj: "45678901000122" }),
      },
    ])
    .returning({ id: schema.users.id });

  const [user1, user2, user3, adminUser, pendingPersonUser, pendingCompanyUser] = usersInserted;
  if (!user1 || !user2 || !user3 || !adminUser || !pendingPersonUser || !pendingCompanyUser) {
    throw new Error("Falha ao criar users");
  }

  console.log("✓ Users created (maria, empresa@construtorax, ana, admin, julia, obras aurora)");

  // ─── Profiles ───────────────────────────────────────────────────────────
  await db.insert(schema.profiles).values([
    { 
      userId: user1.id, 
      name: "Maria Silva", 
      role: "USER", 
      email: "maria@exemplo.com",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      onboardingCompletedAt: now,
      acceptedTermsAt: now,
    },
    { 
      userId: user2.id, 
      name: "João Costa", 
      role: "COMPANY", 
      email: "empresa@construtorax.com",
      phone: "(11) 3333-4444",
      address: "Rua das Obras, 100",
      city: "São Paulo",
      state: "SP",
      onboardingCompletedAt: now,
      acceptedTermsAt: now,
    },
    { 
      userId: user3.id, 
      name: "Ana Santos", 
      role: "USER", 
      email: "ana@exemplo.com",
      phone: "(21) 99876-5432",
      address: "Av. Atlântica, 456",
      city: "Rio de Janeiro",
      state: "RJ",
      onboardingCompletedAt: now,
      acceptedTermsAt: now,
    },
    { 
      userId: adminUser.id, 
      name: "Admin", 
      role: "ADMIN", 
      email: "admin@comunicamulher.com.br",
      cpf: "99999999999",
      phone: "(11) 99999-9999",
      address: "Rua da Administração, 1",
      city: "São Paulo",
      state: "SP",
      onboardingCompletedAt: now,
      acceptedTermsAt: now,
    },
    // Mid-onboarding, so no onboardingCompletedAt and no acceptedTermsAt: this
    // is exactly the row POST /api/auth/register writes before the person ever
    // reaches step 2. Address, city and state are the fields step 2 asks for,
    // so they are still empty here.
    {
      userId: pendingPersonUser.id,
      name: "Júlia Ramos",
      role: "USER",
      email: "julia@exemplo.com",
      cpf: "52998224725",
      provider: "email",
    },
    // The same halfway state for a company: POST /api/auth/register-company
    // names the profile after the company and waits for step 2 for the rest.
    {
      userId: pendingCompanyUser.id,
      name: "Obras Aurora",
      role: "COMPANY",
      email: "contato@obrasaurora.com",
      provider: "email",
    },
  ]);
  console.log("✓ Profiles created");
  console.log(`✓ Admin seed: admin@comunicamulher.com.br / ${defaultPassword}`);

  // ─── Companies ──────────────────────────────────────────────────────────
  // Construtora X was verified by the admin two weeks ago, Transportes Sul had
  // its badge taken back — see the audit trail at the end of this file, which
  // has to agree with these two fields to be worth reading.
  const verifiedConstrutoraXAt = daysAgo(14);

  // Registration dates. Without these, `createdAt` defaults to the moment of the
  // seed run, and every company reads as created today — which puts it after its
  // own verification and after the audit entries that record it. The figures of
  // the admin area print both dates side by side, so the two have to agree.
  const construtoraXRegisteredAt = daysAgo(60);
  const transportesSulRegisteredAt = daysAgo(45);
  const obrasAuroraRegisteredAt = daysAgo(1);

  // Opening and answering times. `getStats` reads the average response time as
  // `updatedAt - createdAt` over the complaints that are no longer OPEN, so with
  // both columns defaulting to the seed run the difference was zero and the
  // indicator rendered as a dash — in the same figure whose caption promises it.
  const hoursAfter = (from: Date, hours: number) =>
    new Date(from.getTime() + hours * 60 * 60 * 1000);
  const noiseOpenedAt = daysAgo(6);
  const signageOpenedAt = daysAgo(10);

  const [company1, company2, company3] = await db
    .insert(schema.companies)
    .values([
      {
        name: "Construtora X",
        slug: "construtora-x",
        cnpj: "12345678000190",
        corporateName: "Construtora X Ltda",
        sector: "Construção",
        description: "Obras de infraestrutura e edificações.",
        email: "contato@construtorax.com",
        phone: "(11) 3333-4444",
        website: "https://construtorax.com",
        city: "São Paulo",
        state: "SP",
        region: "Sudeste",
        address: "Rua das Obras, 100",
        neighborhood: "Centro",
        streetNumber: "100",
        responsibleName: "João Costa",
        responsibleEmail: "empresa@construtorax.com",
        verifiedAt: verifiedConstrutoraXAt,
        createdAt: construtoraXRegisteredAt,
      },
      {
        name: "Transportes Sul",
        slug: "transportes-sul",
        cnpj: "98765432000100",
        corporateName: "Transportes Sul S.A.",
        sector: "Logística",
        description: "Transporte rodoviário de cargas.",
        email: "contato@transportessul.com",
        phone: "(51) 5555-6666",
        city: "Porto Alegre",
        state: "RS",
        region: "Sul",
        address: "Av. dos Caminhões, 500",
        neighborhood: "Industrial",
        streetNumber: "500",
        createdAt: transportesSulRegisteredAt,
      },
      // Registered through step 1 and never finished: name, CNPJ and slug are
      // all POST /api/auth/register-company writes, and step 2 fills the rest.
      {
        name: "Obras Aurora",
        slug: "obras-aurora",
        cnpj: "45678901000122",
        createdAt: obrasAuroraRegisteredAt,
      },
    ])
    .returning({ id: schema.companies.id });

  console.log("✓ Companies created (Construtora X, Transportes Sul, Obras Aurora)");

  // ─── Company users (João = Construtora X) ────────────────────────────────
  // OWNER, because that is the role `POST /api/auth/register-company` gives the
  // person who registers a company — this seeded membership stands in for one.
  // It was "MEMBER", which no signup path produces: it left Construtora X with
  // no owner, and `canManageCompany` refuses MEMBER, so the only seeded company
  // account got a 403 from every project, profile and team route it has a
  // button for.
  await db.insert(schema.companyUsers).values([
    { userId: user2.id, companyId: company1.id, role: "OWNER" },
    // The half-registered company owns its company row from step 1 onwards.
    { userId: pendingCompanyUser.id, companyId: company3.id, role: "OWNER" },
  ]);
  console.log("✓ Company user: empresa@construtorax.com → Construtora X");

  // ─── Projects ───────────────────────────────────────────────────────────
  const [proj1] = await db
    .insert(schema.projects)
    .values([
      {
        companyId: company1.id,
        name: "Obra Rodovia BR-101",
        description: "Duplicação do trecho SP-RJ.",
        location: "São Paulo - RJ",
        status: "IN_PROGRESS",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2025-06-30"),
      },
      {
        companyId: company1.id,
        name: "Ponte Nova",
        description: "Construção da ponte sobre o rio.",
        location: "Santa Catarina",
        status: "PLANNING",
        startDate: new Date("2025-03-01"),
      },
      {
        companyId: company2.id,
        name: "Frota Sul",
        description: "Operação logística região Sul.",
        location: "RS, SC, PR",
        status: "IN_PROGRESS",
        startDate: new Date("2024-06-01"),
      },
    ])
    .returning({ id: schema.projects.id });

  console.log("✓ Projects created");

  // ─── Complaints ──────────────────────────────────────────────────────────
  const [, c2] = await db
    .insert(schema.complaints)
    .values([
      {
        authorId: user1.id,
        companyId: company1.id,
        projectId: proj1.id,
        title: "Atraso na entrega de documentação da obra",
        description: "Solicitei a documentação de impacto ambiental há 30 dias e até hoje não recebi retorno.",
        status: "OPEN",
        isPublic: true,
        isAnonymous: false,
        createdAt: daysAgo(3),
      },
      {
        authorId: user3.id,
        companyId: company1.id,
        projectId: proj1.id,
        title: "Barulho fora do horário permitido",
        description: "Trabalhos noturnos sem autorização, atrapalhando o sono da comunidade.",
        status: "RESPONDED",
        isPublic: true,
        isAnonymous: true,
        createdAt: noiseOpenedAt,
        updatedAt: hoursAfter(noiseOpenedAt, 30),
      },
      {
        authorId: user1.id,
        companyId: company1.id,
        title: "Falta de sinalização na via",
        description: "Trecho da obra sem sinalização adequada, risco de acidentes.",
        status: "RESOLVED",
        isPublic: true,
        isAnonymous: false,
        createdAt: signageOpenedAt,
        updatedAt: hoursAfter(signageOpenedAt, 54),
      },
    ])
    .returning({ id: schema.complaints.id });

  console.log("✓ Complaints created");

  // ─── Complaint messages ─────────────────────────────────────────────────
  await db.insert(schema.complaintMessages).values([
    {
      complaintId: c2.id,
      senderType: "COMPANY",
      authorId: user2.id,
      content: "Prezada, estamos verificando a autorização e entraremos em contato em até 48h.",
    },
  ]);
  console.log("✓ Complaint messages created");

  // ─── Report ─────────────────────────────────────────────────────────────
  await db.insert(schema.reports).values({
    reporterId: user3.id,
    type: "ABUSE",
    status: "PENDING",
    title: "Denúncia de empresa: Informações falsas",
    description: "CNPJ da empresa não confere no site da Receita.",
    relatedCompanyId: company2.id,
  });
  console.log("✓ Report created");

  // ─── Blog Tags ──────────────────────────────────────────────────────────
  const tagsInserted = await db
    .insert(schema.blogTags)
    .values([
      { name: "Direitos", slug: "direitos" },
      { name: "Participação Social", slug: "participacao-social" },
      { name: "Casos de Sucesso", slug: "casos-de-sucesso" },
      { name: "Infraestrutura", slug: "infraestrutura" },
      { name: "Empoderamento", slug: "empoderamento" },
      { name: "Comunidade", slug: "comunidade" },
    ])
    .returning({ id: schema.blogTags.id, slug: schema.blogTags.slug });

  const tagMap = new Map(tagsInserted.map(t => [t.slug, t.id]));
  console.log("✓ Blog tags created");

  // ─── Blog Posts ─────────────────────────────────────────────────────────
  const postsInserted = await db
    .insert(schema.blogPosts)
    .values([
      {
        title: "Como reclamar com segurança",
        slug: "como-reclamar-com-seguranca",
        content: "<p>Guia rápido para registrar reclamações.</p>",
        contentMd: `# Como Reclamar com Segurança

Registrar uma reclamação pode parecer intimidador, mas é um direito fundamental de todo cidadão. Aqui estão algumas dicas para fazer isso com segurança e eficácia.

## 1. Documente Tudo

Antes de fazer sua reclamação, reúna todas as evidências possíveis:
- Fotos e vídeos
- Documentos relacionados
- Datas e horários específicos
- Nomes de pessoas envolvidas

## 2. Seja Claro e Objetivo

Ao escrever sua reclamação:
- Use linguagem clara e direta
- Descreva os fatos de forma cronológica
- Evite linguagem ofensiva
- Foque no problema, não nas pessoas

## 3. Conheça Seus Direitos

É importante saber que você tem o direito de:
- Fazer reclamações de forma anônima
- Receber resposta em tempo hábil
- Ter sua privacidade protegida
- Acompanhar o andamento da reclamação

## 4. Use Canais Oficiais

Sempre prefira canais oficiais e documentados para fazer suas reclamações. Nossa plataforma oferece um ambiente seguro e transparente.

---

Lembre-se: sua voz importa e pode fazer a diferença na sua comunidade!`,
        excerpt: "Dicas essenciais para registrar reclamações de forma segura e eficaz.",
        coverUrl: "/blog-image.webp",
        status: "PUBLISHED",
        publishedAt: now,
      },
      {
        title: "Participação Social Feminina: Como Mulheres Transformaram Projetos de Infraestrutura",
        slug: "participacao-social-feminina-infraestrutura",
        contentMd: `# Participação Social Feminina: Como Mulheres Transformaram Projetos de Infraestrutura

A participação ativa de mulheres em projetos de infraestrutura tem demonstrado resultados extraordinários em comunidades por todo o Brasil.

## O Poder da Voz Feminina

Quando mulheres se envolvem ativamente no planejamento e fiscalização de obras públicas, os projetos tendem a ser mais inclusivos e atentos às necessidades reais da comunidade.

### Casos Reais de Transformação

**Projeto Rodovia Segura - SP**

Em 2023, um grupo de mães da região metropolitana de São Paulo organizou-se para exigir melhorias na sinalização de uma rodovia que passava próxima a escolas. O resultado:
- Redução de 60% nos acidentes
- Instalação de passarelas
- Iluminação adequada
- Faixas de pedestres elevadas

**Ponte da Comunidade - BA**

Na Bahia, mulheres lideraram a fiscalização da construção de uma ponte que conectaria duas comunidades. Sua participação garantiu:
- Cumprimento dos prazos
- Qualidade dos materiais
- Acessibilidade para pessoas com deficiência
- Espaços seguros para pedestres

## Como Participar

Você também pode fazer a diferença:

1. **Informe-se** sobre os projetos em sua região
2. **Organize-se** com outras mulheres da comunidade
3. **Documente** problemas e sugestões
4. **Use plataformas** como a nossa para registrar suas demandas
5. **Acompanhe** o andamento das obras

## O Impacto Vai Além da Obra

A participação feminina em projetos de infraestrutura não apenas melhora as obras, mas também:
- Fortalece a democracia local
- Empodera mulheres
- Cria redes de apoio comunitário
- Inspira outras mulheres a se envolverem

---

*Sua participação é fundamental. Juntas, construímos comunidades melhores.*`,
        excerpt: "Descubra como a participação ativa de mulheres tem transformado projetos de infraestrutura em todo o Brasil.",
        coverUrl: "/blog-image-2.webp",
        status: "PUBLISHED",
        publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: "5 Direitos que Toda Mulher Deve Conhecer ao Fazer uma Reclamação",
        slug: "5-direitos-mulher-reclamacao",
        contentMd: `# 5 Direitos que Toda Mulher Deve Conhecer ao Fazer uma Reclamação

Conhecer seus direitos é o primeiro passo para exercê-los com confiança. Aqui estão 5 direitos fundamentais que toda mulher deve conhecer.

## 1. Direito ao Anonimato

Você tem o direito de fazer reclamações de forma anônima, protegendo sua identidade quando necessário. Isso é especialmente importante em situações sensíveis.

**Como funciona:**
- Sua identidade não será revelada à empresa
- Apenas administradores da plataforma têm acesso
- Suas mensagens permanecem anônimas

## 2. Direito à Resposta

Empresas têm o dever de responder suas reclamações em tempo hábil. Você não deve ser ignorada.

**Prazos esperados:**
- Primeira resposta: até 5 dias úteis
- Resolução: conforme complexidade do caso
- Atualizações regulares sobre o andamento

## 3. Direito à Proteção de Dados

Suas informações pessoais devem ser protegidas conforme a LGPD (Lei Geral de Proteção de Dados).

**Isso significa:**
- Seus dados não serão compartilhados sem consentimento
- Você pode solicitar exclusão de suas informações
- Transparência sobre como seus dados são usados

## 4. Direito de Acompanhamento

Você tem o direito de acompanhar todo o processo de sua reclamação.

**Você pode:**
- Ver todas as mensagens trocadas
- Receber notificações de atualizações
- Adicionar novas informações quando necessário
- Solicitar esclarecimentos

## 5. Direito à Não Retaliação

Fazer uma reclamação legítima não pode resultar em retaliação ou discriminação.

**Proteções incluem:**
- Proibição de represálias
- Canais para denunciar retaliação
- Suporte legal quando necessário

## Como Exercer Seus Direitos

1. **Documente tudo** - mantenha registros de todas as interações
2. **Seja específica** - descreva claramente o problema
3. **Conheça os prazos** - saiba quando esperar respostas
4. **Busque apoio** - não hesite em pedir ajuda
5. **Persista** - seus direitos são garantidos por lei

---

*Conhecimento é poder. Use seus direitos para fazer sua voz ser ouvida.*`,
        excerpt: "Conheça os direitos fundamentais que protegem você ao registrar uma reclamação.",
        coverUrl: "/blog-image-3.webp",
        status: "PUBLISHED",
        publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: "Construindo Comunidades Mais Fortes Através da Participação Cidadã",
        slug: "construindo-comunidades-participacao-cidada",
        contentMd: `# Construindo Comunidades Mais Fortes Através da Participação Cidadã

A participação ativa dos cidadãos, especialmente das mulheres, é fundamental para construir comunidades mais justas e resilientes.

## O Que é Participação Cidadã?

Participação cidadã vai além de votar. É sobre estar ativamente envolvida nas decisões que afetam sua comunidade.

### Formas de Participação

- **Audiências públicas** - participe e faça sua voz ser ouvida
- **Conselhos comunitários** - integre grupos de decisão
- **Fiscalização de obras** - acompanhe projetos em sua região
- **Plataformas digitais** - use ferramentas online para se manifestar

## Por Que Sua Participação Importa

Quando você participa ativamente:

1. **Decisões são mais representativas** - refletem as necessidades reais
2. **Recursos são melhor utilizados** - prioridades são definidas pela comunidade
3. **Transparência aumenta** - gestores são mais responsáveis
4. **Comunidade se fortalece** - laços sociais são criados

## Histórias Inspiradoras

### Rede de Mulheres Fiscalizadoras - RJ

Um grupo de mulheres no Rio de Janeiro criou uma rede para fiscalizar obras públicas em seus bairros. Resultados em 1 ano:
- 15 obras acompanhadas
- 8 irregularidades identificadas e corrigidas
- 3 projetos melhorados com sugestões da comunidade
- Economia de R$ 2 milhões em recursos públicos

### Coletivo Mães pela Mobilidade - MG

Mães em Belo Horizonte se uniram para melhorar o transporte público. Conquistas:
- Novos pontos de ônibus próximos a escolas
- Horários ajustados para atender famílias
- Maior segurança nos trajetos
- Tarifa social para mães solo

## Como Começar

**Passo 1: Identifique um problema**
- O que incomoda você em sua comunidade?
- Que melhorias você gostaria de ver?

**Passo 2: Conecte-se com outras pessoas**
- Converse com vizinhas
- Use redes sociais
- Participe de grupos locais

**Passo 3: Documente e comunique**
- Registre o problema com fotos e vídeos
- Use plataformas como a nossa
- Compartilhe nas redes sociais

**Passo 4: Proponha soluções**
- Seja construtiva
- Apresente alternativas viáveis
- Ofereça-se para colaborar

**Passo 5: Acompanhe e persista**
- Monitore o andamento
- Mantenha a pressão
- Celebre as vitórias

## Ferramentas Disponíveis

Nossa plataforma oferece:
- Sistema de reclamações transparente
- Acompanhamento em tempo real
- Conexão com outras cidadãs
- Recursos educativos
- Suporte da comunidade

## O Futuro que Queremos

Imagine uma comunidade onde:
- Todas as vozes são ouvidas
- Decisões são tomadas coletivamente
- Recursos são usados com sabedoria
- Mulheres lideram mudanças
- Transparência é a norma

Esse futuro começa com sua participação hoje.

---

*Juntas, somos mais fortes. Sua voz importa.*`,
        excerpt: "Descubra como a participação cidadã ativa pode transformar sua comunidade.",
        coverUrl: "/hero.webp",
        status: "PUBLISHED",
        publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ])
    .returning({ id: schema.blogPosts.id, slug: schema.blogPosts.slug });

  console.log("✓ Blog posts created");

  // ─── Blog Post Tags ─────────────────────────────────────────────────────
  const postMap = new Map(postsInserted.map(p => [p.slug, p.id]));

  await db.insert(schema.blogPostTags).values([
    // post: "Como reclamar com segurança"
    { postId: postMap.get("como-reclamar-com-seguranca")!, tagId: tagMap.get("direitos")! },
    { postId: postMap.get("como-reclamar-com-seguranca")!, tagId: tagMap.get("empoderamento")! },
    
    // post: "Participação Social Feminina"
    { postId: postMap.get("participacao-social-feminina-infraestrutura")!, tagId: tagMap.get("participacao-social")! },
    { postId: postMap.get("participacao-social-feminina-infraestrutura")!, tagId: tagMap.get("casos-de-sucesso")! },
    { postId: postMap.get("participacao-social-feminina-infraestrutura")!, tagId: tagMap.get("infraestrutura")! },
    
    // post: "5 Direitos"
    { postId: postMap.get("5-direitos-mulher-reclamacao")!, tagId: tagMap.get("direitos")! },
    { postId: postMap.get("5-direitos-mulher-reclamacao")!, tagId: tagMap.get("empoderamento")! },
    
    // post: "Construindo Comunidades"
    { postId: postMap.get("construindo-comunidades-participacao-cidada")!, tagId: tagMap.get("participacao-social")! },
    { postId: postMap.get("construindo-comunidades-participacao-cidada")!, tagId: tagMap.get("comunidade")! },
    { postId: postMap.get("construindo-comunidades-participacao-cidada")!, tagId: tagMap.get("casos-de-sucesso")! },
  ]);

  console.log("✓ Tags attached to the posts");

  // ─── Audit log ──────────────────────────────────────────────────────────
  // The report presents the audit trail as a reliability requirement, and the
  // figure under that paragraph was an empty table: `AuditRepo` is only ever
  // written by the company verification route, which nothing in the seed calls.
  //
  // These rows are the history the seed's own state implies, written by the
  // same hand and in the same shape as that route: Construtora X carries a
  // verification badge, Transportes Sul does not and has an open abuse report
  // saying its CNPJ does not check out. So: both were verified, and one of the
  // two had it taken back when the report came in. The dates run behind `now`
  // in the same order as the story.
  await db.insert(schema.auditLogs).values([
    {
      actorUserId: adminUser.id,
      action: "COMPANY_VERIFIED",
      entityType: "company",
      entityId: company1.id,
      metadata: JSON.stringify({ verified: true }),
      createdAt: verifiedConstrutoraXAt,
    },
    {
      actorUserId: adminUser.id,
      action: "COMPANY_VERIFIED",
      entityType: "company",
      entityId: company2.id,
      metadata: JSON.stringify({ verified: true }),
      createdAt: daysAgo(9),
    },
    {
      actorUserId: adminUser.id,
      action: "COMPANY_UNVERIFIED",
      entityType: "company",
      entityId: company2.id,
      metadata: JSON.stringify({ verified: false }),
      createdAt: daysAgo(4),
    },
  ]);
  console.log("✓ Audit log entries created");

  console.log("\n✅ Seed finished.\n");
  console.log(`Test logins (password for all of them: ${defaultPassword}):`);
  console.log("  - maria@exemplo.com (person)");
  console.log("  - empresa@construtorax.com (company – Construtora X)");
  console.log("  - ana@exemplo.com (person)");
  console.log("  - admin@comunicamulher.com.br (admin)");
  console.log("  - julia@exemplo.com (person, onboarding unfinished)");
  console.log("  - contato@obrasaurora.com (company, onboarding unfinished)");
  console.log("\nPublic company profile: /company/construtora-x");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
