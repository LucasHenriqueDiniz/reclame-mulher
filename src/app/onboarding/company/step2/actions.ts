"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { users, profiles, companies, companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { HowHeardType } from "@/lib/constants/how-heard";
import { CompaniesRepo } from "@/server/repos/companies";

export async function completeCompanyOnboarding(input: {
  phone: string;
  address: string;
  city: string;
  state: string;
  contact_name: string;
  how_heard?: string | null;
  how_heard_other?: string | null;
}) {
  const session = await getSession();

  if (!session) {
    throw new Error("unauthenticated");
  }

  const howHeardOtherValue =
    input.how_heard === "OUTRO" && input.how_heard_other
      ? input.how_heard_other.trim()
      : null;

  const howHeard = (input.how_heard || null) as HowHeardType | null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  const metadata = (user?.metadata ? JSON.parse(user.metadata) : {}) as Record<string, string>;
  const companyName = metadata.company_name ?? input.contact_name;
  const cnpjRaw = metadata.cnpj ?? null;
  const cnpj = cnpjRaw ? cnpjRaw.replace(/\D/g, "") : null;

  await db.transaction(async (tx) => {
    const [linkedCompany] = await tx
      .select({ companyId: companyUsers.companyId })
      .from(companyUsers)
      .where(eq(companyUsers.userId, session.userId))
      .limit(1);

    let companyId = linkedCompany?.companyId ?? null;
    const slug = await CompaniesRepo.generateUniqueSlug(companyName, companyId ?? undefined);

    if (!companyId && cnpj) {
      const [existingCompany] = await tx
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.cnpj, cnpj))
        .limit(1);

      if (existingCompany) {
        throw new Error("Este CNPJ já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
      }
    }

    await tx
      .insert(profiles)
      .values({
        userId: session.userId,
        email: session.email,
        name: input.contact_name,
        phone: input.phone,
        address: input.address,
        city: input.city,
        state: input.state,
        howHeard,
        howHeardOther: howHeardOtherValue,
        acceptedTermsAt: new Date(),
        onboardingCompletedAt: new Date(),
        locale: "pt-BR",
        role: "COMPANY",
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          name: input.contact_name,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          howHeard,
          howHeardOther: howHeardOtherValue,
          acceptedTermsAt: new Date(),
          onboardingCompletedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    if (companyId) {
      await tx
        .update(companies)
        .set({
          name: companyName,
          cnpj,
          slug,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          contactName: input.contact_name,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, companyId));
    } else {
      const [company] = await tx
        .insert(companies)
        .values({
          name: companyName,
          cnpj,
          slug,
          phone: input.phone,
          address: input.address,
          city: input.city,
          state: input.state,
          contactName: input.contact_name,
        })
        .returning({ id: companies.id });

      companyId = company.id;
    }

    await tx
      .insert(companyUsers)
      .values({
        userId: session.userId,
        companyId,
        role: "OWNER",
      })
      .onConflictDoNothing();
  });

  return { success: true };
}
