"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.logoutSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const user_model_1 = require("../users/user.model");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
        role: zod_1.z.enum(user_model_1.userRoles).optional(),
        candidateProfile: zod_1.z
            .object({
            skills: zod_1.z.array(zod_1.z.string().min(1)).default([]),
            experience: zod_1.z.number().min(0).default(0),
            location: zod_1.z.string().min(2).or(zod_1.z.literal("")).default(""),
            resume: zod_1.z.string().url().or(zod_1.z.literal("")).default(""),
        })
            .optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(8),
    }),
});
const refreshTokenBodySchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: refreshTokenBodySchema,
});
exports.logoutSchema = zod_1.z.object({
    body: refreshTokenBodySchema,
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        isActive: zod_1.z.boolean().optional(),
        candidateProfile: zod_1.z
            .object({
            skills: zod_1.z.array(zod_1.z.string().min(1)).optional(),
            experience: zod_1.z.number().min(0).optional(),
            location: zod_1.z.string().min(2).or(zod_1.z.literal("")).optional(),
            resume: zod_1.z.string().url().or(zod_1.z.literal("")).optional(),
        })
            .optional(),
    }),
});
