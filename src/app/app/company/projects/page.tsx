"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Plus, LayoutDashboard, MessageSquare, Building2 } from "lucide-react";
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
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";
import { ContentCard } from "@/components/app/ContentCard";
import type { CompanyNavTab } from "@/components/app/CompanyPageHeader";

const COMPANY_TABS: CompanyNavTab[] = [
  { key: "dashboard", label: "Painel", href: "/app/company/dashboard", icon: LayoutDashboard },
  { key: "reclamacoes", label: "Reclamações", href: "/app/company/complaints", icon: MessageSquare },
  { key: "projetos", label: "Projetos", href: "/app/company/projects", icon: FolderKanban },
  { key: "perfil", label: "Perfil", href: "/app/company/profile", icon: Building2 },
];

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

  const createButton = (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1E88E5] hover:bg-[#1976D2]">
          <Plus className="w-4 h-4 mr-2" />
          Criar Projeto
        </Button>
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
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={projectLocation}
              onChange={(e) => setProjectLocation(e.target.value)}
              placeholder="Cidade, bairro ou referência"
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
          <Button
            onClick={() => void handleCreateProject()}
            className="w-full bg-[#1E88E5] hover:bg-[#1976D2]"
            disabled={submitting || !projectName.trim()}
          >
            {submitting ? "Criando..." : "Criar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <CompanyPageShell>
      <CompanyPageHeader
        title="Projetos"
        subtitle="Gerencie os projetos vinculados ao perfil da empresa"
        icon={<FolderKanban className="w-8 h-8" />}
        action={createButton}
        tabs={COMPANY_TABS}
        activeTab="projetos"
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-gray-600">Carregando projetos...</p>
      ) : projects.length === 0 ? (
        <ContentCard innerClassName="p-8 text-center text-gray-600 border-2 border-dashed border-[#E5E5ED]">
          Nenhum projeto cadastrado ainda.
        </ContentCard>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ContentCard key={project.id} innerClassName="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="mb-1 font-['Poppins'] text-lg font-semibold text-[#2A3F54]">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold">{project.status}</span>
                  </p>
                  {project.location ? (
                    <p className="text-sm text-gray-600">Local: {project.location}</p>
                  ) : null}
                  {project.description ? (
                    <p className="mt-2 max-w-2xl text-sm text-gray-700">{project.description}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                    Edição em breve
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
            </ContentCard>
          ))}
        </div>
      )}
    </CompanyPageShell>
  );
}
