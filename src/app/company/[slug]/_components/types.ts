/**
 * Shapes the public company profile passes around. They were declared inside
 * company-profile-content.tsx while every section lived there; `Company` is read by four
 * of the split files and `Complaint` by three, so they live here rather than being
 * re-declared per file or imported back out of the orchestrator.
 *
 * `Company` is an index type because page.tsx serializes the whole Drizzle row and the
 * sections narrow the fields they use with String() at the point of use.
 */
export type Company = Record<string, string | null | boolean | number | undefined>;

export type Complaint = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
  isAnonymous?: boolean;
  author?: { name: string | null } | null;
  project?: { name: string } | null;
  problemLocation?: string | null;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
};
