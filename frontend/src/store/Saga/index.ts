import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/store/auth/authSlice';
import uiReducer from '@/store/ui/uiSlice';
import userReducer from '@/store/user/userSlice';
import jobsReducer from '@/store/jobs/jobsSlice';
import applicationsReducer from '@/store/applications/applicationsSlice';
import adminReducer from '@/store/admin/adminSlice';
import notificationsReducer from '@/store/notification/notificationSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  user: userReducer,
  jobs: jobsReducer,
  applications: applicationsReducer,
  admin: adminReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
