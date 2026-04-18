"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./core/middlewares/error.middleware");
const notFound_middleware_1 = require("./core/middlewares/notFound.middleware");
const swagger_1 = require("./config/swagger");
const app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use(express_1.default.json({ limit: "1mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "5mb" }));
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: "*", credentials: true }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)("combined"));
const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 1000, message: "Too many requests" });
app.use("/api/v1", limiter);
app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Service is healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use("/api/v1", routes_1.default);
app.use(notFound_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
