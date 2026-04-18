"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatusHandler = exports.jobApplicationsHandler = exports.candidateApplicationsHandler = exports.myApplicationsHandler = exports.applyToJobHandler = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const apiResponse_1 = require("../../core/utils/apiResponse");
const application_service_1 = require("./application.service");
exports.applyToJobHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const application = await (0, application_service_1.applyToJob)(req.user.sub, req.params.jobId, req.body);
    (0, apiResponse_1.sendSuccess)(res, 201, "Application submitted", application);
});
exports.myApplicationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const applications = await (0, application_service_1.listMyApplications)(req.user.sub);
    (0, apiResponse_1.sendSuccess)(res, 200, "Applications fetched", applications);
});
exports.candidateApplicationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const applications = await (0, application_service_1.listApplicationsByCandidate)({ userId: req.user.sub, role: req.user.role }, req.params.candidateId);
    (0, apiResponse_1.sendSuccess)(res, 200, "Candidate applications fetched", applications);
});
exports.jobApplicationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const applications = await (0, application_service_1.listApplicationsForJob)({ userId: req.user.sub, role: req.user.role }, req.params.jobId);
    (0, apiResponse_1.sendSuccess)(res, 200, "Job applications fetched", applications);
});
exports.updateApplicationStatusHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const application = await (0, application_service_1.updateApplicationStatus)({ userId: req.user.sub, role: req.user.role }, req.params.applicationId, req.body.status);
    (0, apiResponse_1.sendSuccess)(res, 200, "Application status updated", application);
});
