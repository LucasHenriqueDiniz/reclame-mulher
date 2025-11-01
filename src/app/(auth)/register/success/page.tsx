"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Mail, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RegisterSuccessPage() {
  const t = useTranslations("auth.register");

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Conta criada com sucesso! 🎉</h1>
          <p className="text-lg text-muted-foreground">Estamos quase lá...</p>
        </div>

        <div className="rounded-lg border bg-blue-50 p-6 text-left">
          <div className="flex gap-3">
            <Mail className="h-6 w-6 flex-shrink-0 text-blue-600" />
            <div className="space-y-2">
              <h2 className="font-semibold text-blue-900">Verifique seu e-mail</h2>
              <p className="text-sm text-blue-800">
                Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua
                conta e começar a usar o Reclame Mulher.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            Não recebeu o e-mail? Verifique sua caixa de spam ou lixo eletrônico.
          </p>

          <Button asChild className="w-full">
            <Link href="/login">Voltar para o login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}



