"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllApplicationsReadOnly = exports.getAllJobsReadOnly = exports.updateUserActiveStatus = exports.getAllUsers = exports.getDashboardStats = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = require("../../core/errors/AppError");
const queryBuilder_1 = require("../../core/utils/queryBuilder");
const application_model_1 = require("../applications/application.model");
const job_query_1 = require("../jobs/job.query");
const job_model_1 = require("../jobs/job.model");
const user_model_1 = require("../users/user.model");
const user_query_1 = require("../users/user.query");
const APPLICATION_ADMIN_LIST_SELECT = "expectedSalary availability note status jobId candidateId createdAt updatedAt";
const buildDateMatch = (range) => {
    const dateFilter = {};
    if (range.from)
        dateFilter.$gte = new Date(range.from);
    if (range.to)
        dateFilter.$lte = new Date(range.to);
    return Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
};
const aggregateDailyCounts = async (model, range, label) => model.aggregate([
    { $match: buildDateMatch(range) },
    {
        $group: {
            _id: {
                $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt",
                },
            },
            count: { $sum: 1 },
        },
    },
    { $sort: { _id: 1 } },
]).then((rows) => rows.map((row) => ({ date: row._id, count: row.count, label })));
const getDashboardStats = async (range) => {
    const createdAtMatch = buildDateMatch(range);
    const [usersAgg, jobsAgg, applicationsAgg, candidateCount, recruiterCount, suspendedUsersCount, activeJobsCount, topRecruiters, jobTrend, applicationTrend] = await Promise.all([
        user_model_1.UserEntity.aggregate([{ $match: createdAtMatch }, { $count: "count" }]),
        job_model_1.JobEntity.aggregate([{ $match: createdAtMatch }, { $count: "count" }]),
        application_model_1.ApplicationEntity.aggregate([{ $match: createdAtMatch }, { $count: "count" }]),
        user_model_1.UserEntity.countDocuments({ role: "CANDIDATE" }),
        user_model_1.UserEntity.countDocuments({ role: "RECRUITER" }),
        user_model_1.UserEntity.countDocuments({ isActive: false }),
        job_model_1.JobEntity.countDocuments({ isActive: true }),
        job_model_1.JobEntity.aggregate([
            {
                $group: {
                    _id: "$recruiterId",
                    jobIds: { $push: "$_id" },
                    jobsCount: { $sum: 1 },
                    activeJobsCount: {
                        $sum: {
                            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: "applications",
                    localField: "jobIds",
                    foreignField: "jobId",
                    as: "jobApplications",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "recruiter",
                },
            },
            { $unwind: { path: "$recruiter", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    recruiterId: "$_id",
                    jobsCount: 1,
                    activeJobsCount: 1,
                    applicationsCount: { $size: "$jobApplications" },
                    recruiterName: "$recruiter.name",
                    recruiterEmail: "$recruiter.email",
                },
            },
            { $sort: { applicationsCount: -1, jobsCount: -1 } },
            { $limit: 5 },
        ]),
        aggregateDailyCounts(job_model_1.JobEntity, range, "Jobs"),
        aggregateDailyCounts(application_model_1.ApplicationEntity, range, "Applications"),
    ]);
    return {
        usersCount: usersAgg[0]?.count ?? 0,
        jobsCount: jobsAgg[0]?.count ?? 0,
        applicationsCount: applicationsAgg[0]?.count ?? 0,
        candidatesCount: candidateCount,
        recruitersCount: recruiterCount,
        suspendedUsersCount,
        activeJobsCount,
        topRecruiters: topRecruiters.map((recruiter) => ({
            recruiterId: recruiter.recruiterId.toString(),
            name: recruiter.recruiterName ?? "Unknown recruiter",
            email: recruiter.recruiterEmail ?? "",
            jobsCount: recruiter.jobsCount,
            activeJobsCount: recruiter.activeJobsCount,
            applicationsCount: recruiter.applicationsCount,
        })),
        jobTrend,
        applicationTrend,
    };
};
exports.getDashboardStats = getDashboardStats;
const getAllUsers = async (filters) => {
    const query = (0, user_query_1.buildUserListFilter)(filters);
    return (0, queryBuilder_1.runPaginatedQuery)(user_model_1.UserEntity, query, {
        ...filters,
        lean: true,
        select: user_query_1.USER_LIST_SELECT,
    });
};
exports.getAllUsers = getAllUsers;
const updateUserActiveStatus = async (userId, isActive) => {
    if (!mongoose_1.Types.ObjectId.isValid(userId)) {
        throw new AppError_1.AppError("Invalid user id", 400);
    }
    const updated = await user_model_1.UserEntity.findByIdAndUpdate(userId, { isActive }, { new: true });
    if (!updated) {
        throw new AppError_1.AppError("User not found", 404);
    }
    return updated;
};
exports.updateUserActiveStatus = updateUserActiveStatus;
const getAllJobsReadOnly = async (filters) => {
    const query = (0, job_query_1.buildJobListFilter)({
        search: filters.search,
        skills: filters.skills,
        location: filters.location,
        jobType: filters.jobType,
        isActive: filters.isActive,
        includeDescriptionInSearch: false,
    });
    return (0, queryBuilder_1.runPaginatedQuery)(job_model_1.JobEntity, query, {
        ...filters,
        lean: true,
        select: job_query_1.JOB_LIST_SELECT,
    });
};
exports.getAllJobsReadOnly = getAllJobsReadOnly;
const getAllApplicationsReadOnly = async (filters) => {
    const query = {};
    const { page, limit, skip } = (0, queryBuilder_1.getPaginationParams)(filters.page, filters.limit);
    const sortBy = filters.sortBy ?? "createdAt";
    const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
    if (filters.status)
        query.status = filters.status;
    if (filters.jobId)
        query.jobId = filters.jobId;
    if (filters.candidateId)
        query.candidateId = filters.candidateId;
    const [items, total] = await Promise.all([
        application_model_1.ApplicationEntity.find(query)
            .select(APPLICATION_ADMIN_LIST_SELECT)
            .populate(queryBuilder_1.POPULATE_APPLICATION_FULL)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        application_model_1.ApplicationEntity.countDocuments(query),
    ]);
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.getAllApplicationsReadOnly = getAllApplicationsReadOnly;
