import request from "supertest";
import type { Application } from "express";

export const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const uniqueEmail = (prefix: string): string =>
  `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@example.com`;

export const registerUser = async (
  app: Application,
  payload: {
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
  }
) => {
  const response = await request(app).post("/api/v1/auth/register").send(payload);
  return response;
};

export const createJob = async (
  app: Application,
  token: string,
  overrides?: Partial<{
    title: string;
    description: string;
    skills: string[];
    salaryMin: number;
    salaryMax: number;
    jobType: string;
    location: string;
    deadline: string;
  }>
) =>
  request(app)
    .post("/api/v1/jobs")
    .set(authHeaders(token))
    .send({
      title: "Backend Test Job",
      description: "A sufficiently long description for integration testing flows.",
      skills: ["node", "react"],
      salaryMin: 1000,
      salaryMax: 2000,
      jobType: "FULL_TIME",
      location: "India",
      deadline: new Date(Date.now() + 86400000).toISOString(),
      ...overrides,
    });
