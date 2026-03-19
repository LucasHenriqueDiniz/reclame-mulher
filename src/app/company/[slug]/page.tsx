import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CompaniesRepo } from "@/server/repos/companies";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { ProjectsRepo } from "@/server/repos/projects";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { CompanyProfileContent } from "./_components/company-profile-content";

export default async function CompanyProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab = "overview" } = await searchParams;

  let company: Awaited<ReturnType<typeof CompaniesRepo.findBySlug>>;
  try {
    company = await CompaniesRepo.findBySlug(slug);
  } catch {
    notFound();
  }

  const session = await getSession();

  const [publicComplaints, projects, stats] = await Promise.all([
    ComplaintsRepo.findPublic(company.id),
    ProjectsRepo.findByCompany(company.id),
    CompaniesRepo.getStats(company.id),
  ]);

  let isMember = false;
  if (session) {
    const rows = await CompanyUsersRepo.findByUser(session.userId);
    isMember = rows.some((r) => r.company.id === company.id);
  }

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
    complaints: publicComplaints.map((c) => ({
      ...c,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
      updatedAt: c.updatedAt instanceof Date ? (c.updatedAt?.toISOString() ?? null) : null,
    })),
    projects: projects.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt?.toISOString() ?? null,
      startDate: p.startDate?.toISOString() ?? null,
      endDate: p.endDate?.toISOString() ?? null,
    })),
    stats,
    isMember,
    isLoggedIn: !!session,
    initialTab: tab,
  };

  return <CompanyProfileContent {...serialized} />;
}
