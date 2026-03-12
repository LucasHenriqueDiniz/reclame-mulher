import "server-only";
import { db } from "@/db/client";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateProjectInput, UpdateProjectInput } from "../dto/projects";

export class ProjectsRepo {
  static async create(data: CreateProjectInput) {
    const [project] = await db.insert(projects).values({
      companyId: data.company_id,
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? "PLANNING",
      startDate: data.start_date ? new Date(data.start_date) : null,
      endDate: data.end_date ? new Date(data.end_date) : null,
    }).returning();
    return project;
  }

  static async findById(id: string) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) throw new Error("Project not found");
    return project;
  }

  static async findByCompany(companyId: string) {
    return db.select().from(projects).where(eq(projects.companyId, companyId)).orderBy(projects.createdAt);
  }

  static async update(id: string, data: UpdateProjectInput) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.start_date !== undefined) updateData.startDate = data.start_date ? new Date(data.start_date) : null;
    if (data.end_date !== undefined) updateData.endDate = data.end_date ? new Date(data.end_date) : null;
    if (data.location !== undefined) updateData.location = data.location;
    const [project] = await db.update(projects).set(updateData).where(eq(projects.id, id)).returning();
    return project;
  }

  static async delete(id: string) {
    await db.delete(projects).where(eq(projects.id, id));
  }
}
