"use client";
import { RoleCard } from "@/components/RoleCard";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen">
      {/* Imagem de fundo em toda a tela */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/bg-people.jpg')",
        }}
      ></div>
      
      {/* Overlay roxo para contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/80 via-purple-primary/70 to-purple-darker/90"></div>

      {/* Conteúdo */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white text-center">
            Você é?
          </h1>
          <p className="mt-2 text-white/80 text-center">
            Selecione o tipo de perfil que deseja criar
          </p>

          <div className="mt-10 grid w-full gap-6 sm:grid-cols-2 sm:place-items-stretch">
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
      </div>
    </div>
  );
}
