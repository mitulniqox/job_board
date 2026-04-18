import type { ApplicationStatus } from '@/constants/application';

export type Application = {
  _id: string;
  jobId: unknown;
  candidateId: unknown;
  expectedSalary: number;
  availability: string;
  note: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};
