import { AppError } from "../../core/errors/AppError";
import {
  POPULATE_APPLICATION_CANDIDATE_ONLY,
  POPULATE_APPLICATION_JOB_ONLY,
} from "../../core/utils/queryBuilder";
import { UserRole } from "../users/user.model";
import { JobEntity } from "../jobs/job.model";
import { UserEntity } from "../users/user.model";
import {
  ApplicationDocument,
  ApplicationEntity,
  ApplicationStatus,
} from "./application.model";
import { notifyUser } from "../notifications/notification.service";
import { sendApplicationStatusEmail } from "../../services/emailService";

const APPLICATION_LIST_SELECT =
  "expectedSalary availability note status jobId candidateId createdAt updatedAt";

export const applyToJob = async (
  candidateId: string,
  jobId: string,
  payload: { expectedSalary: number; availability: string; note: string }
): Promise<ApplicationDocument> => {
  const job = await JobEntity.findById(jobId);
  if (!job || !job.isActive || job.deadline < new Date()) {
    throw new AppError("Job is not available for applications", 400);
  }

  const existing = await ApplicationEntity.findOne({ jobId, candidateId });
  if (existing) {
    throw new AppError("You already applied to this job", 409);
  }

  const application = await ApplicationEntity.create({ jobId, candidateId, ...payload });
  const candidate = await UserEntity.findById(candidateId).select("name email").lean();

  await notifyUser(job.recruiterId.toString(), {
    type: "job_applied",
    title: "New candidate applied",
    message: `${candidate?.name ?? "A candidate"} applied to ${job.title}.`,
    data: {
      applicationId: application._id.toString(),
      jobId: job._id.toString(),
      jobTitle: job.title,
      candidateId,
      candidateName: candidate?.name ?? "",
      candidateEmail: candidate?.email ?? "",
    },
  });

  if (candidate?.email) {
    void sendApplicationStatusEmail({
      to: candidate.email,
      candidateName: candidate.name ?? "Candidate",
      jobTitle: job.title,
      status: "Applied",
    });
  }

  return application;
};

const findApplicationsForCandidate = (candidateId: string) =>
  ApplicationEntity.find({ candidateId })
    .select(APPLICATION_LIST_SELECT)
    .sort({ createdAt: -1 })
    .populate(POPULATE_APPLICATION_JOB_ONLY)
    .lean();

export const listMyApplications = async (candidateId: string) => findApplicationsForCandidate(candidateId);

export const listApplicationsByCandidate = async (
  actor: { userId: string; role: UserRole },
  candidateId: string
) => {
  if (actor.role === "CANDIDATE" && actor.userId !== candidateId) {
    throw new AppError("Forbidden", 403);
  }

  return findApplicationsForCandidate(candidateId);
};

export const listApplicationsForJob = async (
  actor: { userId: string; role: UserRole },
  jobId: string
) => {
  const job = await JobEntity.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }
  const isOwner = job.recruiterId.toString() === actor.userId;
  if (!isOwner || actor.role !== "RECRUITER") {
    throw new AppError("Forbidden", 403);
  }

  return ApplicationEntity.find({ jobId })
    .select(APPLICATION_LIST_SELECT)
    .sort({ createdAt: -1 })
    .populate(POPULATE_APPLICATION_CANDIDATE_ONLY)
    .lean();
};

export const updateApplicationStatus = async (
  actor: { userId: string; role: UserRole },
  applicationId: string,
  status: ApplicationStatus
): Promise<ApplicationDocument> => {
  const application = await ApplicationEntity.findById(applicationId);
  if (!application) {
    throw new AppError("Application not found", 404);
  }

  const job = await JobEntity.findById(application.jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  const isOwner = job.recruiterId.toString() === actor.userId;
  if (!isOwner || actor.role !== "RECRUITER") {
    throw new AppError("Forbidden", 403);
  }

  const candidate = await UserEntity.findById(application.candidateId).select("name email").lean();
  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  application.status = status;
  await application.save();

  const candidateId = application.candidateId.toString();
  await notifyUser(candidateId, {
    type: "application_status_updated",
    title: "Application status updated",
    message: `Your application for ${job.title} is now ${status}.`,
    data: {
      applicationId: application._id.toString(),
      jobId: job._id.toString(),
      jobTitle: job.title,
      status,
      candidateId,
    },
  });

  if (candidate.email?.trim()) {
    void sendApplicationStatusEmail({
      to: candidate.email,
      candidateName: candidate.name ?? "Candidate",
      jobTitle: job.title,
      status,
    });
  } else {
    // eslint-disable-next-line no-console
    console.warn("Skipping application status email because candidate email is missing.", candidateId);
  }

  return application;
};
