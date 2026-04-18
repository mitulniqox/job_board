import type { JobType } from "./job.model";

/** Shared filter shape for public job listing and admin read-only job listing */
export type JobListFilterInput = {
  search?: string;
  skills?: string[];
  location?: string;
  jobType?: JobType;
  isActive?: boolean;
  /**
   * When true (default), search includes description (job board UX).
   * Admin lists can set false to avoid scanning large description fields.
   */
  includeDescriptionInSearch?: boolean;
};

/**
 * Builds a MongoDB filter for listing jobs (search, location, type, active).
 */
export function buildJobListFilter(input: JobListFilterInput): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  const andFilters: Record<string, unknown>[] = [];

  if (input.search) {
    andFilters.push({ $text: { $search: input.search } });
  }
  if (input.skills?.length) {
    andFilters.push({
      skills: { $in: input.skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")) },
    });
  }
  if (input.location) {
    andFilters.push({ location: { $regex: escapeRegex(input.location), $options: "i" } });
  }
  if (input.jobType) {
    andFilters.push({ jobType: input.jobType });
  }
  if (typeof input.isActive === "boolean") {
    andFilters.push({ isActive: input.isActive });
  }
  if (andFilters.length === 1) {
    Object.assign(query, andFilters[0]);
  }
  if (andFilters.length > 1) {
    query.$and = andFilters;
  }

  return query;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Fields returned for job list/card APIs (read-only, lean-friendly) */
export const JOB_LIST_SELECT =
  "title description skills salaryMin salaryMax jobType location deadline recruiterId isActive createdAt updatedAt";
