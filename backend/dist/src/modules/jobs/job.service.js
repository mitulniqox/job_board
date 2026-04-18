"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJobBookmark = exports.addJobBookmark = exports.listBookmarkedJobIds = exports.listBookmarkedJobs = exports.getRecruiterOverview = exports.toggleJobStatus = exports.deleteJob = exports.updateJob = exports.getJobById = exports.listJobs = exports.createJob = void 0;
const AppError_1 = require("../../core/errors/AppError");
const queryBuilder_1 = require("../../core/utils/queryBuilder");
const job_query_1 = require("./job.query");
const job_model_1 = require("./job.model");
const user_model_1 = require("../users/user.model");
const notification_service_1 = require("../notifications/notification.service");
const application_model_1 = require("../applications/application.model");
const assertRecruiterOwnership = (job, actor) => {
    if (actor.role !== "RECRUITER" || job.recruiterId.toString() !== actor.userId) {
        throw new AppError_1.AppError("Forbidden", 403);
    }
};
const createJob = async (recruiterId, payload) => {
    const job = await job_model_1.JobEntity.create({ ...payload, recruiterId, isActive: true });
    const candidates = await user_model_1.UserEntity.find({ role: "CANDIDATE", isActive: true }).select("_id").lean();
    const candidateIds = candidates.map((candidate) => candidate._id.toString());
    if (candidateIds.length > 0) {
        await (0, notification_service_1.notifyUsers)(candidateIds, {
            type: "new_job_posted",
            title: "New job posted",
            message: `${job.title} is now open for applications in ${job.location}.`,
            data: { jobId: job._id.toString(), jobTitle: job.title, location: job.location },
        });
    }
    return job;
};
exports.createJob = createJob;
const listJobs = async (filters, actor) => {
    const query = (0, job_query_1.buildJobListFilter)({
        search: filters.search,
        location: filters.location,
        jobType: filters.jobType,
        isActive: filters.isActive,
        includeDescriptionInSearch: true,
    });
    if (actor?.role === "RECRUITER") {
        query.recruiterId = actor.userId;
    }
    const data = await (0, queryBuilder_1.runPaginatedQuery)(job_model_1.JobEntity, query, {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy ?? "createdAt",
        sortOrder: filters.sortOrder ?? "desc",
        lean: true,
        select: job_query_1.JOB_LIST_SELECT,
    });
    return {
        jobs: data.items,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
    };
};
exports.listJobs = listJobs;
const getJobById = async (jobId, actor) => {
    const job = await job_model_1.JobEntity.findById(jobId);
    if (!job) {
        throw new AppError_1.AppError("Job not found", 404);
    }
    if (actor?.role === "RECRUITER" && job.recruiterId.toString() !== actor.userId) {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    return job;
};
exports.getJobById = getJobById;
const updateJob = async (jobId, actor, payload) => {
    const job = await (0, exports.getJobById)(jobId);
    assertRecruiterOwnership(job, actor);
    Object.assign(job, payload);
    await job.save();
    return job;
};
exports.updateJob = updateJob;
const deleteJob = async (jobId, actor) => {
    const job = await (0, exports.getJobById)(jobId);
    assertRecruiterOwnership(job, actor);
    await job_model_1.JobEntity.findByIdAndDelete(jobId);
};
exports.deleteJob = deleteJob;
const toggleJobStatus = async (jobId, actor, isActive) => {
    const job = await (0, exports.getJobById)(jobId);
    assertRecruiterOwnership(job, actor);
    job.isActive = isActive;
    await job.save();
    return job;
};
exports.toggleJobStatus = toggleJobStatus;
const getRecruiterOverview = async (recruiterId) => {
    const jobs = await job_model_1.JobEntity.find({ recruiterId })
        .select("title isActive createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .lean();
    const jobIds = jobs.map((job) => job._id);
    const [applicantCounts, recentApplications] = await Promise.all([
        jobIds.length > 0
            ? application_model_1.ApplicationEntity.aggregate([
                { $match: { jobId: { $in: jobIds } } },
                { $count: "totalApplicants" },
            ])
            : Promise.resolve([]),
        jobIds.length > 0
            ? application_model_1.ApplicationEntity.find({ jobId: { $in: jobIds } })
                .populate("jobId", "title")
                .populate("candidateId", "name email")
                .sort({ updatedAt: -1 })
                .limit(6)
                .lean()
            : Promise.resolve([]),
    ]);
    const recentActivity = [
        ...jobs.slice(0, 6).map((job) => ({
            id: `job:${job._id.toString()}`,
            type: "JOB",
            title: "Job listing updated",
            message: `${job.title} is ${job.isActive ? "active" : "closed"}.`,
            createdAt: job.updatedAt?.toISOString?.() ?? new Date(job.updatedAt).toISOString(),
        })),
        ...recentApplications.map((application) => {
            const jobRef = application.jobId;
            const candidateRef = application.candidateId;
            return {
                id: `application:${application._id.toString()}`,
                type: "APPLICATION",
                title: "New applicant activity",
                message: `${candidateRef?.name ?? candidateRef?.email ?? "A candidate"} is ${application.status} for ${jobRef?.title ?? "a job"}.`,
                createdAt: application.updatedAt?.toISOString?.() ?? new Date(application.updatedAt).toISOString(),
            };
        }),
    ]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 8);
    return {
        activeJobsCount: jobs.filter((job) => job.isActive).length,
        totalApplicants: applicantCounts[0]?.totalApplicants ?? 0,
        recentActivity,
    };
};
exports.getRecruiterOverview = getRecruiterOverview;
const listBookmarkedJobs = async (candidateId, filters) => {
    const user = await user_model_1.UserEntity.findById(candidateId).select("bookmarkedJobs").lean();
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    const bookmarkedJobs = user.bookmarkedJobs ?? [];
    if (bookmarkedJobs.length === 0) {
        return {
            jobs: [],
            total: 0,
            page: filters.page ?? 1,
            limit: filters.limit ?? 10,
            totalPages: 0,
        };
    }
    const query = (0, job_query_1.buildJobListFilter)({
        search: filters.search,
        skills: filters.skills,
        location: filters.location,
        jobType: filters.jobType,
        isActive: filters.isActive,
        includeDescriptionInSearch: true,
    });
    query._id = { $in: bookmarkedJobs };
    const data = await (0, queryBuilder_1.runPaginatedQuery)(job_model_1.JobEntity, query, {
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy ?? "createdAt",
        sortOrder: filters.sortOrder ?? "desc",
        lean: true,
        select: job_query_1.JOB_LIST_SELECT,
    });
    return {
        jobs: data.items,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
    };
};
exports.listBookmarkedJobs = listBookmarkedJobs;
const listBookmarkedJobIds = async (candidateId) => {
    const user = await user_model_1.UserEntity.findById(candidateId).select("bookmarkedJobs").lean();
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    return (user.bookmarkedJobs ?? []).map((jobId) => jobId.toString());
};
exports.listBookmarkedJobIds = listBookmarkedJobIds;
const addJobBookmark = async (candidateId, jobId) => {
    const job = await (0, exports.getJobById)(jobId);
    await user_model_1.UserEntity.findByIdAndUpdate(candidateId, { $addToSet: { bookmarkedJobs: job._id } });
    return { jobId: job._id.toString(), bookmarked: true };
};
exports.addJobBookmark = addJobBookmark;
const removeJobBookmark = async (candidateId, jobId) => {
    await user_model_1.UserEntity.findByIdAndUpdate(candidateId, { $pull: { bookmarkedJobs: jobId } });
    return { jobId, bookmarked: false };
};
exports.removeJobBookmark = removeJobBookmark;
