import { getSession } from "@/lib/auth/session";
import { CompaniesRepo } from "@/server/repos/companies";
import { ProjectsRepo } from "@/server/repos/projects";
import { NewComplaintContent } from "./_components/new-complaint-content";

type Props = {
  searchParams: Promise<{ company?: string; project?: string }>;
};

export default async function NewComplaintPage({ searchParams }: Props) {
  const session = await getSession();
  const params = await searchParams;
  const companyId = params.company ?? null;
  const initialProjectId = params.project ?? null;

  let company: Awaited<ReturnType<typeof CompaniesRepo.findById>> | null = null;
  let projects: { id: string; name: string }[] = [];

  let projectsInProgress = 0;
  if (companyId) {
    try {
      company = await CompaniesRepo.findById(companyId);
      const rows = await ProjectsRepo.findByCompany(companyId);
      projects = rows.map((p) => ({ id: p.id, name: p.name }));
      projectsInProgress = rows.filter((p) => p.status === "IN_PROGRESS").length;
    } catch {
      company = null;
    }
  }

  const companyInfo = company
    ? {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        verifiedAt: company.verifiedAt?.toISOString() ?? null,
        region: company.region,
      }
    : null;

  return (
    <NewComplaintContent
      session={session}
      company={companyInfo}
      projects={projects}
      projectsInProgress={projectsInProgress}
      initialProjectId={initialProjectId}
    />
  );
}
