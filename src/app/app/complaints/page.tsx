import { supabaseServer } from "@/lib/supabase/server";
import { ComplaintsRepo } from "@/server/repos/complaints";

import { ComplaintsContent } from "./_components/complaints-content";

export default async function ComplaintsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const complaints = await ComplaintsRepo.findByUser(user.id);

  return <ComplaintsContent complaints={complaints} />;
}
