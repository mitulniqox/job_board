import { Types } from "mongoose";
import { AppError } from "../../core/errors/AppError";
import { runPaginatedQuery } from "../../core/utils/queryBuilder";
import { emitToUserRoom } from "../../socket/socket";
import {
  NotificationDocument,
  NotificationEntity,
  NotificationType,
} from "./notification.model";

const NOTIFICATION_SELECT = "title message type data isRead readAt createdAt updatedAt";

type NotificationPayload = {
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
};

export const createNotification = async (
  userId: string,
  payload: NotificationPayload
): Promise<NotificationDocument> =>
  NotificationEntity.create({
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    data: payload.data ?? null,
  });

export const notifyUser = async (
  userId: string,
  payload: NotificationPayload
): Promise<NotificationDocument> => {
  const notification = await createNotification(userId, payload);
  const socketPayload = {
    _id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    data: notification.data,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };

  emitToUserRoom(userId, "notification", socketPayload);
  emitToUserRoom(userId, payload.type, socketPayload);
  if (payload.type === "job_applied") {
    emitToUserRoom(userId, "new_candidate", socketPayload);
  }

  return notification;
};

export const notifyUsers = async (
  userIds: string[],
  payload: NotificationPayload
): Promise<void> => {
  const uniqueUserIds = [...new Set(userIds)].filter(Boolean);
  if (uniqueUserIds.length === 0) {
    return;
  }

  const notifications = await NotificationEntity.insertMany(
    uniqueUserIds.map((userId) => ({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      data: payload.data ?? null,
    }))
  );

  notifications.forEach((notification) => {
    const userId = notification.userId.toString();
    const socketPayload = {
      _id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };

    emitToUserRoom(userId, "notification", socketPayload);
    emitToUserRoom(userId, payload.type, socketPayload);
  });
};

export const listNotifications = async (
  userId: string,
  filters: { page?: number; limit?: number; unreadOnly?: boolean }
) => {
  const query: Record<string, unknown> = { userId };
  if (filters.unreadOnly) {
    query.isRead = false;
  }

  const data = await runPaginatedQuery(NotificationEntity, query, {
    page: filters.page,
    limit: filters.limit ?? 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    lean: true,
    select: NOTIFICATION_SELECT,
  });

  const unreadCount = await NotificationEntity.countDocuments({ userId, isRead: false });

  return {
    notifications: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
    unreadCount,
  };
};

export const markNotificationRead = async (userId: string, notificationId: string) => {
  if (!Types.ObjectId.isValid(notificationId)) {
    throw new AppError("Invalid notification id", 400);
  }

  const notification = await NotificationEntity.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).select(NOTIFICATION_SELECT);

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  const unreadCount = await NotificationEntity.countDocuments({ userId, isRead: false });

  return {
    notification,
    unreadCount,
  };
};

export const markAllNotificationsRead = async (userId: string) => {
  await NotificationEntity.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return {
    unreadCount: 0,
  };
};
