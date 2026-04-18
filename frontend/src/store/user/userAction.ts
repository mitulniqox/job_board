import { createAction } from '@reduxjs/toolkit';
import { USER_ACTION_TYPES } from '@/store/ActionTypes';
import type { UserListFilters } from './userSlice';

export type FetchAdminUsersPayload = {
  page?: number;
  limit?: number;
  filters?: Partial<UserListFilters>;
};

export type UpdateUserStatusPayload = {
  userId: string;
  isActive: boolean;
};

export const fetchAdminUsersRequest = createAction<FetchAdminUsersPayload>(
  USER_ACTION_TYPES.FETCH_ADMIN_USERS_REQUEST,
);
export const updateUserStatusRequest = createAction<UpdateUserStatusPayload>(
  USER_ACTION_TYPES.UPDATE_USER_STATUS_REQUEST,
);
