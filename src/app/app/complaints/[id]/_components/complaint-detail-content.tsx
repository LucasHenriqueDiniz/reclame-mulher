"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  FolderOpen,
  Calendar,
  Eye,
  EyeOff,
  Globe,
  Lock,
  FileText,
  Lightbulb,
} from "lucide-react";

import { formatDate, formatDateTime } from "@/lib/utils";
import { selectLocale, useLocaleStore } from "@/stores/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ComplaintDetail {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";
  occurredAt: string | null;
  expectedSolution: string | null;
  isAnonymous: boolean | null;
  isPublic: boolean | null;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null };
  company: { name: string | null };
  project: { name: string } | null;
}

interface ComplaintDetailContentProps {
  complaint: ComplaintDetail;
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

export function ComplaintDetailContent({ complaint }: ComplaintDetailContentProps) {
  const t = useTranslations("complaints");
  const locale = useLocaleStore(selectLocale);

  const config = statusConfig[complaint.status];
  const StatusIcon = config.icon;

  return (
    <main className="space-y-6 p-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/app/complaints">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight truncate">
              {complaint.title}
            </h1>
            <Badge
              variant="outline"
              className={`shrink-0 gap-1.5 ${config.className}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {t(`statuses.${complaint.status}` as const)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Descrição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {complaint.expectedSolution && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  Solução Esperada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {complaint.expectedSolution}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaint.company?.name && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Empresa
                    </p>
                    <p className="text-sm font-medium">{complaint.company.name}</p>
                  </div>
                </div>
              )}

              {complaint.project?.name && (
                <div className="flex items-start gap-3">
                  <FolderOpen className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Projeto
                    </p>
                    <p className="text-sm font-medium">{complaint.project.name}</p>
                  </div>
                </div>
              )}

              <Separator />

              {complaint.occurredAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Data da Ocorrência
                    </p>
                    <p className="text-sm">
                      {formatDate(complaint.occurredAt, { locale })}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Registrada em
                  </p>
                  <p className="text-sm">
                    {formatDateTime(complaint.createdAt, { locale })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Última Atualização
                  </p>
                  <p className="text-sm">
                    {formatDateTime(complaint.updatedAt, { locale })}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {complaint.isAnonymous ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Anônima
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      Identificada
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {complaint.isPublic ? (
                    <>
                      <Globe className="h-3.5 w-3.5" />
                      Pública
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      Privada
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
