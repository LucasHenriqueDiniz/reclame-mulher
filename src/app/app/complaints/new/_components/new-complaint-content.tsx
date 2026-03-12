"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export function NewComplaintContent() {
  const t = useTranslations("complaints");

  return (
    <main className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/app/complaints">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold tracking-tight">{t("actions.new")}</h1>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Construction className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mb-1 font-semibold">Em breve</h3>
          <p className="mb-4 text-sm text-muted-foreground max-w-sm">
            O formulário de nova reclamação será implementado em breve.
          </p>
          <Link href="/app/complaints">
            <Button variant="outline" size="sm">
              Voltar às reclamações
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
