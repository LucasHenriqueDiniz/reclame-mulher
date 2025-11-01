import { supabaseServer } from "@/lib/supabase/server";
import { CreateProjectInput, UpdateProjectInput } from "../dto/projects";

export class ProjectsRepo {
  static async create(data: CreateProjectInput) {
    const supabase = await supabaseServer();

    const { data: project, error } = await supabase
      .from("projects")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  static async findById(id: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async findByCompany(companyId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("company_id", companyId);

    if (error) throw error;
    return data;
  }

  static async update(id: string, data: UpdateProjectInput) {
    const supabase = await supabaseServer();

    const { data: project, error } = await supabase
      .from("projects")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return project;
  }

  static async delete(id: string) {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
