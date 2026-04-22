import { Router } from "express";
import { restrictTo, verifyToken } from "../../core/middlewares/auth.middleware";
import { validateRequest } from "../../core/middlewares/validate.middleware";
import {
  applyToJobHandler,
  candidateApplicationsHandler,
  jobApplicationsHandler,
  myApplicationsHandler,
  updateApplicationStatusHandler,
} from "./application.controller";
import { applySchema, updateApplicationStatusSchema } from "./application.validation";

const router = Router();

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
router.post(
  "/jobs/:jobId/apply",
  verifyToken,
  restrictTo("CANDIDATE"),
  validateRequest(applySchema),
  applyToJobHandler
);
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
router.get("/applications/me", verifyToken, restrictTo("CANDIDATE"), myApplicationsHandler);
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
router.get(
  "/candidates/:candidateId/applications",
  verifyToken,
  restrictTo("ADMIN", "RECRUITER"),
  candidateApplicationsHandler
);
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
router.get(
  "/jobs/:jobId/applications",
  verifyToken,
  restrictTo("RECRUITER"),
  jobApplicationsHandler
);
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
router.patch(
  "/applications/:applicationId/status",
  verifyToken,
  restrictTo("RECRUITER"),
  validateRequest(updateApplicationStatusSchema),
  updateApplicationStatusHandler
);

export default router;
