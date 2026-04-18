import { z } from "zod";
import { jobTypes } from "../jobs/job.model";
import { applicationStatuses } from "../applications/application.model";
import { userRoles } from "../users/user.model";

export const dashboardStatsQuerySchema = z.object({
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const adminListUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    q: z.string().optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    location: z.string().optional(),
    role: z.enum(userRoles).optional(),
    isActive: z.enum(["true", "false"]).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const adminUpdateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const adminListJobsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    search: z.string().optional(),
    q: z.string().optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    jobType: z.enum(jobTypes).optional(),
    location: z.string().optional(),
    isActive: z.enum(["true", "false"]).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const adminListApplicationsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    status: z.enum(applicationStatuses).optional(),
    jobId: z.string().optional(),
    candidateId: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});
