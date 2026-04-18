export type NotificationType =
  | 'notification'
  | 'job_applied'
  | 'application_status_updated'
  | 'new_candidate'
  | 'new_job_posted'
  | 'admin_action';

export type AppNotification = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};
