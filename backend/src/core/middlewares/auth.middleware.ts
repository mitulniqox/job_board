import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { verifyAccessToken } from "../../modules/auth/auth.service";
import { UserRole } from "../../modules/users/user.model";

export const verifyToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = verifyAccessToken(token);
  req.user = payload;

  next();
};

export const verifyTokenIfPresent = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AppError("Unauthorized", 401);
  }

  req.user = verifyAccessToken(token);
  next();
};

export const restrictTo =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }
    next();
  };
