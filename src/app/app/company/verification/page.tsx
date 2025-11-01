"use client";
import { GlassCard } from "@/components/GlassCard";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

export default function CompanyVerificationPage() {
  return (
    <AuthLayout>
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-2xl p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-orange-100 p-4">
              <Clock className="h-16 w-16 text-[#FF6A2A]" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2A1B55] mb-4">
            Cadastro em análise
          </h1>

          <p className="text-lg text-neutral-600 mb-8">
            Obrigado por se cadastrar! Seu cadastro de empresa está sendo analisado
            por nossa equipe.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-[#2A1B55] mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#3BA5FF]" />
              Próximos passos:
            </h2>
            <ul className="space-y-2 text-neutral-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#3BA5FF] font-bold">1.</span>
                <span>
                  Nossa equipe irá verificar os dados da sua empresa (pode levar até
                  48 horas úteis)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3BA5FF] font-bold">2.</span>
                <span>
                  Você receberá um email de confirmação assim que sua conta for
                  aprovada
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#3BA5FF] font-bold">3.</span>
                <span>
                  Após a aprovação, você poderá acessar todas as funcionalidades da
                  plataforma
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => (location.href = "/app")}
              className="w-full bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white"
            >
              Ir para o painel
            </Button>
            <Button
              variant="outline"
              onClick={() => (location.href = "/login")}
              className="w-full"
            >
              Voltar ao login
            </Button>
          </div>

          <p className="text-sm text-neutral-500 mt-8">
            Precisa de ajuda?{" "}
            <a
              href="mailto:suporte@reclame-mulher.com.br"
              className="text-[#3BA5FF] hover:underline"
            >
              Entre em contato
            </a>
          </p>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}



