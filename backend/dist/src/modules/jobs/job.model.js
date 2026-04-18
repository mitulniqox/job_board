"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobEntity = exports.jobTypes = void 0;
const mongoose_1 = require("mongoose");
exports.jobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"];
const jobSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], required: true, default: [] },
    salaryMin: { type: Number, required: true, min: 0 },
    salaryMax: { type: Number, required: true, min: 0 },
    jobType: { type: String, enum: exports.jobTypes, required: true },
    location: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    recruiterId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
}, {
    timestamps: true,
    versionKey: false,
});
jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ jobType: 1, location: 1, createdAt: -1 });
exports.JobEntity = (0, mongoose_1.model)("Job", jobSchema);
