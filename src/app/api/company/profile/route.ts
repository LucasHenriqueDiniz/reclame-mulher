import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CompaniesRepo } from "@/server/repos/companies";
import { CompanyUsersRepo } from "@/server/repos/company-users";

async function getCompanyId(userId: string) {
  const rows = await CompanyUsersRepo.findByUser(userId);
  return rows.length ? rows[0].company.id : null;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  const company = await CompaniesRepo.findById(companyId);
  const stats = await CompaniesRepo.getStats(companyId);
  return NextResponse.json({ company, stats });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const companyId = await getCompanyId(session.userId);
  if (!companyId) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const allowed = [
    "name","corporateName","description","phone","email","website",
    "address","neighborhood","streetNumber","city","state","region","sector",
    "contactName","contactPhone","responsibleName","responsibleEmail","foundationDate",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key] || null;
  }
  if (data.foundationDate && typeof data.foundationDate === "string") {
    data.foundationDate = new Date(data.foundationDate);
  }
  const company = await CompaniesRepo.update(companyId, data as never);
  return NextResponse.json({ company });
}
