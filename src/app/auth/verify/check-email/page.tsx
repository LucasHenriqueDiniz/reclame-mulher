"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/layout/AuthLayout";
import { GlassCard } from "@/components/GlassCard";

function CheckEmailContent() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleResend = async () => {
    if (!email) return;
    
    setIsResending(true);
    setResendSuccess(false);
    
    try {
      const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify?type=confirm&next=/onboarding/person/step2`,
        },
      });

      if (error) {
        console.error("Error resending email:", error);
      } else {
        setResendSuccess(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-md p-6 sm:p-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-[#3BA5FF]" />
            </div>

            <h1 className="text-3xl font-extrabold text-[#2A1B55] mb-4">
              Verifique seu e-mail
            </h1>

            <p className="text-neutral-600 mb-6">
              Enviamos um link de confirmação para:
            </p>

            {email && (
              <p className="font-medium text-[#3BA5FF] mb-6 break-all">
                {email}
              </p>
            )}

            <div className="space-y-4 text-left bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-neutral-700">
                <strong>Próximos passos:</strong>
              </p>
              <ol className="text-sm text-neutral-600 space-y-2 list-decimal list-inside">
                <li>Abra sua caixa de entrada</li>
                <li>Clique no link de confirmação no e-mail</li>
                <li>Você será redirecionado para continuar seu cadastro</li>
              </ol>
            </div>

            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                E-mail reenviado com sucesso! Verifique sua caixa de entrada.
              </div>
            )}

            {email && (
              <Button
                onClick={handleResend}
                disabled={isResending}
                variant="outline"
                className="w-full mb-4"
              >
                {isResending ? "Reenviando..." : "Reenviar e-mail"}
              </Button>
            )}

            <div className="pt-4 border-t border-neutral-200">
              <Button
                onClick={() => router.push("/login")}
                variant="ghost"
                className="w-full"
              >
                Já confirmou? Fazer login
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="flex justify-center">
          <GlassCard className="w-full max-w-md p-6 sm:p-10">
            <div className="text-center">
              <div className="animate-pulse space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full" />
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          </GlassCard>
        </div>
      </AuthLayout>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}