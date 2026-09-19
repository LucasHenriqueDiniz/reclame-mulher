import { notFound, redirect } from "next/navigation";

import { getCurrentCompanyContext } from "@/server/auth/company";
import { CompaniesRepo } from "@/server/repos/companies";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { MessagesRepo } from "@/server/repos/messages";
import { CompanyComplaintDetailContent } from "./_components/company-complaint-detail-content";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const context = await getCurrentCompanyContext();
  if (!context) {
    redirect("/login");
  }
  const companyContext = context;

  const { id } = await params;
  let complaint: Awaited<ReturnType<typeof ComplaintsRepo.findById>>;

  try {
    complaint = await ComplaintsRepo.findById(id);
  } catch {
    notFound();
  }

  if (complaint.companyId !== companyContext.companyId) {
    notFound();
  }

  const messages = await MessagesRepo.findByComplaint(id);

  // Same sources the person-facing detail page reads (src/app/app/complaints/[id]/page.tsx),
  // so both sides of one complaint quote the same numbers, the same verification and
  // the same profile link for the same company.
  let companyStats: Awaited<ReturnType<typeof CompaniesRepo.getStats>> | null = null;
  let companyVerified = false;
  let companySlug: string | null = null;
  try {
    const [company, stats] = await Promise.all([
      CompaniesRepo.findByIdOrNull(companyContext.companyId),
      CompaniesRepo.getStats(companyContext.companyId),
    ]);
    companyStats = stats;
    companyVerified = company?.verifiedAt != null;
    // The stored slug, never one derived from the display name: generateUniqueSlug
    // strips accents and appends -2 on a collision, so a guess misses both cases.
    companySlug = company?.slug ?? null;
  } catch {
    // The sidebar card hides its stats block when they cannot be read, rather than
    // failing the whole page over a panel.
  }

  return (
    <CompanyComplaintDetailContent
      companyStats={companyStats}
      companySlug={companySlug}
      companyVerified={companyVerified}
      complaint={{
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        problemLocation: complaint.problemLocation,
        occurredAt: complaint.occurredAt instanceof Date ? complaint.occurredAt.toISOString() : complaint.occurredAt ? String(complaint.occurredAt) : null,
        expectedSolution: complaint.expectedSolution,
        impactCategory: complaint.impactCategory,
        urgencyLevel: complaint.urgencyLevel,
        impactScope: complaint.impactScope,
        isAnonymous: complaint.isAnonymous,
        isPublic: complaint.isPublic,
        createdAt: complaint.createdAt instanceof Date ? complaint.createdAt.toISOString() : String(complaint.createdAt),
        updatedAt: complaint.updatedAt instanceof Date ? complaint.updatedAt.toISOString() : complaint.updatedAt ? String(complaint.updatedAt) : null,
        author: complaint.author ?? null,
        company: complaint.company,
        project: complaint.project,
      }}
      messages={messages.map((message) => ({
        id: message.id,
        content: message.content,
        senderType: message.senderType,
        createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : String(message.createdAt),
        attachmentPath: message.attachmentPath,
        author: message.author ?? null,
      }))}
    />
  );
}

