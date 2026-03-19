import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CompaniesRepo } from "@/server/repos/companies";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { ProjectsRepo } from "@/server/repos/projects";
import { CreateComplaintDto } from "@/server/dto/complaints";

function serializeComplaintSummary(
  complaint: {
    id: string;
    title: string;
    description: string;
    status: string;
    problemLocation: string | null;
    impactCategory: string | null;
    urgencyLevel: string | null;
    impactScope: string | null;
    isAnonymous: boolean;
    isPublic: boolean;
    createdAt: Date | string;
    updatedAt: Date | string | null;
    company: { name: string | null };
    project: { name: string } | null;
    author?: { name: string | null } | null;
  }
) {
  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status,
    problemLocation: complaint.problemLocation,
    impactCategory: complaint.impactCategory,
    urgencyLevel: complaint.urgencyLevel,
    impactScope: complaint.impactScope,
    isAnonymous: complaint.isAnonymous,
    isPublic: complaint.isPublic,
    createdAt: complaint.createdAt instanceof Date ? complaint.createdAt.toISOString() : String(complaint.createdAt),
    updatedAt:
      complaint.updatedAt instanceof Date
        ? complaint.updatedAt.toISOString()
        : complaint.updatedAt != null
          ? String(complaint.updatedAt)
          : null,
    company: complaint.company,
    project: complaint.project,
    author: complaint.author ?? null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);

    const mine = searchParams.get("mine") === "1";
    const companyId = searchParams.get("companyId");

    let complaints;

    if (mine) {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      complaints = await ComplaintsRepo.findByUser(session.userId);
    } else if (companyId) {
      complaints = await ComplaintsRepo.findPublic(companyId);
    } else {
      complaints = await ComplaintsRepo.findPublic();
    }

    return NextResponse.json(complaints.map(serializeComplaintSummary));
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateComplaintDto.parse(body);

    const company = await CompaniesRepo.findByIdOrNull(validatedData.company_id);
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (validatedData.project_id) {
      const project = await ProjectsRepo.findByIdOrNull(validatedData.project_id);
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      if (project.companyId !== validatedData.company_id) {
        return NextResponse.json(
          { error: "Project does not belong to company" },
          { status: 400 }
        );
      }
    }

    const complaint = await ComplaintsRepo.create(validatedData, session.userId);

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);

    if (error instanceof Error && "issues" in error) {
      const zodError = error as { issues: unknown[] };
      return NextResponse.json(
        { error: "Validation error", details: zodError.issues },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
