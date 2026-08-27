import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { erroInterno } from "@/server/http/respond";

/**
 * "Existe alguém logado?" é pergunta, não operação protegida.
 *
 * Esta rota respondia `401` para visitante sem sessão, e isso pintava de
 * vermelho o console de **toda** página anônima — o `AuthStateProvider`
 * pergunta em todo carregamento, porque o cookie é `httpOnly` e o cliente não
 * tem outro jeito de saber. Erro vermelho que é normal ensina quem depura a
 * ignorar erro vermelho.
 *
 * Além do ruído, o `401` contradizia o contrato: `docs/api-erros.md` define
 * `UNAUTHENTICATED` como "você precisa entrar na sua conta para continuar", e
 * aqui não precisa — a home funciona deslogada.
 *
 * A resposta certa para "não há ninguém" é 200 com tudo nulo. Ver task `58`.
 */
function semSessao() {
  return NextResponse.json({ user: null, profile: null, companyMembership: null });
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return semSessao();
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .limit(1);

    const [user] = await db
      .select({ metadata: users.metadata, mustChangePassword: users.mustChangePassword })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const membership = await CompanyUsersRepo.findMembership(session.userId);

    let parsedMeta: Record<string, string> = {};
    try {
      if (user?.metadata) parsedMeta = JSON.parse(user.metadata);
    } catch {}

    if (!user || !profile) {
      // Sessão apontando para conta que não existe mais. A resposta é a mesma
      // de quem nunca entrou — e o cookie morto sai junto, senão a próxima
      // visita repete a consulta ao banco para chegar aqui de novo.
      const response = semSessao();
      await clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        metadata: parsedMeta,
        mustChangePassword: user.mustChangePassword,
      },
      profile,
      companyMembership: membership
        ? {
            companyId: membership.company.id,
            companyName: membership.company.name,
            role: membership.role,
          }
        : null,
    });
  } catch (error) {
    return erroInterno(error, "me");
  }
}
