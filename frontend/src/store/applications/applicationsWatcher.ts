import { call, put, takeLatest } from 'redux-saga/effects';
import { applicationsAPI } from './applicationsAPI';
import {
  applyToJobRequest,
  fetchCandidateApplicationsRequest,
  fetchJobApplicationsRequest,
  fetchMyApplicationsRequest,
  updateApplicationStatusRequest,
} from './applicationsAction';
import {
  setApplicationsError,
  setCandidateApplications,
  setJobApplications,
  setMyApplications,
} from './applicationsSlice';
import { startLoading, stopLoading } from '@/store/ui/uiSlice';
import { getApiErrorMessage } from '@/utils/axios';

function* applyWorker(action: ReturnType<typeof applyToJobRequest>) {
  try {
    yield put(startLoading());
    yield call(applicationsAPI.apply, action.payload);
    yield put(fetchMyApplicationsRequest());
  } catch (error) {
    yield put(setApplicationsError(getApiErrorMessage(error, 'Unable to submit application')));
  } finally {
    yield put(stopLoading());
  }
}

function* myApplicationsWorker() {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof applicationsAPI.myApplications>> = yield call(
      applicationsAPI.myApplications,
    );
    yield put(setMyApplications(response.data));
  } catch (error) {
    yield put(setApplicationsError(getApiErrorMessage(error, 'Unable to load applications')));
  } finally {
    yield put(stopLoading());
  }
}

function* jobApplicationsWorker(action: ReturnType<typeof fetchJobApplicationsRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof applicationsAPI.jobApplications>> = yield call(
      applicationsAPI.jobApplications,
      action.payload.jobId,
    );
    yield put(setJobApplications(response.data));
  } catch (error) {
    yield put(setApplicationsError(getApiErrorMessage(error, 'Unable to load applications')));
  } finally {
    yield put(stopLoading());
  }
}

function* candidateApplicationsWorker(
  action: ReturnType<typeof fetchCandidateApplicationsRequest>,
) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof applicationsAPI.candidateApplications>> = yield call(
      applicationsAPI.candidateApplications,
      action.payload.candidateId,
    );
    yield put(setCandidateApplications(response.data));
  } catch (error) {
    yield put(setApplicationsError(getApiErrorMessage(error, 'Unable to load applications')));
  } finally {
    yield put(stopLoading());
  }
}

function* updateStatusWorker(action: ReturnType<typeof updateApplicationStatusRequest>) {
  try {
    yield put(startLoading());
    yield call(applicationsAPI.updateStatus, action.payload);
    if (action.payload.jobId) {
      yield put(fetchJobApplicationsRequest({ jobId: action.payload.jobId }));
    }
  } catch (error) {
    yield put(setApplicationsError(getApiErrorMessage(error, 'Unable to update status')));
  } finally {
    yield put(stopLoading());
  }
}

export function* applicationsWatcher() {
  yield takeLatest(applyToJobRequest.type, applyWorker);
  yield takeLatest(fetchMyApplicationsRequest.type, myApplicationsWorker);
  yield takeLatest(fetchJobApplicationsRequest.type, jobApplicationsWorker);
  yield takeLatest(fetchCandidateApplicationsRequest.type, candidateApplicationsWorker);
  yield takeLatest(updateApplicationStatusRequest.type, updateStatusWorker);
}
