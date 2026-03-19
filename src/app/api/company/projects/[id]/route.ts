import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/server/repos/projects";
import { UpdateProjectDto } from "@/server/dto/projects";
import { canManageCompany, getCurrentCompanyContext } from "@/server/auth/company";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await getCurrentCompanyContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canManageCompany(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const project = await ProjectsRepo.findByIdOrNull(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (project.companyId !== context.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateProjectDto.parse(body);
    const updated = await ProjectsRepo.update(id, parsed);

    return NextResponse.json({ project: updated });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentCompanyContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageCompany(context.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const proj = await ProjectsRepo.findByIdOrNull(id);
  if (!proj) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (proj.companyId !== context.companyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ProjectsRepo.delete(id);
  return NextResponse.json({ ok: true });
}
