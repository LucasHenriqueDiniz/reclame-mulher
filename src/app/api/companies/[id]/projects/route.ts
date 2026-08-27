import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/server/repos/projects";
import { ehUuid, erroInterno, naoEncontrado } from "@/server/http/respond";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    if (!ehUuid(companyId)) return naoEncontrado();
    const projects = await ProjectsRepo.findByCompany(companyId);
    return NextResponse.json(projects);
  } catch (error) {
    return erroInterno(error, "companies/[id]/projects");
  }
}
