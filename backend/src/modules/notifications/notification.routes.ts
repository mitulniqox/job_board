import { Router } from "express";
import { verifyToken } from "../../core/middlewares/auth.middleware";
import { validateRequest } from "../../core/middlewares/validate.middleware";
import {
  listNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from "./notification.controller";
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from "./notification.validation";

const router = Router();

router.get("/", verifyToken, validateRequest(listNotificationsQuerySchema), listNotificationsHandler);
router.patch("/read-all", verifyToken, markAllNotificationsReadHandler);
router.patch(
  "/:notificationId/read",
  verifyToken,
  validateRequest(notificationIdParamSchema),
  markNotificationReadHandler
);

export default router;
