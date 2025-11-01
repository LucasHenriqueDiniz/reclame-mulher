"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountSettingsPage() {
  const handleDeleteAccount = () => {
    // TODO: [API: DELETE /api/user/account]
    alert("Exclusão de conta será implementada");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/app/settings">
          <Button variant="ghost" size="sm">← Voltar</Button>
        </Link>
        <h1 className="font-heading text-3xl mt-4 mb-2">Conta</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4 text-red-600">
            Zona de Perigo
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Ao deletar sua conta, todos os seus dados serão permanentemente
            removidos. Esta ação não pode ser desfeita.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Deletar Conta</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso irá deletar
                  permanentemente sua conta e todos os seus dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <p className="text-sm text-gray-500 mt-4">
            [API: DELETE /api/user/account]
          </p>
        </section>
      </div>
    </div>
  );
}

