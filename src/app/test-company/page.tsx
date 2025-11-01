"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { formatCNPJ, formatPhone, slugify } from "@/lib/normalize";

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
      console.log("Tentando criar empresa com:", form);

      const { data, error } = await supabaseClient.rpc("create_company_self", {
        p_company_name: form.name,
        p_cnpj: form.cnpj || null,
        p_contact_name: form.responsible_name || null,
        p_phone: form.contact_phone || null,
        p_email: form.responsible_email,
        p_sector: form.sector || null,
        p_website: form.website || null,
        p_slug: form.slug || slugify(form.name),
      });

      if (error) {
        console.error("Erro do Supabase:", error);
        setError(error.message);
        return;
      }

      console.log("Empresa criada com sucesso:", data);
      setSuccess("Empresa criada com sucesso!");

      // Redirecionar após sucesso
      setTimeout(() => {
        router.push("/app");
      }, 2000);

    } catch (err) {
      console.error("Erro inesperado:", err);
      setError("Erro inesperado ao criar empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Teste - Criar Empresa
          </h1>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ
              </label>
              <input
                type="text"
                value={form.cnpj}
                onChange={(e) => handleChange("cnpj", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Responsável *
              </label>
              <input
                type="text"
                required
                value={form.responsible_name}
                onChange={(e) => handleChange("responsible_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone de Contato
              </label>
              <input
                type="tel"
                value={form.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail do Responsável *
              </label>
              <input
                type="email"
                required
                value={form.responsible_email}
                onChange={(e) => handleChange("responsible_email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="responsavel@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setor
              </label>
              <input
                type="text"
                value={form.sector}
                onChange={(e) => handleChange("sector", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tecnologia, Saúde, Educação..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL amigável)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="empresa-nome"
              />
            </div>

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

