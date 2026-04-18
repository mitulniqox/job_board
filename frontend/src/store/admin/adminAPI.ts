import { api } from '@/utils/axios';
import type { ApiSuccess } from '@/types/api';
import type { Job } from '@/types/job';
import type { Application } from '@/types/application';
import type { ApplicationStatus } from '@/constants/application';
import type { JobType } from '@/constants/job';
import type { AdminOverview } from './adminSlice';

type PaginatedJobs = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type PaginatedApplications = {
  items: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const adminAPI = {
  overview: async (params: { from?: string; to?: string }) => {
    const res = await api.get<ApiSuccess<AdminOverview>>('/admin/overview', { params });
    return res.data;
  },
  jobs: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    jobType?: JobType;
    location?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get<ApiSuccess<PaginatedJobs>>('/admin/jobs', { params });
    return res.data;
  },
  applications: async (params: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    jobId?: string;
    candidateId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get<ApiSuccess<PaginatedApplications>>('/admin/applications', { params });
    return res.data;
  },
};
