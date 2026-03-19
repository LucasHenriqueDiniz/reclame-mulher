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
import { maskPhone } from "@/lib/masks";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfilePerson } from "./actions";
import { HOW_HEARD_OPTIONS, HOW_HEARD_VALUES, type HowHeardType } from "@/lib/constants/how-heard";
import { Loader2, UserCircle2 } from "lucide-react";
import { useAuthState } from "@/hooks/use-auth-state";

const schema = z.object({
  phone: z.string().optional(),
  address: z.string().min(3, "Endereço deve ter no mínimo 3 caracteres"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  how_heard: z.enum(HOW_HEARD_VALUES).optional(),
  how_heard_other: z.string().optional(),
}).refine((data) => {
  if (data.how_heard === "OUTRO") {
    return data.how_heard_other && data.how_heard_other.trim().length > 0;
  }
  return true;
}, {
  message: "Especifique como ficou sabendo da plataforma",
  path: ["how_heard_other"],
});

type Form = z.infer<typeof schema>;

const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function PersonStep2() {
  const router = useRouter();
  const { user, profile, isLoggedIn, loading: authLoading } = useAuthState();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const howHeardValue = watch("how_heard");

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [authLoading, isLoggedIn, router]);

  const onPhone = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue("phone", maskPhone(e.target.value));

  const onSubmit = async (data: Form) => {
    setLoading(true);
    setError(null);
    try {
      await updateProfilePerson({
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        how_heard: data.how_heard,
        how_heard_other: data.how_heard_other,
        accepted_terms: true,
        locale: "pt-BR",
      });
      window.location.href = "/app";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isLoggedIn) {
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
          <ProgressBar step={2} total={2} />

          {/* Account context banner */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <UserCircle2 className="h-8 w-8 text-[#3BA5FF] flex-shrink-0" />
            <div>
              {profile?.name && <p className="text-sm font-semibold text-[#2A1B55]">{profile.name}</p>}
              {user?.email && <p className="text-xs text-neutral-500">{user.email}</p>}
            </div>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-[#2A1B55]">
            Quase lá! Complete seu perfil
          </h1>
          <p className="text-neutral-600">
            Precisamos de mais alguns dados para finalizar seu cadastro
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-gray-800">Telefone (opcional)</label>
              <Input
                placeholder="(xx) 1234-56789"
                {...register("phone")}
                onChange={onPhone}
                inputMode="numeric"
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Endereço*</label>
              <Input
                placeholder="Rua, número, bairro"
                {...register("address")}
                className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-800">Cidade*</label>
                <Input
                  placeholder="Sua cidade"
                  {...register("city")}
                  className="mt-1 h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-800">Estado*</label>
                <Select onValueChange={(v) => setValue("state", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Como ficou sabendo da plataforma? (opcional)</label>
              <Select
                value={howHeardValue || "none"}
                onValueChange={(v) => {
                  setValue("how_heard", v && v !== "none" ? (v as HowHeardType) : undefined);
                  if (v !== "OUTRO" && v !== "none") setValue("how_heard_other", "");
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Prefiro não informar</SelectItem>
                  {HOW_HEARD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {howHeardValue === "OUTRO" && (
                <div className="mt-2">
                  <Input
                    placeholder="Como nos encontrou?"
                    {...register("how_heard_other")}
                    className="h-12 text-base border-gray-200 placeholder:text-gray-500 focus:border-blue-stepper"
                  />
                  {errors.how_heard_other && <p className="mt-1 text-sm text-red-600">{errors.how_heard_other.message}</p>}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" type="button" onClick={() => history.back()}>
                ← Voltar
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#3BA5FF] hover:bg-[#2d8ddf] text-white">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Finalizar cadastro →"}
              </Button>
            </div>
          </form>
        </GlassCard>
      </div>
    </AuthLayout>
  );
}
