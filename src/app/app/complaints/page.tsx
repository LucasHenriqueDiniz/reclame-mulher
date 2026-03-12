import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { ProfilesRepo } from "@/server/repos/profiles";
import { ComplaintsContent } from "./_components/complaints-content";

export default async function ComplaintsPage() {
  const session = await getSession();
  if (!session) return null;

  const [rawComplaints, profile] = await Promise.all([
    ComplaintsRepo.findByUser(session.userId),
    ProfilesRepo.findById(session.userId),
  ]);

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

  return (
    <ComplaintsContent
      complaints={complaints}
      profileName={profile?.name ?? "Usuária"}
      profileCity={profile?.city ?? null}
      profileState={profile?.state ?? null}
      avatarUrl={profile?.avatarUrl ?? null}
    />
  );
}
