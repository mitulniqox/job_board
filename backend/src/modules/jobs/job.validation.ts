import { z } from "zod";
import { jobTypes } from "./job.model";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    description: z.string().min(20),
    skills: z.array(z.string().min(1)).min(1),
    salaryMin: z.number().min(0),
    salaryMax: z.number().min(0),
    jobType: z.enum(jobTypes),
    location: z.string().min(2),
    deadline: z.coerce.date(),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(20).optional(),
    skills: z.array(z.string().min(1)).min(1).optional(),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
    jobType: z.enum(jobTypes).optional(),
    location: z.string().min(2).optional(),
    deadline: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const listJobsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    q: z.string().optional(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    location: z.string().optional(),
    jobType: z.enum(jobTypes).optional(),
    isActive: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});
