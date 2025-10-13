import { supabaseServer } from "@/lib/supabase/server";
import {
  CreateProjectDto,
  ListProjectsDto,
  ProjectSchema,
  UpdateProjectDto,
  type CreateProjectInput,
  type ListProjectsInput,
  type Project,
  type UpdateProjectInput,
} from "@/server/dto/projects";

const projectSelect = `
  id,
  company_id,
  name,
  description,
  status,
  created_at,
  updated_at
`;

export async function listProjects(params: ListProjectsInput = {}): Promise<Project[]> {
  const filters = ListProjectsDto.parse(params);
  const client = await supabaseServer();

  let query = client.from("projects").select(projectSelect).order("created_at", { ascending: false });

  if (filters.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ProjectSchema.array().parse(data ?? []);
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const payload = CreateProjectDto.parse(input);
  const client = await supabaseServer();

  const { data, error } = await client
    .from("projects")
    .insert(payload)
    .select(projectSelect)
    .single();

  if (error) {
    throw error;
  }

  return ProjectSchema.parse(data);
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const payload = UpdateProjectDto.parse({ ...input, id });
  const { id: _id, ...updates } = payload;
  void _id;
  const client = await supabaseServer();

  const { data, error } = await client
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select(projectSelect)
    .single();

  if (error) {
    throw error;
  }

  return ProjectSchema.parse(data);
}

export async function deleteProject(id: string): Promise<void> {
  const client = await supabaseServer();
  const { error } = await client.from("projects").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
