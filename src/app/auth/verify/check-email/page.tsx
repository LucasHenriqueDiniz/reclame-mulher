"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layout/AuthLayout";
import { GlassCard } from "@/components/GlassCard";

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-md p-6 sm:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-[#3BA5FF]" />
            </div>

            <h1 className="text-3xl font-extrabold text-[#2A1B55] mb-4">
              Cadastro concluído!
            </h1>

            {email && (
              <p className="font-medium text-[#3BA5FF] mb-6 break-all">{email}</p>
            )}

            <Button onClick={() => router.push("/onboarding/person/step2")} className="w-full">
              Continuar cadastro
            </Button>
          </div>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <CheckEmailContent />
    </Suspense>
  );
}
