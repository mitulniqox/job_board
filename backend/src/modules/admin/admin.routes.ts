import { Router } from "express";
import { restrictTo, verifyToken } from "../../core/middlewares/auth.middleware";
import { validateRequest } from "../../core/middlewares/validate.middleware";
import {
  getAdminOverview,
  getAllApplicationsReadOnlyHandler,
  getAllJobsReadOnlyHandler,
  getAllUsersHandler,
  updateUserStatusHandler,
} from "./admin.controller";
import {
  adminListApplicationsQuerySchema,
  adminListJobsQuerySchema,
  adminListUsersQuerySchema,
  adminUpdateUserStatusSchema,
  dashboardStatsQuerySchema,
} from "./admin.validation";

const router = Router();

/**
 * @swagger
 * /admin/overview:
 *   get:
 *     tags: [Users]
 *     summary: Get admin dashboard overview stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin overview fetched
 *       403:
 *         description: Forbidden
 */
router.get(
  "/overview",
  verifyToken,
  restrictTo("ADMIN"),
  validateRequest(dashboardStatsQuerySchema),
  getAdminOverview
);
/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Users]
 *     summary: List users for admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: skills
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CANDIDATE, RECRUITER, ADMIN]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Users fetched
 *       403:
 *         description: Forbidden
 */
router.get("/users", verifyToken, restrictTo("ADMIN"), validateRequest(adminListUsersQuerySchema), getAllUsersHandler);
/**
 * @swagger
 * /admin/users/{userId}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user's active status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       403:
 *         description: Forbidden
 */
router.patch(
  "/users/:userId/status",
  verifyToken,
  restrictTo("ADMIN"),
  validateRequest(adminUpdateUserStatusSchema),
  updateUserStatusHandler
);
router.get("/jobs", verifyToken, restrictTo("ADMIN"), validateRequest(adminListJobsQuerySchema), getAllJobsReadOnlyHandler);
router.get(
  "/applications",
  verifyToken,
  restrictTo("ADMIN"),
  validateRequest(adminListApplicationsQuerySchema),
  getAllApplicationsReadOnlyHandler
);

export default router;
