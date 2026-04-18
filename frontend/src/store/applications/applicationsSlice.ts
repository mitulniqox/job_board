import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Application } from '@/types/application';

type ApplicationsState = {
  mine: Application[];
  jobApplications: Application[];
  candidateApplications: Application[];
  error: string | null;
};

const initialState: ApplicationsState = {
  mine: [],
  jobApplications: [],
  candidateApplications: [],
  error: null,
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setMyApplications(state, action: PayloadAction<Application[]>) {
      state.mine = action.payload;
      state.error = null;
    },
    setJobApplications(state, action: PayloadAction<Application[]>) {
      state.jobApplications = action.payload;
      state.error = null;
    },
    setCandidateApplications(state, action: PayloadAction<Application[]>) {
      state.candidateApplications = action.payload;
      state.error = null;
    },
    setApplicationsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearJobApplications(state) {
      state.jobApplications = [];
    },
    clearCandidateApplications(state) {
      state.candidateApplications = [];
    },
  },
});

export const {
  setMyApplications,
  setJobApplications,
  setCandidateApplications,
  setApplicationsError,
  clearJobApplications,
  clearCandidateApplications,
} = applicationsSlice.actions;
export default applicationsSlice.reducer;
