import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import {
  clearFailures,
  enforceRateLimit,
  getClientIp,
  registerFailure,
} from "@/lib/rate-limit";
import { erroInterno, invalido, naoAutenticada } from "@/server/http/respond";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);

    // A cota é por e-mail tentado, com o IP como camada extra. O corpo precisa
    // ser lido antes para sabermos qual identidade está sendo tentada — mas
    // nada caro (consulta ao banco, hash de senha) acontece antes desta trava.
    const target = { scope: "login", identifier: email, ip: getClientIp(request) };
    const limited = enforceRateLimit(target);
    if (limited) return limited;

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      registerFailure(target);
      return naoAutenticada("E-mail ou senha inválidos.");
    }

    // Deu certo: a usuária provou quem é, então o contador dela zera.
    clearFailures(target);

    const response = NextResponse.json({
      success: true,
      mustChangePassword: user.mustChangePassword,
    });
    await setSessionCookie(response, { userId: user.id, email: user.email });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalido(error);
    }
    return erroInterno(error, "auth/login");
  }
}
