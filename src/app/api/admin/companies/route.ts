import { NextRequest, NextResponse } from "next/server";

import { exigirAdmin } from "@/server/auth/admin";
import { CompaniesRepo } from "@/server/repos/companies";
import { erroInterno } from "@/server/http/respond";

export async function GET(request: NextRequest) {
  try {
    const admin = await exigirAdmin();
    if (admin instanceof NextResponse) return admin;

    const statusParam = request.nextUrl.searchParams.get("status");
    const status =
      statusParam === "pending" || statusParam === "verified" || statusParam === "all"
        ? statusParam
        : "all";

    const companies = await CompaniesRepo.findForAdmin(status);

    return NextResponse.json({
      companies: companies.map((company) => ({
        ...company,
        verifiedAt: company.verifiedAt?.toISOString() ?? null,
        createdAt: company.createdAt.toISOString(),
        updatedAt: company.updatedAt?.toISOString() ?? null,
      })),
    });
  } catch (error) {
    return erroInterno(error, "admin/companies");
  }
}
