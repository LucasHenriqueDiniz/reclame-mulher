"use server";

import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { users, profiles, companies, companyUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { HowHeardType } from "@/lib/constants/how-heard";

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

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const metadata = (user?.metadata ? JSON.parse(user.metadata) : {}) as Record<string, string>;
  const companyName = metadata.company_name ?? null;
  const cnpjRaw = metadata.cnpj ?? null;
  const cnpj = cnpjRaw ? cnpjRaw.replace(/\D/g, "") : null;

  if (cnpj) {
    const existingCompanies = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.cnpj, cnpj))
      .limit(1);

    if (existingCompanies.length > 0) {
      const userCompany = await db
        .select({ companyId: companyUsers.companyId })
        .from(companyUsers)
        .where(eq(companyUsers.userId, session.userId))
        .limit(1);

      const isOwn = userCompany.length > 0 && userCompany[0].companyId === existingCompanies[0].id;
      if (!isOwn) {
        throw new Error("Este CNPJ já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato com o suporte.");
      }
    }
  }

  // Upsert profile first (companyUsers FK references profiles.userId)
  await db
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
        updatedAt: new Date(),
      },
    });

  // Then create company and link it
  const [company] = await db
    .insert(companies)
    .values({
      name: companyName ?? input.contact_name,
      cnpj: cnpj,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      contactName: input.contact_name,
    })
    .returning();

  await db
    .insert(companyUsers)
    .values({
      userId: session.userId,
      companyId: company.id,
      role: "OWNER",
    })
    .onConflictDoNothing();

  return { success: true };
}
