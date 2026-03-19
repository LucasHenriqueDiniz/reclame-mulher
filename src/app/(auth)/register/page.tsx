"use client";
import { Building2, UserRound } from "lucide-react";
import Link from "next/link";

const PROFILE_CARDS = [
  {
    key: "person",
    title: "Pessoa",
    description: "Para mulheres que desejam registrar problemas e acompanhar soluções.",
    cta: "Continuar",
    topColor: "#1e3a5f",
    ctaBg: "#3BA5FF",
    Icon: UserRound,
  },
  {
    key: "company",
    title: "Empresa",
    description: "Para empresas que desejam responder às reclamações e acompanhar as demandas.",
    cta: "Continuar",
    topColor: "#2d1b5e",
    ctaBg: "#2A1B55",
    Icon: Building2,
  },
] as const;

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
        className="pointer-events-none absolute right-[-150px] bottom-[-120px] h-[520px] w-[520px] rounded-full bg-[rgba(168,85,247,0.14)] blur-[80px]"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[920px] text-center text-white">
          <div className="mx-auto mb-6 text-[22px] font-bold tracking-[-0.02em] sm:mb-8">
            <span className="text-white">Comunica</span>
            <span className="text-[#3BA5FF]">Mulher</span>
          </div>

          <h1 className="text-[26px] font-bold tracking-[-0.025em] sm:text-[30px]">
            Como você vai usar a plataforma?
          </h1>
          <p className="mx-auto mt-2 max-w-[380px] text-[15px] leading-[1.65] text-white/52">
            Escolha o perfil para criar sua conta.
          </p>

          <div className="mx-auto mt-8 grid w-full max-w-[480px] gap-4 sm:grid-cols-2 sm:gap-4 max-[499px]:max-w-[320px] max-[499px]:grid-cols-1">
            {PROFILE_CARDS.map(({ key, title, description, cta, topColor, ctaBg, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => (location.href = key === "person" ? "/onboarding/person/step1" : "/onboarding/company/step1")}
                className="group relative flex min-h-[280px] cursor-pointer flex-col overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.10)] bg-transparent text-left shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-[220ms] hover:-translate-y-[5px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] focus:outline-none"
              >
                <div
                  className="relative flex h-[120px] items-center justify-center overflow-hidden"
                  style={{ backgroundColor: topColor, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                >
                  <div className="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white/8" />
                  <div className="absolute left-1/2 top-1/2 h-[60px] w-[60px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white/8" />
                  <Icon className="relative z-10 h-12 w-12 text-white opacity-90" />
                </div>

                <div className="flex flex-1 flex-col bg-white px-[22px] pb-[26px] pt-[22px]">
                  <h2 className="mb-1.5 text-[19px] font-bold tracking-[-0.02em] text-[#150d35]">
                    {title}
                  </h2>
                  <p className="mb-5 text-[13px] leading-[1.6] text-[#9688bb]">
                    {description}
                  </p>
                  <span
                    className="mt-auto flex h-10 w-full items-center justify-center rounded-[8px] text-[13.5px] font-semibold text-white transition-all duration-200 group-hover:-translate-y-px group-hover:brightness-95"
                    style={{ backgroundColor: ctaBg }}
                  >
                    {cta}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="mt-7 text-[14px] text-[rgba(255,255,255,0.36)]">
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
