import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { complaints } from "@/db/schema";
import { CreateMessageDto } from "@/server/dto/messages";
import { CompanyUsersRepo } from "@/server/repos/company-users";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { MessagesRepo } from "@/server/repos/messages";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const complaint = await ComplaintsRepo.findById(id);
    const memberships = await CompanyUsersRepo.findByUser(session.userId);
    const isCompanyMember = memberships.some((membership) => membership.company.id === complaint.companyId);
    const isAuthor = complaint.authorId === session.userId;

    if (!isAuthor && !isCompanyMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const senderType = isCompanyMember ? "COMPANY" : "USER";
    const body = await request.json().catch(() => ({}));
    const parsed = CreateMessageDto.parse({
      ...body,
      complaint_id: id,
      sender_type: senderType,
    });

    const message = await MessagesRepo.create(parsed, session.userId);

    const nextStatus =
      senderType === "COMPANY"
        ? complaint.status === "RESOLVED" || complaint.status === "CANCELLED"
          ? complaint.status
          : "RESPONDED"
        : complaint.status === "RESPONDED"
          ? "OPEN"
          : complaint.status;

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
    console.error("Error creating complaint message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
