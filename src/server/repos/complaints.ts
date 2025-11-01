import { supabaseServer } from "@/lib/supabase/server";
import { CreateComplaintInput, UpdateComplaintInput, UpdateComplaintStatusInput } from "../dto/complaints";

export class ComplaintsRepo {
  static async create(data: CreateComplaintInput, userId: string) {
    const supabase = await supabaseServer();

    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert({
        ...data,
        author_id: userId,
        status: "OPEN",
      })
      .select()
      .single();

    if (error) throw error;
    return complaint;
  }

  static async findById(id: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        author:profiles(name),
        company:companies(name),
        project:projects(name)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUser(userId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        company:companies(name),
        project:projects(name)
      `)
      .eq("author_id", userId);

    if (error) throw error;
    return data;
  }

  static async findByCompany(companyId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        author:profiles(name),
        project:projects(name)
      `)
      .eq("company_id", companyId);

    if (error) throw error;
    return data;
  }

  static async findPublic(companyId?: string) {
    const supabase = await supabaseServer();

    let query = supabase
      .from("complaints")
      .select(`
        *,
        company:companies(name),
        project:projects(name)
      `)
      .eq("is_public", true);

    if (companyId) {
      query = query.eq("company_id", companyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async update(id: string, data: UpdateComplaintInput) {
    const supabase = await supabaseServer();

    const { data: complaint, error } = await supabase
      .from("complaints")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return complaint;
  }

  static async updateStatus(id: string, data: UpdateComplaintStatusInput) {
    const supabase = await supabaseServer();

    const { data: complaint, error } = await supabase
      .from("complaints")
      .update({ status: data.status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return complaint;
  }

  static async delete(id: string) {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("complaints")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
