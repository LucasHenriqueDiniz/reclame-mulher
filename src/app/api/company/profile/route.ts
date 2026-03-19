import { NextRequest, NextResponse } from "next/server";
import { CompaniesRepo } from "@/server/repos/companies";
import { UpdateCompanyProfileDto } from "@/server/dto/companies";
import { canManageCompany, getCurrentCompanyContext } from "@/server/auth/company";

export async function GET() {
  const context = await getCurrentCompanyContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = context.companyId;
  const company = await CompaniesRepo.findById(companyId);
  const stats = await CompaniesRepo.getStats(companyId);
  return NextResponse.json({ company, stats });
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await getCurrentCompanyContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canManageCompany(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateCompanyProfileDto.parse(body);

    const company = await CompaniesRepo.update(
      context.companyId,
      {
        ...parsed,
        cnpj: parsed.cnpj ? parsed.cnpj.replace(/\D/g, "") : null,
        foundationDate: parsed.foundationDate ? new Date(parsed.foundationDate) : null,
      } as never
    );

    return NextResponse.json({ company });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("Error updating company profile:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const context = await getCurrentCompanyContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageCompany(context.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await CompaniesRepo.softDelete(context.companyId);
  return NextResponse.json({ ok: true });
}
