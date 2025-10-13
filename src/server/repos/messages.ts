import { supabaseServer } from "@/lib/supabase/server";
import {
  ComplaintMessageSchema,
  CreateComplaintMessageDto,
  type ComplaintMessage,
  type CreateComplaintMessageInput,
} from "@/server/dto/messages";

const messageSelect = `
  id,
  complaint_id,
  author_user_id,
  content,
  attachment_path,
  created_at,
  author:author_user_id (
    id,
    name,
    role
  )
`;

export async function listComplaintMessages(complaintId: string): Promise<ComplaintMessage[]> {
  const client = await supabaseServer();
  const { data, error } = await client
    .from("complaint_messages")
    .select(messageSelect)
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return ComplaintMessageSchema.array().parse(data ?? []);
}

export async function createComplaintMessage(
  authorUserId: string,
  input: CreateComplaintMessageInput
): Promise<ComplaintMessage> {
  const payload = CreateComplaintMessageDto.parse(input);
  const client = await supabaseServer();

  const insertPayload = {
    ...payload,
    author_user_id: authorUserId,
  };

  const { data, error } = await client
    .from("complaint_messages")
    .insert(insertPayload)
    .select(messageSelect)
    .single();

  if (error) {
    throw error;
  }

  return ComplaintMessageSchema.parse(data);
}
