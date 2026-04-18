import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { JobListItem } from '@/types/job';
import type { Application } from '@/types/application';
import type { ApplicationStatus } from '@/constants/application';
import type { JobType } from '@/constants/job';

export type AdminOverview = {
  usersCount: number;
  jobsCount: number;
  applicationsCount: number;
  candidatesCount: number;
  recruitersCount: number;
  suspendedUsersCount: number;
  activeJobsCount: number;
  topRecruiters: Array<{
    recruiterId: string;
    name: string;
    email: string;
    jobsCount: number;
    activeJobsCount: number;
    applicationsCount: number;
  }>;
  jobTrend: Array<{ date: string; count: number; label: string }>;
  applicationTrend: Array<{ date: string; count: number; label: string }>;
};

type AdminJobsFilters = {
  search: string;
  jobType: '' | JobType;
  location: string;
  isActive: '' | 'true' | 'false';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type AdminApplicationsFilters = {
  status: '' | ApplicationStatus;
  jobId: string;
  candidateId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type AdminState = {
  overview: AdminOverview | null;
  jobs: {
    items: JobListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: AdminJobsFilters;
  };
  applications: {
    items: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: AdminApplicationsFilters;
  };
  error: string | null;
};

const initialState: AdminState = {
  overview: null,
  jobs: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    filters: {
      search: '',
      jobType: '',
      location: '',
      isActive: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  },
  applications: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    filters: {
      status: '',
      jobId: '',
      candidateId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
  },
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setOverview(state, action: PayloadAction<AdminOverview>) {
      state.overview = action.payload;
      state.error = null;
    },
    setAdminJobs(
      state,
      action: PayloadAction<{
        items: JobListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>,
    ) {
      state.jobs.items = action.payload.items;
      state.jobs.total = action.payload.total;
      state.jobs.page = action.payload.page;
      state.jobs.limit = action.payload.limit;
      state.jobs.totalPages = action.payload.totalPages;
      state.error = null;
    },
    setAdminJobFilters(state, action: PayloadAction<Partial<AdminJobsFilters>>) {
      state.jobs.filters = { ...state.jobs.filters, ...action.payload };
    },
    setAdminApplications(
      state,
      action: PayloadAction<{
        items: Application[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>,
    ) {
      state.applications.items = action.payload.items;
      state.applications.total = action.payload.total;
      state.applications.page = action.payload.page;
      state.applications.limit = action.payload.limit;
      state.applications.totalPages = action.payload.totalPages;
      state.error = null;
    },
    setAdminApplicationFilters(state, action: PayloadAction<Partial<AdminApplicationsFilters>>) {
      state.applications.filters = { ...state.applications.filters, ...action.payload };
    },
    setAdminError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const {
  setOverview,
  setAdminJobs,
  setAdminJobFilters,
  setAdminApplications,
  setAdminApplicationFilters,
  setAdminError,
} = adminSlice.actions;
export default adminSlice.reducer;
