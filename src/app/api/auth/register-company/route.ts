import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users, profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

const schema = z.object({
  company_name: z.string().min(3),
  cnpj: z.string().min(14),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_name, cnpj, email, password } = schema.parse(body);

    const emailNorm = email.toLowerCase();
    const cnpjNorm = cnpj.replace(/\D/g, "");

    // Check email
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, emailNorm)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    // Store company_name and cnpj in user metadata for step2
    const [user] = await db.insert(users).values({
      email: emailNorm,
      passwordHash,
      metadata: JSON.stringify({ company_name, cnpj: cnpjNorm }),
    }).returning({ id: users.id });

    await db.insert(profiles).values({
      userId: user.id,
      name: company_name,
      email: emailNorm,
      role: "COMPANY",
      provider: "email",
    });

    const response = NextResponse.json({ success: true });
    await setSessionCookie(response, { userId: user.id, email: emailNorm });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("Register company error:", error);
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }
}
