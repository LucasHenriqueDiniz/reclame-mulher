import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProjectsRepo } from "@/server/repos/projects";
import { CompanyUsersRepo } from "@/server/repos/company-users";

async function getCompanyId(userId: string) {
  const rows = await CompanyUsersRepo.findByUser(userId);
  return rows.length ? rows[0].company.id : null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const projects = await ProjectsRepo.findByCompany(companyId);
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const project = await ProjectsRepo.create({ company_id: companyId, name: body.name, description: body.description, location: body.location, status: body.status ?? "PLANNING", start_date: body.start_date, end_date: body.end_date });
  return NextResponse.json({ project }, { status: 201 });
}
