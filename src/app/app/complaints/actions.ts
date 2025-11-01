"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { ComplaintsRepo } from "@/server/repos/complaints";
import type { CreateComplaintInput } from "@/server/dto/complaints";

export async function createComplaint(input: CreateComplaintInput) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("unauthorized");
  }

  return ComplaintsRepo.create(input, user.id);
}
