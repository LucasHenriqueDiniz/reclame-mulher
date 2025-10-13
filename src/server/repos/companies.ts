import { supabaseServer } from "@/lib/supabase/server";
import {
  CompanySchema,
  CreateCompanyDto,
  ListCompaniesDto,
  UpdateCompanyDto,
  VerifyCompanyDto,
  type Company,
  type CreateCompanyInput,
  type ListCompaniesInput,
  type UpdateCompanyInput,
  type VerifyCompanyInput,
} from "@/server/dto/companies";

const baseCompanySelect = `
  id,
  name,
  slug,
  description,
  logo_url,
  website_url,
  cnpj,
  phone,
  email,
  state,
  city,
  verified_at,
  created_at,
  updated_at
`;

export async function listCompanies(params: ListCompaniesInput = {}): Promise<Company[]> {
  const filters = ListCompaniesDto.parse(params);
  const client = await supabaseServer();

  let query = client.from("companies").select(baseCompanySelect).order("name", { ascending: true });

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (typeof filters.verified === "boolean") {
    query = filters.verified
      ? query.not("verified_at", "is", null)
      : query.is("verified_at", null);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return CompanySchema.array().parse(data ?? []);
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const client = await supabaseServer();
  const { data, error } = await client
    .from("companies")
    .select(baseCompanySelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? CompanySchema.parse(data) : null;
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const client = await supabaseServer();
  const { data, error } = await client
    .from("companies")
    .select(baseCompanySelect)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? CompanySchema.parse(data) : null;
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const payload = CreateCompanyDto.parse(input);
  const client = await supabaseServer();

  const { data, error } = await client
    .from("companies")
    .insert({ ...payload })
    .select(baseCompanySelect)
    .single();

  if (error) {
    throw error;
  }

  return CompanySchema.parse(data);
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<Company> {
  const payload = UpdateCompanyDto.parse(input);
  const client = await supabaseServer();

  const { data, error } = await client
    .from("companies")
    .update({ ...payload })
    .eq("id", id)
    .select(baseCompanySelect)
    .single();

  if (error) {
    throw error;
  }

  return CompanySchema.parse(data);
}

export async function verifyCompany(id: string, input: VerifyCompanyInput): Promise<Company> {
  const payload = VerifyCompanyDto.parse(input);
  const client = await supabaseServer();

  const updates: Record<string, unknown> = {
    verified_at: payload.verified ? new Date().toISOString() : null,
  };

  const { data, error } = await client
    .from("companies")
    .update(updates)
    .eq("id", id)
    .select(baseCompanySelect)
    .single();

  if (error) {
    throw error;
  }

  return CompanySchema.parse(data);
}
