import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { CompanyComplaintsContent } from "./_components/company-complaints-content";

export default async function CompanyComplaintsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // The user's companies
  const memberships = await CompanyUsersRepo.findByUser(session.userId);
  
  if (memberships.length === 0) {
    redirect("/app");
  }

  // Take the first company; company selection is not implemented yet
  const companyId = memberships[0].company.id;
  const companyName = memberships[0].company.name;

  // Every complaint for that company
  const complaints = await ComplaintsRepo.findByCompany(companyId);

  const serialized = {
    companyId,
    companyName,
    complaints: complaints.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt?.toISOString() ?? null,
      isPublic: c.isPublic,
      isAnonymous: c.isAnonymous,
      problemLocation: c.problemLocation,
      author: c.author ? {
        name: c.author.name,
      } : null,
      project: c.project ? {
        name: c.project.name,
      } : null,
    })),
  };

  return <CompanyComplaintsContent {...serialized} />;
}
