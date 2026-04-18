"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_LIST_SELECT = void 0;
exports.buildJobListFilter = buildJobListFilter;
/**
 * Builds a MongoDB filter for listing jobs (search, location, type, active).
 */
function buildJobListFilter(input) {
    const query = {};
    const andFilters = [];
    if (input.search) {
        andFilters.push({ $text: { $search: input.search } });
    }
    if (input.skills?.length) {
        andFilters.push({
            skills: { $in: input.skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")) },
        });
    }
    if (input.location) {
        andFilters.push({ location: { $regex: escapeRegex(input.location), $options: "i" } });
    }
    if (input.jobType) {
        andFilters.push({ jobType: input.jobType });
    }
    if (typeof input.isActive === "boolean") {
        andFilters.push({ isActive: input.isActive });
    }
    if (andFilters.length === 1) {
        Object.assign(query, andFilters[0]);
    }
    if (andFilters.length > 1) {
        query.$and = andFilters;
    }
    return query;
}
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Fields returned for job list/card APIs (read-only, lean-friendly) */
exports.JOB_LIST_SELECT = "title description skills salaryMin salaryMax jobType location deadline recruiterId isActive createdAt updatedAt";
