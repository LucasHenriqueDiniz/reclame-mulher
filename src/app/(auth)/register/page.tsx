"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para a página de escolha de perfil
    router.replace("/onboarding/role");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-600">Redirecionando...</p>
    </div>
  );
}
