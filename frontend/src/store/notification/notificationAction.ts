import { createAction } from '@reduxjs/toolkit';
import { NOTIFICATION_ACTION_TYPES } from '@/store/ActionTypes';

export const fetchNotificationsRequest = createAction<{ page?: number; limit?: number }>(
  NOTIFICATION_ACTION_TYPES.FETCH_NOTIFICATIONS_REQUEST,
);

export const markNotificationReadRequest = createAction<{ notificationId: string }>(
  NOTIFICATION_ACTION_TYPES.MARK_NOTIFICATION_READ_REQUEST,
);

export const markAllNotificationsReadRequest = createAction(
  NOTIFICATION_ACTION_TYPES.MARK_ALL_NOTIFICATIONS_READ_REQUEST,
);
