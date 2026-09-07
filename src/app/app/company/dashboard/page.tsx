import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CompaniesRepo } from "@/server/repos/companies";
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
  const currentSession = session;

  const userCompanies = await CompanyUsersRepo.findByUser(currentSession.userId);
  if (!userCompanies.length) redirect("/app");

  const companyRow = userCompanies[0];
  const companyId = companyRow.company.id;

  // The projects tab fetches its own list through `useCompanyProjects`, so that
  // query is not here: it would be paid for on every dashboard visit, and
  // `complaints` is the tab that opens by default.
  const [company, stats, complaints] = await Promise.all([
    CompaniesRepo.findById(companyId),
    CompaniesRepo.getStats(companyId),
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
      scheduledPermanentDeletionAt: company.scheduledPermanentDeletionAt?.toISOString() ?? null,
    },
    stats,
    complaints: complaints.map((c: (typeof complaints)[number]) => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt?.toISOString() : String(c.updatedAt ?? ""),
    })),
    initialTab: tab,
  };

  return <CompanyDashboard {...serialized} />;
}
