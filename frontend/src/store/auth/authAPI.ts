import type { AxiosRequestConfig } from 'axios';
import { api } from '@/utils/axios';
import type { ApiSuccess } from '@/types/api';
import type { AuthUser } from '@/types/user';
import type { LoginPayload, RegisterPayload, UpdateMePayload } from './authAction';

type AuthRequestConfig = AxiosRequestConfig & { skipAuthRefresh?: boolean };

const skipAuthRefreshConfig: AuthRequestConfig = { skipAuthRefresh: true };

export type AuthResponse = { user: AuthUser; accessToken: string; refreshToken: string };
export type RefreshTokenResponse = { accessToken: string };

export const authAPI = {
  login: async (body: LoginPayload) => {
    const res = await api.post<ApiSuccess<AuthResponse>>(
      '/auth/login',
      body,
      skipAuthRefreshConfig,
    );
    return res.data;
  },
  register: async (body: RegisterPayload) => {
    const res = await api.post<ApiSuccess<AuthResponse>>(
      '/auth/register',
      body,
      skipAuthRefreshConfig,
    );
    return res.data;
  },
  refreshToken: async (refreshToken: string) => {
    const res = await api.post<ApiSuccess<RefreshTokenResponse>>(
      '/auth/refresh-token',
      { refreshToken },
      skipAuthRefreshConfig,
    );
    return res.data;
  },
  logout: async (refreshToken: string) => {
    const res = await api.post<ApiSuccess<null>>(
      '/auth/logout',
      { refreshToken },
      skipAuthRefreshConfig,
    );
    return res.data;
  },
  me: async () => {
    const res = await api.get<ApiSuccess<AuthUser>>('/auth/me');
    return res.data;
  },
  updateMe: async (body: UpdateMePayload) => {
    const res = await api.patch<ApiSuccess<AuthUser>>('/auth/me', body);
    return res.data;
  },
};
