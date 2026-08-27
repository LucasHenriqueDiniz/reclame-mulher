import { NextRequest, NextResponse } from "next/server";
import { CompaniesRepo } from "@/server/repos/companies";
import { CreateCompanyDto } from "@/server/dto/companies";
import { exigirAdmin } from "@/server/auth/admin";
import { erroInterno, invalido } from "@/server/http/respond";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? searchParams.get("q");
    const verified = searchParams.get("verified") === "true";

    const companies = await CompaniesRepo.findPublic(search || undefined, verified);

    return NextResponse.json(companies);
  } catch (error) {
    return erroInterno(error, "companies");
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await exigirAdmin();
    if (admin instanceof NextResponse) return admin;

    const body = await request.json();
    const validatedData = CreateCompanyDto.parse(body);

    const company = await CompaniesRepo.create(validatedData);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);

    if (error instanceof Error && "issues" in error) {
      const zodError = error as { issues: unknown[] };
      return invalido(zodError);
    }

    return erroInterno(error, "companies");
  }
}

