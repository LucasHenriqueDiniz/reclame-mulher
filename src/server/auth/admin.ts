import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { naoAutenticada, semPermissao } from "@/server/http/respond";

export async function getCurrentAdminContext() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.userId, session.userId))
    .limit(1);

  if (profile?.role !== "ADMIN") {
    return null;
  }

  return {
    session,
    role: profile.role,
  };
}

export function isPlatformAdmin(role: string | null | undefined) {
  return role === "ADMIN";
}

/**
 * Portão de admin para route handlers, que **distingue 401 de 403**.
 *
 * Mesma razão do `exigirEmpresa`: `getCurrentAdminContext` devolve `null` para
 * "sem sessão" e para "não é admin", e os handlers respondiam ora 401, ora 403,
 * para situações equivalentes.
 */
export async function exigirAdmin() {
  const session = await getSession();
  if (!session) return naoAutenticada();

  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.userId, session.userId))
    .limit(1);

  if (!isPlatformAdmin(profile?.role)) {
    return semPermissao("Esta área é da administração da plataforma.");
  }

  return { session, role: profile.role };
}
