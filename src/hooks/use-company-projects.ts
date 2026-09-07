import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

export interface CompanyProject {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt?: string;
}

/**
 * What the project form sends. Snake case because it is the shape
 * `CreateProjectDto` and `UpdateProjectDto` parse on the other side, not a
 * naming choice this module gets to make.
 */
export interface CompanyProjectInput {
  name: string;
  description?: string;
  location?: string;
  status: string;
  start_date?: string;
  end_date?: string;
}

/**
 * `/api/company/projects` reads the company off the session — see
 * `getCurrentCompanyContext` — so there is no company id to put in this key. One
 * signed-in company user has exactly one projects list.
 */
export const companyProjectsKey = ["company", "projects"] as const;

interface ApiErrorResponse {
  error?: string;
}

async function requestJson<T>(url: string, init: RequestInit | undefined, fallback: string) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(body?.error || fallback);
  }
  return (await response.json()) as T;
}

function jsonRequest(method: string, input: CompanyProjectInput): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  };
}

/**
 * Returned from every mutation's `onSuccess` rather than fired and forgotten:
 * react-query then holds the mutation unsettled until the refetch lands, so
 * `mutateAsync` resolves against a list that already includes the write. The
 * modals close on that promise, which is what keeps the closed modal and the
 * rendered list from disagreeing for a frame.
 */
function invalidateCompanyProjects(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: companyProjectsKey });
}

export function useCompanyProjects() {
  return useQuery({
    queryKey: companyProjectsKey,
    queryFn: async () => {
      const data = await requestJson<{ projects: CompanyProject[] }>(
        "/api/company/projects",
        undefined,
        "Erro ao carregar projetos"
      );
      return data.projects;
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CompanyProjectInput) =>
      requestJson<{ project: CompanyProject }>(
        "/api/company/projects",
        jsonRequest("POST", input),
        "Erro ao salvar"
      ),
    onSuccess: () => invalidateCompanyProjects(queryClient),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanyProjectInput }) =>
      requestJson<{ project: CompanyProject }>(
        `/api/company/projects/${id}`,
        jsonRequest("PATCH", input),
        "Erro ao salvar"
      ),
    onSuccess: () => invalidateCompanyProjects(queryClient),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      requestJson<{ ok: boolean }>(
        `/api/company/projects/${id}`,
        { method: "DELETE" },
        "Erro ao excluir"
      ),
    onSuccess: () => invalidateCompanyProjects(queryClient),
  });
}
