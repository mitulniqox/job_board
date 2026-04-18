import type { UserRole } from "./user.model";

export type UserListFilterInput = {
  search?: string;
  skills?: string[];
  location?: string;
  role?: UserRole;
  isActive?: boolean;
};

export const USER_LIST_SELECT = "name email role isActive candidateProfile createdAt updatedAt";

export function buildUserListFilter(input: UserListFilterInput): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  const andFilters: Record<string, unknown>[] = [];

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

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
