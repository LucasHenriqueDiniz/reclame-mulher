"use client";

import { Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";
import { ContentCard } from "@/components/app/ContentCard";
import Link from "next/link";

export default function CompanyVerificationPage() {
  return (
    <CompanyPageShell>
      <CompanyPageHeader
        title="Verificação"
        subtitle="Acompanhe o status da verificação da sua empresa"
        icon={<Clock className="w-8 h-8" />}
      />

      <ContentCard innerClassName="p-8 sm:p-12 text-center max-w-2xl mx-auto">
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
            <CheckCircle2 className="h-5 w-5 text-[#1976D2]" />
            Próximos passos:
          </h2>
          <ul className="space-y-2 text-neutral-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#1565C0] font-bold">1.</span>
              <span>
                Nossa equipe irá verificar os dados da sua empresa (pode levar até
                48 horas úteis)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1565C0] font-bold">2.</span>
              <span>
                Você receberá um email de confirmação assim que sua conta for
                aprovada
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#1565C0] font-bold">3.</span>
              <span>
                Após a aprovação, você poderá acessar todas as funcionalidades da
                plataforma
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            asChild
            className="w-full bg-[#1976D2] hover:bg-[#2d8ddf] text-white"
          >
            <Link href="/app">
              Ir para o painel
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-full"
          >
            <Link href="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </Link>
          </Button>
        </div>

        {/*
          Aqui havia `mailto:suporte@reclame-mulher.com.br`. O domínio não
          existe — NXDOMAIN em três resolvedores —, então a mensagem não sairia
          do lugar. Ver task `67`.
        */}
        <p className="text-sm text-neutral-500 mt-8">
          Precisa de ajuda? Nesta versão não há canal de atendimento — fale com
          quem administra a plataforma.
        </p>
      </ContentCard>
    </CompanyPageShell>
  );
}
