"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApplicationStatusSchema = exports.applySchema = void 0;
const zod_1 = require("zod");
const application_model_1 = require("./application.model");
exports.applySchema = zod_1.z.object({
    body: zod_1.z.object({
        expectedSalary: zod_1.z.number().min(0),
        availability: zod_1.z.string().min(2),
        note: zod_1.z.string().min(5),
    }),
});
exports.updateApplicationStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(application_model_1.applicationStatuses),
    }),
});
