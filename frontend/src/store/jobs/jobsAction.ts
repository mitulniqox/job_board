import { createAction } from '@reduxjs/toolkit';
import { JOBS_ACTION_TYPES } from '@/store/ActionTypes';
import type { JobType } from '@/constants/job';
import type { JobsListFilters } from './jobsSlice';

export type FetchPublicJobsPayload = {
  page?: number;
  limit?: number;
  filters?: Partial<JobsListFilters>;
};

export type FetchJobPayload = { jobId: string };

export type CreateJobPayload = {
  title: string;
  description: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  location: string;
  deadline: string;
};

export type UpdateJobPayload = {
  jobId: string;
  body: Partial<{
    title: string;
    description: string;
    skills: string[];
    salaryMin: number;
    salaryMax: number;
    jobType: JobType;
    location: string;
    deadline: string;
    isActive: boolean;
  }>;
};

export type ToggleJobPayload = { jobId: string; mode: 'close' | 'reopen' };
export type BookmarkJobPayload = { jobId: string };

export const fetchPublicJobsRequest = createAction<FetchPublicJobsPayload>(
  JOBS_ACTION_TYPES.FETCH_PUBLIC_JOBS_REQUEST,
);
export const fetchJobRequest = createAction<FetchJobPayload>(JOBS_ACTION_TYPES.FETCH_JOB_REQUEST);
export const createJobRequest = createAction<CreateJobPayload>(
  JOBS_ACTION_TYPES.CREATE_JOB_REQUEST,
);
export const updateJobRequest = createAction<UpdateJobPayload>(
  JOBS_ACTION_TYPES.UPDATE_JOB_REQUEST,
);
export const deleteJobRequest = createAction<{ jobId: string }>(
  JOBS_ACTION_TYPES.DELETE_JOB_REQUEST,
);
export const toggleJobRequest = createAction<ToggleJobPayload>(
  JOBS_ACTION_TYPES.TOGGLE_JOB_REQUEST,
);
export const fetchRecruiterOverviewRequest = createAction(
  JOBS_ACTION_TYPES.FETCH_RECRUITER_OVERVIEW_REQUEST,
);
export const fetchBookmarkedJobsRequest = createAction<FetchPublicJobsPayload>(
  JOBS_ACTION_TYPES.FETCH_BOOKMARKED_JOBS_REQUEST,
);
export const fetchBookmarkedJobIdsRequest = createAction(
  JOBS_ACTION_TYPES.FETCH_BOOKMARKED_JOB_IDS_REQUEST,
);
export const bookmarkJobRequest = createAction<BookmarkJobPayload>(
  JOBS_ACTION_TYPES.BOOKMARK_JOB_REQUEST,
);
export const unbookmarkJobRequest = createAction<BookmarkJobPayload>(
  JOBS_ACTION_TYPES.UNBOOKMARK_JOB_REQUEST,
);
