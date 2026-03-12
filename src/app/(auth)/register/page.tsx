"use client";
import { RoleCard } from "@/components/RoleCard";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-people.jpg')" }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A1B55]/90 via-[#2A1B55]/75 to-[#1a1038]/95" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#3BA5FF] font-semibold text-sm uppercase tracking-widest mb-3">
            Bem-vinda à ComunicaMulher
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            Como você vai usar
            <br />
            <span className="text-[#3BA5FF]">a plataforma?</span>
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-md mx-auto">
            Selecione o perfil que melhor descreve você para criarmos a experiência certa.
          </p>
        </div>

        {/* Cards */}
        <div className="grid w-full gap-6 sm:grid-cols-2">
          <RoleCard
            type="person"
            title="Sou uma Pessoa"
            desc="Para mulheres impactadas por obras de infraestrutura que desejam reportar problemas e acompanhar soluções."
            cta="Continuar como Pessoa"
            onClick={() => (location.href = "/onboarding/person/step1")}
          />
          <RoleCard
            type="company"
            title="Sou uma Empresa"
            desc="Para empresas do setor de infraestrutura que desejam responder a reclamações e demonstrar responsabilidade."
            cta="Continuar como Empresa"
            onClick={() => (location.href = "/onboarding/company/step1")}
          />
        </div>

        {/* Footer link */}
        <p className="mt-10 text-center text-white/50 text-sm">
          Já tem uma conta?{" "}
          <a href="/login" className="text-[#3BA5FF] hover:underline font-medium">
            Fazer login
          </a>
        </p>
      </div>
    </div>
  );
}
