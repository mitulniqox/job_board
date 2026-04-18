import { call, put, select, takeLatest } from 'redux-saga/effects';
import { notificationAPI } from './notificationAPI';
import {
  fetchNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from './notificationAction';
import {
  markAllNotificationsReadLocal,
  setNotificationError,
  setNotificationReadState,
  setNotifications,
} from './notificationSlice';
import { getApiErrorMessage } from '@/utils/axios';
import { startLoading, stopLoading } from '@/store/ui/uiSlice';
import type { RootState } from '@/store/Saga';

function* fetchNotificationsWorker(action: ReturnType<typeof fetchNotificationsRequest>) {
  try {
    yield put(startLoading());
    const notificationState: RootState['notifications'] = yield select(
      (state: RootState) => state.notifications,
    );
    const response: Awaited<ReturnType<typeof notificationAPI.list>> = yield call(
      notificationAPI.list,
      {
        page: action.payload.page ?? notificationState.page,
        limit: action.payload.limit ?? notificationState.limit,
      },
    );

    yield put(setNotifications(response.data));
  } catch (error) {
    yield put(setNotificationError(getApiErrorMessage(error, 'Unable to load notifications')));
  } finally {
    yield put(stopLoading());
  }
}

function* markNotificationReadWorker(action: ReturnType<typeof markNotificationReadRequest>) {
  try {
    const response: Awaited<ReturnType<typeof notificationAPI.markRead>> = yield call(
      notificationAPI.markRead,
      action.payload.notificationId,
    );
    yield put(setNotificationReadState(response.data));
  } catch (error) {
    yield put(
      setNotificationError(getApiErrorMessage(error, 'Unable to mark notification as read')),
    );
  }
}

function* markAllNotificationsReadWorker() {
  try {
    yield call(notificationAPI.markAllRead);
    yield put(markAllNotificationsReadLocal());
  } catch (error) {
    yield put(setNotificationError(getApiErrorMessage(error, 'Unable to mark all as read')));
  }
}

export function* notificationWatcher() {
  yield takeLatest(fetchNotificationsRequest.type, fetchNotificationsWorker);
  yield takeLatest(markNotificationReadRequest.type, markNotificationReadWorker);
  yield takeLatest(markAllNotificationsReadRequest.type, markAllNotificationsReadWorker);
}
