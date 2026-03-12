import "server-only";
import { db } from "@/db/client";
import { complaintMessages, profiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { CreateMessageInput } from "../dto/messages";

export class MessagesRepo {
  static async create(data: CreateMessageInput, userId: string) {
    const [message] = await db.insert(complaintMessages).values({
      complaintId: data.complaint_id,
      senderType: data.sender_type,
      content: data.content,
      attachmentPath: data.attachment_path ?? null,
      authorId: userId,
    }).returning();
    return message;
  }

  static async findByComplaint(complaintId: string) {
    const rows = await db
      .select({
        message: complaintMessages,
        authorName: profiles.name,
      })
      .from(complaintMessages)
      .leftJoin(profiles, eq(complaintMessages.authorId, profiles.userId))
      .where(eq(complaintMessages.complaintId, complaintId))
      .orderBy(asc(complaintMessages.createdAt));

    return rows.map((r) => ({
      ...r.message,
      author: { name: r.authorName },
    }));
  }
}
