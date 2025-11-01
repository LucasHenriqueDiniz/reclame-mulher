"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

    const { error } = await supabaseClient.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (error) {
      setErr(error.message);
    } else {
      router.push("/app");
    }
  };

  const onGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });

    if (error) {
      setErr(error.message);
      setLoading(false);
    }
  };

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

      {/* Conteúdo com grid responsivo */}
      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-2">
        {/* Texto de marketing - esquerda no desktop, topo no mobile */}
        <div className="flex flex-col justify-center items-center lg:items-start px-8 py-12 lg:px-16 text-white text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
            Conectando vozes
            <br />
            que transformam
            <br />
            comunidades
          </h1>
          <p className="text-lg lg:text-xl leading-relaxed max-w-lg">
            Diálogo direto entre mulheres e responsáveis por obras de infraestrutura
          </p>
        </div>

        {/* Card de Login - direita no desktop */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-10">
            {/* Tabs */}
            <div className="flex mb-10 border-b-2 border-gray-100">
              <Link
                href="/login"
                className="flex-1 pb-3 text-center font-heading font-bold text-sm tracking-wide text-gray-800 border-b-4 border-blue-stepper -mb-0.5"
              >
                ENTRAR
              </Link>
              <Link
                href="/register"
                className="flex-1 pb-3 text-center font-heading font-bold text-sm tracking-wide text-gray-400 hover:text-gray-600 transition"
              >
                CADASTRAR
              </Link>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit(onLogin)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800">Seu email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu email"
                  {...register("email")}
                  className="h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800">Sua senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  {...register("password")}
                  className="h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {err && (
                <p className="text-sm text-red-600 text-center">{err}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full h-12 bg-blue-stepper hover:bg-blue-stepper/90 text-white font-heading font-semibold text-base rounded-full transition-all shadow-md mt-2"
              >
                {loading ? "Carregando..." : "Login"}
              </Button>
            </form>

            <div className="relative my-8">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-4 text-gray-400 text-sm">ou</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full h-12 bg-gray-700 hover:bg-gray-800 text-white font-heading font-semibold text-base rounded-full transition-all"
                >
                  Criar uma conta
                </Button>
              </Link>

              <Button
                onClick={onGoogleLogin}
                disabled={loading}
                variant="secondary"
                size="lg"
                className="w-full h-12 bg-gray-500 hover:bg-gray-600 text-white font-heading font-semibold text-base rounded-full transition-all"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Logar com o Google
              </Button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

