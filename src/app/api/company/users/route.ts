import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getCurrentCompanyContext, canManageCompanyUsers } from "@/server/auth/company";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { CreateCompanyMemberDto } from "@/server/dto/company-users";
import { db } from "@/db/client";
import { users, profiles, companyUsers } from "@/db/schema";
import { generateTemporaryPassword, hashPassword } from "@/lib/auth/password";

export async function GET() {
  const context = await getCurrentCompanyContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const context = await getCurrentCompanyContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageCompanyUsers(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
        return NextResponse.json(
          { error: "Este usuário já está vinculado a uma empresa." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Este e-mail já está em uso." },
        { status: 409 }
      );
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
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    console.error("Create company user error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
