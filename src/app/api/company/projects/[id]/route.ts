import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/server/repos/projects";
import { UpdateProjectDto } from "@/server/dto/projects";
import { exigirEmpresaComGestao } from "@/server/auth/company";
import { ehUuid, erroInterno, invalido, naoEncontrado, semPermissao } from "@/server/http/respond";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await exigirEmpresaComGestao();
    if (context instanceof NextResponse) return context;

    const { id } = await params;
    if (!ehUuid(id)) return naoEncontrado();
    const project = await ProjectsRepo.findByIdOrNull(id);
    if (!project) {
      return naoEncontrado("Este projeto não existe ou foi removido.");
    }
    if (project.companyId !== context.companyId) {
      return semPermissao();
    }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateProjectDto.parse(body);
    const updated = await ProjectsRepo.update(id, parsed);

    return NextResponse.json({ project: updated });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }
    return erroInterno(error, "company/projects/[id]");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await exigirEmpresaComGestao();
  if (context instanceof NextResponse) return context;
  const { id } = await params;
  if (!ehUuid(id)) return naoEncontrado();
  const proj = await ProjectsRepo.findByIdOrNull(id);
  if (!proj) return naoEncontrado("Este projeto não existe ou foi removido.");
  if (proj.companyId !== context.companyId) return semPermissao();
  await ProjectsRepo.delete(id);
  return NextResponse.json({ ok: true });
}
