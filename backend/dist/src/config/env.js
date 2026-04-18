"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.normalizedEnv = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const zod_1 = require("zod");
const envSchema = zod_1.z
    .object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    SOCKET_PORT: zod_1.z.coerce.number().int().positive().optional(),
    MONGODB_URI: zod_1.z.string().min(1, "MONGODB_URI is required"),
    ACCESS_TOKEN_SECRET: zod_1.z.string().min(32, "ACCESS_TOKEN_SECRET must be at least 32 chars").optional(),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars").optional(),
    ACCESS_TOKEN_EXPIRES_IN: zod_1.z.string().default("1h"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().optional(),
    REFRESH_TOKEN_SECRET: zod_1.z
        .string()
        .min(32, "REFRESH_TOKEN_SECRET must be at least 32 chars")
        .optional(),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars").optional(),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default("1d"),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().optional(),
    EMAIL_USER: zod_1.z.string().default(""),
    EMAIL_PASS: zod_1.z.string().default(""),
})
    .superRefine((data, ctx) => {
    if (!data.ACCESS_TOKEN_SECRET && !data.JWT_ACCESS_SECRET) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["ACCESS_TOKEN_SECRET"],
            message: "ACCESS_TOKEN_SECRET or JWT_ACCESS_SECRET is required",
        });
    }
    if (!data.REFRESH_TOKEN_SECRET && !data.JWT_REFRESH_SECRET) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ["REFRESH_TOKEN_SECRET"],
            message: "REFRESH_TOKEN_SECRET or JWT_REFRESH_SECRET is required",
        });
    }
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`Invalid environment variables: ${details}`);
}
const accessTokenSecret = parsed.data.ACCESS_TOKEN_SECRET ?? parsed.data.JWT_ACCESS_SECRET;
const accessTokenExpiresIn = parsed.data.ACCESS_TOKEN_EXPIRES_IN ?? parsed.data.JWT_ACCESS_EXPIRES_IN ?? "1h";
const refreshTokenSecret = parsed.data.REFRESH_TOKEN_SECRET ?? parsed.data.JWT_REFRESH_SECRET;
const refreshTokenExpiresIn = parsed.data.REFRESH_TOKEN_EXPIRES_IN ?? parsed.data.JWT_REFRESH_EXPIRES_IN ?? "1d";
exports.normalizedEnv = {
    ...parsed.data,
    ACCESS_TOKEN_SECRET: accessTokenSecret,
    JWT_ACCESS_SECRET: accessTokenSecret,
    ACCESS_TOKEN_EXPIRES_IN: accessTokenExpiresIn,
    JWT_ACCESS_EXPIRES_IN: accessTokenExpiresIn,
    REFRESH_TOKEN_SECRET: refreshTokenSecret,
    JWT_REFRESH_SECRET: refreshTokenSecret,
    REFRESH_TOKEN_EXPIRES_IN: refreshTokenExpiresIn,
    JWT_REFRESH_EXPIRES_IN: refreshTokenExpiresIn,
};
exports.env = exports.normalizedEnv;
