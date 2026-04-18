import type { JobType } from '@/constants/job';

export type Job = {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  location: string;
  deadline: string;
  recruiterId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobListItem = Pick<
  Job,
  | '_id'
  | 'title'
  | 'description'
  | 'skills'
  | 'salaryMin'
  | 'salaryMax'
  | 'jobType'
  | 'location'
  | 'deadline'
  | 'recruiterId'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;
