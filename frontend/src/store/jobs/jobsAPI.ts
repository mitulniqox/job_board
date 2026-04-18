import { api } from '@/utils/axios';
import type { ApiSuccess } from '@/types/api';
import type { Job } from '@/types/job';
import type { JobType } from '@/constants/job';
import type { CreateJobPayload, UpdateJobPayload } from './jobsAction';

export type PublicJobsResponse = {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type RecruiterOverview = {
  activeJobsCount: number;
  totalApplicants: number;
  recentActivity: Array<{
    id: string;
    type: 'JOB' | 'APPLICATION';
    title: string;
    message: string;
    createdAt: string;
  }>;
};

export const jobsAPI = {
  list: async (params: {
    search?: string;
    skills?: string[];
    location?: string;
    jobType?: JobType;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get<ApiSuccess<PublicJobsResponse>>('/jobs', {
      params: {
        ...params,
        skills: params.skills?.join(',') || undefined,
      },
    });
    return res.data;
  },
  getById: async (jobId: string) => {
    const res = await api.get<ApiSuccess<Job>>(`/jobs/${jobId}`);
    return res.data;
  },
  create: async (body: CreateJobPayload) => {
    const res = await api.post<ApiSuccess<Job>>('/jobs', {
      ...body,
      deadline: new Date(body.deadline).toISOString(),
    });
    return res.data;
  },
  update: async (jobId: string, body: UpdateJobPayload['body']) => {
    const payload = {
      ...body,
      ...(body.deadline ? { deadline: new Date(body.deadline).toISOString() } : {}),
    };
    const res = await api.patch<ApiSuccess<Job>>(`/jobs/${jobId}`, payload);
    return res.data;
  },
  remove: async (jobId: string) => {
    const res = await api.delete<ApiSuccess<null>>(`/jobs/${jobId}`);
    return res.data;
  },
  close: async (jobId: string) => {
    const res = await api.patch<ApiSuccess<Job>>(`/jobs/${jobId}/close`);
    return res.data;
  },
  reopen: async (jobId: string) => {
    const res = await api.patch<ApiSuccess<Job>>(`/jobs/${jobId}/reopen`);
    return res.data;
  },
  recruiterOverview: async () => {
    const res = await api.get<ApiSuccess<RecruiterOverview>>('/jobs/recruiter/overview');
    return res.data;
  },
  bookmarkedJobs: async (params: {
    search?: string;
    skills?: string[];
    location?: string;
    jobType?: JobType;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get<ApiSuccess<PublicJobsResponse>>('/jobs/bookmarks/me', {
      params: {
        ...params,
        skills: params.skills?.join(',') || undefined,
      },
    });
    return res.data;
  },
  bookmarkedJobIds: async () => {
    const res = await api.get<ApiSuccess<string[]>>('/jobs/bookmarks/me/ids');
    return res.data;
  },
  bookmark: async (jobId: string) => {
    const res = await api.post<ApiSuccess<{ jobId: string; bookmarked: boolean }>>(
      `/jobs/${jobId}/bookmark`,
    );
    return res.data;
  },
  unbookmark: async (jobId: string) => {
    const res = await api.delete<ApiSuccess<{ jobId: string; bookmarked: boolean }>>(
      `/jobs/${jobId}/bookmark`,
    );
    return res.data;
  },
};
