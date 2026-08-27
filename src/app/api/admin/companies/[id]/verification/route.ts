import { NextRequest, NextResponse } from "next/server";

import { exigirAdmin } from "@/server/auth/admin";
import { VerifyCompanyDto } from "@/server/dto/companies";
import { AuditRepo } from "@/server/repos/audit";
import { CompaniesRepo } from "@/server/repos/companies";
import { ehUuid, erroInterno, invalido, naoEncontrado } from "@/server/http/respond";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await exigirAdmin();
    if (admin instanceof NextResponse) return admin;

    const { id } = await params;
    if (!ehUuid(id)) return naoEncontrado();
    const company = await CompaniesRepo.findByIdOrNull(id);
    if (!company) {
      return naoEncontrado("Esta empresa não existe ou foi removida.");
    }

    const body = await request.json().catch(() => ({}));
    const parsed = VerifyCompanyDto.parse(body);

    const updated = await CompaniesRepo.verify(id, parsed.verified);
    await AuditRepo.recordCompanyVerificationAction({
      actorUserId: admin.session.userId,
      companyId: id,
      verified: parsed.verified,
    });

    return NextResponse.json({
      company: {
        ...updated,
        verifiedAt: updated?.verifiedAt?.toISOString() ?? null,
        createdAt: updated?.createdAt?.toISOString() ?? null,
        updatedAt: updated?.updatedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }
    return erroInterno(error, "admin/companies/[id]/verification");
  }
}
