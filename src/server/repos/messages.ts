import { supabaseServer } from "@/lib/supabase/server";
import { CreateMessageInput } from "../dto/messages";

export class MessagesRepo {
  static async create(data: CreateMessageInput, userId: string) {
    const supabase = await supabaseServer();

    const { data: message, error } = await supabase
      .from("complaint_messages")
      .insert({
        ...data,
        author_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  }

  static async findByComplaint(complaintId: string) {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("complaint_messages")
      .select(`
        *,
        author:profiles(name)
      `)
      .eq("complaint_id", complaintId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }
}
