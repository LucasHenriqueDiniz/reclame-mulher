"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

interface CompanyProject {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

interface ProjectsResponse {
  projects?: CompanyProject[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function CompanyProjectsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/company/projects", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Nao foi possivel carregar os projetos.");
      }

      const data = (await response.json()) as ProjectsResponse;
      setProjects(data.projects ?? []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao carregar projetos."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleCreateProject() {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/company/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          description: projectDescription || undefined,
          location: projectLocation || undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Nao foi possivel criar o projeto.");
      }

      toast({
        title: "Projeto criado",
        description: "O projeto foi cadastrado com sucesso.",
      });

      setProjectName("");
      setProjectDescription("");
      setProjectLocation("");
      setIsCreateOpen(false);
      await loadProjects();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao criar projeto."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProject(projectId: string) {
    try {
      setPendingDeleteId(projectId);
      setError(null);

      const response = await fetch(`/api/company/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Nao foi possivel excluir o projeto.");
      }

      toast({
        title: "Projeto removido",
        description: "O projeto foi excluido com sucesso.",
      });

      await loadProjects();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao excluir projeto."));
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-heading text-3xl">Projetos</h1>
          <p className="text-gray-600">Gerencie os projetos vinculados ao perfil da empresa.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Criar Projeto</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
              <DialogDescription>Cadastre um projeto real da empresa.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Projeto</Label>
                <Input id="name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="location">Localizacao</Label>
                <Input
                  id="location"
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="Cidade, bairro ou referencia"
                />
              </div>
              <div>
                <Label htmlFor="description">Descricao</Label>
                <Textarea
                  id="description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => void handleCreateProject()}
                className="w-full"
                disabled={submitting || !projectName.trim()}
              >
                {submitting ? "Criando..." : "Criar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <p className="text-gray-600">Carregando projetos...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center text-gray-600">
          Nenhum projeto cadastrado ainda.
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="mb-1 font-heading text-lg">{project.name}</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold">{project.status}</span>
                  </p>
                  {project.location ? <p className="text-sm text-gray-600">Local: {project.location}</p> : null}
                  {project.description ? (
                    <p className="mt-2 max-w-2xl text-sm text-gray-700">{project.description}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                    Edicao em breve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void handleDeleteProject(project.id)}
                    disabled={pendingDeleteId === project.id}
                  >
                    {pendingDeleteId === project.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
