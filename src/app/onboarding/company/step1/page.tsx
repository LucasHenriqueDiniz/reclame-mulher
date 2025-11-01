"use client";
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
import { supabaseClient } from "@/lib/supabase/client";
import { useState } from "react";

const schema = z
  .object({
    company_name: z.string().min(3, "Nome da empresa deve ter no mínimo 3 caracteres"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirm: z.string().min(8, "Confirme sua senha"),
    terms: z.boolean().refine((v) => v, "Aceite os termos para continuar."),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Senhas não conferem",
    path: ["confirm"],
  });

type Form = z.infer<typeof schema>;

export default function CompanyStep1() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCNPJ = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue("cnpj", maskCNPJ(e.target.value));

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            company_name: data.company_name,
            cnpj: data.cnpj,
            user_type: "company",
          },
          emailRedirectTo: `${window.location.origin}/auth/verify?type=confirm&next=/onboarding/company/step2`,
        },
      });
      
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Se o email precisa ser confirmado, redireciona para página de verificação
      if (signUpData.user && !signUpData.session) {
        // Email precisa ser confirmado
        location.href = "/auth/verify/check-email?email=" + encodeURIComponent(data.email);
      } else if (signUpData.session) {
        // Email já confirmado ou confirmação desabilitada, continua onboarding
        location.href = "/onboarding/company/step2";
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
              <label className="text-sm font-medium text-gray-800">
                Nome da Empresa*
              </label>
              <Input
                placeholder="Razão social da empresa"
                {...register("company_name")}
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.company_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.company_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">
                CNPJ*
              </label>
              <Input
                placeholder="12.345.678/0001-00"
                {...register("cnpj")}
                onChange={onCNPJ}
                inputMode="numeric"
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.cnpj && (
                <p className="mt-1 text-sm text-red-600">{errors.cnpj.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">
                Email Corporativo*
              </label>
              <Input
                type="email"
                placeholder="contato@empresa.com"
                {...register("email")}
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-800">
                  Senha*
                </label>
                <PasswordField
                  placeholder="********"
                  {...register("password")}
                  className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-800">
                  Confirmar Senha*
                </label>
                <PasswordField
                  placeholder="********"
                  {...register("confirm")}
                  className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.confirm && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-2">
              <label className="flex items-start gap-3">
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
                  <a className="underline" href="/terms" target="_blank">
                    Termos de uso
                  </a>{" "}
                  e{" "}
                  <a className="underline" href="/privacy" target="_blank">
                    política de privacidade
                  </a>
                  .
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-red-600 mt-1">{errors.terms.message}</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a
                href="/login"
                className="text-sm font-medium text-blue-stepper hover:text-blue-stepper/80 hover:underline transition"
              >
                Já tem uma conta? Entrar
              </a>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white"
              >
                {loading ? "Carregando..." : "Continuar"}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}

