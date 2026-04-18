import { createAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/constants/roles';
import { AUTH_ACTION_TYPES } from '@/store/ActionTypes';

export type LoginPayload = { email: string; password: string };

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  candidateProfile?: {
    skills: string[];
    experience: number;
    location: string;
    resume: string;
  };
};

export type UpdateMePayload = {
  name?: string;
  isActive?: boolean;
  candidateProfile?: {
    skills?: string[];
    experience?: number;
    location?: string;
    resume?: string;
  };
};

export const loginRequest = createAction<LoginPayload>(AUTH_ACTION_TYPES.LOGIN_REQUEST);
export const registerRequest = createAction<RegisterPayload>(AUTH_ACTION_TYPES.REGISTER_REQUEST);
export const fetchMeRequest = createAction(AUTH_ACTION_TYPES.FETCH_ME_REQUEST);
export const updateMeRequest = createAction<UpdateMePayload>(AUTH_ACTION_TYPES.UPDATE_ME_REQUEST);
export const restoreSessionRequest = createAction(AUTH_ACTION_TYPES.RESTORE_SESSION_REQUEST);
export const logoutRequest = createAction(AUTH_ACTION_TYPES.LOGOUT_REQUEST);

export const loginFailure = createAction<string>('auth/loginFailure');
export const registerFailure = createAction<string>('auth/registerFailure');
export const fetchMeFailure = createAction<string>('auth/fetchMeFailure');
export const updateMeFailure = createAction<string>('auth/updateMeFailure');
