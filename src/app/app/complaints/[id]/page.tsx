import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { ComplaintDetailContent } from "./_components/complaint-detail-content";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    notFound();
  }

  let complaint;
  try {
    complaint = await ComplaintsRepo.findById(id);
  } catch {
    notFound();
  }

  if (complaint.authorId !== session.userId) {
    notFound();
  }

  const serialized = {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status as "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED",
    occurredAt: complaint.occurredAt instanceof Date ? complaint.occurredAt.toISOString() : complaint.occurredAt ? String(complaint.occurredAt) : null,
    expectedSolution: complaint.expectedSolution,
    isAnonymous: complaint.isAnonymous,
    isPublic: complaint.isPublic,
    createdAt: complaint.createdAt instanceof Date ? complaint.createdAt.toISOString() : String(complaint.createdAt),
    updatedAt: complaint.updatedAt instanceof Date ? complaint.updatedAt.toISOString() : String(complaint.updatedAt),
    author: complaint.author,
    company: complaint.company,
    project: complaint.project,
  };

  return <ComplaintDetailContent complaint={serialized} />;
}
