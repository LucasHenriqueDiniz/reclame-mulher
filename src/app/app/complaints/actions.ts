"use server";

import { getSession } from "@/lib/auth/session";
import { ComplaintsRepo } from "@/server/repos/complaints";
import type { CreateComplaintInput } from "@/server/dto/complaints";

export async function createComplaint(input: CreateComplaintInput) {
  const session = await getSession();

  if (!session) {
    throw new Error("unauthorized");
  }

  return ComplaintsRepo.create(input, session.userId);
}
