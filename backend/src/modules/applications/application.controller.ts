import { Request, Response } from "express";
import { asyncHandler } from "../../core/utils/asyncHandler";
import { sendSuccess } from "../../core/utils/apiResponse";
import {
  applyToJob,
  listApplicationsByCandidate,
  listApplicationsForJob,
  listMyApplications,
  updateApplicationStatus,
} from "./application.service";

export const applyToJobHandler = asyncHandler(async (req: Request, res: Response) => {
  const application = await applyToJob(req.user!.sub, req.params.jobId, req.body);
  sendSuccess(res, 201, "Application submitted", application);
});

export const myApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const applications = await listMyApplications(req.user!.sub);
  sendSuccess(res, 200, "Applications fetched", applications);
});

export const candidateApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const applications = await listApplicationsByCandidate(
    { userId: req.user!.sub, role: req.user!.role },
    req.params.candidateId
  );
  sendSuccess(res, 200, "Candidate applications fetched", applications);
});

export const jobApplicationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const applications = await listApplicationsForJob(
    { userId: req.user!.sub, role: req.user!.role },
    req.params.jobId
  );
  sendSuccess(res, 200, "Job applications fetched", applications);
});

export const updateApplicationStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  const application = await updateApplicationStatus(
    { userId: req.user!.sub, role: req.user!.role },
    req.params.applicationId,
    req.body.status
  );
  sendSuccess(res, 200, "Application status updated", application);
});
