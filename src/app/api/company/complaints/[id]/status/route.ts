import { NextRequest, NextResponse } from "next/server";

import { exigirEmpresa } from "@/server/auth/company";
import { UpdateComplaintStatusDto } from "@/server/dto/complaints";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { ehUuid, erroInterno, invalido, naoEncontrado, semPermissao } from "@/server/http/respond";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await exigirEmpresa();
    if (context instanceof NextResponse) return context;

    const { id } = await params;
    if (!ehUuid(id)) return naoEncontrado();
    const complaint = await ComplaintsRepo.findById(id);
    if (complaint.companyId !== context.companyId) {
      return semPermissao();
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
      return invalido(error);
    }
    if (error instanceof Error && error.message === "Complaint not found") {
      return naoEncontrado();
    }
    return erroInterno(error, "company/complaints/[id]/status");
  }
}
