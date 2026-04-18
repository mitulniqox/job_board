import { createAction } from '@reduxjs/toolkit';
import { APPLICATIONS_ACTION_TYPES } from '@/store/ActionTypes';
import type { ApplicationStatus } from '@/constants/application';

export type ApplyPayload = {
  jobId: string;
  body: { expectedSalary: number; availability: string; note: string };
};

export type UpdateApplicationStatusPayload = {
  applicationId: string;
  status: ApplicationStatus;
  jobId?: string;
};

export const applyToJobRequest = createAction<ApplyPayload>(
  APPLICATIONS_ACTION_TYPES.APPLY_REQUEST,
);
export const fetchMyApplicationsRequest = createAction(
  APPLICATIONS_ACTION_TYPES.FETCH_MY_APPLICATIONS_REQUEST,
);
export const fetchJobApplicationsRequest = createAction<{ jobId: string }>(
  APPLICATIONS_ACTION_TYPES.FETCH_JOB_APPLICATIONS_REQUEST,
);
export const fetchCandidateApplicationsRequest = createAction<{ candidateId: string }>(
  APPLICATIONS_ACTION_TYPES.FETCH_CANDIDATE_APPLICATIONS_REQUEST,
);
export const updateApplicationStatusRequest = createAction<UpdateApplicationStatusPayload>(
  APPLICATIONS_ACTION_TYPES.UPDATE_STATUS_REQUEST,
);
