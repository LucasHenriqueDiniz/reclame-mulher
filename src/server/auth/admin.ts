import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { getSession } from "@/lib/auth/session";

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
