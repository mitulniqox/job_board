import { api } from '@/utils/axios';
import type { ApiSuccess } from '@/types/api';
import type { AppNotification } from '@/types/notification';

export type NotificationListResponse = {
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
};

export const notificationAPI = {
  list: async (params: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const res = await api.get<ApiSuccess<NotificationListResponse>>('/notifications', { params });
    return res.data;
  },
  markRead: async (notificationId: string) => {
    const res = await api.patch<ApiSuccess<{ notification: AppNotification; unreadCount: number }>>(
      `/notifications/${notificationId}/read`,
    );
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.patch<ApiSuccess<{ unreadCount: number }>>('/notifications/read-all');
    return res.data;
  },
};
