import "server-only";
import { db } from "@/db/client";
import { complaints, complaintAttachments, profiles, companies, projects } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CreateComplaintInput, UpdateComplaintInput, UpdateComplaintStatusInput } from "../dto/complaints";

export class ComplaintsRepo {
  static async create(data: CreateComplaintInput, userId: string) {
    const [complaint] = await db.insert(complaints).values({
      companyId: data.company_id,
      projectId: data.project_id ?? null,
      title: data.title,
      description: data.description,
      problemLocation: data.problem_location ?? null,
      occurredAt: data.occurred_at ?? null,
      expectedSolution: data.expected_solution ?? null,
      hasPreviousComplaintElsewhere: data.has_previous_complaint_elsewhere ?? false,
      previousComplaintChannel: data.has_previous_complaint_elsewhere ? (data.previous_complaint_channel ?? null) : null,
      impactCategory: data.impact_category ?? null,
      urgencyLevel: data.urgency_level ?? null,
      impactScope: data.impact_scope ?? null,
      isPublic: data.is_public,
      isAnonymous: data.is_anonymous,
      authorId: userId,
      status: "OPEN",
    }).returning();
    if (complaint && data.attachment_paths?.length) {
      await db.insert(complaintAttachments).values(
        data.attachment_paths.map((a) => ({
          complaintId: complaint.id,
          filePath: a.file_path,
          fileName: a.file_name,
          contentType: a.content_type ?? null,
          sizeBytes: a.size_bytes ?? null,
        }))
      );
    }
    return complaint;
  }

  static async findById(id: string) {
    const [row] = await db
      .select({
        complaint: complaints,
        authorName: profiles.name,
        companyName: companies.name,
        projectName: projects.name,
      })
      .from(complaints)
      .leftJoin(profiles, eq(complaints.authorId, profiles.userId))
      .leftJoin(companies, eq(complaints.companyId, companies.id))
      .leftJoin(projects, eq(complaints.projectId, projects.id))
      .where(eq(complaints.id, id))
      .limit(1);

    if (!row) throw new Error("Complaint not found");

    return {
      ...row.complaint,
      author: { name: row.authorName },
      company: { name: row.companyName },
      project: row.projectName ? { name: row.projectName } : null,
    };
  }

  static async findByUser(userId: string) {
    const rows = await db
      .select({
        complaint: complaints,
        companyName: companies.name,
        projectName: projects.name,
      })
      .from(complaints)
      .leftJoin(companies, eq(complaints.companyId, companies.id))
      .leftJoin(projects, eq(complaints.projectId, projects.id))
      .where(eq(complaints.authorId, userId))
      .orderBy(desc(complaints.createdAt));

    return rows.map((r) => ({
      ...r.complaint,
      company: { name: r.companyName },
      project: r.projectName ? { name: r.projectName } : null,
    }));
  }

  static async findByCompany(companyId: string) {
    const rows = await db
      .select({
        complaint: complaints,
        authorName: profiles.name,
        projectName: projects.name,
      })
      .from(complaints)
      .leftJoin(profiles, eq(complaints.authorId, profiles.userId))
      .leftJoin(projects, eq(complaints.projectId, projects.id))
      .where(eq(complaints.companyId, companyId))
      .orderBy(desc(complaints.createdAt));

    return rows.map((r) => ({
      ...r.complaint,
      author: { name: r.authorName },
      project: r.projectName ? { name: r.projectName } : null,
    }));
  }

  static async findPublic(companyId?: string) {
    const rows = await db
      .select({
        complaint: complaints,
        companyName: companies.name,
        projectName: projects.name,
        authorName: profiles.name,
      })
      .from(complaints)
      .leftJoin(companies, eq(complaints.companyId, companies.id))
      .leftJoin(projects, eq(complaints.projectId, projects.id))
      .leftJoin(profiles, eq(complaints.authorId, profiles.userId))
      .where(companyId ? and(eq(complaints.isPublic, true), eq(complaints.companyId, companyId)) : eq(complaints.isPublic, true))
      .orderBy(desc(complaints.createdAt));

    return rows.map((r) => ({
      ...r.complaint,
      company: { name: r.companyName },
      project: r.projectName ? { name: r.projectName } : null,
      author: r.complaint.isAnonymous ? null : { name: r.authorName },
    }));
  }

  static async update(id: string, data: UpdateComplaintInput) {
    const [complaint] = await db
      .update(complaints)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.occurred_at !== undefined && { occurredAt: data.occurred_at ?? null }),
        ...(data.expected_solution !== undefined && { expectedSolution: data.expected_solution ?? null }),
        ...(data.is_public !== undefined && { isPublic: data.is_public }),
        ...(data.is_anonymous !== undefined && { isAnonymous: data.is_anonymous }),
        updatedAt: new Date(),
      })
      .where(eq(complaints.id, id))
      .returning();
    return complaint;
  }

  static async updateStatus(id: string, data: UpdateComplaintStatusInput) {
    const [complaint] = await db
      .update(complaints)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(complaints.id, id))
      .returning();
    return complaint;
  }

  static async delete(id: string) {
    await db.delete(complaints).where(eq(complaints.id, id));
  }
}
