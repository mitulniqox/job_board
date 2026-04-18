import { Types } from "mongoose";
import { AppError } from "../../core/errors/AppError";
import {
  POPULATE_APPLICATION_FULL,
  getPaginationParams,
  runPaginatedQuery,
} from "../../core/utils/queryBuilder";
import { ApplicationEntity, ApplicationStatus } from "../applications/application.model";
import { JOB_LIST_SELECT, buildJobListFilter } from "../jobs/job.query";
import { JobEntity, JobType } from "../jobs/job.model";
import { UserEntity, UserRole } from "../users/user.model";
import { buildUserListFilter, USER_LIST_SELECT } from "../users/user.query";

const APPLICATION_ADMIN_LIST_SELECT =
  "expectedSalary availability note status jobId candidateId createdAt updatedAt";

interface DateRange {
  from?: string;
  to?: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const buildDateMatch = (range: DateRange) => {
  const dateFilter: Record<string, Date> = {};
  if (range.from) dateFilter.$gte = new Date(range.from);
  if (range.to) dateFilter.$lte = new Date(range.to);
  return Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};
};

const aggregateDailyCounts = async (
  model: typeof UserEntity | typeof JobEntity | typeof ApplicationEntity,
  range: DateRange,
  label: string
) =>
  model.aggregate<{ _id: string; count: number }>([
    { $match: buildDateMatch(range) },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).then((rows) => rows.map((row) => ({ date: row._id, count: row.count, label })));

export const getDashboardStats = async (range: DateRange) => {
  const createdAtMatch = buildDateMatch(range);

  const [usersAgg, jobsAgg, applicationsAgg, candidateCount, recruiterCount, suspendedUsersCount, activeJobsCount, topRecruiters, jobTrend, applicationTrend] = await Promise.all([
    UserEntity.aggregate([{ $match: createdAtMatch }, { $count: "count" }]),
    JobEntity.aggregate([{ $match: createdAtMatch }, { $count: "count" }]),
    ApplicationEntity.aggregate([{ $match: createdAtMatch }, { $count: "count" }]),
    UserEntity.countDocuments({ role: "CANDIDATE" }),
    UserEntity.countDocuments({ role: "RECRUITER" }),
    UserEntity.countDocuments({ isActive: false }),
    JobEntity.countDocuments({ isActive: true }),
    JobEntity.aggregate<{
      recruiterId: Types.ObjectId;
      jobIds: Types.ObjectId[];
      jobsCount: number;
      activeJobsCount: number;
      applicationsCount: number;
      recruiterName: string;
      recruiterEmail: string;
    }>([
      {
        $group: {
          _id: "$recruiterId",
          jobIds: { $push: "$_id" },
          jobsCount: { $sum: 1 },
          activeJobsCount: {
            $sum: {
              $cond: [{ $eq: ["$isActive", true] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "applications",
          localField: "jobIds",
          foreignField: "jobId",
          as: "jobApplications",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "recruiter",
        },
      },
      { $unwind: { path: "$recruiter", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          recruiterId: "$_id",
          jobsCount: 1,
          activeJobsCount: 1,
          applicationsCount: { $size: "$jobApplications" },
          recruiterName: "$recruiter.name",
          recruiterEmail: "$recruiter.email",
        },
      },
      { $sort: { applicationsCount: -1, jobsCount: -1 } },
      { $limit: 5 },
    ]),
    aggregateDailyCounts(JobEntity, range, "Jobs"),
    aggregateDailyCounts(ApplicationEntity, range, "Applications"),
  ]);

  return {
    usersCount: usersAgg[0]?.count ?? 0,
    jobsCount: jobsAgg[0]?.count ?? 0,
    applicationsCount: applicationsAgg[0]?.count ?? 0,
    candidatesCount: candidateCount,
    recruitersCount: recruiterCount,
    suspendedUsersCount,
    activeJobsCount,
    topRecruiters: topRecruiters.map((recruiter) => ({
      recruiterId: recruiter.recruiterId.toString(),
      name: recruiter.recruiterName ?? "Unknown recruiter",
      email: recruiter.recruiterEmail ?? "",
      jobsCount: recruiter.jobsCount,
      activeJobsCount: recruiter.activeJobsCount,
      applicationsCount: recruiter.applicationsCount,
    })),
    jobTrend,
    applicationTrend,
  };
};

export const getAllUsers = async (
  filters: {
    search?: string;
    skills?: string[];
    location?: string;
    role?: UserRole;
    isActive?: boolean;
  } & ListOptions
) => {
  const query = buildUserListFilter(filters);

  return runPaginatedQuery(UserEntity, query, {
    ...filters,
    lean: true,
    select: USER_LIST_SELECT,
  });
};

export const updateUserActiveStatus = async (userId: string, isActive: boolean) => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  const updated = await UserEntity.findByIdAndUpdate(userId, { isActive }, { new: true });
  if (!updated) {
    throw new AppError("User not found", 404);
  }
  return updated;
};

export const getAllJobsReadOnly = async (
  filters: {
    search?: string;
    skills?: string[];
    jobType?: JobType;
    location?: string;
    isActive?: boolean;
  } & ListOptions
) => {
  const query = buildJobListFilter({
    search: filters.search,
    skills: filters.skills,
    location: filters.location,
    jobType: filters.jobType,
    isActive: filters.isActive,
    includeDescriptionInSearch: false,
  });

  return runPaginatedQuery(JobEntity, query, {
    ...filters,
    lean: true,
    select: JOB_LIST_SELECT,
  });
};

export const getAllApplicationsReadOnly = async (
  filters: { status?: ApplicationStatus; jobId?: string; candidateId?: string } & ListOptions
) => {
  const query: Record<string, unknown> = {};
  const { page, limit, skip } = getPaginationParams(filters.page, filters.limit);
  const sortBy = filters.sortBy ?? "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  if (filters.status) query.status = filters.status;
  if (filters.jobId) query.jobId = filters.jobId;
  if (filters.candidateId) query.candidateId = filters.candidateId;

  const [items, total] = await Promise.all([
    ApplicationEntity.find(query)
      .select(APPLICATION_ADMIN_LIST_SELECT)
      .populate(POPULATE_APPLICATION_FULL)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    ApplicationEntity.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
