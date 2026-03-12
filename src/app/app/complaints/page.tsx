import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";

import { ComplaintsContent } from "./_components/complaints-content";

export default async function ComplaintsPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const complaints = await ComplaintsRepo.findByUser(session.userId);

  return <ComplaintsContent complaints={complaints} />;
}
