import { NextRequest, NextResponse } from "next/server";
import { CompaniesRepo } from "@/server/repos/companies";
import { CreateCompanyDto } from "@/server/dto/companies";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const verified = searchParams.get("verified") === "true";

    const companies = await CompaniesRepo.findPublic(search || undefined, verified);

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateCompanyDto.parse(body);

    const company = await CompaniesRepo.create(validatedData);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creating company:", error);

    if (error instanceof Error && "issues" in error) {
      const zodError = error as { issues: unknown[] };
      return NextResponse.json(
        { error: "Validation error", details: zodError.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

