"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationEntity = exports.notificationTypes = void 0;
const mongoose_1 = require("mongoose");
exports.notificationTypes = [
    "notification",
    "job_applied",
    "application_status_updated",
    "new_candidate",
    "new_job_posted",
    "admin_action",
];
const notificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: exports.notificationTypes, default: "notification", index: true },
    data: { type: mongoose_1.Schema.Types.Mixed, default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
}, {
    timestamps: true,
    versionKey: false,
});
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
exports.NotificationEntity = (0, mongoose_1.model)("Notification", notificationSchema);
