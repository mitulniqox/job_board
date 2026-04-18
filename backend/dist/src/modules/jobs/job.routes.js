"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const job_controller_1 = require("./job.controller");
const job_validation_1 = require("./job.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /jobs:
 *   get:
 *     tags: [Jobs]
 *     summary: List jobs with search and pagination
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
 *         name: jobType
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Jobs fetched
 */
router.get("/bookmarks/me", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("CANDIDATE"), (0, validate_middleware_1.validateRequest)(job_validation_1.listJobsQuerySchema), job_controller_1.listBookmarkedJobsHandler);
router.get("/bookmarks/me/ids", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("CANDIDATE"), job_controller_1.bookmarkedJobIdsHandler);
router.get("/recruiter/overview", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), job_controller_1.recruiterOverviewHandler);
router.get("/", auth_middleware_1.verifyTokenIfPresent, (0, validate_middleware_1.validateRequest)(job_validation_1.listJobsQuerySchema), job_controller_1.listJobsHandler);
/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     tags: [Jobs]
 *     summary: Get a single job by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job fetched
 *       404:
 *         description: Job not found
 */
router.get("/:id", auth_middleware_1.verifyTokenIfPresent, job_controller_1.getJobHandler);
/**
 * @swagger
 * /jobs:
 *   post:
 *     tags: [Jobs]
 *     summary: Create a new job
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, skills, salaryMin, salaryMax, jobType, location, deadline]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               salaryMin:
 *                 type: number
 *               salaryMax:
 *                 type: number
 *               jobType:
 *                 type: string
 *               location:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Job created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), (0, validate_middleware_1.validateRequest)(job_validation_1.createJobSchema), job_controller_1.createJobHandler);
router.patch("/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), (0, validate_middleware_1.validateRequest)(job_validation_1.updateJobSchema), job_controller_1.updateJobHandler);
router.delete("/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), job_controller_1.deleteJobHandler);
router.patch("/:id/close", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), job_controller_1.closeJobHandler);
router.patch("/:id/reopen", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), job_controller_1.reopenJobHandler);
router.post("/:id/bookmark", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("CANDIDATE"), job_controller_1.addJobBookmarkHandler);
router.delete("/:id/bookmark", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("CANDIDATE"), job_controller_1.removeJobBookmarkHandler);
exports.default = router;
