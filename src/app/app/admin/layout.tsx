import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // TODO: Verificar se o usuário é admin
  // const { data: profile } = await supabase...
  // if (profile?.role !== 'admin') { redirect("/app"); }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded">
        <h2 className="font-heading text-lg mb-1">Área Administrativa</h2>
        <p className="text-sm text-purple-700">
          Esta área é restrita a administradores
        </p>
      </div>
      {children}
    </div>
  );
}

