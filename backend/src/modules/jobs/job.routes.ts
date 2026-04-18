import { Router } from "express";
import { restrictTo, verifyToken, verifyTokenIfPresent } from "../../core/middlewares/auth.middleware";
import { validateRequest } from "../../core/middlewares/validate.middleware";
import {
  addJobBookmarkHandler,
  bookmarkedJobIdsHandler,
  closeJobHandler,
  createJobHandler,
  deleteJobHandler,
  getJobHandler,
  listBookmarkedJobsHandler,
  listJobsHandler,
  recruiterOverviewHandler,
  removeJobBookmarkHandler,
  reopenJobHandler,
  updateJobHandler,
} from "./job.controller";
import { createJobSchema, listJobsQuerySchema, updateJobSchema } from "./job.validation";

const router = Router();

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
router.get("/bookmarks/me", verifyToken, restrictTo("CANDIDATE"), validateRequest(listJobsQuerySchema), listBookmarkedJobsHandler);
router.get("/bookmarks/me/ids", verifyToken, restrictTo("CANDIDATE"), bookmarkedJobIdsHandler);
router.get("/recruiter/overview", verifyToken, restrictTo("RECRUITER"), recruiterOverviewHandler);
router.get("/", verifyTokenIfPresent, validateRequest(listJobsQuerySchema), listJobsHandler);
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
router.get("/:id", verifyTokenIfPresent, getJobHandler);
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
router.post("/", verifyToken, restrictTo("RECRUITER"), validateRequest(createJobSchema), createJobHandler);
router.patch(
  "/:id",
  verifyToken,
  restrictTo("RECRUITER"),
  validateRequest(updateJobSchema),
  updateJobHandler
);
router.delete("/:id", verifyToken, restrictTo("RECRUITER"), deleteJobHandler);
router.patch("/:id/close", verifyToken, restrictTo("RECRUITER"), closeJobHandler);
router.patch("/:id/reopen", verifyToken, restrictTo("RECRUITER"), reopenJobHandler);
router.post("/:id/bookmark", verifyToken, restrictTo("CANDIDATE"), addJobBookmarkHandler);
router.delete("/:id/bookmark", verifyToken, restrictTo("CANDIDATE"), removeJobBookmarkHandler);

export default router;
