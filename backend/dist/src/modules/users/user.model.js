"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEntity = exports.userRoles = void 0;
const mongoose_1 = require("mongoose");
exports.userRoles = ["CANDIDATE", "RECRUITER", "ADMIN"];
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    refreshToken: { type: String, default: null, select: false },
    bookmarkedJobs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Job" }],
    role: { type: String, enum: exports.userRoles, default: "CANDIDATE" },
    isActive: { type: Boolean, default: true, index: true },
    candidateProfile: {
        skills: { type: [String], default: [] },
        experience: { type: Number, default: 0, min: 0 },
        location: { type: String, trim: true, default: "" },
        resume: { type: String, trim: true, default: "" },
    },
}, {
    timestamps: true,
    versionKey: false,
});
userSchema.index({
    name: "text",
    email: "text",
    "candidateProfile.skills": "text",
    "candidateProfile.location": "text",
});
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });
exports.UserEntity = (0, mongoose_1.model)("User", userSchema);
