import "server-only";

import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { naoAutenticada, semPermissao } from "@/server/http/respond";
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

/**
 * Portão de empresa para route handlers, que **distingue 401 de 403**.
 *
 * `getCurrentCompanyContext` devolve `null` tanto para quem não tem sessão
 * quanto para quem tem sessão mas nenhum vínculo com empresa. O handler não
 * tinha como saber qual dos dois era, e por isso respondia 401 nos dois casos —
 * o achado da task `11`. Um cliente que trate 401 mandando para o login mandava
 * a usuária logada de volta para o login.
 *
 * Uso:
 *
 * ```ts
 * const contexto = await exigirEmpresa();
 * if (contexto instanceof NextResponse) return contexto;
 * ```
 */
export async function exigirEmpresa() {
  const session = await getSession();
  if (!session) return naoAutenticada();

  const memberships = await CompanyUsersRepo.findByUser(session.userId);
  const membership = memberships[0] ?? null;
  if (!membership) {
    return semPermissao("Sua conta não está vinculada a nenhuma empresa.");
  }

  return {
    session,
    role: membership.role,
    company: membership.company,
    companyId: membership.company.id,
  };
}

/** Mesma ideia, para quando a operação exige `OWNER` ou `ADMIN` na empresa. */
export async function exigirEmpresaComGestao() {
  const contexto = await exigirEmpresa();
  if (contexto instanceof NextResponse) return contexto;

  if (!canManageCompany(contexto.role)) {
    return semPermissao(
      "Só quem administra a empresa pode fazer isso. Peça a quem é responsável pela conta."
    );
  }
  return contexto;
}

/** Idem, para gestão de pessoas da equipe. */
export async function exigirEmpresaComGestaoDeEquipe() {
  const contexto = await exigirEmpresa();
  if (contexto instanceof NextResponse) return contexto;

  if (!canManageCompanyUsers(contexto.role)) {
    return semPermissao(
      "Só quem administra a empresa pode gerenciar a equipe. Peça a quem é responsável pela conta."
    );
  }
  return contexto;
}
