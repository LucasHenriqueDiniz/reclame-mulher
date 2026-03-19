import { NextRequest, NextResponse } from "next/server";

import { canManageCompanyUsers, getCurrentCompanyContext } from "@/server/auth/company";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { UpdateCompanyMemberRoleDto } from "@/server/dto/company-users";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const context = await getCurrentCompanyContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!canManageCompanyUsers(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await params;
    const members = await CompanyUsersRepo.findByCompany(context.companyId);
    const target = members.find((member) => member.userId === userId);

    if (!target) {
      return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
    }

    if (target.role === "OWNER") {
      return NextResponse.json({ error: "Não é possível alterar o papel do owner." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = UpdateCompanyMemberRoleDto.parse(body);

    const updated = await CompanyUsersRepo.updateRole(userId, context.companyId, parsed.role);

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    console.error("Update company user error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const context = await getCurrentCompanyContext();
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canManageCompanyUsers(context.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const members = await CompanyUsersRepo.findByCompany(context.companyId);
  const target = members.find((member) => member.userId === userId);

  if (!target) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 });
  }

  if (target.role === "OWNER") {
    return NextResponse.json({ error: "Não é possível remover o owner." }, { status: 400 });
  }

  await CompanyUsersRepo.delete(userId, context.companyId);

  return NextResponse.json({ success: true });
}
