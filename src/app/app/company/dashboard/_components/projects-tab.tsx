"use client";

import { useState } from "react";
import {
  companyTheme as S,
  CompanyProjectList,
  CompanyProjectFormModal,
  CompanyDeleteProjectModal,
  SearchInput,
  type ProjectSubmitValues,
} from "@/components/company";
import {
  useCompanyProjects,
  useCreateProject,
  useDeleteProject,
  useUpdateProject,
  type CompanyProject,
} from "@/hooks/use-company-projects";
import { filterProjects } from "./projects-tab-helpers";

/**
 * The dashboard's projects tab, with create, edit, delete and search.
 *
 * The list is a `@tanstack/react-query` query, not component state seeded from a
 * prop: create, edit and delete each invalidate that query, so what is rendered
 * comes from a read of the database rather than from the payload the modal
 * happened to return. Before this, the tab hand-mutated a local array on every
 * save and delete and nothing refetched — so its list and the database drifted
 * until the page was reloaded.
 *
 * Nothing is fetched on the server for this tab. `projects` was in the
 * dashboard page's `Promise.all`, which paid for the query on every dashboard
 * visit even though `complaints` is the tab that opens by default; the query
 * runs when this component first mounts instead.
 */
export function ProjectsTab() {
  const projects = useCompanyProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<CompanyProject | null>(null);
  const [deletingProject, setDeletingProject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [search, setSearch] = useState("");

  const filtered = filterProjects(projects.data ?? [], search);

  const submitProject = (values: ProjectSubmitValues) =>
    editingProject
      ? updateProject.mutateAsync({ id: editingProject.id, input: values })
      : createProject.mutateAsync(values);

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingProject(null);
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
      {projects.isPending ? (
        <Notice>Carregando projetos…</Notice>
      ) : projects.isError ? (
        <Notice color={S.red}>
          {projects.error instanceof Error
            ? projects.error.message
            : "Erro ao carregar projetos"}
        </Notice>
      ) : (
        <CompanyProjectList
          projects={filtered}
          isLoggedIn={true}
          showActions={true}
          onEdit={(p) => {
            setEditingProject({
              ...p,
              description: p.description ?? null,
              location: p.location ?? null,
              startDate: p.startDate ?? null,
              endDate: p.endDate ?? null,
            } as CompanyProject);
            setShowFormModal(true);
          }}
          onDelete={(p) => setDeletingProject({ id: p.id, name: p.name })}
        />
      )}
      {showFormModal && (
        <CompanyProjectFormModal
          project={projectForEdit}
          onClose={closeFormModal}
          onSubmit={submitProject}
        />
      )}
      {deletingProject && (
        <CompanyDeleteProjectModal
          project={{ id: deletingProject.id, name: deletingProject.name }}
          onClose={() => setDeletingProject(null)}
          onConfirm={() => deleteProject.mutateAsync(deletingProject.id)}
        />
      )}
    </div>
  );
}

/** The loading and error lines, styled like the list's own empty state. */
function Notice({ children, color }: { children: string; color?: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 0",
        color: color ?? S.muted,
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}
