"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const errorMiddleware = (error, _req, res, _next) => {
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }
    if (error instanceof AppError_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.errorMiddleware = errorMiddleware;
