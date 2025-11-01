import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

interface ComplaintDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({
  params,
}: ComplaintDetailPageProps) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // TODO: Buscar reclamação e verificar se o usuário tem acesso
  // [API: GET /api/complaints/[id]]

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl mb-2">Reclamação #{id}</h1>
        <p className="text-gray-600">
          [API: GET /api/complaints/{id}]
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-heading text-xl mb-4">Detalhes</h2>
          <div className="p-4 border rounded">
            <p>Detalhes da reclamação aparecerão aqui...</p>
            <p className="text-sm text-gray-500 mt-2">
              Thread, anexos, histórico de mensagens
            </p>
          </div>
        </section>

        <section>
          <div className="flex gap-4">
            <Button variant="outline">Voltar</Button>
            <Button>Editar</Button>
            <Button variant="destructive">Excluir</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

