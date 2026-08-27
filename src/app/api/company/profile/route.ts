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

    // `PATCH` é atualização parcial: campo que não veio no corpo não entra no
    // `UPDATE`. Escrever `cnpj: ... : null` incondicionalmente apagava o CNPJ
    // de quem mandasse qualquer outro campo — ver o comentário longo em
    // `src/server/dto/companies.ts` e a task `56`.
    // O CNPJ já sai do DTO só com dígitos, e `name` e `cnpj` já foram recusados
    // se vierem nulos ou em branco: os dois são `NOT NULL` no banco (task `69`).
    const alteracoes: Record<string, unknown> = { ...parsed };
    if (parsed.foundationDate !== undefined) {
      alteracoes.foundationDate = parsed.foundationDate
        ? new Date(parsed.foundationDate)
        : null;
    }

    const company = await CompaniesRepo.update(context.companyId, alteracoes);

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
