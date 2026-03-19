"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface CompanyProfile {
  name: string | null;
  sector: string | null;
  website: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
}

interface CompanyProfileResponse {
  company: CompanyProfile;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/company/profile", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Nao foi possivel carregar o perfil da empresa.");
        }

        const data = (await response.json()) as CompanyProfileResponse;
        const company = data.company;
        setName(company.name ?? "");
        setSector(company.sector ?? "");
        setWebsite(company.website ?? "");
        setDescription(company.description ?? "");
        setCity(company.city ?? "");
        setState(company.state ?? "");
        setAddress(company.address ?? "");
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Erro ao carregar perfil da empresa."));
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sector,
          website,
          description,
          city,
          state,
          address,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Nao foi possivel salvar o perfil.");
      }

      toast({
        title: "Perfil atualizado",
        description: "As informacoes da empresa foram salvas.",
      });
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao salvar perfil da empresa."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 font-heading text-3xl">Perfil da Empresa</h1>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-gray-600">Carregando perfil...</p>
      ) : (
        <div className="max-w-3xl space-y-6">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-xl">Informacoes Publicas</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sector">Setor</Label>
                  <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Endereco</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, numero, bairro"
                />
              </div>
              <div>
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => void handleSave()} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alteracoes"}
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-xl">Preview rapido</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Nome:</strong> {name || "Nao informado"}</p>
              <p><strong>Setor:</strong> {sector || "Nao informado"}</p>
              <p><strong>Website:</strong> {website || "Nao informado"}</p>
              <p><strong>Local:</strong> {[city, state].filter(Boolean).join(", ") || "Nao informado"}</p>
              <p><strong>Descricao:</strong> {description || "Nao informada"}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
