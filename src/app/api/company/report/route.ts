import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { reports } from "@/db/schema";
import { CreateCompanyReportDto } from "@/server/dto/companies";
import { CompaniesRepo } from "@/server/repos/companies";
import { erroInterno, invalido, naoAutenticada, naoEncontrado } from "@/server/http/respond";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return naoAutenticada("Entre na sua conta para denunciar.");

    const body = await req.json().catch(() => ({}));
    const parsed = CreateCompanyReportDto.parse(body);

    await CompaniesRepo.findById(parsed.companyId);

    const [report] = await db
      .insert(reports)
      .values({
        reporterId: session.userId,
        type: "ABUSE",
        title: `Denúncia de empresa: ${parsed.reason}`,
        description: parsed.details || parsed.reason,
        relatedCompanyId: parsed.companyId,
        status: "PENDING",
      })
      .returning();

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return invalido(error);
    }
    if (error instanceof Error && error.message === "Company not found") {
      return naoEncontrado("Esta empresa não existe ou foi removida.");
    }
    return erroInterno(error, "company/report");
  }
}
