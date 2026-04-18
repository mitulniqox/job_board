"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_LIST_SELECT = void 0;
exports.buildUserListFilter = buildUserListFilter;
exports.USER_LIST_SELECT = "name email role isActive candidateProfile createdAt updatedAt";
function buildUserListFilter(input) {
    const query = {};
    const andFilters = [];
    if (input.search) {
        andFilters.push({ $text: { $search: input.search } });
    }
    if (input.skills?.length) {
        andFilters.push({
            "candidateProfile.skills": {
                $in: input.skills.map((skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")),
            },
        });
    }
    if (input.location) {
        andFilters.push({
            "candidateProfile.location": { $regex: escapeRegex(input.location), $options: "i" },
        });
    }
    if (input.role) {
        andFilters.push({ role: input.role });
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
