import { HydratedDocument, Schema, Types, model } from "mongoose";

export const applicationStatuses = [
  "Applied",
  "Shortlisted",
  "Interviewed",
  "Rejected",
  "Hired",
] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number];

const applicationSchema = new Schema(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expectedSalary: { type: Number, required: true, min: 0 },
    availability: { type: String, required: true, trim: true },
    note: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: applicationStatuses,
      default: "Applied",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
applicationSchema.index({ status: 1, createdAt: -1 });

export interface Application {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  expectedSalary: number;
  availability: string;
  note: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationDocument = HydratedDocument<Application>;
export const ApplicationEntity = model<Application>("Application", applicationSchema);
