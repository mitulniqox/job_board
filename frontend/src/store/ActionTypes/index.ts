export const AUTH_ACTION_TYPES = {
  LOGIN_REQUEST: 'auth/loginRequest',
  REGISTER_REQUEST: 'auth/registerRequest',
  FETCH_ME_REQUEST: 'auth/fetchMeRequest',
  UPDATE_ME_REQUEST: 'auth/updateMeRequest',
  RESTORE_SESSION_REQUEST: 'auth/restoreSessionRequest',
  LOGOUT_REQUEST: 'auth/logoutRequest',
} as const;

export const USER_ACTION_TYPES = {
  FETCH_ADMIN_USERS_REQUEST: 'user/fetchAdminUsersRequest',
  UPDATE_USER_STATUS_REQUEST: 'user/updateUserStatusRequest',
} as const;

export const JOBS_ACTION_TYPES = {
  FETCH_PUBLIC_JOBS_REQUEST: 'jobs/fetchPublicJobsRequest',
  FETCH_JOB_REQUEST: 'jobs/fetchJobRequest',
  CREATE_JOB_REQUEST: 'jobs/createJobRequest',
  UPDATE_JOB_REQUEST: 'jobs/updateJobRequest',
  DELETE_JOB_REQUEST: 'jobs/deleteJobRequest',
  TOGGLE_JOB_REQUEST: 'jobs/toggleJobRequest',
  FETCH_RECRUITER_OVERVIEW_REQUEST: 'jobs/fetchRecruiterOverviewRequest',
  FETCH_BOOKMARKED_JOBS_REQUEST: 'jobs/fetchBookmarkedJobsRequest',
  FETCH_BOOKMARKED_JOB_IDS_REQUEST: 'jobs/fetchBookmarkedJobIdsRequest',
  BOOKMARK_JOB_REQUEST: 'jobs/bookmarkJobRequest',
  UNBOOKMARK_JOB_REQUEST: 'jobs/unbookmarkJobRequest',
} as const;

export const APPLICATIONS_ACTION_TYPES = {
  APPLY_REQUEST: 'applications/applyRequest',
  FETCH_MY_APPLICATIONS_REQUEST: 'applications/fetchMyApplicationsRequest',
  FETCH_JOB_APPLICATIONS_REQUEST: 'applications/fetchJobApplicationsRequest',
  FETCH_CANDIDATE_APPLICATIONS_REQUEST: 'applications/fetchCandidateApplicationsRequest',
  UPDATE_STATUS_REQUEST: 'applications/updateStatusRequest',
} as const;

export const ADMIN_ACTION_TYPES = {
  FETCH_OVERVIEW_REQUEST: 'admin/fetchOverviewRequest',
  FETCH_ADMIN_JOBS_REQUEST: 'admin/fetchAdminJobsRequest',
  FETCH_ADMIN_APPLICATIONS_REQUEST: 'admin/fetchAdminApplicationsRequest',
} as const;

export const NOTIFICATION_ACTION_TYPES = {
  FETCH_NOTIFICATIONS_REQUEST: 'notifications/fetchNotificationsRequest',
  MARK_NOTIFICATION_READ_REQUEST: 'notifications/markNotificationReadRequest',
  MARK_ALL_NOTIFICATIONS_READ_REQUEST: 'notifications/markAllNotificationsReadRequest',
} as const;
