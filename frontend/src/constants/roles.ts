export const USER_ROLES = ['ADMIN', 'RECRUITER', 'CANDIDATE'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  RECRUITER: 'Recruiter',
  CANDIDATE: 'Candidate',
};
