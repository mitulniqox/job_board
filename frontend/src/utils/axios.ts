import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiErrorBody, ApiSuccess } from '@/types/api';
import { logout, setAccessToken } from '@/store/auth/authSlice';
import type { RootState } from '@/store/Saga';

type AuthAxiosRequestConfig = AxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

type AuthInternalAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const rawBase =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ??
  '';
const apiBaseURL = rawBase ? `${rawBase}/api/v1` : '/api/v1';

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

type StoreWithDispatch = {
  getState: () => RootState;
  dispatch: (action: unknown) => void;
};

let storeRef: StoreWithDispatch | null = null;

export const injectStore = (store: StoreWithDispatch) => {
  storeRef = store;
};

const shouldSkipRefresh = (config?: AuthAxiosRequestConfig | AuthInternalAxiosRequestConfig) => {
  const url = config?.url ?? '';
  return (
    Boolean(config?.skipAuthRefresh) ||
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/logout')
  );
};

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
};

const clearAuthSession = () => {
  storeRef?.dispatch(logout());
  redirectToLogin();
};

let refreshPromise: Promise<string> | null = null;

const requestNewAccessToken = async (): Promise<string> => {
  const refreshToken = storeRef?.getState()?.auth.refreshToken ?? null;
  if (!refreshToken) {
    throw new Error('Refresh token not available');
  }

  const response = await refreshClient.post<ApiSuccess<{ accessToken: string }>>(
    '/auth/refresh-token',
    { refreshToken },
  );
  const accessToken = response.data.data.accessToken;
  storeRef?.dispatch(setAccessToken(accessToken));
  return accessToken;
};

api.interceptors.request.use((config: AuthInternalAxiosRequestConfig) => {
  const token = storeRef?.getState()?.auth.accessToken ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const originalRequest = error.config as AuthAxiosRequestConfig | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest)
    ) {
      const refreshToken = storeRef?.getState()?.auth.refreshToken ?? null;

      if (!refreshToken) {
        clearAuthSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = requestNewAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const nextAccessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthSession();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && !shouldSkipRefresh(originalRequest)) {
      clearAuthSession();
    }

    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(', ');
  }
  if (error instanceof Error) return error.message;
  return fallback;
};
