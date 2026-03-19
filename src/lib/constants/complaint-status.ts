/**
 * Constantes padronizadas para status de reclamações
 * Usado em toda a aplicação para garantir consistência visual
 */

export type ComplaintStatus = "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";

export interface ComplaintStatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor?: string;
}

export const COMPLAINT_STATUS: Record<ComplaintStatus, ComplaintStatusConfig> = {
  OPEN: {
    label: "Aberta",
    color: "#F57C00", // Laranja escuro
    bgColor: "#FFF3E0", // Laranja claro
    borderColor: "#FFB74D",
  },
  RESPONDED: {
    label: "Em réplica",
    color: "#1E0F62", // Roxo escuro
    bgColor: "#EBFF55", // Amarelo vibrante
    borderColor: "#E0E055",
  },
  RESOLVED: {
    label: "Resolvida",
    color: "#2E7D32", // Verde escuro
    bgColor: "#C8E6C9", // Verde claro
    borderColor: "#81C784",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "#455A64", // Cinza escuro
    bgColor: "#CFD8DC", // Cinza claro
    borderColor: "#90A4AE",
  },
};

/**
 * Retorna a configuração de estilo para um status
 */
export function getComplaintStatusConfig(status: ComplaintStatus): ComplaintStatusConfig {
  return COMPLAINT_STATUS[status] || COMPLAINT_STATUS.OPEN;
}
