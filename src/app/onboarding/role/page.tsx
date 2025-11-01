"use client";
import AuthLayout from "@/components/layout/AuthLayout";
import { RoleCard } from "@/components/RoleCard";

export default function RolePage() {
  return (
    <AuthLayout>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center">
          Você é?
        </h1>
        <p className="mt-2 text-white/80 text-center">
          Selecione o tipo de perfil que deseja criar
        </p>

        <div className="mt-10 grid w-full gap-6 sm:grid-cols-2 place-items-center">
          <RoleCard
            type="person"
            title="Sou uma Pessoa"
            desc="Para mulheres impactadas por obras de infraestrutura que desejam reportar problemas e acompanhar soluções"
            cta="Continuar como Pessoa"
            onClick={() => (location.href = "/onboarding/person/step1")}
          />
          <RoleCard
            type="company"
            title="Sou uma Empresa"
            desc="Para empresas que desejam responder a reclamações e acompanhar soluções"
            cta="Continuar como Empresa"
            onClick={() => (location.href = "/onboarding/company/step1")}
          />
        </div>
      </div>
    </AuthLayout>
  );
}



