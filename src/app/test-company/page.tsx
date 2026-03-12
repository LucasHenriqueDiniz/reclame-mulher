"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/normalize";

export default function TestCompanyPage() {
  const [form, setForm] = useState({
    name: "",
    cnpj: "",
    responsible_name: "",
    contact_phone: "",
    responsible_email: "",
    sector: "",
    website: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          cnpj: form.cnpj || null,
          contact_name: form.responsible_name || null,
          phone: form.contact_phone || null,
          sector: form.sector || null,
          website: form.website || null,
          slug: form.slug || slugify(form.name),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Erro ao criar empresa");
        return;
      }

      setSuccess("Empresa criada com sucesso!");
      setTimeout(() => { router.push("/app"); }, 2000);
    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao criar empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Teste - Criar Empresa</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {[
              { label: "Nome da Empresa *", field: "name", type: "text", required: true, placeholder: "Nome da empresa" },
              { label: "CNPJ", field: "cnpj", type: "text", required: false, placeholder: "00.000.000/0000-00" },
              { label: "Nome do Responsável *", field: "responsible_name", type: "text", required: true, placeholder: "Nome do responsável" },
              { label: "Telefone de Contato", field: "contact_phone", type: "tel", required: false, placeholder: "(00) 00000-0000" },
              { label: "Setor", field: "sector", type: "text", required: false, placeholder: "Tecnologia, Saúde, Educação..." },
              { label: "Website", field: "website", type: "url", required: false, placeholder: "https://empresa.com" },
              { label: "Slug (URL amigável)", field: "slug", type: "text", required: false, placeholder: "empresa-nome" },
            ].map(({ label, field, type, required, placeholder }) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <input
                  type={type}
                  required={required}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Criando empresa..." : "Criar Empresa"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
