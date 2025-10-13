import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/routing";

export default async function HomePage() {
  const t = await getTranslations("common.hero");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {t("ctaLogin")}
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          {t("ctaRegister")}
        </Link>
      </div>
    </main>
  );
}
