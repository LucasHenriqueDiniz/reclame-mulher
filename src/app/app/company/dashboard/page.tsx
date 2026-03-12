import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CompaniesRepo } from "@/server/repos/companies";
import { ProjectsRepo } from "@/server/repos/projects";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { CompanyDashboard } from "./_components/company-dashboard";

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const userCompanies = await CompanyUsersRepo.findByUser(session.userId);
  if (!userCompanies.length) redirect("/app");

  const companyRow = userCompanies[0];
  const companyId = companyRow.company.id;

  const [company, stats, projects, complaints] = await Promise.all([
    CompaniesRepo.findById(companyId),
    CompaniesRepo.getStats(companyId),
    ProjectsRepo.findByCompany(companyId),
    ComplaintsRepo.findByCompany(companyId),
  ]);

  const { tab = "complaints" } = await searchParams;

  const serialized = {
    company: {
      ...company,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt?.toISOString() ?? null,
      verifiedAt: company.verifiedAt?.toISOString() ?? null,
      foundationDate: company.foundationDate?.toISOString() ?? null,
      deletedAt: company.deletedAt?.toISOString() ?? null,
    },
    stats,
    projects: projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt?.toISOString() ?? null,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
    })),
    complaints: complaints.map((c) => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt?.toISOString() : String(c.updatedAt ?? ""),
    })),
    initialTab: tab,
  };

  return <CompanyDashboard {...serialized} />;
}
