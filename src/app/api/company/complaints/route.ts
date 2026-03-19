import { NextRequest, NextResponse } from "next/server";

import { getCurrentCompanyContext } from "@/server/auth/company";
import { ComplaintsRepo } from "@/server/repos/complaints";

function serializeComplaint(
  complaint: Awaited<ReturnType<typeof ComplaintsRepo.findByCompany>>[number]
) {
  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status,
    problemLocation: complaint.problemLocation,
    isAnonymous: complaint.isAnonymous,
    isPublic: complaint.isPublic,
    createdAt: complaint.createdAt instanceof Date ? complaint.createdAt.toISOString() : String(complaint.createdAt),
    updatedAt:
      complaint.updatedAt instanceof Date
        ? complaint.updatedAt.toISOString()
        : complaint.updatedAt != null
          ? String(complaint.updatedAt)
          : null,
    author: complaint.author ?? null,
    project: complaint.project,
  };
}

export async function GET(request: NextRequest) {
  try {
    const context = await getCurrentCompanyContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.trim().toLowerCase();

    const complaints = await ComplaintsRepo.findByCompany(context.companyId);
    const filtered = complaints.filter((complaint) => {
      const matchesStatus = !status || status === "ALL" || complaint.status === status;
      const haystack = [complaint.title, complaint.description, complaint.author?.name, complaint.project?.name]
        .filter((value): value is string => typeof value === "string")
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesStatus && matchesQuery;
    });

    return NextResponse.json(filtered.map(serializeComplaint));
  } catch (error) {
    console.error("Error fetching company complaints:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
