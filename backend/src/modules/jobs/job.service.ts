import { AppError } from "../../core/errors/AppError";
import { runPaginatedQuery } from "../../core/utils/queryBuilder";
import { UserRole } from "../users/user.model";
import { JOB_LIST_SELECT, buildJobListFilter, type JobListFilterInput } from "./job.query";
import { Job, JobDocument, JobEntity } from "./job.model";
import { UserEntity } from "../users/user.model";
import { notifyUsers } from "../notifications/notification.service";
import { ApplicationEntity } from "../applications/application.model";

type JobFilters = JobListFilterInput & {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type JobActor = {
  userId: string;
  role: UserRole;
};

const assertRecruiterOwnership = (job: JobDocument, actor: JobActor) => {
  if (actor.role !== "RECRUITER" || job.recruiterId.toString() !== actor.userId) {
    throw new AppError("Forbidden", 403);
  }
};

export const createJob = async (
  recruiterId: string,
  payload: Omit<Job, "createdAt" | "updatedAt" | "recruiterId" | "isActive">
): Promise<JobDocument> => {
  const job = await JobEntity.create({ ...payload, recruiterId, isActive: true });

  const candidates = await UserEntity.find({ role: "CANDIDATE", isActive: true }).select("_id").lean();
  const candidateIds = candidates.map((candidate) => candidate._id.toString());

  if (candidateIds.length > 0) {
    await notifyUsers(candidateIds, {
      type: "new_job_posted",
      title: "New job posted",
      message: `${job.title} is now open for applications in ${job.location}.`,
      data: { jobId: job._id.toString(), jobTitle: job.title, location: job.location },
    });
  }

  return job;
};

export const listJobs = async (
  filters: JobFilters,
  actor?: JobActor
): Promise<{ jobs: Job[]; total: number; page: number; limit: number; totalPages: number }> => {
  const query = buildJobListFilter({
    search: filters.search,
    location: filters.location,
    jobType: filters.jobType,
    isActive: filters.isActive,
    includeDescriptionInSearch: true,
  });

  if (actor?.role === "RECRUITER") {
    query.recruiterId = actor.userId;
  }

  const data = await runPaginatedQuery(JobEntity, query, {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy ?? "createdAt",
    sortOrder: filters.sortOrder ?? "desc",
    lean: true,
    select: JOB_LIST_SELECT,
  });
  return {
    jobs: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
};

export const getJobById = async (jobId: string, actor?: JobActor): Promise<JobDocument> => {
  const job = await JobEntity.findById(jobId);
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  if (actor?.role === "RECRUITER" && job.recruiterId.toString() !== actor.userId) {
    throw new AppError("Forbidden", 403);
  }

  return job;
};

export const updateJob = async (
  jobId: string,
  actor: { userId: string; role: UserRole },
  payload: Partial<Job>
): Promise<Job> => {
  const job = await getJobById(jobId);
  assertRecruiterOwnership(job, actor);

  Object.assign(job, payload);
  await job.save();
  return job;
};

export const deleteJob = async (
  jobId: string,
  actor: { userId: string; role: UserRole }
): Promise<void> => {
  const job = await getJobById(jobId);
  assertRecruiterOwnership(job, actor);

  await JobEntity.findByIdAndDelete(jobId);
};

export const toggleJobStatus = async (
  jobId: string,
  actor: { userId: string; role: UserRole },
  isActive: boolean
): Promise<JobDocument> => {
  const job = await getJobById(jobId);
  assertRecruiterOwnership(job, actor);

  job.isActive = isActive;
  await job.save();
  return job;
};

export const getRecruiterOverview = async (recruiterId: string) => {
  const jobs = await JobEntity.find({ recruiterId })
    .select("title isActive createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const jobIds = jobs.map((job) => job._id);
  const [applicantCounts, recentApplications] = await Promise.all([
    jobIds.length > 0
      ? ApplicationEntity.aggregate<{ totalApplicants: number }>([
          { $match: { jobId: { $in: jobIds } } },
          { $count: "totalApplicants" },
        ])
      : Promise.resolve([]),
    jobIds.length > 0
      ? ApplicationEntity.find({ jobId: { $in: jobIds } })
          .populate("jobId", "title")
          .populate("candidateId", "name email")
          .sort({ updatedAt: -1 })
          .limit(6)
          .lean()
      : Promise.resolve([]),
  ]);

  const recentActivity = [
    ...jobs.slice(0, 6).map((job) => ({
      id: `job:${job._id.toString()}`,
      type: "JOB",
      title: "Job listing updated",
      message: `${job.title} is ${job.isActive ? "active" : "closed"}.`,
      createdAt: job.updatedAt?.toISOString?.() ?? new Date(job.updatedAt).toISOString(),
    })),
    ...recentApplications.map((application) => {
      const jobRef = application.jobId as { title?: string } | null;
      const candidateRef = application.candidateId as { name?: string; email?: string } | null;
      return {
        id: `application:${application._id.toString()}`,
        type: "APPLICATION",
        title: "New applicant activity",
        message: `${candidateRef?.name ?? candidateRef?.email ?? "A candidate"} is ${application.status} for ${
          jobRef?.title ?? "a job"
        }.`,
        createdAt:
          application.updatedAt?.toISOString?.() ?? new Date(application.updatedAt).toISOString(),
      };
    }),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 8);

  return {
    activeJobsCount: jobs.filter((job) => job.isActive).length,
    totalApplicants: applicantCounts[0]?.totalApplicants ?? 0,
    recentActivity,
  };
};

export const listBookmarkedJobs = async (
  candidateId: string,
  filters: JobFilters
): Promise<{ jobs: Job[]; total: number; page: number; limit: number; totalPages: number }> => {
  const user = await UserEntity.findById(candidateId).select("bookmarkedJobs").lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const bookmarkedJobs = user.bookmarkedJobs ?? [];
  if (bookmarkedJobs.length === 0) {
    return {
      jobs: [],
      total: 0,
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
      totalPages: 0,
    };
  }

  const query = buildJobListFilter({
    search: filters.search,
    skills: filters.skills,
    location: filters.location,
    jobType: filters.jobType,
    isActive: filters.isActive,
    includeDescriptionInSearch: true,
  });
  query._id = { $in: bookmarkedJobs };

  const data = await runPaginatedQuery(JobEntity, query, {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy ?? "createdAt",
    sortOrder: filters.sortOrder ?? "desc",
    lean: true,
    select: JOB_LIST_SELECT,
  });

  return {
    jobs: data.items,
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  };
};

export const listBookmarkedJobIds = async (candidateId: string): Promise<string[]> => {
  const user = await UserEntity.findById(candidateId).select("bookmarkedJobs").lean();
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return (user.bookmarkedJobs ?? []).map((jobId) => jobId.toString());
};

export const addJobBookmark = async (candidateId: string, jobId: string) => {
  const job = await getJobById(jobId);
  await UserEntity.findByIdAndUpdate(candidateId, { $addToSet: { bookmarkedJobs: job._id } });
  return { jobId: job._id.toString(), bookmarked: true };
};

export const removeJobBookmark = async (candidateId: string, jobId: string) => {
  await UserEntity.findByIdAndUpdate(candidateId, { $pull: { bookmarkedJobs: jobId } });
  return { jobId, bookmarked: false };
};
