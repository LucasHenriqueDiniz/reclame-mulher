"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg-people.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/80 via-purple-primary/70 to-purple-darker/90" />

      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-2">
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

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-10">
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
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {err && <p className="text-sm text-red-600 text-center">{err}</p>}

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full h-12 bg-blue-stepper hover:bg-blue-stepper/90 text-white font-heading font-semibold text-base rounded-full transition-all shadow-md mt-2"
                >
                  {loading ? "Carregando..." : "Login"}
                </Button>
              </form>

              <div className="mt-6">
                <Link href="/register">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full h-12 bg-gray-700 hover:bg-gray-800 text-white font-heading font-semibold text-base rounded-full transition-all"
                  >
                    Criar uma conta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
