import { Request, Response } from "express";
import { AppError } from "../../core/errors/AppError";
import { asyncHandler } from "../../core/utils/asyncHandler";
import { sendSuccess } from "../../core/utils/apiResponse";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateCurrentUser,
} from "./auth.service";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  sendSuccess(res, 201, "Registration successful", result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  sendSuccess(res, 200, "Login successful", result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await refreshAccessToken(req.body.refreshToken);
  sendSuccess(res, 200, "Access token refreshed", result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logoutUser(req.body.refreshToken);
  sendSuccess(res, 200, "Logout successful");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCurrentUser(req.user!.sub);
  sendSuccess(res, 200, "Profile retrieved", data);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const data = await updateCurrentUser(req.user!.sub, req.body);
  sendSuccess(res, 200, "Profile updated", data);
});

export const uploadResume = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new AppError("Resume file is required.", 400);
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const resumeUrl = `${baseUrl}/uploads/resumes/${file.filename}`;

  sendSuccess(res, 201, "Resume uploaded", {
    resumeUrl,
    originalName: file.originalname,
  });
});
