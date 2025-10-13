"use client";

import { useTranslations } from "next-intl";

interface AppHomeContentProps {
  name?: string | null;
  role?: string | null;
}

export function AppHomeContent({ name, role }: AppHomeContentProps) {
  const t = useTranslations("common.dashboard");

  const profileName = name ?? t("welcomeAnonymous");
  const profileRole = role ?? t("roleUnknown");

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("summary")}</p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">
          {name ? t("welcome", { name }) : profileName}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("profileLabel")}: {profileRole}
        </p>
      </div>
    </main>
  );
}
