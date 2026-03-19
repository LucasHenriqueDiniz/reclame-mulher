import { NextRequest, NextResponse } from "next/server";

import { getCurrentAdminContext } from "@/server/auth/admin";
import { CompaniesRepo } from "@/server/repos/companies";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdminContext();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    console.error("Error fetching admin companies:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
