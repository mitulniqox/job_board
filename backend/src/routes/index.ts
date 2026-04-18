import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import jobRoutes from "../modules/jobs/job.routes";
import applicationRoutes from "../modules/applications/application.routes";
import adminRoutes from "../modules/admin/admin.routes";
import notificationRoutes from "../modules/notifications/notification.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/", applicationRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);

export default router;
