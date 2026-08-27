import { NextRequest, NextResponse } from "next/server";

import { exigirEmpresa } from "@/server/auth/company";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { MessagesRepo } from "@/server/repos/messages";
import { ehUuid, erroInterno, naoEncontrado, semPermissao } from "@/server/http/respond";

function serializeComplaintDetail(
  complaint: Awaited<ReturnType<typeof ComplaintsRepo.findById>>
) {
  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    status: complaint.status,
    problemLocation: complaint.problemLocation,
    occurredAt: complaint.occurredAt instanceof Date ? complaint.occurredAt.toISOString() : complaint.occurredAt ? String(complaint.occurredAt) : null,
    expectedSolution: complaint.expectedSolution,
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
    author: complaint.author ?? null,
    company: complaint.company,
    companyId: complaint.companyId,
    project: complaint.project,
  };
}

export async function GET(
  _request: NextRequest,
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

    const messages = await MessagesRepo.findByComplaint(id);

    return NextResponse.json({
      complaint: serializeComplaintDetail(complaint),
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        senderType: message.senderType,
        attachmentPath: message.attachmentPath,
        createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : String(message.createdAt),
        author: message.author ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Complaint not found") {
      return naoEncontrado();
    }
    return erroInterno(error, "company/complaints/[id]");
  }
}
