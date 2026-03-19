import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/client";
import { complaints } from "@/db/schema";
import { CreateMessageDto } from "@/server/dto/messages";
import { getCurrentCompanyContext } from "@/server/auth/company";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { MessagesRepo } from "@/server/repos/messages";
import { eq } from "drizzle-orm";

export async function POST(
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
    const parsed = CreateMessageDto.parse({
      ...body,
      complaint_id: id,
      sender_type: "COMPANY",
    });

    const message = await MessagesRepo.create(parsed, context.session.userId);

    const nextStatus =
      complaint.status === "RESOLVED" || complaint.status === "CANCELLED"
        ? complaint.status
        : "RESPONDED";

    await db
      .update(complaints)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(complaints.id, id));

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        senderType: message.senderType,
        attachmentPath: message.attachmentPath,
        createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : String(message.createdAt),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Complaint not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Error creating company complaint message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
