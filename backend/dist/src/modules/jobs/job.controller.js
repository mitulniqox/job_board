"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJobBookmarkHandler = exports.addJobBookmarkHandler = exports.bookmarkedJobIdsHandler = exports.listBookmarkedJobsHandler = exports.recruiterOverviewHandler = exports.reopenJobHandler = exports.closeJobHandler = exports.deleteJobHandler = exports.updateJobHandler = exports.getJobHandler = exports.listJobsHandler = exports.createJobHandler = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const apiResponse_1 = require("../../core/utils/apiResponse");
const job_service_1 = require("./job.service");
exports.createJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await (0, job_service_1.createJob)(req.user.sub, req.body);
    (0, apiResponse_1.sendSuccess)(res, 201, "Job created", job);
});
exports.listJobsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, job_service_1.listJobs)({
        search: req.query.search ?? req.query.q,
        skills: parseSkillsQuery(req.query.skills),
        location: req.query.location,
        jobType: req.query.jobType,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    }, req.user ? { userId: req.user.sub, role: req.user.role } : undefined);
    (0, apiResponse_1.sendSuccess)(res, 200, "Jobs fetched", data);
});
const parseSkillsQuery = (value) => {
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
exports.getJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await (0, job_service_1.getJobById)(req.params.id, req.user ? { userId: req.user.sub, role: req.user.role } : undefined);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job fetched", job);
});
exports.updateJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await (0, job_service_1.updateJob)(req.params.id, { userId: req.user.sub, role: req.user.role }, req.body);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job updated", job);
});
exports.deleteJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, job_service_1.deleteJob)(req.params.id, { userId: req.user.sub, role: req.user.role });
    (0, apiResponse_1.sendSuccess)(res, 200, "Job deleted");
});
exports.closeJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await (0, job_service_1.toggleJobStatus)(req.params.id, { userId: req.user.sub, role: req.user.role }, false);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job closed", job);
});
exports.reopenJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const job = await (0, job_service_1.toggleJobStatus)(req.params.id, { userId: req.user.sub, role: req.user.role }, true);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job reopened", job);
});
exports.recruiterOverviewHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, job_service_1.getRecruiterOverview)(req.user.sub);
    (0, apiResponse_1.sendSuccess)(res, 200, "Recruiter overview fetched", data);
});
exports.listBookmarkedJobsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, job_service_1.listBookmarkedJobs)(req.user.sub, {
        search: req.query.search ?? req.query.q,
        skills: parseSkillsQuery(req.query.skills),
        location: req.query.location,
        jobType: req.query.jobType,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    });
    (0, apiResponse_1.sendSuccess)(res, 200, "Bookmarked jobs fetched", data);
});
exports.bookmarkedJobIdsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, job_service_1.listBookmarkedJobIds)(req.user.sub);
    (0, apiResponse_1.sendSuccess)(res, 200, "Bookmarked job ids fetched", data);
});
exports.addJobBookmarkHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, job_service_1.addJobBookmark)(req.user.sub, req.params.id);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job bookmarked", data);
});
exports.removeJobBookmarkHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, job_service_1.removeJobBookmark)(req.user.sub, req.params.id);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job bookmark removed", data);
});
