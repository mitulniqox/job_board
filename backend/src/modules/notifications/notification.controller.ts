import { Request, Response } from "express";
import { sendSuccess } from "../../core/utils/apiResponse";
import { asyncHandler } from "../../core/utils/asyncHandler";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notification.service";

export const listNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await listNotifications(req.user!.sub, {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    unreadOnly: req.query.unreadOnly === "true",
  });

  sendSuccess(res, 200, "Notifications fetched", data);
});

export const markNotificationReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const data = await markNotificationRead(req.user!.sub, req.params.notificationId);
  sendSuccess(res, 200, "Notification marked as read", data);
});

export const markAllNotificationsReadHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = await markAllNotificationsRead(req.user!.sub);
    sendSuccess(res, 200, "Notifications marked as read", data);
  }
);
