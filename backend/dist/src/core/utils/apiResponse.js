"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = void 0;
const sendSuccess = (res, statusCode, message, data) => {
    res.status(statusCode).json({
        success: true,
        message,
        data: data ?? null,
    });
};
exports.sendSuccess = sendSuccess;
