"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/layout/AuthLayout";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/PasswordField";
import { maskCNPJ } from "@/lib/masks";
import { Loader2 } from "lucide-react";

const schema = z
  .object({
    company_name: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirm: z.string().min(8, "Confirme sua senha"),
    terms: z.boolean().refine((v) => v === true, "Aceite os termos para continuar."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Senhas não conferem",
    path: ["confirm"],
  });

type Form = z.infer<typeof schema>;

export default function CompanyStep1() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user already has a session (e.g. pressed back), go straight to step 2
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) {
          router.replace("/onboarding/company/step2");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const onCNPJ = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue("cnpj", maskCNPJ(e.target.value));

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: data.company_name,
          cnpj: data.cnpj,
          email: data.email,
          password: data.password,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.error || "Erro ao criar conta. Tente novamente.");
        setLoading(false);
        return;
      }

      location.href = "/onboarding/company/step2";
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <GlassCard className="w-full max-w-3xl p-6 sm:p-10">
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3BA5FF]" />
            </div>
          </GlassCard>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex justify-center">
        <GlassCard className="w-full max-w-3xl p-6 sm:p-10">
          <ProgressBar step={1} total={2} />
          <h1 className="mt-4 text-3xl font-extrabold text-[#2A1B55]">
            Cadastro de empresa
          </h1>
          <p className="text-neutral-600">
            Preencha os dados abaixo para criar a conta da sua empresa!
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Nome da Empresa*</label>
              <Input
                placeholder="Razão social da empresa"
                {...register("company_name")}
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.company_name && <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">CNPJ*</label>
              <Input
                placeholder="12.345.678/0001-00"
                {...register("cnpj")}
                onChange={onCNPJ}
                inputMode="numeric"
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Email Corporativo*</label>
              <Input
                type="email"
                placeholder="contato@empresa.com"
                {...register("email")}
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-800">Senha*</label>
                <PasswordField
                  placeholder="Mínimo 8 caracteres"
                  {...register("password")}
                  className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-800">Confirmar Senha*</label>
                <PasswordField
                  placeholder="Repita a senha"
                  {...register("confirm")}
                  className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>}
              </div>
            </div>

            <div className="mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  )}
                />
                <span className="text-sm text-neutral-700">
                  Aceito os{" "}
                  <a className="underline text-[#3BA5FF]" href="/terms" target="_blank">Termos de uso</a>{" "}
                  e{" "}
                  <a className="underline text-[#3BA5FF]" href="/privacy" target="_blank">política de privacidade</a>.
                </span>
              </label>
              {errors.terms && <p className="text-sm text-red-600 mt-1">{errors.terms.message}</p>}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a href="/login" className="text-sm font-medium text-blue-stepper hover:text-blue-stepper/80 hover:underline transition">
                Já tem uma conta? Entrar
              </a>
              <Button type="submit" disabled={loading} className="bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Criando conta...</> : "Continuar →"}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}
