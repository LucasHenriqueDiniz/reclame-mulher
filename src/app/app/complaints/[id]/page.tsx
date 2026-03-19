import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { CompaniesRepo } from "@/server/repos/companies";
import { MessagesRepo } from "@/server/repos/messages";
import { ComplaintDetailContent } from "./_components/complaint-detail-content";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  let complaint;
  try {
    complaint = await ComplaintsRepo.findById(id);
  } catch {
    notFound();
  }

  const isPublic = complaint.isPublic === true;
  const isAuthor = session?.userId != null && complaint.authorId === session.userId;

  if (!isPublic && !isAuthor) {
    notFound();
  }

  let companySlug: string | null = null;
  let companyLogo: string | null = null;
  let companyVerified = false;
  let companyStats: { resolutionRate: number; activeDialogsCount: number; resolvedCases: number; activeProjectsCount: number; avgResponseHours: number | null } | null = null;

  if (complaint.companyId) {
    try {
      const [company, stats] = await Promise.all([
        CompaniesRepo.findById(complaint.companyId),
        CompaniesRepo.getStats(complaint.companyId),
      ]);
      companySlug = company.slug ?? null;
      companyLogo = company.logoUrl ?? null;
      companyVerified = company.verifiedAt != null;
      companyStats = {
        resolutionRate: stats.resolutionRate,
        activeDialogsCount: stats.activeDialogsCount,
        resolvedCases: stats.resolvedCases,
        activeProjectsCount: stats.activeProjectsCount,
        avgResponseHours: stats.avgResponseHours,
      };
    } catch {
      // ignore
    }
  }

  const messages = await MessagesRepo.findByComplaint(id);

  const serialized = {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status as "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED",
    occurredAt: complaint.occurredAt instanceof Date ? complaint.occurredAt.toISOString() : complaint.occurredAt ? String(complaint.occurredAt) : null,
    expectedSolution: complaint.expectedSolution,
    problemLocation: complaint.problemLocation ?? null,
    impactCategory: complaint.impactCategory ?? null,
    urgencyLevel: complaint.urgencyLevel ?? null,
    impactScope: complaint.impactScope ?? null,
    isAnonymous: complaint.isAnonymous,
    isPublic: complaint.isPublic,
    createdAt: complaint.createdAt instanceof Date ? complaint.createdAt.toISOString() : String(complaint.createdAt),
    updatedAt: complaint.updatedAt instanceof Date ? complaint.updatedAt.toISOString() : String(complaint.updatedAt ?? complaint.createdAt),
    author: complaint.author,
    company: complaint.company,
    companyId: complaint.companyId,
    companySlug,
    companyLogo,
    companyVerified,
    companyStats,
    project: complaint.project,
  };

  const serializedMessages = messages.map((m) => ({
    id: m.id,
    content: m.content,
    senderType: m.senderType,
    author: m.author,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    attachmentPath: m.attachmentPath,
  }));

  return (
    <ComplaintDetailContent
      complaint={serialized}
      messages={serializedMessages}
      isAuthor={isAuthor}
      isLoggedIn={!!session}
    />
  );
}
