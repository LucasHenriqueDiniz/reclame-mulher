/**
 * Canonical constants for complaint statuses.
 * Used across the whole app so the visuals stay consistent.
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
    color: "#F57C00", // dark orange
    bgColor: "#FFF3E0", // light orange
    borderColor: "#FFB74D",
  },
  RESPONDED: {
    label: "Em réplica",
    color: "#1E0F62", // dark purple
    bgColor: "#EBFF55", // vivid yellow
    borderColor: "#E0E055",
  },
  RESOLVED: {
    label: "Resolvida",
    color: "#2E7D32", // dark green
    bgColor: "#C8E6C9", // light green
    borderColor: "#81C784",
  },
  CANCELLED: {
    label: "Cancelada",
    color: "#455A64", // dark grey
    bgColor: "#CFD8DC", // light grey
    borderColor: "#90A4AE",
  },
};

/**
 * Returns the style config for a status.
 */
export function getComplaintStatusConfig(status: ComplaintStatus): ComplaintStatusConfig {
  return COMPLAINT_STATUS[status] || COMPLAINT_STATUS.OPEN;
}
