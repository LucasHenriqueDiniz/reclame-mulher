"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/PasswordField";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const TRUST_POINTS = [
  "Registre e acompanhe suas reclamações em tempo real",
  "Comunicação direta com as empresas responsáveis",
  "Seus dados protegidos com total segurança",
  "Plataforma gratuita para todas as mulheres",
];

export default function LoginPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErr(body.error || "Email ou senha inválidos");
    } else {
      router.push("/app");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-people.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2A1B55]/90 via-[#2A1B55]/75 to-[#1a1038]/95" />

      {/* Layout */}
      <div className="relative z-10 w-full min-h-screen flex flex-col lg:grid lg:grid-cols-2">

        {/* ── Left: Hero ── */}
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16 text-white">
          {/* Brand */}
          <p className="text-[#3BA5FF] font-semibold text-sm uppercase tracking-widest mb-6">
            ComunicaMulher
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Conectando vozes
            <br />
            que{" "}
            <span className="text-[#3BA5FF]">transformam</span>
            <br />
            comunidades
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-md mb-10">
            Diálogo direto entre mulheres e responsáveis por obras de infraestrutura.
          </p>

          {/* Trust signals */}
          <ul className="flex flex-col gap-3">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#3BA5FF] flex-shrink-0 mt-0.5" />
                <span className="text-white/75 text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Right: Login card ── */}
        <div className="flex items-center justify-center px-6 py-12 lg:py-0">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

              {/* Card header */}
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-[#2A1B55]">Bem-vinda de volta!</h2>
                <p className="text-neutral-500 text-sm mt-1">
                  Não tem uma conta?{" "}
                  <Link href="/register" className="text-[#3BA5FF] font-semibold hover:underline">
                    Cadastre-se grátis
                  </Link>
                </p>
              </div>

              {/* Error banner */}
              {err && (
                <div className="mb-5 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {err}
                </div>
              )}

              <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-800 block mb-1.5">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    {...register("email")}
                    className="h-12 text-base border-gray-200 placeholder:text-gray-400 focus:border-[#3BA5FF]"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-800">Senha</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[#3BA5FF] hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <PasswordField
                    placeholder="Sua senha"
                    {...register("password")}
                    className="h-12 text-base border-gray-200 placeholder:text-gray-400 focus:border-[#3BA5FF]"
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white font-semibold text-base rounded-full shadow-md transition-all mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar na plataforma"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3 w-fit mx-auto">
                  ou
                </div>
              </div>

              {/* Register CTA */}
              <Link href="/register">
                <Button
                  variant="outline"
                  className="w-full h-12 border-gray-200 text-[#2A1B55] font-semibold rounded-full hover:bg-gray-50 transition-all"
                >
                  Criar uma conta gratuita
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
