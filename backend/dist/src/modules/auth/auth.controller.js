"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMe = exports.me = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const asyncHandler_1 = require("../../core/utils/asyncHandler");
const apiResponse_1 = require("../../core/utils/apiResponse");
const auth_service_1 = require("./auth.service");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.registerUser)(req.body);
    (0, apiResponse_1.sendSuccess)(res, 201, "Registration successful", result);
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.loginUser)(req.body);
    (0, apiResponse_1.sendSuccess)(res, 200, "Login successful", result);
});
exports.refreshToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, auth_service_1.refreshAccessToken)(req.body.refreshToken);
    (0, apiResponse_1.sendSuccess)(res, 200, "Access token refreshed", result);
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await (0, auth_service_1.logoutUser)(req.body.refreshToken);
    (0, apiResponse_1.sendSuccess)(res, 200, "Logout successful");
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, auth_service_1.getCurrentUser)(req.user.sub);
    (0, apiResponse_1.sendSuccess)(res, 200, "Profile retrieved", data);
});
exports.updateMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = await (0, auth_service_1.updateCurrentUser)(req.user.sub, req.body);
    (0, apiResponse_1.sendSuccess)(res, 200, "Profile updated", data);
});
