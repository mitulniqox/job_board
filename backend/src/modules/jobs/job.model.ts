import { HydratedDocument, Schema, Types, model } from "mongoose";

export const jobTypes = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"] as const;
export type JobType = (typeof jobTypes)[number];

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], required: true, default: [] },
    salaryMin: { type: Number, required: true, min: 0 },
    salaryMax: { type: Number, required: true, min: 0 },
    jobType: { type: String, enum: jobTypes, required: true },
    location: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

jobSchema.index({ title: "text", description: "text", skills: "text" });
jobSchema.index({ jobType: 1, location: 1, createdAt: -1 });

export interface Job {
  title: string;
  description: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  jobType: JobType;
  deadline: Date;
  recruiterId: Types.ObjectId;
  skills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type JobDocument = HydratedDocument<Job>;
export const JobEntity = model<Job>("Job", jobSchema);
