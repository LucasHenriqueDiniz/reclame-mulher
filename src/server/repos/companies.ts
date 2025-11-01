import { supabaseServer } from "@/lib/supabase/server";
import { CreateCompanyInput, UpdateCompanyInput } from "../dto/companies";

export class CompaniesRepo {
  static async create(data: CreateCompanyInput) {
    const supabase = await supabaseServer();

    const { data: company, error } = await supabase
      .rpc("create_company_self", {
        p_company_name: data.name,
        p_cnpj: data.cnpj ?? null,
        p_contact_name: data.responsible_name,
        p_phone: data.contact_phone ?? null,
        p_email: data.responsible_email,
        p_sector: data.sector ?? null,
        p_website: data.website ?? null,
        p_slug: data.slug ?? null,
      });

    if (error) throw error;
    return company;
  }

  static async findById(id: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async findBySlug(slug: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  }

  static async findPublic(search?: string, verified?: boolean) {
    const supabase = await supabaseServer();

    let query = supabase
      .from("companies")
      .select("*")
      .eq("verified", verified ?? true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,corporate_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async update(id: string, data: UpdateCompanyInput) {
    const supabase = await supabaseServer();

    const { data: company, error } = await supabase
      .from("companies")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return company;
  }

  static async verify(id: string, verified: boolean) {
    const supabase = await supabaseServer();

    const updateData = verified
      ? { verified_at: new Date().toISOString() }
      : { verified_at: null };

    const { data, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUser(userId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("company_users")
      .select(`
        role,
        companies (*)
      `)
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  }
}
