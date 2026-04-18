"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POPULATE_APPLICATION_FULL = exports.POPULATE_APPLICATION_CANDIDATE_ONLY = exports.POPULATE_APPLICATION_JOB_ONLY = exports.getPaginationParams = exports.runPaginatedQuery = void 0;
const runPaginatedQuery = async (model, filter, options) => {
    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sortBy = options.sortBy ?? "createdAt";
    const sortOrder = options.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const base = model.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);
    const withSelect = options.select ? base.select(options.select) : base;
    const itemsPromise = options.lean
        ? withSelect.lean().exec()
        : withSelect.exec();
    const [items, total] = await Promise.all([itemsPromise, model.countDocuments(filter)]);
    return {
        items: items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.runPaginatedQuery = runPaginatedQuery;
/** Pagination math shared when using custom find chains (e.g. populate) */
const getPaginationParams = (page, limit) => {
    const p = page ?? 1;
    const l = limit ?? 10;
    return { page: p, limit: l, skip: (p - 1) * l };
};
exports.getPaginationParams = getPaginationParams;
const JOB_SUMMARY_SELECT = "title location deadline isActive salaryMin salaryMax jobType";
const CANDIDATE_SUMMARY_SELECT = "name email role isActive";
/** Candidate listing: only job summary */
exports.POPULATE_APPLICATION_JOB_ONLY = {
    path: "jobId",
    select: JOB_SUMMARY_SELECT,
};
/** Recruiter listing per job: only applicant summary */
exports.POPULATE_APPLICATION_CANDIDATE_ONLY = {
    path: "candidateId",
    select: CANDIDATE_SUMMARY_SELECT,
};
/** Admin full list: job + candidate */
exports.POPULATE_APPLICATION_FULL = [
    exports.POPULATE_APPLICATION_JOB_ONLY,
    exports.POPULATE_APPLICATION_CANDIDATE_ONLY,
];
