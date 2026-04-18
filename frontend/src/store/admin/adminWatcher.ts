import { call, put, select, takeLatest } from 'redux-saga/effects';
import { adminAPI } from './adminAPI';
import {
  fetchAdminApplicationsRequest,
  fetchAdminJobsRequest,
  fetchAdminOverviewRequest,
} from './adminAction';
import { setAdminApplications, setAdminError, setAdminJobs, setOverview } from './adminSlice';
import { startLoading, stopLoading } from '@/store/ui/uiSlice';
import { getApiErrorMessage } from '@/utils/axios';
import type { RootState } from '@/store/Saga';

function* overviewWorker(action: ReturnType<typeof fetchAdminOverviewRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof adminAPI.overview>> = yield call(
      adminAPI.overview,
      action.payload,
    );
    yield put(setOverview(response.data));
  } catch (error) {
    yield put(setAdminError(getApiErrorMessage(error, 'Unable to load overview')));
  } finally {
    yield put(stopLoading());
  }
}

function* adminJobsWorker(action: ReturnType<typeof fetchAdminJobsRequest>) {
  try {
    yield put(startLoading());
    const adminState: RootState['admin'] = yield select((s: RootState) => s.admin);
    const page = action.payload.page ?? adminState.jobs.page;
    const limit = action.payload.limit ?? adminState.jobs.limit;
    const filters = adminState.jobs.filters;
    const response: Awaited<ReturnType<typeof adminAPI.jobs>> = yield call(adminAPI.jobs, {
      page,
      limit,
      search: filters.search || undefined,
      jobType: filters.jobType || undefined,
      location: filters.location || undefined,
      isActive:
        filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    yield put(
      setAdminJobs({
        items: response.data.items,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      }),
    );
  } catch (error) {
    yield put(setAdminError(getApiErrorMessage(error, 'Unable to load jobs')));
  } finally {
    yield put(stopLoading());
  }
}

function* adminApplicationsWorker(action: ReturnType<typeof fetchAdminApplicationsRequest>) {
  try {
    yield put(startLoading());
    const adminState: RootState['admin'] = yield select((s: RootState) => s.admin);
    const page = action.payload.page ?? adminState.applications.page;
    const limit = action.payload.limit ?? adminState.applications.limit;
    const filters = adminState.applications.filters;
    const response: Awaited<ReturnType<typeof adminAPI.applications>> = yield call(
      adminAPI.applications,
      {
        page,
        limit,
        status: filters.status || undefined,
        jobId: filters.jobId || undefined,
        candidateId: filters.candidateId || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    );
    yield put(
      setAdminApplications({
        items: response.data.items,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      }),
    );
  } catch (error) {
    yield put(setAdminError(getApiErrorMessage(error, 'Unable to load applications')));
  } finally {
    yield put(stopLoading());
  }
}

export function* adminWatcher() {
  yield takeLatest(fetchAdminOverviewRequest.type, overviewWorker);
  yield takeLatest(fetchAdminJobsRequest.type, adminJobsWorker);
  yield takeLatest(fetchAdminApplicationsRequest.type, adminApplicationsWorker);
}
