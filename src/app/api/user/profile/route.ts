import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { ProfilesRepo } from "@/server/repos/profiles";
import { erroInterno, invalido, naoAutenticada } from "@/server/http/respond";

const UpdateProfileDto = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return naoAutenticada();
    }

    const body = await request.json().catch(() => ({}));
    const parsed = UpdateProfileDto.parse(body);

    const updated = await ProfilesRepo.update(session.userId, parsed);

    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return invalido(error);
    }
    return erroInterno(error, "user/profile");
  }
}
