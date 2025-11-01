import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase/server";
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
  const supabase = await supabaseServer();

  // Verifica se o usuário é membro/admin da empresa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isCompanyMember = false;
  const isCompanyAdmin = false;

  if (user) {
    // TODO: Verificar se user é membro/admin da empresa
    // const { data: membership } = await supabase...
  }

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

