import fs from "fs";
import path from "path";
import multer from "multer";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

const resumeUploadDir = path.join(process.cwd(), "uploads", "resumes");
fs.mkdirSync(resumeUploadDir, { recursive: true });

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resumeUploadDir),
  filename: (_req, file, cb) => {
    const safeBaseName = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBaseName || "resume"}-${suffix}${path.extname(file.originalname)}`);
  },
});

const resumeUploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new AppError("Only PDF, DOC, and DOCX resume files are allowed.", 400));
      return;
    }
    cb(null, true);
  },
});

export const uploadResumeFile = (req: Request, res: Response, next: NextFunction): void => {
  resumeUploader.single("resume")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("Resume file size must be 5MB or less.", 400));
        return;
      }
      next(new AppError(error.message, 400));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    if (!req.file) {
      next(new AppError("Resume file is required.", 400));
      return;
    }

    next();
  });
};
