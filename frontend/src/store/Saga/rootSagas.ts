import { all } from 'redux-saga/effects';
import { authWatcher } from '@/store/auth/authWatcher';
import { userWatcher } from '@/store/user/userWatcher';
import { jobsWatcher } from '@/store/jobs/jobsWatcher';
import { applicationsWatcher } from '@/store/applications/applicationsWatcher';
import { adminWatcher } from '@/store/admin/adminWatcher';
import { notificationWatcher } from '@/store/notification/notificationWatcher';

export default function* rootSagas() {
  yield all([
    authWatcher(),
    userWatcher(),
    jobsWatcher(),
    applicationsWatcher(),
    adminWatcher(),
    notificationWatcher(),
  ]);
}
