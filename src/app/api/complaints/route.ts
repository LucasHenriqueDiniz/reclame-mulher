import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { CreateComplaintDto } from "@/server/dto/complaints";
import { createComplaint, type CreateComplaintFailure } from "@/server/use-cases/create-complaint";
import { createComplaintDeps } from "@/server/use-cases/create-complaint.deps";

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

/**
 * The use case reports a reason; this is the only place that turns one into a
 * status and a body. The `error` strings are byte-identical to what POST
 * returned before the extraction — the client reads them.
 */
const CREATE_COMPLAINT_FAILURES: Record<CreateComplaintFailure, { status: number; error: string }> = {
  "company-not-found": { status: 404, error: "Company not found" },
  "project-not-found": { status: 404, error: "Project not found" },
  "project-company-mismatch": { status: 400, error: "Project does not belong to company" },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateComplaintDto.parse(body);

    const result = await createComplaint(validatedData, session.userId, createComplaintDeps);

    if (!result.ok) {
      const failure = CREATE_COMPLAINT_FAILURES[result.reason];
      return NextResponse.json({ error: failure.error }, { status: failure.status });
    }

    return NextResponse.json(result.complaint, { status: 201 });
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
