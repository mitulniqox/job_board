export const APPLICATION_STATUSES = [
  'Applied',
  'Shortlisted',
  'Interviewed',
  'Rejected',
  'Hired',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
