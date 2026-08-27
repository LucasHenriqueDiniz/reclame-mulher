import { notFound, redirect } from "next/navigation";

import { getCurrentCompanyContext } from "@/server/auth/company";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { CompaniesRepo } from "@/server/repos/companies";
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

  const [messages, company, stats, attachments] = await Promise.all([
    MessagesRepo.findByComplaint(id),
    CompaniesRepo.findById(companyContext.companyId),
    CompaniesRepo.getStats(companyContext.companyId),
    ComplaintsRepo.findAttachments(id),
  ]);

  return (
    <CompanyComplaintDetailContent
      companyProfile={{
        slug: company.slug ?? null,
        verified: company.verifiedAt != null,
      }}
      companyStats={{
        resolutionRate: stats.resolutionRate,
        activeDialogsCount: stats.activeDialogsCount,
        resolvedCases: stats.resolvedCases,
        activeProjectsCount: stats.activeProjectsCount,
        avgResponseHours: stats.avgResponseHours,
      }}
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
        attachments: attachments.map((a) => ({
          id: a.id,
          filePath: a.filePath,
          fileName: a.fileName,
          contentType: a.contentType,
        })),
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

