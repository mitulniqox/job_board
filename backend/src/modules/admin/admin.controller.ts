import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/asyncHandler";
import { sendSuccess } from "../../core/utils/apiResponse";
import {
  getAllApplicationsReadOnly,
  getAllJobsReadOnly,
  getAllUsers,
  getDashboardStats,
  updateUserActiveStatus,
} from "./admin.service";

export const getAdminOverview = asyncHandler(async (req: Request, res: Response) => {
  const data = await getDashboardStats({
    from: req.query.from as string | undefined,
    to: req.query.to as string | undefined,
  });
  sendSuccess(res, 200, "Admin overview fetched", data);
});

export const getAllUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAllUsers({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: (req.query.search as string | undefined) ?? (req.query.q as string | undefined),
    skills: parseSkillsQuery(req.query.skills),
    location: req.query.location as string | undefined,
    role: req.query.role as "ADMIN" | "RECRUITER" | "CANDIDATE" | undefined,
    isActive:
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  });
  sendSuccess(res, 200, "Users fetched", data);
});

export const updateUserStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateUserActiveStatus(req.params.userId, req.body.isActive);
  sendSuccess(res, 200, req.body.isActive ? "User activated" : "User suspended", data);
});

export const getAllJobsReadOnlyHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAllJobsReadOnly({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: (req.query.search as string | undefined) ?? (req.query.q as string | undefined),
    skills: parseSkillsQuery(req.query.skills),
    jobType: req.query.jobType as
      | "FULL_TIME"
      | "PART_TIME"
      | "CONTRACT"
      | "INTERNSHIP"
      | "REMOTE"
      | undefined,
    location: req.query.location as string | undefined,
    isActive:
      req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  });
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

export const getAllApplicationsReadOnlyHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await getAllApplicationsReadOnly({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    status: req.query.status as "Applied" | "Shortlisted" | "Interviewed" | "Rejected" | "Hired" | undefined,
    jobId: req.query.jobId as string | undefined,
    candidateId: req.query.candidateId as string | undefined,
    sortBy: req.query.sortBy as string | undefined,
    sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
  });
  sendSuccess(res, 200, "Applications fetched", data);
});
