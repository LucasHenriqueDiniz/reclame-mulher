import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  cpf: z.string().min(11),
});

export async function POST(request: NextRequest) {
  const limit = rateLimit(request);
  if (limit) return limit;

  try {
    const body = await request.json();
    const { name, email, password, cpf } = schema.parse(body);

    const emailNorm = email.toLowerCase();
    const cpfNorm = cpf.replace(/\D/g, "");

    // Check if email already exists
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, emailNorm)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
    }

    // Check CPF uniqueness
    const [existingCpf] = await db.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.cpf, cpfNorm)).limit(1);
    if (existingCpf) {
      return NextResponse.json({ error: "Este CPF já está cadastrado." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    let userId = "";

    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: emailNorm,
          passwordHash,
        })
        .returning({ id: users.id });

      userId = user.id;

      await tx.insert(profiles).values({
        userId: user.id,
        name,
        email: emailNorm,
        cpf: cpfNorm,
        role: "USER",
        provider: "email",
      });
    });

    const response = NextResponse.json({ success: true });
    await setSessionCookie(response, { userId, email: emailNorm });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }
}
