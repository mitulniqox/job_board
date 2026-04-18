"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const job_routes_1 = __importDefault(require("../modules/jobs/job.routes"));
const application_routes_1 = __importDefault(require("../modules/applications/application.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const notification_routes_1 = __importDefault(require("../modules/notifications/notification.routes"));
const router = (0, express_1.Router)();
router.use("/auth", auth_routes_1.default);
router.use("/jobs", job_routes_1.default);
router.use("/", application_routes_1.default);
router.use("/admin", admin_routes_1.default);
router.use("/notifications", notification_routes_1.default);
exports.default = router;
