import { call, put, select, takeLatest } from 'redux-saga/effects';
import { authAPI } from './authAPI';
import {
  fetchMeFailure,
  fetchMeRequest,
  loginFailure,
  loginRequest,
  logoutRequest,
  registerFailure,
  registerRequest,
  restoreSessionRequest,
  updateMeFailure,
  updateMeRequest,
} from './authAction';
import { logout, setAccessToken, setAuthResolved, setCredentials, setUser } from './authSlice';
import type { RootState } from '@/store/Saga';
import { startLoading, stopLoading } from '@/store/ui/uiSlice';
import { getApiErrorMessage } from '@/utils/axios';

function* loginWorker(action: ReturnType<typeof loginRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof authAPI.login>> = yield call(
      authAPI.login,
      action.payload,
    );
    yield put(setCredentials(response.data));
  } catch (error) {
    yield put(loginFailure(getApiErrorMessage(error, 'Login failed')));
  } finally {
    yield put(stopLoading());
  }
}

function* registerWorker(action: ReturnType<typeof registerRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof authAPI.register>> = yield call(
      authAPI.register,
      action.payload,
    );
    yield put(setCredentials(response.data));
  } catch (error) {
    yield put(registerFailure(getApiErrorMessage(error, 'Registration failed')));
  } finally {
    yield put(stopLoading());
  }
}

function* fetchMeWorker() {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof authAPI.me>> = yield call(authAPI.me);
    yield put(setUser(response.data));
  } catch (error) {
    yield put(fetchMeFailure(getApiErrorMessage(error, 'Unable to load profile')));
  } finally {
    yield put(setAuthResolved(true));
    yield put(stopLoading());
  }
}

function* updateMeWorker(action: ReturnType<typeof updateMeRequest>) {
  try {
    yield put(startLoading());
    const response: Awaited<ReturnType<typeof authAPI.updateMe>> = yield call(
      authAPI.updateMe,
      action.payload,
    );
    yield put(setUser(response.data));
  } catch (error) {
    yield put(updateMeFailure(getApiErrorMessage(error, 'Update failed')));
  } finally {
    yield put(stopLoading());
  }
}

function* restoreSessionWorker() {
  try {
    yield put(startLoading());
    const refreshToken: string | null = yield select((state: RootState) => state.auth.refreshToken);

    if (!refreshToken) {
      yield put(setAuthResolved(true));
      return;
    }

    const refreshResponse: Awaited<ReturnType<typeof authAPI.refreshToken>> = yield call(
      authAPI.refreshToken,
      refreshToken,
    );
    yield put(setAccessToken(refreshResponse.data.accessToken));

    const meResponse: Awaited<ReturnType<typeof authAPI.me>> = yield call(authAPI.me);
    yield put(setUser(meResponse.data));
  } catch {
    yield put(logout());
  } finally {
    yield put(setAuthResolved(true));
    yield put(stopLoading());
  }
}

function* logoutWorker() {
  try {
    const refreshToken: string | null = yield select((state: RootState) => state.auth.refreshToken);
    if (refreshToken) {
      yield call(authAPI.logout, refreshToken);
    }
  } catch {
    // Local logout still proceeds when server-side invalidation fails.
  } finally {
    yield put(logout());
  }
}

export function* authWatcher() {
  yield takeLatest(loginRequest.type, loginWorker);
  yield takeLatest(registerRequest.type, registerWorker);
  yield takeLatest(fetchMeRequest.type, fetchMeWorker);
  yield takeLatest(updateMeRequest.type, updateMeWorker);
  yield takeLatest(restoreSessionRequest.type, restoreSessionWorker);
  yield takeLatest(logoutRequest.type, logoutWorker);
}
