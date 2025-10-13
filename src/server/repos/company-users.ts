import { supabaseServer } from "@/lib/supabase/server";
import {
  AttachCompanyUserDto,
  CompanyUserSchema,
  DetachCompanyUserDto,
  type AttachCompanyUserInput,
  type CompanyUser,
  type DetachCompanyUserInput,
} from "@/server/dto/company-users";

const membershipSelect = `
  company_id,
  user_id,
  role,
  created_at,
  companies:company_id (
    id,
    name,
    slug,
    verified_at
  )
`;

export async function listMembershipsForUser(userId: string): Promise<CompanyUser[]> {
  const client = await supabaseServer();
  const { data, error } = await client
    .from("company_users")
    .select(membershipSelect)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return CompanyUserSchema.array().parse(data ?? []);
}

export async function attachUserToCompany(input: AttachCompanyUserInput): Promise<CompanyUser> {
  const payload = AttachCompanyUserDto.parse(input);
  const client = await supabaseServer();

  const { data, error } = await client
    .from("company_users")
    .upsert(payload, { onConflict: "company_id,user_id" })
    .select(membershipSelect)
    .single();

  if (error) {
    throw error;
  }

  return CompanyUserSchema.parse(data);
}

export async function detachUserFromCompany(input: DetachCompanyUserInput): Promise<void> {
  const payload = DetachCompanyUserDto.parse(input);
  const client = await supabaseServer();
  const { error } = await client
    .from("company_users")
    .delete()
    .match({ company_id: payload.company_id, user_id: payload.user_id });

  if (error) {
    throw error;
  }
}
