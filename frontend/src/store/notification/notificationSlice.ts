import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { logout } from '@/store/auth/authSlice';
import type { AppNotification } from '@/types/notification';

type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isConnected: boolean;
  error: string | null;
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isConnected: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(
      state,
      action: PayloadAction<{
        notifications: AppNotification[];
        unreadCount: number;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>,
    ) {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
      state.error = null;
    },
    prependNotification(state, action: PayloadAction<AppNotification>) {
      const exists = state.notifications.some(
        (notification) => notification._id === action.payload._id,
      );
      if (!exists) {
        state.notifications = [action.payload, ...state.notifications].slice(0, state.limit);
        state.total += 1;
        state.unreadCount += action.payload.isRead ? 0 : 1;
      }
    },
    setNotificationReadState(
      state,
      action: PayloadAction<{ notification: AppNotification; unreadCount: number }>,
    ) {
      state.notifications = state.notifications.map((notification) =>
        notification._id === action.payload.notification._id
          ? action.payload.notification
          : notification,
      );
      state.unreadCount = action.payload.unreadCount;
      state.error = null;
    },
    markAllNotificationsReadLocal(state) {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt ?? new Date().toISOString(),
      }));
      state.unreadCount = 0;
      state.error = null;
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setNotificationError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);
  },
});

export const {
  setNotifications,
  prependNotification,
  setNotificationReadState,
  markAllNotificationsReadLocal,
  setSocketConnected,
  setNotificationError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
