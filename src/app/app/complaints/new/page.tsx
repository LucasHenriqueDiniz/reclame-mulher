import { getSession } from "@/lib/auth/session";
import { NewComplaintContent } from "./_components/new-complaint-content";

export default async function NewComplaintPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return <NewComplaintContent />;
}
