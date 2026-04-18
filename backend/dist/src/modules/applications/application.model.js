"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationEntity = exports.applicationStatuses = void 0;
const mongoose_1 = require("mongoose");
exports.applicationStatuses = [
    "Applied",
    "Shortlisted",
    "Interviewed",
    "Rejected",
    "Hired",
];
const applicationSchema = new mongoose_1.Schema({
    jobId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expectedSalary: { type: Number, required: true, min: 0 },
    availability: { type: String, required: true, trim: true },
    note: { type: String, required: true, trim: true },
    status: {
        type: String,
        enum: exports.applicationStatuses,
        default: "Applied",
    },
}, {
    timestamps: true,
    versionKey: false,
});
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });
exports.ApplicationEntity = (0, mongoose_1.model)("Application", applicationSchema);
