import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ProjectsRepo } from "@/server/repos/projects";
import { CompanyUsersRepo } from "@/server/repos/company-users";

async function getCompanyId(userId: string) {
  const rows = await CompanyUsersRepo.findByUser(userId);
  return rows.length ? rows[0].company.id : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const project = await ProjectsRepo.update(id, { name: body.name, description: body.description, location: body.location, status: body.status, start_date: body.start_date, end_date: body.end_date });
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { id } = await params;
  const proj = await ProjectsRepo.findById(id);
  if (proj.companyId !== companyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ProjectsRepo.delete(id);
  return NextResponse.json({ ok: true });
}
