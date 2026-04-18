import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt, { JsonWebTokenError, SignOptions, TokenExpiredError } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../core/errors/AppError";
import { UserDocument, UserEntity } from "../users/user.model";
import { JwtPayload } from "./auth.types";

const sanitizeUser = (user: UserDocument) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  candidateProfile: {
    skills: user.candidateProfile?.skills ?? [],
    experience: user.candidateProfile?.experience ?? 0,
    location: user.candidateProfile?.location ?? "",
    resume: user.candidateProfile?.resume ?? "",
  },
  createdAt: user.createdAt ?? null,
});

const createJwtPayload = (user: Pick<UserDocument, "id" | "email" | "role">): JwtPayload => ({
  sub: user.id,
  email: user.email,
  role: user.role,
});

const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

const signAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, options);
};

const signRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, options);
};

const verifyToken = (
  token: string,
  secret: string,
  expiredMessage: string,
  invalidMessage: string
): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new AppError(expiredMessage, 401);
    }

    if (error instanceof JsonWebTokenError) {
      throw new AppError(invalidMessage, 401);
    }

    throw error;
  }
};

const issueAuthTokens = async (
  user: UserDocument
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = createJwtPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await UserEntity.findByIdAndUpdate(user.id, { refreshToken: hashToken(refreshToken) });

  return { accessToken, refreshToken };
};

export const registerUser = async (input: {
  name: string;
  email: string;
  password: string;
  role?: "CANDIDATE" | "RECRUITER" | "ADMIN";
  candidateProfile?: {
    skills?: string[];
    experience?: number;
    location?: string;
    resume?: string;
  };
}): Promise<{ user: ReturnType<typeof sanitizeUser>; accessToken: string; refreshToken: string }> => {
  const exists = await UserEntity.findOne({ email: input.email });
  if (exists) {
    throw new AppError("Email is already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);
  const user = await UserEntity.create({ ...input, password: hashedPassword });
  const tokens = await issueAuthTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginUser = async (input: {
  email: string;
  password: string;
}): Promise<{ user: ReturnType<typeof sanitizeUser>; accessToken: string; refreshToken: string }> => {
  const user = await UserEntity.findOne({ email: input.email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValidPassword = await bcrypt.compare(input.password, user.password);
  if (!isValidPassword) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account suspended, please contact admin.", 403);
  }

  const tokens = await issueAuthTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await UserEntity.findById(payload.sub).select("+refreshToken");

  if (!user || !user.refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (user.refreshToken !== hashToken(refreshToken)) {
    throw new AppError("Invalid refresh token", 401);
  }

  return {
    accessToken: signAccessToken(createJwtPayload(user)),
  };
};

export const logoutUser = async (refreshToken: string): Promise<void> => {
  await UserEntity.findOneAndUpdate({ refreshToken: hashToken(refreshToken) }, { refreshToken: null });
};

export const getCurrentUser = async (userId: string): Promise<ReturnType<typeof sanitizeUser>> => {
  const user = await UserEntity.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return sanitizeUser(user);
};

export const updateCurrentUser = async (
  userId: string,
  input: {
    name?: string;
    isActive?: boolean;
    candidateProfile?: {
      skills?: string[];
      experience?: number;
      location?: string;
      resume?: string;
    };
  }
): Promise<ReturnType<typeof sanitizeUser>> => {
  const updated = await UserEntity.findByIdAndUpdate(userId, input, { new: true });
  if (!updated) {
    throw new AppError("User not found", 404);
  }
  return sanitizeUser(updated);
};

export const verifyAccessToken = (token: string): JwtPayload =>
  verifyToken(token, env.ACCESS_TOKEN_SECRET, "Access token expired", "Invalid access token");

export const verifyRefreshToken = (token: string): JwtPayload =>
  verifyToken(token, env.REFRESH_TOKEN_SECRET, "Refresh token expired", "Invalid refresh token");
