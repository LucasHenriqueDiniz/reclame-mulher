import { NextRequest, NextResponse } from "next/server";

import { exigirEmpresaComGestaoDeEquipe } from "@/server/auth/company";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { UpdateCompanyMemberRoleDto } from "@/server/dto/company-users";
import { ehUuid, erro, erroInterno, invalido, naoEncontrado } from "@/server/http/respond";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const context = await exigirEmpresaComGestaoDeEquipe();
    if (context instanceof NextResponse) return context;

    const { userId } = await params;
    if (!ehUuid(userId)) return naoEncontrado();
    const members = await CompanyUsersRepo.findByCompany(context.companyId);
    const target = members.find((member) => member.userId === userId);

    if (!target) {
      return naoEncontrado("Esta pessoa não está na equipe da empresa.");
    }

    if (target.role === "OWNER") {
      return erro("VALIDATION_ERROR", "Não dá para alterar o papel de quem é dona da conta.");
    }

    const body = await request.json().catch(() => ({}));
    const parsed = UpdateCompanyMemberRoleDto.parse(body);

    const updated = await CompanyUsersRepo.updateRole(userId, context.companyId, parsed.role);

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }

    return erroInterno(error, "company/users/[userId]");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const context = await exigirEmpresaComGestaoDeEquipe();
  if (context instanceof NextResponse) return context;

  const { userId } = await params;
  if (!ehUuid(userId)) return naoEncontrado();
  const members = await CompanyUsersRepo.findByCompany(context.companyId);
  const target = members.find((member) => member.userId === userId);

  if (!target) {
    return naoEncontrado("Esta pessoa não está na equipe da empresa.");
  }

  if (target.role === "OWNER") {
    return erro("VALIDATION_ERROR", "Não dá para remover quem é dona da conta.");
  }

  await CompanyUsersRepo.delete(userId, context.companyId);

  return NextResponse.json({ success: true });
}
