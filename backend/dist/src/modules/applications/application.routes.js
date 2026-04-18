"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const application_controller_1 = require("./application.controller");
const application_validation_1 = require("./application.validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /jobs/{jobId}/apply:
 *   post:
 *     tags: [Applications]
 *     summary: Apply to a job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [expectedSalary, availability, note]
 *             properties:
 *               expectedSalary:
 *                 type: number
 *               availability:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Duplicate application
 */
router.post("/jobs/:jobId/apply", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("CANDIDATE"), (0, validate_middleware_1.validateRequest)(application_validation_1.applySchema), application_controller_1.applyToJobHandler);
/**
 * @swagger
 * /applications/me:
 *   get:
 *     tags: [Applications]
 *     summary: List applications for the current candidate
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applications fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/applications/me", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("CANDIDATE"), application_controller_1.myApplicationsHandler);
/**
 * @swagger
 * /candidates/{candidateId}/applications:
 *   get:
 *     tags: [Applications]
 *     summary: List applications by candidate id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate applications fetched
 *       403:
 *         description: Forbidden
 */
router.get("/candidates/:candidateId/applications", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), application_controller_1.candidateApplicationsHandler);
/**
 * @swagger
 * /jobs/{jobId}/applications:
 *   get:
 *     tags: [Applications]
 *     summary: List applications for a job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job applications fetched
 *       403:
 *         description: Forbidden
 */
router.get("/jobs/:jobId/applications", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), application_controller_1.jobApplicationsHandler);
/**
 * @swagger
 * /applications/{applicationId}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update application status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Applied, Shortlisted, Interviewed, Rejected, Hired]
 *     responses:
 *       200:
 *         description: Application status updated
 *       403:
 *         description: Forbidden
 */
router.patch("/applications/:applicationId/status", auth_middleware_1.verifyToken, (0, auth_middleware_1.restrictTo)("RECRUITER"), (0, validate_middleware_1.validateRequest)(application_validation_1.updateApplicationStatusSchema), application_controller_1.updateApplicationStatusHandler);
exports.default = router;
