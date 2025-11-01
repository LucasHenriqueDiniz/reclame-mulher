import { supabaseServer } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-heading text-3xl mb-6">Configurações</h1>

      <div className="space-y-4 max-w-2xl">
        <div className="p-4 border rounded">
          <h2 className="font-heading text-xl mb-2">Perfil</h2>
          <p className="text-sm text-gray-600 mb-4">
            Edite seu nome, avatar, locale
          </p>
          <Link href="/app/settings">
            <Button>Editar Perfil</Button>
          </Link>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-heading text-xl mb-2">Segurança</h2>
          <p className="text-sm text-gray-600 mb-4">
            Senha, privacidade
          </p>
          <Link href="/app/settings/security">
            <Button variant="outline">Configurar Segurança</Button>
          </Link>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-heading text-xl mb-2">Conta</h2>
          <p className="text-sm text-gray-600 mb-4">
            Deletar conta
          </p>
          <Link href="/app/settings/account">
            <Button variant="outline">Gerenciar Conta</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

