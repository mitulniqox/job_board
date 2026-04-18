import { HydratedDocument, Schema, model } from "mongoose";

export const userRoles = ["CANDIDATE", "RECRUITER", "ADMIN"] as const;
export type UserRole = (typeof userRoles)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    refreshToken: { type: String, default: null, select: false },
    bookmarkedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    role: { type: String, enum: userRoles, default: "CANDIDATE" },
    isActive: { type: Boolean, default: true, index: true },
    candidateProfile: {
      skills: { type: [String], default: [] },
      experience: { type: Number, default: 0, min: 0 },
      location: { type: String, trim: true, default: "" },
      resume: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({
  name: "text",
  email: "text",
  "candidateProfile.skills": "text",
  "candidateProfile.location": "text",
});
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });

export interface User {
  name: string;
  email: string;
  password: string;
  refreshToken?: string | null;
  bookmarkedJobs?: string[];
  role: UserRole;
  isActive: boolean;
  candidateProfile: {
    skills: string[];
    experience: number;
    location: string;
    resume: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

export const UserEntity = model<User>("User", userSchema);
