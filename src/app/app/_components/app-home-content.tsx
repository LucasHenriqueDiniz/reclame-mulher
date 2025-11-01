"use client";

import { useTranslations } from "next-intl";
import { User, Mail, Shield } from "lucide-react";

interface AppHomeContentProps {
  name?: string | null;
  role?: string | null;
  email?: string | null;
}

export function AppHomeContent({ name, role, email }: AppHomeContentProps) {
  const t = useTranslations("common.dashboard");

  const profileName = name ?? t("welcomeAnonymous");
  const profileRole = role ?? t("roleUnknown");

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("summary")}</p>
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <h2 className="mb-4 text-xl font-semibold">
          {name ? t("welcome", { name }) : profileName}
        </h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Nome</p>
              <p className="text-muted-foreground">{name || "Não informado"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">E-mail</p>
              <p className="text-muted-foreground">{email || "Não informado"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Perfil</p>
              <p className="text-muted-foreground capitalize">{profileRole}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="mb-1 text-2xl font-bold">0</h3>
          <p className="text-sm text-muted-foreground">Reclamações ativas</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-1 text-2xl font-bold">0</h3>
          <p className="text-sm text-muted-foreground">Respostas recebidas</p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-1 text-2xl font-bold">0</h3>
          <p className="text-sm text-muted-foreground">Resoluções</p>
        </div>
      </div>
    </main>
  );
}
