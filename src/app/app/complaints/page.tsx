import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";

import { ComplaintsContent } from "./_components/complaints-content";

export default async function ComplaintsPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const rawComplaints = await ComplaintsRepo.findByUser(session.userId);

  const complaints = rawComplaints.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    status: c.status as "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED",
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
    company: c.company,
    project: c.project,
  }));

  return <ComplaintsContent complaints={complaints} />;
}
