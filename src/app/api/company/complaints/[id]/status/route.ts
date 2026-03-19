import { NextRequest, NextResponse } from "next/server";

import { getCurrentCompanyContext } from "@/server/auth/company";
import { UpdateComplaintStatusDto } from "@/server/dto/complaints";
import { ComplaintsRepo } from "@/server/repos/complaints";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getCurrentCompanyContext();
    if (!context) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const complaint = await ComplaintsRepo.findById(id);
    if (complaint.companyId !== context.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = UpdateComplaintStatusDto.parse(body);
    const updated = await ComplaintsRepo.updateStatus(id, parsed);

    return NextResponse.json({
      complaint: {
        id: updated?.id,
        status: updated?.status,
        updatedAt:
          updated?.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : updated?.updatedAt != null
              ? String(updated.updatedAt)
              : null,
      },
    });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Complaint not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Error updating company complaint status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
