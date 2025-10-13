"use client";

import { useTranslations } from "next-intl";

import { formatDate } from "@/lib/utils";
import { selectLocale, useLocaleStore } from "@/stores/locale";

interface ComplaintSummary {
  id: string;
  title: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";
  created_at: string;
}

interface ComplaintsContentProps {
  complaints: ComplaintSummary[];
}

export function ComplaintsContent({ complaints }: ComplaintsContentProps) {
  const t = useTranslations("complaints");
  const locale = useLocaleStore(selectLocale);

  const hasComplaints = complaints.length > 0;

  return (
    <main className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-sm text-muted-foreground">{t("subheading")}</p>
      </div>

      {hasComplaints ? (
        <ul className="space-y-2">
          {complaints.map((complaint) => (
            <li key={complaint.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{complaint.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(complaint.created_at, { locale })}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {t(`statuses.${complaint.status}` as const)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          <p className="font-medium">{t("empty.title")}</p>
          <p>{t("empty.description")}</p>
        </div>
      )}
    </main>
  );
}
