export interface FilterableProject {
  name: string;
  description: string | null;
}

/**
 * The projects tab's search. Its own function because the tab now reads the list
 * from a query rather than from state, and this is the one piece of that tab a
 * unit test can reach without a DOM.
 *
 * Name and description only — deliberately not location, which the public
 * profile's own tab does search. Widening it here would be a behaviour change
 * riding along with the cache replacement.
 */
export function filterProjects<T extends FilterableProject>(projects: T[], search: string): T[] {
  const query = search.trim().toLowerCase();
  if (!query) return projects;
  return projects.filter(
    (project) =>
      project.name.toLowerCase().includes(query) ||
      (project.description?.toLowerCase().includes(query) ?? false)
  );
}
