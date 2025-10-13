import { supabaseServer } from "@/lib/supabase/server";
import {
  ComplaintSchema,
  CreateComplaintDto,
  ListComplaintsDto,
  UpdateComplaintDto,
  UpdateComplaintStatusDto,
  type Complaint,
  type CreateComplaintInput,
  type ListComplaintsInput,
  type UpdateComplaintInput,
  type UpdateComplaintStatusInput,
} from "@/server/dto/complaints";

const complaintSelect = `
  id,
  company_id,
  project_id,
  author_user_id,
  title,
  description,
  occurred_at,
  expected_solution,
  is_public,
  is_anonymous,
  status,
  created_at,
  updated_at,
  company:company_id (
    id,
    name,
    slug
  )
`;

const allowedTransitions: Record<string, string[]> = {
  OPEN: ["RESPONDED", "CANCELLED"],
  RESPONDED: ["RESOLVED", "CANCELLED", "OPEN"],
  RESOLVED: [],
  CANCELLED: [],
};

function toDateTimeString(value?: Date | null) {
  return value ? value.toISOString() : null;
}

export async function listComplaintsForUser(
  userId: string,
  filters: ListComplaintsInput = {}
): Promise<Complaint[]> {
  const parsed = ListComplaintsDto.parse(filters);
  const client = await supabaseServer();

  let query = client
    .from("complaints")
    .select(complaintSelect)
    .eq("author_user_id", userId)
    .order("created_at", { ascending: false });

  if (parsed.status) {
    query = query.eq("status", parsed.status);
  }

  if (parsed.search) {
    query = query.ilike("title", `%${parsed.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ComplaintSchema.array().parse(data ?? []);
}

export async function listComplaintsForCompany(
  companyId: string,
  filters: ListComplaintsInput = {}
): Promise<Complaint[]> {
  const parsed = ListComplaintsDto.parse(filters);
  const client = await supabaseServer();

  let query = client
    .from("complaints")
    .select(complaintSelect)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (parsed.status) {
    query = query.eq("status", parsed.status);
  }

  if (parsed.search) {
    query = query.ilike("title", `%${parsed.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ComplaintSchema.array().parse(data ?? []);
}

export async function listPublicComplaints(
  companyId?: string,
  filters: ListComplaintsInput = {}
): Promise<Complaint[]> {
  const parsed = ListComplaintsDto.parse(filters);
  const client = await supabaseServer();

  let query = client
    .from("complaints")
    .select(complaintSelect)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (companyId) {
    query = query.eq("company_id", companyId);
  }

  if (parsed.status) {
    query = query.eq("status", parsed.status);
  }

  if (parsed.search) {
    query = query.ilike("title", `%${parsed.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ComplaintSchema.array().parse(data ?? []);
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  const client = await supabaseServer();
  const { data, error } = await client
    .from("complaints")
    .select(complaintSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? ComplaintSchema.parse(data) : null;
}

export async function createComplaint(
  authorUserId: string,
  input: CreateComplaintInput
): Promise<Complaint> {
  const payload = CreateComplaintDto.parse(input);
  const client = await supabaseServer();

  const insertPayload = {
    ...payload,
    occurred_at: toDateTimeString(payload.occurred_at ?? null),
    project_id: payload.project_id ?? null,
    author_user_id: authorUserId,
  };

  const { data, error } = await client
    .from("complaints")
    .insert(insertPayload)
    .select(complaintSelect)
    .single();

  if (error) {
    throw error;
  }

  return ComplaintSchema.parse(data);
}

export async function updateComplaint(
  id: string,
  input: UpdateComplaintInput
): Promise<Complaint> {
  const payload = UpdateComplaintDto.parse({ ...input, id });
  const { id: _id, occurred_at, project_id, ...rest } = payload;
  void _id;
  const client = await supabaseServer();

  const updates = {
    ...rest,
    project_id: project_id ?? null,
    occurred_at: toDateTimeString(occurred_at ?? null),
  };

  const { data, error } = await client
    .from("complaints")
    .update(updates)
    .eq("id", id)
    .select(complaintSelect)
    .single();

  if (error) {
    throw error;
  }

  return ComplaintSchema.parse(data);
}

export async function updateComplaintStatus(
  id: string,
  input: UpdateComplaintStatusInput
): Promise<Complaint> {
  const payload = UpdateComplaintStatusDto.parse(input);
  const client = await supabaseServer();

  const { data: current, error: fetchError } = await client
    .from("complaints")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const allowedNextStatuses = allowedTransitions[current.status] ?? [];
  if (!allowedNextStatuses.includes(payload.status)) {
    throw new Error(`Invalid status transition from ${current.status} to ${payload.status}`);
  }

  const { data, error } = await client
    .from("complaints")
    .update({ status: payload.status })
    .eq("id", id)
    .select(complaintSelect)
    .single();

  if (error) {
    throw error;
  }

  return ComplaintSchema.parse(data);
}
