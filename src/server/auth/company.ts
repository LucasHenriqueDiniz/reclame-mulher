import "server-only";

import { getSession } from "@/lib/auth/session";
import { CompanyUsersRepo } from "@/server/repos/company-users";

export async function getCurrentCompanyContext() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const memberships = await CompanyUsersRepo.findByUser(session.userId);
  const membership = memberships[0] ?? null;

  if (!membership) {
    return null;
  }

  return {
    session,
    role: membership.role,
    company: membership.company,
    companyId: membership.company.id,
  };
}

export function canManageCompanyUsers(role: string | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageCompany(role: string | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}
