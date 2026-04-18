"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatus = exports.listApplicationsForJob = exports.listApplicationsByCandidate = exports.listMyApplications = exports.applyToJob = void 0;
const AppError_1 = require("../../core/errors/AppError");
const queryBuilder_1 = require("../../core/utils/queryBuilder");
const job_model_1 = require("../jobs/job.model");
const user_model_1 = require("../users/user.model");
const application_model_1 = require("./application.model");
const notification_service_1 = require("../notifications/notification.service");
const emailService_1 = require("../../services/emailService");
const APPLICATION_LIST_SELECT = "expectedSalary availability note status jobId candidateId createdAt updatedAt";
const applyToJob = async (candidateId, jobId, payload) => {
    const job = await job_model_1.JobEntity.findById(jobId);
    if (!job || !job.isActive || job.deadline < new Date()) {
        throw new AppError_1.AppError("Job is not available for applications", 400);
    }
    const existing = await application_model_1.ApplicationEntity.findOne({ jobId, candidateId });
    if (existing) {
        throw new AppError_1.AppError("You already applied to this job", 409);
    }
    const application = await application_model_1.ApplicationEntity.create({ jobId, candidateId, ...payload });
    const candidate = await user_model_1.UserEntity.findById(candidateId).select("name email").lean();
    await (0, notification_service_1.notifyUser)(job.recruiterId.toString(), {
        type: "job_applied",
        title: "New candidate applied",
        message: `${candidate?.name ?? "A candidate"} applied to ${job.title}.`,
        data: {
            applicationId: application._id.toString(),
            jobId: job._id.toString(),
            jobTitle: job.title,
            candidateId,
            candidateName: candidate?.name ?? "",
            candidateEmail: candidate?.email ?? "",
        },
    });
    if (candidate?.email) {
        void (0, emailService_1.sendApplicationStatusEmail)({
            to: candidate.email,
            candidateName: candidate.name ?? "Candidate",
            jobTitle: job.title,
            status: "Applied",
        });
    }
    return application;
};
exports.applyToJob = applyToJob;
const findApplicationsForCandidate = (candidateId) => application_model_1.ApplicationEntity.find({ candidateId })
    .select(APPLICATION_LIST_SELECT)
    .sort({ createdAt: -1 })
    .populate(queryBuilder_1.POPULATE_APPLICATION_JOB_ONLY)
    .lean();
const listMyApplications = async (candidateId) => findApplicationsForCandidate(candidateId);
exports.listMyApplications = listMyApplications;
const listApplicationsByCandidate = async (actor, candidateId) => {
    if (actor.role === "CANDIDATE" && actor.userId !== candidateId) {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    return findApplicationsForCandidate(candidateId);
};
exports.listApplicationsByCandidate = listApplicationsByCandidate;
const listApplicationsForJob = async (actor, jobId) => {
    const job = await job_model_1.JobEntity.findById(jobId);
    if (!job) {
        throw new AppError_1.AppError("Job not found", 404);
    }
    const isOwner = job.recruiterId.toString() === actor.userId;
    if (!isOwner || actor.role !== "RECRUITER") {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    return application_model_1.ApplicationEntity.find({ jobId })
        .select(APPLICATION_LIST_SELECT)
        .sort({ createdAt: -1 })
        .populate(queryBuilder_1.POPULATE_APPLICATION_CANDIDATE_ONLY)
        .lean();
};
exports.listApplicationsForJob = listApplicationsForJob;
const updateApplicationStatus = async (actor, applicationId, status) => {
    const application = await application_model_1.ApplicationEntity.findById(applicationId);
    if (!application) {
        throw new AppError_1.AppError("Application not found", 404);
    }
    const job = await job_model_1.JobEntity.findById(application.jobId);
    if (!job) {
        throw new AppError_1.AppError("Job not found", 404);
    }
    const isOwner = job.recruiterId.toString() === actor.userId;
    if (!isOwner || actor.role !== "RECRUITER") {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    const candidate = await user_model_1.UserEntity.findById(application.candidateId).select("name email").lean();
    if (!candidate) {
        throw new AppError_1.AppError("Candidate not found", 404);
    }
    application.status = status;
    await application.save();
    const candidateId = application.candidateId.toString();
    await (0, notification_service_1.notifyUser)(candidateId, {
        type: "application_status_updated",
        title: "Application status updated",
        message: `Your application for ${job.title} is now ${status}.`,
        data: {
            applicationId: application._id.toString(),
            jobId: job._id.toString(),
            jobTitle: job.title,
            status,
            candidateId,
        },
    });
    if (candidate.email?.trim()) {
        void (0, emailService_1.sendApplicationStatusEmail)({
            to: candidate.email,
            candidateName: candidate.name ?? "Candidate",
            jobTitle: job.title,
            status,
        });
    }
    else {
        // eslint-disable-next-line no-console
        console.warn("Skipping application status email because candidate email is missing.", candidateId);
    }
    return application;
};
exports.updateApplicationStatus = updateApplicationStatus;
