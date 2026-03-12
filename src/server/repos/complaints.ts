import "server-only";
import { db } from "@/db/client";
import { complaints, profiles, companies, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateComplaintInput, UpdateComplaintInput, UpdateComplaintStatusInput } from "../dto/complaints";

export class ComplaintsRepo {
  static async create(data: CreateComplaintInput, userId: string) {
    const [complaint] = await db.insert(complaints).values({
      ...data,
      authorId: userId,
      status: "OPEN",
    }).returning();
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
      .where(eq(complaints.authorId, userId));

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
      .where(eq(complaints.companyId, companyId));

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
      })
      .from(complaints)
      .leftJoin(companies, eq(complaints.companyId, companies.id))
      .leftJoin(projects, eq(complaints.projectId, projects.id))
      .where(eq(complaints.isPublic, true));

    return rows.map((r) => ({
      ...r.complaint,
      company: { name: r.companyName },
      project: r.projectName ? { name: r.projectName } : null,
    }));
  }

  static async update(id: string, data: UpdateComplaintInput) {
    const [complaint] = await db
      .update(complaints)
      .set({ ...data, updatedAt: new Date() })
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
