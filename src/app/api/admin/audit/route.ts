import { NextRequest, NextResponse } from "next/server";

import { exigirAdmin } from "@/server/auth/admin";
import { AuditFiltersDto } from "@/server/dto/audit";
import { AuditRepo } from "@/server/repos/audit";
import { erroInterno, invalido } from "@/server/http/respond";

export async function GET(request: NextRequest) {
  try {
    const admin = await exigirAdmin();
    if (admin instanceof NextResponse) return admin;

    const filters = AuditFiltersDto.parse({
      entity: request.nextUrl.searchParams.get("entity") ?? undefined,
      actor:
        request.nextUrl.searchParams.get("actor") ??
        request.nextUrl.searchParams.get("q") ??
        undefined,
      from: request.nextUrl.searchParams.get("from") ?? undefined,
      to: request.nextUrl.searchParams.get("to") ?? undefined,
      page: request.nextUrl.searchParams.get("page") ?? undefined,
      limit: request.nextUrl.searchParams.get("limit") ?? undefined,
    });

    const result = await AuditRepo.find(filters);

    return NextResponse.json({
      total: result.total,
      logs: result.logs.map((log) => ({
        ...log,
        createdAt: log.createdAt.toISOString(),
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
      })),
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }
    return erroInterno(error, "admin/audit");
  }
}
