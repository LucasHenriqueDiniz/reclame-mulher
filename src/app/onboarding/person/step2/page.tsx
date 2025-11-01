"use client";
import AuthLayout from "@/components/layout/AuthLayout";
import { GlassCard } from "@/components/GlassCard";
import { ProgressBar } from "@/components/ProgressBar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { maskPhone, maskCPF } from "@/lib/masks";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { updateProfilePerson } from "./actions";

const schema = z.object({
  cpf: z.string().min(11, "CPF é obrigatório").optional(),
  phone: z.string().optional(),
  address: z.string().min(3, "Endereço deve ter no mínimo 3 caracteres"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  how_heard_option_id: z.string().uuid().optional(),
  how_heard_free_text: z.string().optional(),
});

type Form = z.infer<typeof schema>;

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function PersonStep2() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [howHeardOptions, setHowHeardOptions] = useState<
    Array<{ id: string; label: string; slug: string }>
  >([]);
  const [needsCPF, setNeedsCPF] = useState(false);

  const howHeardOptionId = watch("how_heard_option_id");

  // Carrega opções de how_heard
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Note: Esta é uma chamada client-side, então vamos criar uma API route ou usar server action
        // Por enquanto, vamos fazer fetch direto (se RLS permitir) ou criar API route
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;

        const response = await fetch("/api/how-heard/options");
        if (response.ok) {
          const options = await response.json();
          setHowHeardOptions(options);
        }
      } catch (err) {
        console.error("Erro ao carregar opções:", err);
      }
    };

    loadOptions();
  }, []);

  // Verifica se usuário está autenticado e se precisa CPF
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      if (!user.email_confirmed_at && user.app_metadata?.provider === "email") {
        router.push(`/auth/verify/check-email?email=${encodeURIComponent(user.email || "")}`);
        return;
      }

      // Verifica se veio de OAuth (precisa CPF)
      const isOAuth = user.app_metadata?.provider !== "email";
      if (isOAuth) {
        // Busca perfil para ver se tem CPF
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("cpf")
          .eq("user_id", user.id)
          .maybeSingle();

        setNeedsCPF(!profile?.cpf);
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue("phone", maskPhone(e.target.value));

  const onCPF = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue("cpf", maskCPF(e.target.value));

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setError(null);
    try {
      // Se precisa CPF e não foi preenchido
      if (needsCPF && !data.cpf) {
        setError("CPF é obrigatório para completar o cadastro");
        setLoading(false);
        return;
      }

      await updateProfilePerson({
        cpf: data.cpf,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        how_heard_option_id: data.how_heard_option_id,
        how_heard_free_text: data.how_heard_free_text,
        accepted_terms: true,
        locale: "pt-BR",
      });
      // Fim do onboarding - redireciona para app
      window.location.href = "/app";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar dados. Tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <GlassCard className="w-full max-w-3xl p-6 sm:p-10">
            <div className="text-center py-8">
              <p className="text-neutral-600">Verificando autenticação...</p>
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
          <ProgressBar step={2} total={2} />
          <h1 className="mt-4 text-3xl font-extrabold text-[#2A1B55]">
            Olá! Estamos quase terminando!
          </h1>
          <p className="text-neutral-600">
            Complete seu perfil com as informações abaixo
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            {needsCPF && (
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  CPF*
                </label>
                <Input
                  placeholder="123.456.789-00"
                  {...register("cpf")}
                  onChange={onCPF}
                  inputMode="numeric"
                  className="mt-1"
                />
                {errors.cpf && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cpf.message}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-neutral-700">
                Telefone (Recomendado)
              </label>
              <Input
                placeholder="(xx) 1234-56789"
                {...register("phone")}
                onChange={onPhone}
                inputMode="numeric"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">
                Endereço*
              </label>
              <Input
                placeholder="Rua..."
                {...register("address")}
                className="mt-1"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  Cidade*
                </label>
                <Input {...register("city")} className="mt-1" />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">
                  Estado*
                </label>
                <Select onValueChange={(v) => setValue("state", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">
                Como ficou sabendo da plataforma? (opcional)
              </label>
              <Select
                value={howHeardOptionId || ""}
                onValueChange={(v) => setValue("how_heard_option_id", v || undefined)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma opção</SelectItem>
                  {howHeardOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Outro (especifique abaixo)</SelectItem>
                </SelectContent>
              </Select>
              {howHeardOptionId === "other" && (
                <Input
                  placeholder="Digite aqui..."
                  {...register("how_heard_free_text")}
                  className="mt-2"
                />
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => history.back()}
              >
                ← Voltar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white"
              >
                {loading ? "Salvando..." : "Continuar"}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}



