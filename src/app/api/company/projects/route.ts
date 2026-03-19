import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/server/repos/projects";
import { CreateProjectDto } from "@/server/dto/projects";
import { canManageCompany, getCurrentCompanyContext } from "@/server/auth/company";

export async function GET() {
  const context = await getCurrentCompanyContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await ProjectsRepo.findByCompany(context.companyId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  try {
    const context = await getCurrentCompanyContext();
    if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canManageCompany(context.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateProjectDto.parse({
      ...body,
      company_id: context.companyId,
    });

    const project = await ProjectsRepo.create(parsed);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
