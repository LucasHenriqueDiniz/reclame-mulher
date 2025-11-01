"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { supabaseClient } from "@/lib/supabase/client";
import AuthLayout from "@/components/layout/AuthLayout";
import { GlassCard } from "@/components/GlassCard";
import { PasswordField } from "@/components/PasswordField";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("auth.login");

  const onLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("Login error:", signInError);
        
        // Verifica se é erro de email não confirmado
        if (signInError.message?.includes("email") || signInError.message?.includes("confirm")) {
          setError("Por favor, verifique seu email e confirme sua conta antes de fazer login.");
        } else {
          setError(signInError.message ?? t("error"));
        }
        setIsSubmitting(false);
        return;
      }

      // Verifica se o usuário confirmou o email
      if (data.user && !data.user.email_confirmed_at) {
        setError("Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.");
        setIsSubmitting(false);
        
        // Opcional: reenvia email de confirmação
        await supabaseClient.auth.resend({
          type: "signup",
          email: data.user.email!,
        });
        return;
      }

      if (data.session) {
        console.log("Login successful, redirecting...");
        // Força um refresh da página para atualizar a sessão no server
        window.location.href = "/app";
      } else {
        setError(t("error"));
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError(t("error"));
      setIsSubmitting(false);
    }
  };

  const onGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signInError) {
        console.error("Google login error:", signInError);
        setError(signInError.message ?? "Erro ao fazer login com Google");
        setIsGoogleLoading(false);
      }
      // Se sucesso, o usuário será redirecionado para o callback
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Erro ao fazer login com Google");
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-md p-6 sm:p-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold text-[#2A1B55]">{t("title")}</h1>
            <LocaleSwitcher showLabel />
          </div>

          <p className="text-neutral-600 mb-6">{t("subtitle")}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                {t("password")}
              </Label>
              <PasswordField
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("loading") : t("submit")}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-neutral-500">Ou</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={onGoogleLogin}
              variant="outline"
              className="w-full"
              disabled={isGoogleLoading || isSubmitting}
            >
              {isGoogleLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Conectando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar com Google
                </span>
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-neutral-700">
                {t("ctaRegister")}{" "}
                <Link
                  href="/onboarding/role"
                  className="font-medium text-[#3BA5FF] hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}
