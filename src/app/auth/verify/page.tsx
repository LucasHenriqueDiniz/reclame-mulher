"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.verify");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const type = searchParams.get("type");
        const next = searchParams.get("next");
        
        // Se veio do link de confirmação, processa o hash
        if (type === "confirm") {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { data, error: sessionError } = await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }

            if (data.session) {
              // Redireciona imediatamente para continuar onboarding ou app
              router.push(next || "/onboarding/person/step2");
              return;
            }
          }
        }

        // Verifica se já tem sessão ativa
        const { data, error: authError } = await supabaseClient.auth.getSession();

        if (authError) {
          throw authError;
        }

        if (data.session) {
          // Redireciona imediatamente para continuar onboarding ou app
          router.push(next || "/app");
        } else {
          // Sem sessão - mostra mensagem para verificar email
          setStatus("loading");
          setError("Por favor, verifique seu email e clique no link de confirmação.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Erro ao verificar email");
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t("loading.title")}</h1>
              <p className="text-muted-foreground">{t("loading.subtitle")}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-600">{t("success.title")}</h1>
              <p className="text-muted-foreground">{t("success.subtitle")}</p>
            </div>
            <Button onClick={() => router.push("/app")} className="w-full">
              {t("success.cta")}
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-destructive">{t("error.title")}</h1>
              <p className="text-muted-foreground">{t("error.subtitle")}</p>
              {error && (
                <p className="text-sm text-muted-foreground">
                  {t("error.details")}: {error}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/login")} variant="outline" className="w-full">
                {t("error.ctaLogin")}
              </Button>
              <Button onClick={() => router.push("/register")} className="w-full">
                {t("error.ctaRegister")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}