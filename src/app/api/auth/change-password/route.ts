import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getSession, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearFailures,
  enforceRateLimit,
  getClientIp,
  registerFailure,
} from "@/lib/rate-limit";

const ChangePasswordDto = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Aqui já sabemos quem é: a cota é da conta, não do IP compartilhado.
    const target = { scope: "change-password", identifier: session.userId, ip: getClientIp(request) };
    const limited = enforceRateLimit(target);
    if (limited) return limited;

    const body = await request.json().catch(() => ({}));
    const parsed = ChangePasswordDto.parse(body);

    const [user] = await db
      .select({ id: users.id, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || !(await verifyPassword(parsed.currentPassword, user.passwordHash))) {
      registerFailure(target);
      return NextResponse.json({ error: "Senha atual inválida" }, { status: 400 });
    }

    clearFailures(target);

    await db
      .update(users)
      .set({
        passwordHash: await hashPassword(parsed.newPassword),
        mustChangePassword: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.userId));

    // Rotacionar sessão para invalidar token antigo
    const response = NextResponse.json({ success: true });
    await setSessionCookie(response, { userId: session.userId, email: session.email });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
