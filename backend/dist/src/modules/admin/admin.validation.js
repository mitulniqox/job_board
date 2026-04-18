"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListApplicationsQuerySchema = exports.adminListJobsQuerySchema = exports.adminUpdateUserStatusSchema = exports.adminListUsersQuerySchema = exports.dashboardStatsQuerySchema = void 0;
const zod_1 = require("zod");
const job_model_1 = require("../jobs/job.model");
const application_model_1 = require("../applications/application.model");
const user_model_1 = require("../users/user.model");
exports.dashboardStatsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        from: zod_1.z.string().datetime().optional(),
        to: zod_1.z.string().datetime().optional(),
    }),
});
exports.adminListUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        search: zod_1.z.string().optional(),
        q: zod_1.z.string().optional(),
        skills: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        location: zod_1.z.string().optional(),
        role: zod_1.z.enum(user_model_1.userRoles).optional(),
        isActive: zod_1.z.enum(["true", "false"]).optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
exports.adminUpdateUserStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        isActive: zod_1.z.boolean(),
    }),
});
exports.adminListJobsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        search: zod_1.z.string().optional(),
        q: zod_1.z.string().optional(),
        skills: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
        jobType: zod_1.z.enum(job_model_1.jobTypes).optional(),
        location: zod_1.z.string().optional(),
        isActive: zod_1.z.enum(["true", "false"]).optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
exports.adminListApplicationsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        status: zod_1.z.enum(application_model_1.applicationStatuses).optional(),
        jobId: zod_1.z.string().optional(),
        candidateId: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
