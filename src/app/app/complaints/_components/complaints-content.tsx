"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Plus,
  FileWarning,
  Building2,
  FolderOpen,
} from "lucide-react";

import { formatDate } from "@/lib/utils";
import { selectLocale, useLocaleStore } from "@/stores/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface ComplaintSummary {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";
  createdAt: string | Date;
  updatedAt: string | Date;
  company: { name: string | null };
  project: { name: string } | null;
}

interface ComplaintsContentProps {
  complaints: ComplaintSummary[];
}

const statusConfig = {
  OPEN: {
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  },
  RESPONDED: {
    icon: AlertCircle,
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  },
  RESOLVED: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  CANCELLED: {
    icon: XCircle,
    className: "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
  },
} as const;

export function ComplaintsContent({ complaints }: ComplaintsContentProps) {
  const t = useTranslations("complaints");
  const locale = useLocaleStore(selectLocale);

  const hasComplaints = complaints.length > 0;

  const openCount = complaints.filter((c) => c.status === "OPEN").length;
  const respondedCount = complaints.filter((c) => c.status === "RESPONDED").length;
  const resolvedCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <main className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{t("heading")}</h1>
          <p className="text-sm text-muted-foreground">{t("subheading")}</p>
        </div>
        <Link href="/app/complaints/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {t("actions.new")}
          </Button>
        </Link>
      </div>

      {hasComplaints && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{openCount}</p>
              <p className="text-xs text-muted-foreground">{t("statuses.OPEN")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{respondedCount}</p>
              <p className="text-xs text-muted-foreground">{t("statuses.RESPONDED")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">{t("statuses.RESOLVED")}</p>
            </div>
          </div>
        </div>
      )}

      {hasComplaints ? (
        <div className="space-y-3">
          {complaints.map((complaint) => {
            const config = statusConfig[complaint.status];
            const StatusIcon = config.icon;

            return (
              <Link
                key={complaint.id}
                href={`/app/complaints/${complaint.id}`}
                className="block"
              >
                <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/20 group cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                            {complaint.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`shrink-0 gap-1 text-[11px] ${config.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {t(`statuses.${complaint.status}` as const)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {complaint.company?.name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {complaint.company.name}
                            </span>
                          )}
                          {complaint.project?.name && (
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {complaint.project.name}
                            </span>
                          )}
                          <span>
                            {formatDate(complaint.createdAt, { locale })}
                          </span>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileWarning className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-1 font-semibold">{t("empty.title")}</h3>
            <p className="mb-4 text-sm text-muted-foreground max-w-sm">
              {t("empty.description")}
            </p>
            <Link href="/app/complaints/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                {t("actions.new")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
