import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { JobListItem, Job } from '@/types/job';
import type { JobType } from '@/constants/job';
import type { RecruiterOverview } from './jobsAPI';

export type JobsListFilters = {
  search: string;
  skills: string[];
  location: string;
  jobType: '' | JobType;
  isActive: '' | 'true' | 'false';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type JobsState = {
  list: JobListItem[];
  saved: {
    items: JobListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  bookmarkedJobIds: string[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: JobsListFilters;
  current: Job | null;
  recruiterOverview: RecruiterOverview | null;
  error: string | null;
};

const initialState: JobsState = {
  list: [],
  saved: {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  bookmarkedJobIds: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {
    search: '',
    skills: [],
    location: '',
    jobType: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  current: null,
  recruiterOverview: null,
  error: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setJobsList(
      state,
      action: PayloadAction<{
        list: JobListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>,
    ) {
      state.list = action.payload.list;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
      state.error = null;
    },
    setSavedJobs(
      state,
      action: PayloadAction<{
        list: JobListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>,
    ) {
      state.saved.items = action.payload.list;
      state.saved.total = action.payload.total;
      state.saved.page = action.payload.page;
      state.saved.limit = action.payload.limit;
      state.saved.totalPages = action.payload.totalPages;
      state.error = null;
    },
    setBookmarkedJobIds(state, action: PayloadAction<string[]>) {
      state.bookmarkedJobIds = action.payload;
      state.error = null;
    },
    updateBookmarkedJobState(state, action: PayloadAction<{ jobId: string; bookmarked: boolean }>) {
      const { jobId, bookmarked } = action.payload;
      const nextIds = new Set(state.bookmarkedJobIds);
      if (bookmarked) {
        nextIds.add(jobId);
      } else {
        nextIds.delete(jobId);
        state.saved.items = state.saved.items.filter((job) => job._id !== jobId);
        state.saved.total = Math.max(0, state.saved.total - 1);
      }
      state.bookmarkedJobIds = [...nextIds];
      state.error = null;
    },
    setJobFilters(state, action: PayloadAction<Partial<JobsListFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setJobPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setCurrentJob(state, action: PayloadAction<Job | null>) {
      state.current = action.payload;
      state.error = null;
    },
    setRecruiterOverview(state, action: PayloadAction<RecruiterOverview>) {
      state.recruiterOverview = action.payload;
      state.error = null;
    },
    setJobsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearCurrentJob(state) {
      state.current = null;
    },
  },
});

export const {
  setJobsList,
  setSavedJobs,
  setBookmarkedJobIds,
  updateBookmarkedJobState,
  setJobFilters,
  setJobPage,
  setCurrentJob,
  setRecruiterOverview,
  setJobsError,
  clearCurrentJob,
} = jobsSlice.actions;
export default jobsSlice.reducer;
