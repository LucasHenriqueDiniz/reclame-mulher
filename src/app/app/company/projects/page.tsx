"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CompanyProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleCreateProject = () => {
    // TODO: [API: POST /api/company/projects]
    alert("Criar projeto será implementado");
    setIsCreateOpen(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-3xl mb-2">Projetos</h1>
          <p className="text-gray-600">
            Gerencie projetos públicos e internos
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Criar Projeto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
              <DialogDescription>
                Crie um novo projeto público ou interno
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Projeto</Label>
                <Input
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="public" />
                <Label htmlFor="public" className="font-normal">
                  Projeto público
                </Label>
              </div>
              <Button onClick={handleCreateProject} className="w-full">
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          [API: GET /api/company/projects?page=1]
        </p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-lg mb-1">Projeto {i}</h3>
                <p className="text-sm text-gray-600">
                  Descrição do projeto {i}...
                </p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Público
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Editar
                </Button>
                <Button size="sm" variant="destructive">
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-4">
        [API: POST /api/company/projects - Criar]
        <br />
        [API: PATCH /api/company/projects/[id] - Editar]
        <br />
        [API: DELETE /api/company/projects/[id] - Excluir]
      </p>
    </div>
  );
}

