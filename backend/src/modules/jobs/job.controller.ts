import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/asyncHandler";
import { sendSuccess } from "../../core/utils/apiResponse";
import {
  addJobBookmark,
  createJob,
  deleteJob,
  getJobById,
  getRecruiterOverview,
  listBookmarkedJobs,
  listBookmarkedJobIds,
  listJobs,
  removeJobBookmark,
  toggleJobStatus,
  updateJob,
} from "./job.service";

export const createJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const job = await createJob(req.user!.sub, req.body);
  sendSuccess(res, 201, "Job created", job);
});

export const listJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await listJobs({
    search: (req.query.search as string | undefined) ?? (req.query.q as string | undefined),
    skills: parseSkillsQuery(req.query.skills),
    location: req.query.location as string | undefined,
    jobType: req.query.jobType as
      | "FULL_TIME"
      | "PART_TIME"
      | "CONTRACT"
      | "INTERNSHIP"
      | "REMOTE"
      | undefined,
    isActive:
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  }, req.user ? { userId: req.user.sub, role: req.user.role } : undefined);
  sendSuccess(res, 200, "Jobs fetched", data);
});

const parseSkillsQuery = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(","))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return undefined;
};

export const getJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const job = await getJobById(
    req.params.id,
    req.user ? { userId: req.user.sub, role: req.user.role } : undefined
  );
  sendSuccess(res, 200, "Job fetched", job);
});

export const updateJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const job = await updateJob(
    req.params.id,
    { userId: req.user!.sub, role: req.user!.role },
    req.body
  );
  sendSuccess(res, 200, "Job updated", job);
});

export const deleteJobHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteJob(req.params.id, { userId: req.user!.sub, role: req.user!.role });
  sendSuccess(res, 200, "Job deleted");
});

export const closeJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const job = await toggleJobStatus(
    req.params.id,
    { userId: req.user!.sub, role: req.user!.role },
    false
  );
  sendSuccess(res, 200, "Job closed", job);
});

export const reopenJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const job = await toggleJobStatus(
    req.params.id,
    { userId: req.user!.sub, role: req.user!.role },
    true
  );
  sendSuccess(res, 200, "Job reopened", job);
});

export const recruiterOverviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getRecruiterOverview(req.user!.sub);
  sendSuccess(res, 200, "Recruiter overview fetched", data);
});

export const listBookmarkedJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await listBookmarkedJobs(req.user!.sub, {
    search: (req.query.search as string | undefined) ?? (req.query.q as string | undefined),
    skills: parseSkillsQuery(req.query.skills),
    location: req.query.location as string | undefined,
    jobType: req.query.jobType as
      | "FULL_TIME"
      | "PART_TIME"
      | "CONTRACT"
      | "INTERNSHIP"
      | "REMOTE"
      | undefined,
    isActive:
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  });
  sendSuccess(res, 200, "Bookmarked jobs fetched", data);
});

export const bookmarkedJobIdsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await listBookmarkedJobIds(req.user!.sub);
  sendSuccess(res, 200, "Bookmarked job ids fetched", data);
});

export const addJobBookmarkHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await addJobBookmark(req.user!.sub, req.params.id);
  sendSuccess(res, 200, "Job bookmarked", data);
});

export const removeJobBookmarkHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await removeJobBookmark(req.user!.sub, req.params.id);
  sendSuccess(res, 200, "Job bookmark removed", data);
});
