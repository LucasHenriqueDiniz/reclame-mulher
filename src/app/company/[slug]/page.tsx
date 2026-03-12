import { Suspense } from "react";
import { getSession } from "@/lib/auth/session";
import { CompanyProfileContent } from "./_components/company-profile-content";

interface CompanyProfilePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function CompanyProfilePage({
  params,
  searchParams,
}: CompanyProfilePageProps) {
  const { slug } = await params;
  const { tab = "overview" } = await searchParams;

  const session = await getSession();
  const isCompanyMember = false;
  const isCompanyAdmin = false;

  void session;

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <CompanyProfileContent
          slug={slug}
          tab={tab}
          isCompanyMember={isCompanyMember}
          isCompanyAdmin={isCompanyAdmin}
        />
      </Suspense>
    </div>
  );
}
