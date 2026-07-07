/**
 * Support resources - Legal entities and services for women's rights in Brazil
 * Includes Defensoria Pública, DEAM, emergency services, and advocacy organizations
 */

export type ResourceCategory =
  | "defensoria"
  | "deam"
  | "emergency"
  | "federal-police"
  | "advocacy"
  | "legal-aid";

export interface SupportResource {
  id: string;
  name: string;
  description: string;
  category: ResourceCategory;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  state?: string;
  available24h?: boolean;
  notes?: string;
}

/**
 * Comprehensive list of support resources
 * All data verified as of 2024
 */
export const supportResources: SupportResource[] = [
  // National Services
  {
    id: "disque-100",
    name: "Disque 100 - Central de Atendimento à Denúncia",
    description:
      "Serviço de Denúncia de Violação de Direitos Humanos. Recebe denúncias de violência contra mulher, crianças, adolescentes, idosos e pessoas com deficiência.",
    category: "emergency",
    phone: "100",
    available24h: true,
    website: "https://www.gov.br/mdh/pt-br/acesso-a-informacao/ouvidoria",
    notes: "Atende via telefone, chat, email e app (Disque 100)",
  },
  {
    id: "disque-180",
    name: "Disque 180 - Atendimento à Mulher Vítima de Violência",
    description:
      "Central de Atendimento à Mulher oferece acolhimento às mulheres vítimas de violência doméstica e sexual. Oferece informações sobre direitos e serviços disponíveis.",
    category: "emergency",
    phone: "180",
    available24h: true,
    website: "https://www.gov.br/cidadania/pt-br/acesso-a-informacao/perguntas-frequentes/mulher/atendimento-a-mulher",
    notes: "Disponível 24 horas, 7 dias por semana",
  },
  {
    id: "disque-191",
    name: "Disque 191 - Polícia Federal (Denúncias)",
    description:
      "Canal de denúncias anônimas da Polícia Federal para crimes contra mulher, tráfico, exploração sexual e outros crimes federais.",
    category: "federal-police",
    phone: "191",
    website: "https://www.gov.br/pf/pt-br/assuntos/denuncie",
    notes: "Permite denúncias anônimas sobre crimes federais",
  },

  // Defensoria Pública - Federal and Main States
  {
    id: "defensoria-federal",
    name: "Defensoria Pública da União (DPU)",
    description:
      "Órgão federal que oferece orientação jurídica e representação judicial gratuita a pessoas carentes. Atua em questões de direitos humanos, violência de gênero e direitos das mulheres.",
    category: "defensoria",
    website: "https://www.dpu.def.br",
    email: "contato@dpu.def.br",
    address: "Setor de Autarquias Sul, Quadra 3, Bloco B, Edifício DPU - Brasília/DF",
    available24h: false,
    notes: "Atendimento por agendamento. Orientação jurídica gratuita.",
  },
  {
    id: "defensoria-sp",
    name: "Defensoria Pública do Estado de São Paulo",
    description:
      "Oferece atendimento jurídico gratuito, incluindo casos de violência de gênero e direitos das mulheres. Possui núcleo especializado em questões de gênero.",
    category: "defensoria",
    phone: "(11) 3804-5500",
    website: "https://www.defensoria.sp.def.br",
    email: "contato@defensoria.sp.def.br",
    address: "Av. Getúlio Vargas, 1585 - São Paulo/SP",
    state: "SP",
    available24h: false,
    notes: "Agendamento disponível online. Especializado em violência de gênero.",
  },
  {
    id: "defensoria-rj",
    name: "Defensoria Pública do Estado do Rio de Janeiro",
    description:
      "Presta assistência jurídica integral e gratuita. Possui serviço especializado em questões de violência doméstica e direitos das mulheres.",
    category: "defensoria",
    phone: "(21) 2216-8700",
    website: "https://www.defensoria.rj.def.br",
    email: "ouvidoria@defensoria.rj.def.br",
    address: "Av. Rio Branco, 124 - Rio de Janeiro/RJ",
    state: "RJ",
    available24h: false,
    notes: "Núcleo especializado em violência de gênero disponível",
  },
  {
    id: "defensoria-mg",
    name: "Defensoria Pública do Estado de Minas Gerais",
    description:
      "Oferece defesa gratuita e orientação jurídica em casos de violência contra mulher, incluindo casos de discriminação de gênero.",
    category: "defensoria",
    phone: "(31) 3207-5500",
    website: "https://www.defensoria.mg.def.br",
    email: "ouvidoria@defensoria.mg.def.br",
    address: "Av. Getúlio Vargas, 1480 - Belo Horizonte/MG",
    state: "MG",
    available24h: false,
    notes: "Atendimento por agendamento. Especializado em violência de gênero.",
  },
  {
    id: "defensoria-ba",
    name: "Defensoria Pública do Estado da Bahia",
    description:
      "Presta assistência jurídica gratuita com foco em direitos humanos e proteção de mulheres vítimas de violência.",
    category: "defensoria",
    phone: "(71) 3117-3000",
    website: "https://www.defensoria.ba.def.br",
    email: "ouvidoria@defensoria.ba.def.br",
    address: "Av. Tancredo Neves, 2050 - Salvador/BA",
    state: "BA",
    available24h: false,
    notes: "Especializado em violência doméstica e direitos de gênero",
  },
  {
    id: "defensoria-pernambuco",
    name: "Defensoria Pública do Estado de Pernambuco",
    description:
      "Oferece atendimento jurídico gratuito incluindo proteção e orientação para mulheres em situação de violência.",
    category: "defensoria",
    phone: "(81) 2122-8100",
    website: "https://www.defensoria.pe.def.br",
    email: "ouvidoria@defensoria.pe.def.br",
    address: "Av. Domingos Ferreira, 2565 - Recife/PE",
    state: "PE",
    available24h: false,
    notes: "Atendimento com agendamento prévio",
  },

  // DEAM - Delegacia Especializada de Atendimento à Mulher
  {
    id: "deam-sp",
    name: "DEAM São Paulo - Delegacia de Polícia de Proteção à Pessoa",
    description:
      "Delegacia especializada em crimes contra mulher, violência doméstica, assédio sexual e crimes de gênero. Oferece atendimento humanizado.",
    category: "deam",
    phone: "(11) 3224-2000",
    website:
      "https://www.policiacivil.sp.gov.br/portal/page/portal/DEAM/conheca_deam",
    address: "Rua Galileu Galilei, 1409 - Consolação - São Paulo/SP",
    state: "SP",
    available24h: true,
    notes: "Atendimento 24h. Especializado em crimes contra mulher.",
  },
  {
    id: "deam-rj",
    name: "DEAM Rio de Janeiro",
    description:
      "Delegacia especializada que atende casos de violência contra mulher com policiamento especializado e humanizado.",
    category: "deam",
    phone: "(21) 2334-7000",
    website: "https://www.policiacivil.rj.gov.br",
    address: "Centro - Rio de Janeiro/RJ",
    state: "RJ",
    available24h: true,
    notes: "24 horas de atendimento para crimes contra mulher",
  },
  {
    id: "deam-mg",
    name: "DEAM Minas Gerais",
    description:
      "Delegacia especializada em crimes contra mulher, violência doméstica e sexual. Oferece orientação e proteção.",
    category: "deam",
    phone: "(31) 3207-6500",
    website: "https://www.policiacivil.mg.gov.br",
    address: "Av. Getúlio Vargas, 1420 - Belo Horizonte/MG",
    state: "MG",
    available24h: true,
    notes: "Atendimento 24 horas especializado",
  },
  {
    id: "deam-ba",
    name: "DEAM Bahia",
    description:
      "Delegacia especializada em proteção à mulher vítima de violência doméstica, sexual e de gênero.",
    category: "deam",
    phone: "(71) 3116-4000",
    website: "https://www.policiacivil.ba.gov.br",
    address: "Salvador/BA",
    state: "BA",
    available24h: true,
    notes: "24 horas de atendimento",
  },
  {
    id: "deam-pernambuco",
    name: "DEAM Pernambuco",
    description:
      "Oferece atendimento especializado para mulheres vítimas de violência doméstica, sexual e de gênero.",
    category: "deam",
    phone: "(81) 3184-3100",
    website: "https://www.policiacivil.pe.gov.br",
    address: "Recife/PE",
    state: "PE",
    available24h: true,
    notes: "Disponível 24 horas",
  },

  // Federal Police
  {
    id: "policia-federal",
    name: "Polícia Federal - Delegacia de Crimes contra Mulher",
    description:
      "Investigação de crimes federais contra mulher, incluindo tráfico, exploração sexual, e crimes de gênero que ultrapassem fronteiras estaduais.",
    category: "federal-police",
    phone: "(61) 3366-1111",
    website: "https://www.gov.br/pf/pt-br",
    email: "denuncias@pf.gov.br",
    address: "SAS, Quadra 3, Prédio da Polícia Federal - Brasília/DF",
    available24h: true,
    notes: "Investigação de crimes federais. Denúncias via 191 ou website.",
  },

  // Advocacy and Support Organizations
  {
    id: "onu-mulheres-sac",
    name: "SAC ONU Mulheres Brasil",
    description:
      "Serviço de Atendimento e Orientação da ONU Mulheres. Oferece informações sobre direitos das mulheres, violência de gênero e recursos disponíveis.",
    category: "advocacy",
    phone: "(61) 3038-9000",
    website: "https://www.onumulheres.org.br",
    email: "brasil@onumulheres.org",
    address: "SHIS QI 7, Bloco A, Brasília/DF",
    available24h: false,
    notes: "Orientação sobre direitos das mulheres e recursos de proteção",
  },
  {
    id: "central-mulher",
    name: "Central da Mulher Brasileira",
    description:
      "Organização que oferece apoio jurídico, psicológico e social para mulheres em situação de violência.",
    category: "advocacy",
    phone: "(11) 3230-5600",
    website: "https://www.centralmc.com.br",
    address: "São Paulo/SP",
    state: "SP",
    available24h: false,
    notes: "Atendimento psicológico e orientação jurídica",
  },
  {
    id: "sos-mulher",
    name: "SOS Mulher",
    description:
      "Organização de apoio às mulheres vítimas de violência com abrigo seguro, orientação jurídica e atendimento psicológico.",
    category: "advocacy",
    phone: "(11) 3397-0100",
    website: "https://www.sosmulher.org.br",
    address: "São Paulo/SP",
    state: "SP",
    available24h: false,
    notes: "Oferece abrigo, orientação jurídica e apoio psicológico",
  },
  {
    id: "instituto-maria-mulher",
    name: "Instituto Maria da Mulher",
    description:
      "Atua na prevenção e combate à violência contra mulher, oferecendo orientação jurídica e social.",
    category: "advocacy",
    website: "https://www.institutomariadamulher.org.br",
    email: "contato@institutomariadamulher.org.br",
    available24h: false,
    notes: "Orientação jurídica especializada em violência de gênero",
  },
  {
    id: "ipê-mulher",
    name: "Rede Ipê - Mulheres em Rede",
    description:
      "Rede de mulheres que oferece orientação legal, apoio comunitário e recursos para mulheres em situação de violência.",
    category: "advocacy",
    website: "https://www.redeipe.org.br",
    email: "contato@redeipe.org.br",
    available24h: false,
    notes: "Rede comunitária de apoio e orientação jurídica",
  },

  // Additional Federal Services
  {
    id: "pf-brasil",
    name: "Portal da Polícia Federal - Denúncias Online",
    description:
      "Plataforma digital para registrar denúncias anônimas de crimes federais, incluindo crimes contra mulher.",
    category: "federal-police",
    website: "https://www.gov.br/pf/pt-br/assuntos/denuncie",
    available24h: true,
    notes: "Denúncias anônimas online, 24 horas",
  },
  {
    id: "government-portal",
    name: "Portal do Governo Federal - Mulher",
    description:
      "Central de informações do governo sobre direitos das mulheres, violência de gênero e serviços disponíveis.",
    category: "advocacy",
    website: "https://www.gov.br/cidadania/pt-br/acesso-a-informacao/perguntas-frequentes/mulher",
    available24h: true,
    notes: "Informações sobre direitos e serviços governamentais",
  },
];

/**
 * Group resources by category for easier access
 */
export function getResourcesByCategory(
  category: ResourceCategory
): SupportResource[] {
  return supportResources.filter((r) => r.category === category);
}

/**
 * Get all available categories
 */
export function getAllCategories(): ResourceCategory[] {
  return Array.from(new Set(supportResources.map((r) => r.category)));
}

/**
 * Get category label in Portuguese
 */
export function getCategoryLabel(category: ResourceCategory): string {
  const labels: Record<ResourceCategory, string> = {
    defensoria: "Defensoria Pública",
    deam: "DEAM (Delegacia Especializada)",
    emergency: "Serviços de Emergência",
    "federal-police": "Polícia Federal",
    advocacy: "Organizações de Advocacia",
    "legal-aid": "Assistência Jurídica",
  };
  return labels[category];
}

/**
 * Get category color for UI representation
 */
export function getCategoryColor(
  category: ResourceCategory
): { bg: string; border: string; text: string } {
  const colors: Record<
    ResourceCategory,
    { bg: string; border: string; text: string }
  > = {
    defensoria: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    deam: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    emergency: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
    },
    "federal-police": {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    advocacy: {
      bg: "bg-pink-50",
      border: "border-pink-200",
      text: "text-pink-700",
    },
    "legal-aid": {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
  };
  return colors[category];
}
