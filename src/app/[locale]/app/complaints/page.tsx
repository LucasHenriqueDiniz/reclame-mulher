import { getTranslations } from "next-intl/server";

import { supabaseServer } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { listComplaintsForUser } from "@/server/repos/complaints";

export default async function ComplaintsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const t = await getTranslations("complaints");

  if (!user) {
    return null;
  }

  const complaints = await listComplaintsForUser(user.id);

  return (
    <main className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("subheading")}</p>
      </div>

      {complaints.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium">{t("empty.title")}</p>
          <p>{t("empty.description")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {complaints.map((complaint) => (
            <li key={complaint.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{complaint.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(complaint.created_at)}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {t(`statuses.${complaint.status}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
