import { HydratedDocument, Schema, Types, model } from "mongoose";

export const notificationTypes = [
  "notification",
  "job_applied",
  "application_status_updated",
  "new_candidate",
  "new_job_posted",
  "admin_action",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: notificationTypes, default: "notification", index: true },
    data: { type: Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export interface Notification {
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;

export const NotificationEntity = model<Notification>("Notification", notificationSchema);
