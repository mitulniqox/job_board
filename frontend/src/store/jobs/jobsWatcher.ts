import { call, put, select, takeLatest } from 'redux-saga/effects';
import { jobsAPI } from './jobsAPI';
import {
  bookmarkJobRequest,
  createJobRequest,
  deleteJobRequest,
  fetchBookmarkedJobIdsRequest,
  fetchBookmarkedJobsRequest,
  fetchJobRequest,
  fetchPublicJobsRequest,
  fetchRecruiterOverviewRequest,
  toggleJobRequest,
  unbookmarkJobRequest,
  updateJobRequest,
} from './jobsAction';
import {
  clearCurrentJob,
  setBookmarkedJobIds,
  setCurrentJob,
  setJobsError,
  setJobsList,
  setRecruiterOverview,
  setSavedJobs,
  updateBookmarkedJobState,
} from './jobsSlice';
import { startLoading, stopLoading } from '@/store/ui/uiSlice';
import { getApiErrorMessage } from '@/utils/axios';
import type { RootState } from '@/store/Saga';

function* fetchPublicJobsWorker(action: ReturnType<typeof fetchPublicJobsRequest>) {
  try {
    yield put(startLoading());
    const jobsState: RootState['jobs'] = yield select((s: RootState) => s.jobs);
    const page = action.payload.page ?? jobsState.page;
    const limit = action.payload.limit ?? jobsState.limit;
    const filters = { ...jobsState.filters, ...action.payload.filters };
    const response: Awaited<ReturnType<typeof jobsAPI.list>> = yield call(jobsAPI.list, {
      page,
      limit,
      search: filters.search || undefined,
      skills: filters.skills.length > 0 ? filters.skills : undefined,
      location: filters.location || undefined,
      jobType: filters.jobType || undefined,
      isActive:
        filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
    yield put(
      setJobsList({
        list: response.data.jobs as RootState['jobs']['list'],
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      }),
    );
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to load jobs')));
  } finally {
    yield put(stopLoading());
  }
}

function* fetchJobWorker(action: ReturnType<typeof fetchJobRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof jobsAPI.getById>> = yield call(
      jobsAPI.getById,
      action.payload.jobId,
    );
    yield put(setCurrentJob(response.data));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to load job')));
    yield put(clearCurrentJob());
  } finally {
    yield put(stopLoading());
  }
}

function* fetchRecruiterOverviewWorker() {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof jobsAPI.recruiterOverview>> = yield call(
      jobsAPI.recruiterOverview,
    );
    yield put(setRecruiterOverview(response.data));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to load recruiter dashboard')));
  } finally {
    yield put(stopLoading());
  }
}

function* fetchBookmarkedJobsWorker(action: ReturnType<typeof fetchBookmarkedJobsRequest>) {
  try {
    yield put(startLoading());
    const jobsState: RootState['jobs'] = yield select((s: RootState) => s.jobs);
    const page = action.payload.page ?? jobsState.saved.page;
    const limit = action.payload.limit ?? jobsState.saved.limit;
    const filters = { ...jobsState.filters, ...action.payload.filters };
    const response: Awaited<ReturnType<typeof jobsAPI.bookmarkedJobs>> = yield call(
      jobsAPI.bookmarkedJobs,
      {
        page,
        limit,
        search: filters.search || undefined,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        location: filters.location || undefined,
        jobType: filters.jobType || undefined,
        isActive:
          filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    );
    yield put(
      setSavedJobs({
        list: response.data.jobs as RootState['jobs']['saved']['items'],
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      }),
    );
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to load saved jobs')));
  } finally {
    yield put(stopLoading());
  }
}

function* fetchBookmarkedJobIdsWorker() {
  try {
    const response: Awaited<ReturnType<typeof jobsAPI.bookmarkedJobIds>> = yield call(
      jobsAPI.bookmarkedJobIds,
    );
    yield put(setBookmarkedJobIds(response.data));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to load saved jobs')));
  }
}

function* createJobWorker(action: ReturnType<typeof createJobRequest>) {
  try {
    yield put(startLoading());
    yield call(jobsAPI.create, action.payload);
    yield put(fetchPublicJobsRequest({}));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to create job')));
  } finally {
    yield put(stopLoading());
  }
}

function* updateJobWorker(action: ReturnType<typeof updateJobRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof jobsAPI.update>> = yield call(
      jobsAPI.update,
      action.payload.jobId,
      action.payload.body,
    );
    yield put(setCurrentJob(response.data));
    yield put(fetchPublicJobsRequest({}));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to update job')));
  } finally {
    yield put(stopLoading());
  }
}

function* deleteJobWorker(action: ReturnType<typeof deleteJobRequest>) {
  try {
    yield put(startLoading());
    yield call(jobsAPI.remove, action.payload.jobId);
    yield put(clearCurrentJob());
    yield put(fetchPublicJobsRequest({}));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to delete job')));
  } finally {
    yield put(stopLoading());
  }
}

function* toggleJobWorker(action: ReturnType<typeof toggleJobRequest>) {
  try {
    yield put(startLoading());
    const response:
      | Awaited<ReturnType<typeof jobsAPI.close>>
      | Awaited<ReturnType<typeof jobsAPI.reopen>> =
      action.payload.mode === 'close'
        ? yield call(jobsAPI.close, action.payload.jobId)
        : yield call(jobsAPI.reopen, action.payload.jobId);
    yield put(setCurrentJob(response.data));
    yield put(fetchPublicJobsRequest({}));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to update job status')));
  } finally {
    yield put(stopLoading());
  }
}

function* bookmarkJobWorker(action: ReturnType<typeof bookmarkJobRequest>) {
  try {
    const response: Awaited<ReturnType<typeof jobsAPI.bookmark>> = yield call(
      jobsAPI.bookmark,
      action.payload.jobId,
    );
    yield put(updateBookmarkedJobState(response.data));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to save job')));
  }
}

function* unbookmarkJobWorker(action: ReturnType<typeof unbookmarkJobRequest>) {
  try {
    const response: Awaited<ReturnType<typeof jobsAPI.unbookmark>> = yield call(
      jobsAPI.unbookmark,
      action.payload.jobId,
    );
    yield put(updateBookmarkedJobState(response.data));
  } catch (error) {
    yield put(setJobsError(getApiErrorMessage(error, 'Unable to remove saved job')));
  }
}

export function* jobsWatcher() {
  yield takeLatest(fetchPublicJobsRequest.type, fetchPublicJobsWorker);
  yield takeLatest(fetchJobRequest.type, fetchJobWorker);
  yield takeLatest(fetchRecruiterOverviewRequest.type, fetchRecruiterOverviewWorker);
  yield takeLatest(fetchBookmarkedJobsRequest.type, fetchBookmarkedJobsWorker);
  yield takeLatest(fetchBookmarkedJobIdsRequest.type, fetchBookmarkedJobIdsWorker);
  yield takeLatest(createJobRequest.type, createJobWorker);
  yield takeLatest(updateJobRequest.type, updateJobWorker);
  yield takeLatest(deleteJobRequest.type, deleteJobWorker);
  yield takeLatest(toggleJobRequest.type, toggleJobWorker);
  yield takeLatest(bookmarkJobRequest.type, bookmarkJobWorker);
  yield takeLatest(unbookmarkJobRequest.type, unbookmarkJobWorker);
}
