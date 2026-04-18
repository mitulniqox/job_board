"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const admin_controller_1 = require("./admin.controller");
const admin_validation_1 = require("./admin.validation");
const router = (0, express_1.Router)();
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
router.get("/overview", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("ADMIN"), (0, validate_middleware_1.validateRequest)(admin_validation_1.dashboardStatsQuerySchema), admin_controller_1.getAdminOverview);
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
router.get("/users", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("ADMIN"), (0, validate_middleware_1.validateRequest)(admin_validation_1.adminListUsersQuerySchema), admin_controller_1.getAllUsersHandler);
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
router.patch("/users/:userId/status", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("ADMIN"), (0, validate_middleware_1.validateRequest)(admin_validation_1.adminUpdateUserStatusSchema), admin_controller_1.updateUserStatusHandler);
router.get("/jobs", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("ADMIN"), (0, validate_middleware_1.validateRequest)(admin_validation_1.adminListJobsQuerySchema), admin_controller_1.getAllJobsReadOnlyHandler);
router.get("/applications", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("ADMIN"), (0, validate_middleware_1.validateRequest)(admin_validation_1.adminListApplicationsQuerySchema), admin_controller_1.getAllApplicationsReadOnlyHandler);
exports.default = router;
