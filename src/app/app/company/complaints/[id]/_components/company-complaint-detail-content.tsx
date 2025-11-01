"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CompanyComplaintDetailContentProps {
  id: string;
}

export function CompanyComplaintDetailContent({
  id,
}: CompanyComplaintDetailContentProps) {
  const [response, setResponse] = useState("");

  const handleSubmit = () => {
    // TODO: [API: POST /api/complaints/{id}/messages]
    alert("Enviar resposta será implementado");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/app/company/inbox">
          <Button variant="ghost" size="sm">← Voltar</Button>
        </Link>
        <h1 className="font-heading text-3xl mt-4 mb-2">
          Reclamação #{id}
        </h1>
        <p className="text-gray-600">
          [API: GET /api/complaints/{id}]
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Detalhes */}
        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Detalhes</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> Pendente</p>
            <p><strong>Data:</strong> 01/01/2024</p>
            <p><strong>Autor:</strong> Usuário</p>
          </div>
        </section>

        {/* Thread de mensagens */}
        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Conversa</h2>
          <div className="space-y-4 mb-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm font-semibold mb-1">Reclamador:</p>
              <p>Mensagem inicial da reclamação...</p>
              <p className="text-xs text-gray-500 mt-1">01/01/2024 10:00</p>
            </div>
          </div>

          {/* Formulário de resposta */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-4">Responder</h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div>
                <Label htmlFor="response">Sua Resposta</Label>
                <Textarea
                  id="response"
                  placeholder="Digite sua resposta..."
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Enviar Resposta</Button>
                <Button type="button" variant="outline">
                  Salvar Rascunho
                </Button>
              </div>
            </form>
            <p className="text-sm text-gray-500 mt-4">
              [API: POST /api/complaints/{id}/messages]
            </p>
          </div>
        </section>

        {/* Ações */}
        <section className="p-6 border rounded">
          <h2 className="font-heading text-xl mb-4">Ações</h2>
          <div className="flex flex-wrap gap-2">
            <select className="px-4 py-2 border rounded">
              <option>Pendente</option>
              <option>Em Andamento</option>
              <option>Resolvida</option>
              <option>Fechada</option>
            </select>
            <Button>Alterar Status</Button>
            <Button variant="outline">Adicionar Nota Interna</Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            [API: PATCH /api/complaints/{id}/status]
          </p>
        </section>
      </div>
    </div>
  );
}

