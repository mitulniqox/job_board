import { api } from '@/utils/axios';
import type { ApiSuccess } from '@/types/api';
import type { UserRole } from '@/constants/roles';
import type { AdminUserRow } from './userSlice';

export type PaginatedUsers = {
  items: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const userAPI = {
  fetchAdminUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    skills?: string[];
    location?: string;
    role?: UserRole;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get<ApiSuccess<PaginatedUsers>>('/admin/users', {
      params: {
        ...params,
        skills: params.skills?.join(',') || undefined,
      },
    });
    return res.data;
  },
  updateUserStatus: async (userId: string, body: { isActive: boolean }) => {
    const res = await api.patch<ApiSuccess<unknown>>(`/admin/users/${userId}/status`, body);
    return res.data;
  },
};
