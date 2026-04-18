"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.listNotifications = exports.notifyUsers = exports.notifyUser = exports.createNotification = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = require("../../core/errors/AppError");
const queryBuilder_1 = require("../../core/utils/queryBuilder");
const socket_1 = require("../../socket/socket");
const notification_model_1 = require("./notification.model");
const NOTIFICATION_SELECT = "title message type data isRead readAt createdAt updatedAt";
const createNotification = async (userId, payload) => notification_model_1.NotificationEntity.create({
    userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    data: payload.data ?? null,
});
exports.createNotification = createNotification;
const notifyUser = async (userId, payload) => {
    const notification = await (0, exports.createNotification)(userId, payload);
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
    (0, socket_1.emitToUserRoom)(userId, "notification", socketPayload);
    (0, socket_1.emitToUserRoom)(userId, payload.type, socketPayload);
    if (payload.type === "job_applied") {
        (0, socket_1.emitToUserRoom)(userId, "new_candidate", socketPayload);
    }
    return notification;
};
exports.notifyUser = notifyUser;
const notifyUsers = async (userIds, payload) => {
    const uniqueUserIds = [...new Set(userIds)].filter(Boolean);
    if (uniqueUserIds.length === 0) {
        return;
    }
    const notifications = await notification_model_1.NotificationEntity.insertMany(uniqueUserIds.map((userId) => ({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        data: payload.data ?? null,
    })));
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
        (0, socket_1.emitToUserRoom)(userId, "notification", socketPayload);
        (0, socket_1.emitToUserRoom)(userId, payload.type, socketPayload);
    });
};
exports.notifyUsers = notifyUsers;
const listNotifications = async (userId, filters) => {
    const query = { userId };
    if (filters.unreadOnly) {
        query.isRead = false;
    }
    const data = await (0, queryBuilder_1.runPaginatedQuery)(notification_model_1.NotificationEntity, query, {
        page: filters.page,
        limit: filters.limit ?? 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        lean: true,
        select: NOTIFICATION_SELECT,
    });
    const unreadCount = await notification_model_1.NotificationEntity.countDocuments({ userId, isRead: false });
    return {
        notifications: data.items,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        unreadCount,
    };
};
exports.listNotifications = listNotifications;
const markNotificationRead = async (userId, notificationId) => {
    if (!mongoose_1.Types.ObjectId.isValid(notificationId)) {
        throw new AppError_1.AppError("Invalid notification id", 400);
    }
    const notification = await notification_model_1.NotificationEntity.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true, readAt: new Date() }, { new: true }).select(NOTIFICATION_SELECT);
    if (!notification) {
        throw new AppError_1.AppError("Notification not found", 404);
    }
    const unreadCount = await notification_model_1.NotificationEntity.countDocuments({ userId, isRead: false });
    return {
        notification,
        unreadCount,
    };
};
exports.markNotificationRead = markNotificationRead;
const markAllNotificationsRead = async (userId) => {
    await notification_model_1.NotificationEntity.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    return {
        unreadCount: 0,
    };
};
exports.markAllNotificationsRead = markAllNotificationsRead;
