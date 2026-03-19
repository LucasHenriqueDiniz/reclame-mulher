"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import type { HowHeardType } from "@/lib/constants/how-heard";

export async function updateProfilePerson(input: {
  cpf?: string | null;
  phone?: string | null;
  address: string;
  city: string;
  state: string;
  how_heard?: string | null;
  how_heard_other?: string | null;
  accepted_terms?: boolean;
  locale?: string;
}) {
  const session = await getSession();

  if (!session) {
    throw new Error("unauthenticated");
  }

  const cpfNormalized = input.cpf && input.cpf.trim()
    ? input.cpf.trim().replace(/\D/g, "")
    : null;

  if (cpfNormalized) {
    const existing = await db
      .select({ userId: profiles.userId })
      .from(profiles)
      .where(and(eq(profiles.cpf, cpfNormalized), ne(profiles.userId, session.userId)))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("Este CPF já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
    }
  }

  const howHeardOtherValue =
    input.how_heard === "OUTRO" && input.how_heard_other
      ? input.how_heard_other.trim()
      : null;

  const howHeard = (input.how_heard || null) as HowHeardType | null;

  await db
    .insert(profiles)
    .values({
      userId: session.userId,
      email: session.email,
      cpf: cpfNormalized,
      phone: input.phone?.trim() || null,
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      howHeard,
      howHeardOther: howHeardOtherValue,
      acceptedTermsAt: input.accepted_terms ? new Date() : null,
      onboardingCompletedAt: new Date(),
      locale: input.locale || "pt-BR",
      role: "USER",
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        cpf: cpfNormalized,
        phone: input.phone?.trim() || null,
        address: input.address.trim(),
        city: input.city.trim(),
        state: input.state.trim(),
        howHeard,
        howHeardOther: howHeardOtherValue,
        acceptedTermsAt: input.accepted_terms ? new Date() : null,
        onboardingCompletedAt: new Date(),
        locale: input.locale || "pt-BR",
        updatedAt: new Date(),
      },
    });

  return { success: true };
}
