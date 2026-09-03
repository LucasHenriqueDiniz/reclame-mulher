import "server-only";
import { CompaniesRepo } from "@/server/repos/companies";
import { ComplaintsRepo } from "@/server/repos/complaints";
import { ProjectsRepo } from "@/server/repos/projects";
import type { CreateComplaintDeps } from "./create-complaint";

/**
 * The real wiring, kept out of `create-complaint.ts` so that importing the use
 * case never imports a repository. This file is `server-only` for the same reason
 * the repos are: it reaches the database through them.
 */
export const createComplaintDeps: CreateComplaintDeps = {
  companies: CompaniesRepo,
  projects: ProjectsRepo,
  complaints: ComplaintsRepo,
};
