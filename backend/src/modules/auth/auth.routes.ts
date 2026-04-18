import { Router } from "express";
import { verifyToken } from "../../core/middlewares/auth.middleware";
import { validateRequest } from "../../core/middlewares/validate.middleware";
import { login, logout, me, refreshToken, register, updateMe } from "./auth.controller";
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  updateProfileSchema,
} from "./auth.validation";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [CANDIDATE, RECRUITER, ADMIN]
 *               candidateProfile:
 *                 $ref: '#/components/schemas/CandidateProfile'
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 */
router.post("/register", validateRequest(registerSchema), register);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", validateRequest(loginSchema), login);
/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh-token", validateRequest(refreshTokenSchema), refreshToken);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and invalidate the current refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", validateRequest(logoutSchema), logout);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/me", verifyToken, me);
/**
 * @swagger
 * /auth/me:
 *   patch:
 *     tags: [Auth]
 *     summary: Update current authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               candidateProfile:
 *                 $ref: '#/components/schemas/CandidateProfile'
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.patch("/me", verifyToken, validateRequest(updateProfileSchema), updateMe);

export default router;
