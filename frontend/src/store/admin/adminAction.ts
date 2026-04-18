import { createAction } from '@reduxjs/toolkit';
import { ADMIN_ACTION_TYPES } from '@/store/ActionTypes';

export type FetchOverviewPayload = { from?: string; to?: string };

export type FetchAdminJobsPayload = {
  page?: number;
  limit?: number;
};

export type FetchAdminApplicationsPayload = {
  page?: number;
  limit?: number;
};

export const fetchAdminOverviewRequest = createAction<FetchOverviewPayload>(
  ADMIN_ACTION_TYPES.FETCH_OVERVIEW_REQUEST,
);
export const fetchAdminJobsRequest = createAction<FetchAdminJobsPayload>(
  ADMIN_ACTION_TYPES.FETCH_ADMIN_JOBS_REQUEST,
);
export const fetchAdminApplicationsRequest = createAction<FetchAdminApplicationsPayload>(
  ADMIN_ACTION_TYPES.FETCH_ADMIN_APPLICATIONS_REQUEST,
);
