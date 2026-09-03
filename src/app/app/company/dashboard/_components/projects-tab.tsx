"use client";

import { useState } from "react";
import {
  companyTheme as S,
  CompanyProjectList,
  CompanyProjectFormModal,
  CompanyDeleteProjectModal,
  SearchInput,
} from "@/components/company";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
};

/**
 * The dashboard's projects tab, with create, edit, delete and search.
 *
 * It keeps a local copy of the server's list: `projects` is seeded from the
 * `initial` prop and then mutated by hand on every save and delete, so the
 * component's list and the database can drift until the page is reloaded. That
 * cache predates this file — moving the tab out of the dashboard only made it
 * easier to see. Replacing it with `@tanstack/react-query`, already a
 * dependency, is its own change and wants its own proof.
 */
export function ProjectsTab({ initial }: { initial: Project[] }) {
  const [projects, setProjects] = useState(initial);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : projects;

  const handleSave = (p: unknown) => {
    const proj = p as Project & { createdAt?: string };
    if (editingProject) {
      setProjects((prev) =>
        prev.map((x) =>
          x.id === editingProject.id
            ? {
                ...x,
                ...proj,
                startDate: proj.startDate ?? x.startDate,
                endDate: proj.endDate ?? x.endDate,
              }
            : x
        )
      );
    } else {
      setProjects((prev) => [...prev, { ...proj }]);
    }
    setShowFormModal(false);
    setEditingProject(null);
  };

  const handleDeleteSuccess = () => {
    if (deletingProject) {
      setProjects((prev) => prev.filter((x) => x.id !== deletingProject.id));
      setDeletingProject(null);
    }
  };

  const projectForEdit = editingProject
    ? {
        id: editingProject.id,
        name: editingProject.name,
        description: editingProject.description ?? null,
        location: editingProject.location ?? null,
        status: editingProject.status,
        startDate: editingProject.startDate ?? null,
        endDate: editingProject.endDate ?? null,
      }
    : null;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar projetos..."
        />
        <button
          type="button"
          onClick={() => {
            setEditingProject(null);
            setShowFormModal(true);
          }}
          style={{
            background: S.primary,
            color: S.white,
            border: "none",
            borderRadius: 8,
            padding: "11px 22px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Adicionar novo projeto
        </button>
      </div>
      <CompanyProjectList
        projects={filtered}
        companyId=""
        isLoggedIn={true}
        showActions={true}
        onEdit={(p) => {
          setEditingProject({
            ...p,
            description: p.description ?? null,
            location: p.location ?? null,
            startDate: p.startDate ?? null,
            endDate: p.endDate ?? null,
          } as Project);
          setShowFormModal(true);
        }}
        onDelete={(p) => setDeletingProject({ id: p.id, name: p.name })}
      />
      {showFormModal && (
        <CompanyProjectFormModal
          project={projectForEdit}
          onClose={() => {
            setShowFormModal(false);
            setEditingProject(null);
          }}
          onSuccess={handleSave}
        />
      )}
      {deletingProject && (
        <CompanyDeleteProjectModal
          project={{ id: deletingProject.id, name: deletingProject.name }}
          onClose={() => setDeletingProject(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
