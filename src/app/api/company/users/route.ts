import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { exigirEmpresa, exigirEmpresaComGestaoDeEquipe } from "@/server/auth/company";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { CreateCompanyMemberDto } from "@/server/dto/company-users";
import { db } from "@/db/client";
import { users, profiles, companyUsers } from "@/db/schema";
import { generateTemporaryPassword, hashPassword } from "@/lib/auth/password";
import { conflito, erroInterno, invalido } from "@/server/http/respond";

export async function GET() {
  const context = await exigirEmpresa();
  if (context instanceof NextResponse) return context;

  const members = await CompanyUsersRepo.findByCompany(context.companyId);

  return NextResponse.json({
    currentUserRole: context.role,
    members: members.map((member) => ({
      userId: member.userId,
      role: member.role,
      name: member.profile.name,
      email: member.profile.email,
    })),
  });
}

export async function POST(request: NextRequest) {
  try {
    const context = await exigirEmpresaComGestaoDeEquipe();
    if (context instanceof NextResponse) return context;

    const body = await request.json().catch(() => ({}));
    const parsed = CreateCompanyMemberDto.parse(body);
    const email = parsed.email.toLowerCase();

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      const existingMembership = await CompanyUsersRepo.findMembership(existingUser.id);

      if (existingMembership) {
        return conflito("Esta pessoa já está vinculada a uma empresa.");
      }

      return conflito("Este e-mail já está em uso.");
    }

    const temporaryPassword = generateTemporaryPassword();

    const created = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email,
          passwordHash: await hashPassword(temporaryPassword),
          mustChangePassword: true,
        })
        .returning({ id: users.id });

      await tx.insert(profiles).values({
        userId: user.id,
        email,
        name: parsed.name,
        role: "USER",
        provider: "email",
      });

      const [membership] = await tx
        .insert(companyUsers)
        .values({
          userId: user.id,
          companyId: context.companyId,
          role: parsed.role,
        })
        .returning();

      return { userId: user.id, membership };
    });

    return NextResponse.json({
      success: true,
      member: {
        userId: created.userId,
        role: created.membership.role,
        name: parsed.name,
        email,
      },
      temporaryPassword,
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }

    return erroInterno(error, "company/users");
  }
}
