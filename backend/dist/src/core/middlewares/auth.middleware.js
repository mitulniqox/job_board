"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.verifyTokenIfPresent = exports.verifyToken = void 0;
const AppError_1 = require("../errors/AppError");
const auth_service_1 = require("../../modules/auth/auth.service");
const verifyToken = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const payload = (0, auth_service_1.verifyAccessToken)(token);
    req.user = payload;
    next();
};
exports.verifyToken = verifyToken;
const verifyTokenIfPresent = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        next();
        return;
    }
    if (!authHeader.startsWith("Bearer ")) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    req.user = (0, auth_service_1.verifyAccessToken)(token);
    next();
};
exports.verifyTokenIfPresent = verifyTokenIfPresent;
const restrictTo = (...allowedRoles) => (req, _res, next) => {
    if (!req.user) {
        throw new AppError_1.AppError("Unauthorized", 401);
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        throw new AppError_1.AppError("Forbidden", 403);
    }
    next();
};
exports.restrictTo = restrictTo;
