import { z } from "zod";
import { userRoles } from "../users/user.model";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(userRoles).optional(),
    candidateProfile: z
      .object({
        skills: z.array(z.string().min(1)).default([]),
        experience: z.number().min(0).default(0),
        location: z.string().min(2).or(z.literal("")).default(""),
        resume: z.string().url().or(z.literal("")).default(""),
      })
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  body: refreshTokenBodySchema,
});

export const logoutSchema = z.object({
  body: refreshTokenBodySchema,
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    isActive: z.boolean().optional(),
    candidateProfile: z
      .object({
        skills: z.array(z.string().min(1)).optional(),
        experience: z.number().min(0).optional(),
        location: z.string().min(2).or(z.literal("")).optional(),
        resume: z.string().url().or(z.literal("")).optional(),
      })
      .optional(),
  }),
});
