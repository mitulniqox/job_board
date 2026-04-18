import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserRole } from '@/constants/roles';
import type { CandidateProfile } from '@/types/user';

export type AdminUserRow = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  candidateProfile?: CandidateProfile;
  createdAt?: string;
  updatedAt?: string;
};

export type UserListFilters = {
  search: string;
  skills: string[];
  location: string;
  role: '' | UserRole;
  isActive: '' | 'true' | 'false';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
};

type UserState = {
  items: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: UserListFilters;
  error: string | null;
};

const initialState: UserState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {
    search: '',
    skills: [],
    location: '',
    role: '',
    isActive: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsersList(
      state,
      action: PayloadAction<{
        items: AdminUserRow[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>,
    ) {
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.totalPages = action.payload.totalPages;
      state.error = null;
    },
    setUserFilters(state, action: PayloadAction<Partial<UserListFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setUserPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setUserListError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearUserListError(state) {
      state.error = null;
    },
  },
});

export const { setUsersList, setUserFilters, setUserPage, setUserListError, clearUserListError } =
  userSlice.actions;
export default userSlice.reducer;
