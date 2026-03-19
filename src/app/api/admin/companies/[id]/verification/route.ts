import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdminContext } from "@/server/auth/admin";
import { VerifyCompanyDto } from "@/server/dto/companies";
import { AuditRepo } from "@/server/repos/audit";
import { CompaniesRepo } from "@/server/repos/companies";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdminContext();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const company = await CompaniesRepo.findByIdOrNull(id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("Error updating company verification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
