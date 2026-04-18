"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.updateCurrentUser = exports.getCurrentUser = exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const AppError_1 = require("../../core/errors/AppError");
const user_model_1 = require("../users/user.model");
const sanitizeUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    candidateProfile: {
        skills: user.candidateProfile?.skills ?? [],
        experience: user.candidateProfile?.experience ?? 0,
        location: user.candidateProfile?.location ?? "",
        resume: user.candidateProfile?.resume ?? "",
    },
    createdAt: user.createdAt ?? null,
});
const createJwtPayload = (user) => ({
    sub: user.id,
    email: user.email,
    role: user.role,
});
const hashToken = (token) => crypto_1.default.createHash("sha256").update(token).digest("hex");
const signAccessToken = (payload) => {
    const options = { expiresIn: env_1.env.ACCESS_TOKEN_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, env_1.env.ACCESS_TOKEN_SECRET, options);
};
const signRefreshToken = (payload) => {
    const options = { expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES_IN };
    return jsonwebtoken_1.default.sign(payload, env_1.env.REFRESH_TOKEN_SECRET, options);
};
const verifyToken = (token, secret, expiredMessage, invalidMessage) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.TokenExpiredError) {
            throw new AppError_1.AppError(expiredMessage, 401);
        }
        if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
            throw new AppError_1.AppError(invalidMessage, 401);
        }
        throw error;
    }
};
const issueAuthTokens = async (user) => {
    const payload = createJwtPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await user_model_1.UserEntity.findByIdAndUpdate(user.id, { refreshToken: hashToken(refreshToken) });
    return { accessToken, refreshToken };
};
const registerUser = async (input) => {
    const exists = await user_model_1.UserEntity.findOne({ email: input.email });
    if (exists) {
        throw new AppError_1.AppError("Email is already in use", 409);
    }
    const hashedPassword = await bcryptjs_1.default.hash(input.password, 12);
    const user = await user_model_1.UserEntity.create({ ...input, password: hashedPassword });
    const tokens = await issueAuthTokens(user);
    return { user: sanitizeUser(user), ...tokens };
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const user = await user_model_1.UserEntity.findOne({ email: input.email }).select("+password");
    if (!user) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const isValidPassword = await bcryptjs_1.default.compare(input.password, user.password);
    if (!isValidPassword) {
        throw new AppError_1.AppError("Invalid credentials", 401);
    }
    const tokens = await issueAuthTokens(user);
    return { user: sanitizeUser(user), ...tokens };
};
exports.loginUser = loginUser;
const refreshAccessToken = async (refreshToken) => {
    const payload = (0, exports.verifyRefreshToken)(refreshToken);
    const user = await user_model_1.UserEntity.findById(payload.sub).select("+refreshToken");
    if (!user || !user.refreshToken) {
        throw new AppError_1.AppError("Invalid refresh token", 401);
    }
    if (user.refreshToken !== hashToken(refreshToken)) {
        throw new AppError_1.AppError("Invalid refresh token", 401);
    }
    return {
        accessToken: signAccessToken(createJwtPayload(user)),
    };
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (refreshToken) => {
    await user_model_1.UserEntity.findOneAndUpdate({ refreshToken: hashToken(refreshToken) }, { refreshToken: null });
};
exports.logoutUser = logoutUser;
const getCurrentUser = async (userId) => {
    const user = await user_model_1.UserEntity.findById(userId);
    if (!user) {
        throw new AppError_1.AppError("User not found", 404);
    }
    return sanitizeUser(user);
};
exports.getCurrentUser = getCurrentUser;
const updateCurrentUser = async (userId, input) => {
    const updated = await user_model_1.UserEntity.findByIdAndUpdate(userId, input, { new: true });
    if (!updated) {
        throw new AppError_1.AppError("User not found", 404);
    }
    return sanitizeUser(updated);
};
exports.updateCurrentUser = updateCurrentUser;
const verifyAccessToken = (token) => verifyToken(token, env_1.env.ACCESS_TOKEN_SECRET, "Access token expired", "Invalid access token");
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => verifyToken(token, env_1.env.REFRESH_TOKEN_SECRET, "Refresh token expired", "Invalid refresh token");
exports.verifyRefreshToken = verifyRefreshToken;
