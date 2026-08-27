#!/usr/bin/env tsx
/**
 * Dados de demonstração para a defesa.
 *
 *   pnpm db:seed            # base — é dela que os testes dependem
 *   pnpm db:seed:demo       # acrescenta o cenário de demonstração
 *
 * **Por que este script existe.** Até a task `03` a home mostrava números
 * inventados, fixos no código. Ela passou a consultar o banco — o que está
 * certo — e com o seed base passou a mostrar *2 mulheres ouvidas, 33% de
 * resolução, 1 empresa em diálogo*. É verdade e parece abandono. A solução é
 * ter mais dado de demonstração, não voltar a mentir no front.
 *
 * **Tudo aqui é ficção.** Nomes, empresas, obras e relatos foram inventados
 * para a demonstração. Nenhuma pessoa e nenhuma empresa real aparece.
 *
 * **Para voltar ao estado dos testes:** `pnpm db:seed`. A suíte automatizada
 * depende dos dados da base, não destes.
 *
 * O script é re-executável: ele apaga o que ele mesmo criou antes de inserir.
 */

import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import crypto from "crypto";
import { promisify } from "util";

import * as schema from "../src/db/schema";

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!connectionString || connectionString.includes("build")) {
  console.error("Defina DATABASE_URL ou DIRECT_URL no .env (URL real do Neon/Postgres).");
  process.exit(1);
}

const db = drizzle(neon(connectionString), { schema });

const SENHA = process.env.E2E_SENHA ?? "senha123";

async function hashDaSenha(senha: string) {
  const sal = crypto.randomBytes(16).toString("hex");
  const hash = ((await promisify(crypto.scrypt)(senha, sal, 64)) as Buffer).toString("hex");
  return `${sal}:${hash}`;
}

/** Data relativa a hoje, para o cenário não envelhecer sozinho. */
function diasAtras(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(9 + (dias % 8), (dias * 7) % 60, 0, 0);
  return d;
}

// ─── O elenco ────────────────────────────────────────────────────────────────

const MULHERES = [
  { email: "helena.demo@exemplo.com", nome: "Helena Vasconcelos", cidade: "Recife", uf: "PE" },
  { email: "rosangela.demo@exemplo.com", nome: "Rosângela Braga", cidade: "Salvador", uf: "BA" },
  { email: "cleide.demo@exemplo.com", nome: "Cleide Nascimento", cidade: "Belém", uf: "PA" },
  { email: "juliana.demo@exemplo.com", nome: "Juliana Prado", cidade: "Curitiba", uf: "PR" },
  { email: "marlene.demo@exemplo.com", nome: "Marlene Ferreira", cidade: "Goiânia", uf: "GO" },
  { email: "sonia.demo@exemplo.com", nome: "Sônia Rabelo", cidade: "Fortaleza", uf: "CE" },
  { email: "beatriz.demo@exemplo.com", nome: "Beatriz Almeida", cidade: "Porto Alegre", uf: "RS" },
  { email: "damiana.demo@exemplo.com", nome: "Damiana Costa", cidade: "Teresina", uf: "PI" },
  { email: "vera.demo@exemplo.com", nome: "Vera Lúcia Moraes", cidade: "Campinas", uf: "SP" },
];

const RESPONSAVEIS = [
  { email: "atendimento.norte.demo@exemplo.com", nome: "Patrícia Meireles" },
  { email: "ouvidoria.saneamento.demo@exemplo.com", nome: "Rogério Tavares" },
];

const EMPRESAS = [
  {
    slug: "norte-engenharia-demo",
    name: "Norte Engenharia",
    corporateName: "Norte Engenharia e Infraestrutura Ltda",
    cnpj: "31415926000153",
    sector: "Construção pesada",
    description:
      "Executa obras rodoviárias e de drenagem urbana em municípios do Norte e Nordeste.",
    city: "Recife",
    state: "PE",
    region: "Nordeste",
    email: "contato@norteengenharia.exemplo.com",
    phone: "(81) 3222-1100",
    website: "https://norteengenharia.exemplo.com",
    address: "Av. Agamenon Magalhães, 1200",
    neighborhood: "Boa Vista",
    streetNumber: "1200",
    responsavel: RESPONSAVEIS[0],
    verificada: true,
    projetos: [
      { name: "Drenagem da Bacia do Beberibe", location: "Recife, PE", status: "IN_PROGRESS" as const },
      { name: "Duplicação da BR-232 (lote 3)", location: "Vitória de Santo Antão, PE", status: "IN_PROGRESS" as const },
      { name: "Ponte do Canal do Arruda", location: "Recife, PE", status: "COMPLETED" as const },
    ],
  },
  {
    slug: "aguas-do-cerrado-demo",
    name: "Águas do Cerrado",
    corporateName: "Águas do Cerrado Saneamento S.A.",
    cnpj: "27182818000128",
    sector: "Saneamento",
    description:
      "Concessionária de água e esgoto. Obras de rede coletora e estações de tratamento.",
    city: "Goiânia",
    state: "GO",
    region: "Centro-Oeste",
    email: "ouvidoria@aguasdocerrado.exemplo.com",
    phone: "(62) 3444-7700",
    address: "Rua 84, 500",
    neighborhood: "Setor Sul",
    streetNumber: "500",
    responsavel: RESPONSAVEIS[1],
    verificada: true,
    projetos: [
      { name: "Rede coletora do Setor Leste", location: "Goiânia, GO", status: "IN_PROGRESS" as const },
      { name: "Estação Elevatória Jardim Novo Mundo", location: "Goiânia, GO", status: "PLANNING" as const },
    ],
  },
  {
    slug: "vialitoral-demo",
    name: "ViaLitoral Concessões",
    corporateName: "ViaLitoral Concessões Rodoviárias S.A.",
    cnpj: "16180339000174",
    sector: "Concessão rodoviária",
    description: "Administra 240 km de rodovia litorânea e as obras de manutenção do trecho.",
    city: "Curitiba",
    state: "PR",
    region: "Sul",
    email: "faleconosco@vialitoral.exemplo.com",
    phone: "(41) 3555-2200",
    address: "Rodovia PR-407, km 12",
    neighborhood: "Zona Rural",
    streetNumber: "s/n",
    responsavel: null,
    verificada: false,
    projetos: [
      { name: "Terceira faixa da PR-407", location: "Paranaguá, PR", status: "IN_PROGRESS" as const },
    ],
  },
];

type Situacao = "OPEN" | "RESPONDED" | "RESOLVED";

/**
 * Os relatos. `dias` é há quantos dias o relato foi aberto — o cenário se
 * mantém plausível com o tempo em vez de congelar numa data.
 */
const RELATOS: Array<{
  empresa: string;
  projeto?: string;
  autora: string;
  titulo: string;
  descricao: string;
  local: string;
  categoria: string;
  urgencia: string;
  alcance: string;
  situacao: Situacao;
  anonimo?: boolean;
  publico?: boolean;
  dias: number;
  conversa?: Array<{ de: "USER" | "COMPANY"; texto: string; dias: number }>;
}> = [
  {
    empresa: "norte-engenharia-demo",
    projeto: "Drenagem da Bacia do Beberibe",
    autora: "helena.demo@exemplo.com",
    titulo: "Vala aberta na calçada há três semanas",
    descricao:
      "Abriram uma vala na frente de casa para a rede de drenagem e não fecharam. Minha mãe tem 78 anos e usa bengala; ela não consegue mais sair sozinha.",
    local: "Rua do Hospício, altura do número 400 — Boa Vista",
    categoria: "Mobilidade",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 62,
    conversa: [
      { de: "COMPANY", texto: "Bom dia. Registramos a ocorrência e a equipe vai ao local ainda esta semana para avaliar o fechamento provisório.", dias: 60 },
      { de: "USER", texto: "A equipe veio na quinta e colocou umas placas, mas a vala continua aberta.", dias: 55 },
      { de: "COMPANY", texto: "A vala foi fechada em definitivo na sexta-feira, dia 12, e a calçada foi refeita no mesmo trecho. Pedimos desculpas pela demora.", dias: 48 },
    ],
  },
  {
    empresa: "norte-engenharia-demo",
    projeto: "Drenagem da Bacia do Beberibe",
    autora: "rosangela.demo@exemplo.com",
    titulo: "Água suja entrando no quintal quando chove",
    descricao:
      "Desde que a obra começou, toda chuva forte a água desce da rua e entra no quintal. Já perdi duas máquinas de lavar.",
    local: "Travessa São Vicente, 87",
    categoria: "Patrimônio",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESPONDED",
    dias: 21,
    conversa: [
      { de: "COMPANY", texto: "Recebemos seu relato. Vamos verificar o desvio provisório de escoamento no trecho e retornamos em até cinco dias úteis.", dias: 18 },
    ],
  },
  {
    empresa: "norte-engenharia-demo",
    projeto: "Duplicação da BR-232 (lote 3)",
    autora: "cleide.demo@exemplo.com",
    titulo: "Caminhões passando às cinco da manhã na rua residencial",
    descricao:
      "Os caminhões da obra cortam caminho pela nossa rua, que é residencial e não tem asfalto reforçado. Começam às cinco da manhã.",
    local: "Rua Projetada B — Bairro Novo",
    categoria: "Saúde",
    urgencia: "Média",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 95,
    conversa: [
      { de: "COMPANY", texto: "O trajeto foi alterado a partir de segunda-feira. Os caminhões passam agora pela via de acesso da obra, e não mais pela rua residencial.", dias: 88 },
    ],
  },
  {
    empresa: "norte-engenharia-demo",
    autora: "sonia.demo@exemplo.com",
    titulo: "Não avisaram que ia faltar água",
    descricao:
      "Ficamos dois dias sem água por causa do desvio da rede e ninguém avisou. Tenho uma filha bebê.",
    local: "Conjunto Beira Rio, quadra 4",
    categoria: "Direitos",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 130,
    conversa: [
      { de: "COMPANY", texto: "Você tem razão: a comunicação prévia falhou. Passamos a avisar por carro de som e cartaz nos comércios com 48 horas de antecedência.", dias: 124 },
    ],
  },
  {
    empresa: "norte-engenharia-demo",
    projeto: "Ponte do Canal do Arruda",
    autora: "damiana.demo@exemplo.com",
    titulo: "Passarela provisória sem corrimão",
    descricao:
      "A passarela que colocaram para atravessar o canal não tem corrimão de um lado. As crianças passam ali para ir à escola.",
    local: "Canal do Arruda, próximo à Escola Municipal Padre Cícero",
    categoria: "Saúde",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 158,
    conversa: [
      { de: "COMPANY", texto: "Corrimão instalado nos dois lados e piso antiderrapante aplicado. Obrigado pelo aviso.", dias: 150 },
    ],
  },
  {
    empresa: "norte-engenharia-demo",
    autora: "vera.demo@exemplo.com",
    titulo: "Poeira da obra entrando dentro de casa",
    descricao:
      "Não dá para abrir janela. Limpo de manhã e à tarde já está tudo branco de novo. Meu filho tem bronquite.",
    local: "Rua das Acácias, 55",
    categoria: "Saúde",
    urgencia: "Média",
    alcance: "Minha família",
    situacao: "OPEN",
    anonimo: true,
    dias: 6,
  },
  // Casos antigos, já encerrados. Existem por dois motivos: a plataforma
  // precisa ter histórico para a demonstração não parecer recém-instalada, e
  // a taxa de resolução da home vem daqui. Relato antigo resolvido e relato
  // recente aberto é como um cenário real se distribui.
  {
    empresa: "norte-engenharia-demo",
    projeto: "Duplicação da BR-232 (lote 3)",
    autora: "beatriz.demo@exemplo.com",
    titulo: "Desvio jogava o trânsito pesado na porta da creche",
    descricao:
      "O desvio da obra passou a rota dos caminhões bem na frente da creche municipal, no horário de entrada das crianças.",
    local: "Rua da Creche Municipal Dona Sinhá",
    categoria: "Saúde",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 176,
    conversa: [
      { de: "COMPANY", texto: "Rota do desvio alterada e horário de tráfego pesado restringido entre 7h e 8h30. Confirmado com a direção da creche.", dias: 168 },
    ],
  },
  {
    empresa: "norte-engenharia-demo",
    autora: "juliana.demo@exemplo.com",
    titulo: "Entulho da obra acumulado no terreno baldio",
    descricao:
      "Estão deixando entulho no terreno da esquina há um mês. Já apareceu escorpião em duas casas.",
    local: "Terreno da esquina da Rua do Hospício com a Travessa São Vicente",
    categoria: "Meio ambiente",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 145,
    conversa: [
      { de: "COMPANY", texto: "Entulho retirado e o terreno foi limpo e cercado. Passamos a usar caçamba com retirada semanal.", dias: 137 },
    ],
  },
  {
    empresa: "aguas-do-cerrado-demo",
    autora: "damiana.demo@exemplo.com",
    titulo: "Obra deixou o poste de luz solto",
    descricao:
      "Ao abrir a vala, mexeram na base do poste e ele ficou balançando. Com vento forte fica assustador.",
    local: "Rua 84, em frente ao número 512 — Setor Sul",
    categoria: "Saúde",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 121,
    conversa: [
      { de: "COMPANY", texto: "Base do poste refeita em concreto no mesmo dia do seu relato, com acompanhamento da concessionária de energia.", dias: 119 },
    ],
  },
  {
    empresa: "aguas-do-cerrado-demo",
    projeto: "Estação Elevatória Jardim Novo Mundo",
    autora: "sonia.demo@exemplo.com",
    titulo: "Reunião com a comunidade foi marcada em horário de trabalho",
    descricao:
      "A reunião de apresentação da obra foi às 14h de uma terça. Quem trabalha não pôde ir, e é quem mora aqui.",
    local: "Jardim Novo Mundo",
    categoria: "Direitos",
    urgencia: "Média",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 191,
    conversa: [
      { de: "COMPANY", texto: "Você tem razão. Refizemos a reunião num sábado de manhã e passamos a marcar as próximas fora do horário comercial.", dias: 180 },
    ],
  },
  {
    empresa: "vialitoral-demo",
    projeto: "Terceira faixa da PR-407",
    autora: "vera.demo@exemplo.com",
    titulo: "Máquina trabalhando em domingo de manhã",
    descricao:
      "Domingo às sete da manhã tem retroescavadeira funcionando. A licença da obra não permite isso no fim de semana.",
    local: "PR-407, km 13",
    categoria: "Saúde",
    urgencia: "Média",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 163,
    conversa: [
      { de: "COMPANY", texto: "O trabalho de domingo foi suspenso. Era serviço de recuperação fora do previsto e não deveria ter sido autorizado.", dias: 155 },
    ],
  },
  {
    empresa: "aguas-do-cerrado-demo",
    projeto: "Rede coletora do Setor Leste",
    autora: "marlene.demo@exemplo.com",
    titulo: "Rua interditada sem aviso e sem previsão",
    descricao:
      "Fecharam a rua inteira de manhã cedo. Não consegui tirar o carro e perdi consulta no posto. Ninguém soube dizer quando abre.",
    local: "Rua 236, entre a 84 e a 90 — Setor Leste",
    categoria: "Mobilidade",
    urgencia: "Média",
    alcance: "Vizinhos e comunidade",
    situacao: "RESPONDED",
    dias: 12,
    conversa: [
      { de: "COMPANY", texto: "A interdição estava prevista para dois dias e se estendeu por causa de uma rede de gás não mapeada. Previsão de liberação: sexta-feira.", dias: 9 },
      { de: "USER", texto: "Obrigada pela resposta. Dá para colocar um aviso na esquina para quem não usa a plataforma?", dias: 8 },
    ],
  },
  {
    empresa: "aguas-do-cerrado-demo",
    projeto: "Rede coletora do Setor Leste",
    autora: "juliana.demo@exemplo.com",
    titulo: "Cheiro forte de esgoto desde o início da obra",
    descricao:
      "O cheiro começou junto com a obra e piora à noite. Não é só na minha casa, é a quadra inteira.",
    local: "Rua 240, quadra 12 — Setor Leste",
    categoria: "Meio ambiente",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 74,
    conversa: [
      { de: "COMPANY", texto: "Identificamos um trecho da rede antiga sem tamponamento. Foi corrigido no dia 3. Se o cheiro voltar, responda aqui mesmo.", dias: 66 },
    ],
  },
  {
    empresa: "aguas-do-cerrado-demo",
    autora: "beatriz.demo@exemplo.com",
    titulo: "Conta veio o dobro no mês da obra",
    descricao:
      "A conta veio 112 reais mais cara no mês em que trocaram a rede da rua. Suspeito de vazamento no cavalete.",
    local: "Setor Sul, Rua 90",
    categoria: "Patrimônio",
    urgencia: "Média",
    alcance: "Minha família",
    situacao: "OPEN",
    dias: 3,
  },
  {
    empresa: "aguas-do-cerrado-demo",
    autora: "rosangela.demo@exemplo.com",
    titulo: "Buraco no asfalto onde a rede foi trocada",
    descricao:
      "Recolocaram o asfalto de qualquer jeito e afundou. Já vi duas motos caírem ali.",
    local: "Cruzamento da Rua 236 com a Avenida Independência",
    categoria: "Mobilidade",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "RESOLVED",
    dias: 110,
    conversa: [
      { de: "COMPANY", texto: "Recapeamento refeito no trecho, com compactação. Serviço concluído em 14 dias.", dias: 100 },
    ],
  },
  {
    empresa: "vialitoral-demo",
    projeto: "Terceira faixa da PR-407",
    autora: "beatriz.demo@exemplo.com",
    titulo: "Sinalização da obra some à noite",
    descricao:
      "De dia tem cone e placa. De noite não tem nada, e o desvio fica no escuro. É onde teve o acidente do mês passado.",
    local: "PR-407, km 14, sentido Paranaguá",
    categoria: "Saúde",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "OPEN",
    dias: 9,
  },
  {
    empresa: "vialitoral-demo",
    autora: "juliana.demo@exemplo.com",
    titulo: "Ônibus escolar não consegue mais entrar na vila",
    descricao:
      "Com a obra, o retorno foi fechado e o ônibus escolar deixou de entrar. As crianças andam 1,5 km até a rodovia.",
    local: "Acesso à Vila Guarani, km 16",
    categoria: "Direitos",
    urgencia: "Alta",
    alcance: "Vizinhos e comunidade",
    situacao: "OPEN",
    anonimo: true,
    dias: 17,
  },
  {
    empresa: "vialitoral-demo",
    autora: "cleide.demo@exemplo.com",
    titulo: "Barreira de contenção invadiu a horta comunitária",
    descricao:
      "A barreira de terra da obra passou por cima de metade da horta comunitária, que é de onde sai a merenda da creche.",
    local: "Horta Comunitária da Vila Guarani",
    categoria: "Meio ambiente",
    urgencia: "Média",
    alcance: "Vizinhos e comunidade",
    situacao: "RESPONDED",
    dias: 28,
    conversa: [
      { de: "COMPANY", texto: "Estamos avaliando com a equipe de meio ambiente. Retornamos com uma proposta de recomposição da área.", dias: 24 },
    ],
  },
  {
    empresa: "vialitoral-demo",
    autora: "marlene.demo@exemplo.com",
    titulo: "Vibração das máquinas rachou a parede",
    descricao:
      "A parede dos fundos rachou depois que começaram a compactar o solo. Tenho foto de antes e de depois.",
    local: "Vila Guarani, casa 12",
    categoria: "Patrimônio",
    urgencia: "Alta",
    alcance: "Minha família",
    situacao: "RESPONDED",
    publico: false,
    dias: 34,
    conversa: [
      { de: "COMPANY", texto: "Vamos enviar um engenheiro para laudo. Por favor, guarde as fotos e não faça reparo antes da vistoria.", dias: 30 },
    ],
  },
  {
    empresa: "vialitoral-demo",
    autora: "helena.demo@exemplo.com",
    titulo: "Prometeram recolocar o ponto de ônibus e não recolocaram",
    descricao:
      "Tiraram o abrigo do ponto para a obra em março e disseram que voltaria em duas semanas. Até hoje a gente espera ônibus na chuva.",
    local: "PR-407, km 11, sentido Curitiba",
    categoria: "Mobilidade",
    urgencia: "Média",
    alcance: "Vizinhos e comunidade",
    situacao: "OPEN",
    dias: 44,
  },
];

// ─── Execução ────────────────────────────────────────────────────────────────

/**
 * Apaga o que este script criou antes, para poder rodar de novo.
 *
 * A ordem é explícita, e não confia em `ON DELETE CASCADE`: o banco tem
 * `complaints.author_id` com `RESTRICT` apontando para `profiles`, e o seed
 * base também apaga tabela por tabela. Apagar `users` esperando que o resto
 * caia junto não funciona — foi o que quebrou a primeira reexecução.
 */
async function limparCenarioAnterior() {
  const emails = [...MULHERES, ...RESPONSAVEIS].map((p) => p.email);
  const slugs = EMPRESAS.map((e) => e.slug);

  const empresas = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(inArray(schema.companies.slug, slugs));
  const usuarios = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(inArray(schema.users.email, emails));

  // Perfis também por e-mail, e não só pelos donos encontrados acima: uma
  // execução que morre no meio pode deixar perfil órfão, sem conta. Como
  // `profiles.email` é único, o órfão bloquearia a próxima execução com um
  // erro de chave duplicada que não explica nada.
  const perfis = await db
    .select({ id: schema.profiles.userId })
    .from(schema.profiles)
    .where(inArray(schema.profiles.email, emails));

  const idsDeEmpresa = empresas.map((e) => e.id);
  const idsDeUsuario = [...new Set([...usuarios.map((u) => u.id), ...perfis.map((p) => p.id)])];

  // 1. Relatos — os das empresas do cenário e os das autoras do cenário.
  const relatos: string[] = [];
  if (idsDeEmpresa.length) {
    const porEmpresa = await db
      .select({ id: schema.complaints.id })
      .from(schema.complaints)
      .where(inArray(schema.complaints.companyId, idsDeEmpresa));
    relatos.push(...porEmpresa.map((r) => r.id));
  }
  if (idsDeUsuario.length) {
    const porAutora = await db
      .select({ id: schema.complaints.id })
      .from(schema.complaints)
      .where(inArray(schema.complaints.authorId, idsDeUsuario));
    relatos.push(...porAutora.map((r) => r.id));
  }
  const relatosUnicos = [...new Set(relatos)];
  if (relatosUnicos.length) {
    await db
      .delete(schema.complaintMessages)
      .where(inArray(schema.complaintMessages.complaintId, relatosUnicos));
    await db.delete(schema.complaints).where(inArray(schema.complaints.id, relatosUnicos));
  }

  // 2. Mensagens assinadas por gente do cenário em relatos que ficam.
  if (idsDeUsuario.length) {
    await db
      .delete(schema.complaintMessages)
      .where(inArray(schema.complaintMessages.authorId, idsDeUsuario));
  }

  // 3. Empresas do cenário e o que pende delas.
  if (idsDeEmpresa.length) {
    await db.delete(schema.projects).where(inArray(schema.projects.companyId, idsDeEmpresa));
    await db.delete(schema.companyUsers).where(inArray(schema.companyUsers.companyId, idsDeEmpresa));
    await db.delete(schema.companies).where(inArray(schema.companies.id, idsDeEmpresa));
  }

  // 4. Pessoas do cenário: vínculo, perfil e conta, nesta ordem.
  if (idsDeUsuario.length) {
    await db.delete(schema.companyUsers).where(inArray(schema.companyUsers.userId, idsDeUsuario));
    await db.delete(schema.profiles).where(inArray(schema.profiles.userId, idsDeUsuario));
    await db.delete(schema.users).where(inArray(schema.users.id, idsDeUsuario));
  }

  return { empresas: idsDeEmpresa.length, pessoas: idsDeUsuario.length };
}

async function main() {
  console.log("Preparando o cenário de demonstração...\n");

  const base = await db
    .select({ id: schema.companies.id, slug: schema.companies.slug })
    .from(schema.companies)
    .where(eq(schema.companies.slug, "construtora-x"));
  if (!base.length) {
    console.error(
      "A Construtora X não existe no banco. Rode `pnpm db:seed` primeiro — este script\n" +
        "acrescenta ao cenário base, não o substitui."
    );
    process.exit(1);
  }

  const removido = await limparCenarioAnterior();
  if (removido.empresas || removido.pessoas) {
    console.log(
      `Cenário anterior removido: ${removido.empresas} empresas, ${removido.pessoas} pessoas.`
    );
  }

  const passwordHash = await hashDaSenha(SENHA);

  // ─── Pessoas ───────────────────────────────────────────────────────────────
  const pessoas = [...MULHERES, ...RESPONSAVEIS];
  const usuarios = await db
    .insert(schema.users)
    .values(pessoas.map((p) => ({ email: p.email, passwordHash })))
    .returning({ id: schema.users.id, email: schema.users.email });

  const idPorEmail = new Map(usuarios.map((u) => [u.email, u.id]));

  await db.insert(schema.profiles).values(
    pessoas.map((p) => ({
      userId: idPorEmail.get(p.email)!,
      name: p.nome,
      role: ("cidade" in p ? "USER" : "COMPANY") as "USER" | "COMPANY",
      email: p.email,
      city: "cidade" in p ? (p as { cidade: string }).cidade : "Recife",
      state: "uf" in p ? (p as { uf: string }).uf : "PE",
      onboardingCompletedAt: diasAtras(200),
      acceptedTermsAt: diasAtras(200),
    }))
  );
  console.log(`${MULHERES.length} mulheres e ${RESPONSAVEIS.length} responsáveis de empresa criados.`);

  // ─── Empresas, vínculos e obras ────────────────────────────────────────────
  const idDaEmpresa = new Map<string, string>();
  const idDoProjeto = new Map<string, string>();

  for (const e of EMPRESAS) {
    const [empresa] = await db
      .insert(schema.companies)
      .values({
        name: e.name,
        slug: e.slug,
        cnpj: e.cnpj,
        corporateName: e.corporateName,
        sector: e.sector,
        description: e.description,
        email: e.email,
        phone: e.phone,
        website: "website" in e ? e.website : undefined,
        city: e.city,
        state: e.state,
        region: e.region,
        address: e.address,
        neighborhood: e.neighborhood,
        streetNumber: e.streetNumber,
        responsibleName: e.responsavel?.nome,
        responsibleEmail: e.responsavel?.email,
        verifiedAt: e.verificada ? diasAtras(210) : null,
        createdAt: diasAtras(220),
      })
      .returning({ id: schema.companies.id });
    idDaEmpresa.set(e.slug, empresa.id);

    if (e.responsavel) {
      await db.insert(schema.companyUsers).values({
        userId: idPorEmail.get(e.responsavel.email)!,
        companyId: empresa.id,
        // OWNER de propósito: quem responde pela empresa na demonstração
        // precisa alcançar as telas de perfil e de obras. O seed base resolveu
        // isto na task `56` criando contas separadas para MEMBER e OWNER; aqui
        // há uma conta por empresa, e ela é a dona.
        role: "OWNER",
      });
    }

    for (const p of e.projetos) {
      const [projeto] = await db
        .insert(schema.projects)
        .values({
          companyId: empresa.id,
          name: p.name,
          location: p.location,
          status: p.status,
          description: `Obra de ${e.sector.toLowerCase()} em ${p.location}.`,
          startDate: diasAtras(200),
          createdAt: diasAtras(200),
        })
        .returning({ id: schema.projects.id });
      idDoProjeto.set(p.name, projeto.id);
    }
  }
  console.log(`${EMPRESAS.length} empresas com ${EMPRESAS.reduce((s, e) => s + e.projetos.length, 0)} obras criadas.`);

  // ─── Relatos e conversas ───────────────────────────────────────────────────
  let mensagens = 0;
  for (const r of RELATOS) {
    const abertoEm = diasAtras(r.dias);
    const [relato] = await db
      .insert(schema.complaints)
      .values({
        authorId: idPorEmail.get(r.autora)!,
        companyId: idDaEmpresa.get(r.empresa)!,
        projectId: r.projeto ? idDoProjeto.get(r.projeto) : undefined,
        title: r.titulo,
        description: r.descricao,
        problemLocation: r.local,
        impactCategory: r.categoria,
        urgencyLevel: r.urgencia,
        impactScope: r.alcance,
        isAnonymous: r.anonimo ?? false,
        isPublic: r.publico ?? true,
        status: r.situacao,
        createdAt: abertoEm,
        occurredAt: abertoEm,
      })
      .returning({ id: schema.complaints.id });

    for (const m of r.conversa ?? []) {
      const empresaSlug = r.empresa;
      const responsavel = EMPRESAS.find((e) => e.slug === empresaSlug)?.responsavel;
      await db.insert(schema.complaintMessages).values({
        complaintId: relato.id,
        senderType: m.de,
        authorId:
          m.de === "COMPANY"
            ? responsavel
              ? idPorEmail.get(responsavel.email)
              : null
            : idPorEmail.get(r.autora),
        content: m.texto,
        createdAt: diasAtras(m.dias),
      });
      mensagens += 1;
    }
  }
  console.log(`${RELATOS.length} relatos e ${mensagens} mensagens criados.`);

  // ─── O que a home vai mostrar ─────────────────────────────────────────────
  const todos = await db
    .select({
      autor: schema.complaints.authorId,
      empresa: schema.complaints.companyId,
      status: schema.complaints.status,
    })
    .from(schema.complaints);

  const mulheres = new Set(todos.map((c) => c.autor)).size;
  const empresas = new Set(todos.map((c) => c.empresa)).size;
  const resolvidos = todos.filter((c) => c.status === "RESOLVED").length;
  const taxa = todos.length ? Math.round((resolvidos / todos.length) * 100) : 0;

  console.log("\nA home passa a mostrar:");
  console.log(`  ${mulheres} mulheres ouvidas · ${taxa}% de taxa de resolução · ${empresas} empresas em diálogo`);
  console.log(`  (${todos.length} relatos no total, ${resolvidos} resolvidos)`);
  console.log("\nPara voltar ao estado que os testes esperam: pnpm db:seed");
}

main()
  .then(() => process.exit(0))
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  });
