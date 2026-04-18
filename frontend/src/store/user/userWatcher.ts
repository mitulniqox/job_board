import { call, put, select, takeLatest } from 'redux-saga/effects';
import { userAPI } from './userAPI';
import { fetchAdminUsersRequest, updateUserStatusRequest } from './userAction';
import { setUserListError, setUsersList } from './userSlice';
import { startLoading, stopLoading } from '@/store/ui/uiSlice';
import { getApiErrorMessage } from '@/utils/axios';
import type { RootState } from '@/store/Saga';

function* fetchAdminUsersWorker(action: ReturnType<typeof fetchAdminUsersRequest>) {
  try {
    yield put(startLoading());
    const userState: RootState['user'] = yield select((s: RootState) => s.user);
    const page = action.payload.page ?? userState.page;
    const limit = action.payload.limit ?? userState.limit;
    const filters = { ...userState.filters, ...action.payload.filters };
    const response: Awaited<ReturnType<typeof userAPI.fetchAdminUsers>> = yield call(
      userAPI.fetchAdminUsers,
      {
        page,
        limit,
        search: filters.search || undefined,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
        location: filters.location || undefined,
        role: filters.role || undefined,
        isActive:
          filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    );
    yield put(
      setUsersList({
        items: response.data.items,
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      }),
    );
  } catch (error) {
    yield put(setUserListError(getApiErrorMessage(error, 'Unable to load users')));
  } finally {
    yield put(stopLoading());
  }
}

function* updateUserStatusWorker(action: ReturnType<typeof updateUserStatusRequest>) {
  try {
    yield put(startLoading());
    yield call(userAPI.updateUserStatus, action.payload.userId, {
      isActive: action.payload.isActive,
    });
    yield put(fetchAdminUsersRequest({}));
  } catch (error) {
    yield put(setUserListError(getApiErrorMessage(error, 'Unable to update user')));
  } finally {
    yield put(stopLoading());
  }
}

export function* userWatcher() {
  yield takeLatest(fetchAdminUsersRequest.type, fetchAdminUsersWorker);
  yield takeLatest(updateUserStatusRequest.type, updateUserStatusWorker);
}
