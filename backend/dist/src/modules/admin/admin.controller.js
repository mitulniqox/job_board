"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllApplicationsReadOnlyHandler = exports.getAllJobsReadOnlyHandler = exports.updateUserStatusHandler = exports.getAllUsersHandler = exports.getAdminOverview = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const apiResponse_1 = require("../../core/utils/apiResponse");
const admin_service_1 = require("./admin.service");
exports.getAdminOverview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, admin_service_1.getDashboardStats)({
        from: req.query.from,
        to: req.query.to,
    });
    (0, apiResponse_1.sendSuccess)(res, 200, "Admin overview fetched", data);
});
exports.getAllUsersHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, admin_service_1.getAllUsers)({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search ?? req.query.q,
        skills: parseSkillsQuery(req.query.skills),
        location: req.query.location,
        role: req.query.role,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    });
    (0, apiResponse_1.sendSuccess)(res, 200, "Users fetched", data);
});
exports.updateUserStatusHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, admin_service_1.updateUserActiveStatus)(req.params.userId, req.body.isActive);
    (0, apiResponse_1.sendSuccess)(res, 200, req.body.isActive ? "User activated" : "User suspended", data);
});
exports.getAllJobsReadOnlyHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, admin_service_1.getAllJobsReadOnly)({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search ?? req.query.q,
        skills: parseSkillsQuery(req.query.skills),
        jobType: req.query.jobType,
        location: req.query.location,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    });
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
exports.getAllApplicationsReadOnlyHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, admin_service_1.getAllApplicationsReadOnly)({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status,
        jobId: req.query.jobId,
        candidateId: req.query.candidateId,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
    });
    (0, apiResponse_1.sendSuccess)(res, 200, "Applications fetched", data);
});
