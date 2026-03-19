"use client";

import { Building2, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#130b2b] via-[#2A1B55] to-[#1b1040]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-[0.12]"
        style={{ backgroundImage: "url('/images/bg-people.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#130b2b]/92 via-[#2A1B55]/86 to-[#1b1040]/92"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-[rgba(59,165,255,0.12)] blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-150px] bottom-[-120px] h-[520px] w-[520px] rounded-full bg-[rgba(168,85,247,0.14)] blur-[100px]"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1180px] text-center text-white">
          <div className="mx-auto mb-6 text-[24px] font-bold tracking-[-0.02em] sm:mb-8 sm:text-[26px]">
            <span className="text-white">Comunica</span>
            <span className="text-[#3BA5FF]">Mulher</span>
          </div>

          <h1 className="text-[30px] font-bold tracking-[-0.03em] sm:text-[38px] lg:text-[44px]">
            Como você vai usar a plataforma?
          </h1>

          <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-[1.75] text-white/60 sm:text-[17px]">
            Escolha o perfil ideal para criar sua conta e continuar o cadastro.
          </p>

          <div className="mt-10 grid items-stretch gap-6 sm:mt-12 lg:grid-cols-2 lg:gap-8">
            <Link
              href="/onboarding/person/step1"
              className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.08] p-8 text-left text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#3BA5FF]/30 hover:bg-white/[0.11] sm:min-h-[460px] sm:p-10 lg:min-h-[500px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,165,255,0.16),transparent_38%)] opacity-80" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative z-10">
                <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[12px] font-medium tracking-[0.02em] text-white/70">
                  Perfil
                </span>

                <div className="mt-6 flex h-18 w-18 items-center justify-center rounded-[20px] border border-[#3BA5FF]/20 bg-[rgba(59,165,255,0.16)] text-[#3BA5FF] shadow-[0_14px_34px_rgba(59,165,255,0.18)] sm:h-20 sm:w-20">
                  <Users className="h-8 w-8 sm:h-9 sm:w-9" />
                </div>

                <h2 className="mt-8 text-[26px] font-bold tracking-[-0.03em] text-white sm:text-[30px]">
                  Pessoa
                </h2>

                <p className="mt-4 max-w-[34ch] text-[15px] leading-[1.85] text-white/62 sm:text-[16px]">
                  Para mulheres que desejam registrar problemas, acompanhar o andamento
                  das solicitações e buscar soluções com mais transparência.
                </p>
              </div>

              <div className="relative z-10 mt-auto pt-10">
                <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#3BA5FF] transition-all duration-300 group-hover:gap-3">
                  Continuar como pessoa
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>

            <Link
              href="/onboarding/company/step1"
              className="group relative flex min-h-[400px] flex-col overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.08] p-8 text-left text-white shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c084fc]/30 hover:bg-white/[0.11] sm:min-h-[460px] sm:p-10 lg:min-h-[500px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(192,132,252,0.18),transparent_38%)] opacity-80" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative z-10">
                <span className="inline-flex rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[12px] font-medium tracking-[0.02em] text-white/70">
                  Perfil
                </span>

                <div className="mt-6 flex h-18 w-18 items-center justify-center rounded-[20px] border border-[#c084fc]/20 bg-[rgba(168,85,247,0.16)] text-[#c084fc] shadow-[0_14px_34px_rgba(192,132,252,0.18)] sm:h-20 sm:w-20">
                  <Building2 className="h-8 w-8 sm:h-9 sm:w-9" />
                </div>

                <h2 className="mt-8 text-[26px] font-bold tracking-[-0.03em] text-white sm:text-[30px]">
                  Empresa
                </h2>

                <p className="mt-4 max-w-[36ch] text-[15px] leading-[1.85] text-white/62 sm:text-[16px]">
                  Para empresas que desejam responder às reclamações, acompanhar demandas
                  e fortalecer o relacionamento com suas clientes.
                </p>
              </div>

              <div className="relative z-10 mt-auto pt-10">
                <div className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#c084fc] transition-all duration-300 group-hover:gap-3">
                  Continuar como empresa
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>

          <p className="mt-8 text-[14px] text-white/40 sm:mt-10">
            Já tem conta?{" "}
            <Link href="/login" className="font-medium text-[#3BA5FF] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}