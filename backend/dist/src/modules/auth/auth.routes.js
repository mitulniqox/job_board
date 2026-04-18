"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../core/middlewares/auth.middleware");
const validate_middleware_1 = require("../../core/middlewares/validate.middleware");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
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
router.post("/register", (0, validate_middleware_1.validateRequest)(auth_validation_1.registerSchema), auth_controller_1.register);
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
router.post("/login", (0, validate_middleware_1.validateRequest)(auth_validation_1.loginSchema), auth_controller_1.login);
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
router.post("/refresh-token", (0, validate_middleware_1.validateRequest)(auth_validation_1.refreshTokenSchema), auth_controller_1.refreshToken);
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
router.post("/logout", (0, validate_middleware_1.validateRequest)(auth_validation_1.logoutSchema), auth_controller_1.logout);
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
router.get("/me", auth_middleware_1.verifyToken, auth_controller_1.me);
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
router.patch("/me", auth_middleware_1.verifyToken, (0, validate_middleware_1.validateRequest)(auth_validation_1.updateProfileSchema), auth_controller_1.updateMe);
exports.default = router;
