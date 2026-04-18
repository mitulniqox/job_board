"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationIdParamSchema = exports.listNotificationsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listNotificationsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional(),
        unreadOnly: zod_1.z.enum(["true", "false"]).optional(),
    }),
});
exports.notificationIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        notificationId: zod_1.z.string().min(1),
    }),
});
