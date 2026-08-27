import { NextRequest, NextResponse } from "next/server";
import { CompaniesRepo } from "@/server/repos/companies";
import { UpdateCompanyProfileDto } from "@/server/dto/companies";
import { exigirEmpresa, exigirEmpresaComGestao } from "@/server/auth/company";
import { erroInterno, invalido } from "@/server/http/respond";

export async function GET() {
  const context = await exigirEmpresa();
  if (context instanceof NextResponse) return context;
  const companyId = context.companyId;
  const company = await CompaniesRepo.findById(companyId);
  const stats = await CompaniesRepo.getStats(companyId);
  return NextResponse.json({ company, stats });
}

export async function PATCH(req: NextRequest) {
  try {
    const context = await exigirEmpresaComGestao();
    if (context instanceof NextResponse) return context;

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
      return invalido(error);
    }
    return erroInterno(error, "company/profile");
  }
}

export async function DELETE() {
  const context = await exigirEmpresaComGestao();
  if (context instanceof NextResponse) return context;
  await CompaniesRepo.softDelete(context.companyId);
  return NextResponse.json({ ok: true });
}
