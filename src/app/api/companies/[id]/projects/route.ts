import { NextRequest, NextResponse } from "next/server";
import { ProjectsRepo } from "@/server/repos/projects";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    const projects = await ProjectsRepo.findByCompany(companyId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching company projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
