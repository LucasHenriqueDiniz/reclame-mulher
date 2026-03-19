import { redirect } from "next/navigation";

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; verified?: string; category?: string }>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams(params as Record<string, string>).toString();
  redirect(`/companies${queryString ? `?${queryString}` : ""}`);
}
