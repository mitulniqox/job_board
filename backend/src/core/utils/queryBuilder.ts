import type { PopulateOptions } from "mongoose";
import { Model } from "mongoose";

export interface ListQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RunPaginatedQueryOptions extends ListQueryOptions {
  /** Return plain JS objects (faster, less memory for read-only APIs) */
  lean?: boolean;
  /** Mongoose projection string or object */
  select?: string | Record<string, 0 | 1>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const runPaginatedQuery = async <T>(
  model: Model<T>,
  filter: Record<string, unknown>,
  options: RunPaginatedQueryOptions
): Promise<PaginatedResult<T>> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const sortBy = options.sortBy ?? "createdAt";
  const sortOrder = options.sortOrder === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const base = model.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);
  const withSelect = options.select ? base.select(options.select) : base;

  const itemsPromise = options.lean
    ? withSelect.lean().exec()
    : withSelect.exec();

  const [items, total] = await Promise.all([itemsPromise, model.countDocuments(filter)]);

  return {
    items: items as T[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Pagination math shared when using custom find chains (e.g. populate) */
export const getPaginationParams = (
  page?: number,
  limit?: number
): { page: number; limit: number; skip: number } => {
  const p = page ?? 1;
  const l = limit ?? 10;
  return { page: p, limit: l, skip: (p - 1) * l };
};

const JOB_SUMMARY_SELECT = "title location deadline isActive salaryMin salaryMax jobType";
const CANDIDATE_SUMMARY_SELECT = "name email role isActive";

/** Candidate listing: only job summary */
export const POPULATE_APPLICATION_JOB_ONLY: PopulateOptions = {
  path: "jobId",
  select: JOB_SUMMARY_SELECT,
};

/** Recruiter listing per job: only applicant summary */
export const POPULATE_APPLICATION_CANDIDATE_ONLY: PopulateOptions = {
  path: "candidateId",
  select: CANDIDATE_SUMMARY_SELECT,
};

/** Admin full list: job + candidate */
export const POPULATE_APPLICATION_FULL: PopulateOptions[] = [
  POPULATE_APPLICATION_JOB_ONLY,
  POPULATE_APPLICATION_CANDIDATE_ONLY,
];
