import { supabaseServer } from "@/lib/supabase/server";
import { CreateCompanyUserInput } from "../dto/company-users";

export class CompanyUsersRepo {
  static async create(data: CreateCompanyUserInput) {
    const supabase = await supabaseServer();

    const { data: companyUser, error } = await supabase
      .from("company_users")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return companyUser;
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

  static async findByCompany(companyId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("company_users")
      .select(`
        role,
        profiles (name, email)
      `)
      .eq("company_id", companyId);

    if (error) throw error;
    return data;
  }

  static async delete(userId: string, companyId: string) {
    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("company_users")
      .delete()
      .eq("user_id", userId)
      .eq("company_id", companyId);

    if (error) throw error;
  }
}
