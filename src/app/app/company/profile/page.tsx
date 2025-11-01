"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CompanyProfilePage() {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    // TODO: [API: PATCH /api/company/profile]
    alert("Salvar perfil será implementado");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-heading text-3xl mb-6">Perfil da Empresa</h1>

      <div className="space-y-6 max-w-2xl">
        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Informações Públicas</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sector">Setor</Label>
              <Input
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
              />
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
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                [API: POST /api/files/upload para logo]
              </p>
            </div>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            [API: PATCH /api/company/profile]
          </p>
        </section>

        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Preview</h2>
          <p className="text-sm text-gray-600">
            Como seu perfil público aparece em /company/[slug]
          </p>
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-500">Preview aparecerá aqui...</p>
          </div>
        </section>
      </div>
    </div>
  );
}

