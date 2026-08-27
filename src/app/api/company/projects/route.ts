import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/server/repos/projects";
import { CreateProjectDto } from "@/server/dto/projects";
import { exigirEmpresa, exigirEmpresaComGestao } from "@/server/auth/company";
import { erroInterno, invalido } from "@/server/http/respond";

export async function GET() {
  const context = await exigirEmpresa();
  if (context instanceof NextResponse) return context;
  const projects = await ProjectsRepo.findByCompany(context.companyId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  try {
    const context = await exigirEmpresaComGestao();
    if (context instanceof NextResponse) return context;

    const body = await req.json().catch(() => ({}));
    const parsed = CreateProjectDto.parse({
      ...body,
      company_id: context.companyId,
    });

    const project = await ProjectsRepo.create(parsed);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }
    return erroInterno(error, "company/projects");
  }
}
