import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/user';
import { fetchMeFailure, loginFailure, registerFailure, updateMeFailure } from './authAction';

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  isAuthResolved: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  error: null,
  isAuthResolved: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      state.isAuthResolved = true;
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.error = null;
      state.isAuthResolved = true;
    },
    setAuthResolved(state, action: PayloadAction<boolean | undefined>) {
      state.isAuthResolved = action.payload ?? true;
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.isAuthResolved = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginFailure, (state, action) => {
        state.error = action.payload;
      })
      .addCase(registerFailure, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMeFailure, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateMeFailure, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setCredentials, setAccessToken, setUser, setAuthResolved, logout, clearAuthError } =
  authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  Boolean(state.auth.accessToken);
export const selectIsAuthResolved = (state: { auth: AuthState }) => state.auth.isAuthResolved;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null;
