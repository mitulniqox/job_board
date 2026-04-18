"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsReadHandler = exports.markNotificationReadHandler = exports.listNotificationsHandler = void 0;
const apiResponse_1 = require("../../core/utils/apiResponse");
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const notification_service_1 = require("./notification.service");
exports.listNotificationsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, notification_service_1.listNotifications)(req.user.sub, {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        unreadOnly: req.query.unreadOnly === "true",
    });
    (0, apiResponse_1.sendSuccess)(res, 200, "Notifications fetched", data);
});
exports.markNotificationReadHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, notification_service_1.markNotificationRead)(req.user.sub, req.params.notificationId);
    (0, apiResponse_1.sendSuccess)(res, 200, "Notification marked as read", data);
});
exports.markAllNotificationsReadHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, notification_service_1.markAllNotificationsRead)(req.user.sub);
    (0, apiResponse_1.sendSuccess)(res, 200, "Notifications marked as read", data);
});
