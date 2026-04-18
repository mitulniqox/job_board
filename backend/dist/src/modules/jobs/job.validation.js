"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJobsQuerySchema = exports.updateJobSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
const job_model_1 = require("./job.model");
exports.createJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3),
        description: zod_1.z.string().min(20),
        skills: zod_1.z.array(zod_1.z.string().min(1)).min(1),
        salaryMin: zod_1.z.number().min(0),
        salaryMax: zod_1.z.number().min(0),
        jobType: zod_1.z.enum(job_model_1.jobTypes),
        location: zod_1.z.string().min(2),
        deadline: zod_1.z.coerce.date(),
    }),
});
exports.updateJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(20).optional(),
        skills: zod_1.z.array(zod_1.z.string().min(1)).min(1).optional(),
        salaryMin: zod_1.z.number().min(0).optional(),
        salaryMax: zod_1.z.number().min(0).optional(),
        jobType: zod_1.z.enum(job_model_1.jobTypes).optional(),
        location: zod_1.z.string().min(2).optional(),
        deadline: zod_1.z.coerce.date().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.listJobsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        q: zod_1.z.string().optional(),
        skills: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        location: zod_1.z.string().optional(),
        jobType: zod_1.z.enum(job_model_1.jobTypes).optional(),
        isActive: zod_1.z.enum(["true", "false"]).optional(),
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
