import {
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/**
 * O status de uma reclamação, com um nome só.
 *
 * Este módulo já existia dizendo que era "usado em toda a aplicação". Não era:
 * a task `54` encontrou mais quatro mapas paralelos, e eles discordavam. O
 * mesmo relato aparecia como "Em réplica" na lista e "Respondida" no detalhe;
 * quando a empresa encerrava, a usuária lia "Concluído" e a empresa lia
 * "Resolvida".
 *
 * A regra dos rótulos: eles concordam com **reclamação**, e por isso são
 * femininos — Aberta, Respondida, Resolvida, Cancelada. É o mesmo critério que
 * o resto do produto já usava na maioria das telas.
 *
 * Quem precisar de rótulo, cor, borda ou ícone de status vem aqui. Não crie
 * outro mapa.
 */

export type ComplaintStatus = "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";

export interface ComplaintStatusConfig {
  /** Rótulo único, no singular, concordando com "reclamação". */
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  /**
   * Componente de ícone do lucide, não JSX: assim este arquivo continua sendo
   * `.ts` e pode ser importado tanto por página de servidor quanto por
   * componente de cliente. Quem renderiza escolhe o tamanho.
   */
  icon: LucideIcon;
}

export const COMPLAINT_STATUS: Record<ComplaintStatus, ComplaintStatusConfig> = {
  OPEN: {
    label: "Aberta",
    color: "#8A4B00", // Laranja escuro
    bgColor: "#FFF3E0", // Laranja claro
    borderColor: "#FFB74D",
    icon: AlertCircle,
  },
  RESPONDED: {
    label: "Respondida",
    color: "#1E0F62", // Roxo escuro
    bgColor: "#EBFF55", // Amarelo vibrante
    borderColor: "#E0E055",
    icon: MessageCircle,
  },
  RESOLVED: {
    label: "Resolvida",
    color: "#1B5E20", // Verde escuro
    bgColor: "#C8E6C9", // Verde claro
    borderColor: "#81C784",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelada",
    color: "#455A64", // Cinza escuro
    bgColor: "#CFD8DC", // Cinza claro
    borderColor: "#90A4AE",
    icon: XCircle,
  },
};

/** A ordem em que os status aparecem para quem escolhe um. */
export const COMPLAINT_STATUS_ORDER: ComplaintStatus[] = [
  "OPEN",
  "RESPONDED",
  "RESOLVED",
  "CANCELLED",
];

/**
 * Opções prontas para o `select` de mudança de status do painel da empresa.
 * Deriva do mapa acima de propósito: acrescentar um status novo não pode
 * exigir que alguém lembre de mexer em duas listas.
 */
export const COMPLAINT_STATUS_OPTIONS = COMPLAINT_STATUS_ORDER.map((value) => ({
  value,
  label: COMPLAINT_STATUS[value].label,
}));

/**
 * Configuração de um status.
 *
 * Aceita `string` porque boa parte das telas recebe o status como texto vindo
 * da API. Valor desconhecido cai em `OPEN` — comportamento que já existia aqui
 * e nos mapas locais que este módulo substituiu.
 */
export function getComplaintStatusConfig(status: string): ComplaintStatusConfig {
  return COMPLAINT_STATUS[status as ComplaintStatus] ?? COMPLAINT_STATUS.OPEN;
}

/** Atalho para quem só quer o texto. */
export function complaintStatusLabel(status: string): string {
  return getComplaintStatusConfig(status).label;
}
