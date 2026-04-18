import request from "supertest";
import type { Application } from "express";
import { authHeaders, registerUser, uniqueEmail } from "../helpers/api";
import { clearDatabase, setupTestApp, teardownTestApp } from "../helpers/testApp";

describe("User APIs", () => {
  let app: Application;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it("returns the current user's profile", async () => {
    const email = uniqueEmail("profile");
    const registerResponse = await registerUser(app, {
      name: "Profile Tester",
      email,
      password: "Password123!",
      role: "CANDIDATE",
    });

    const token = registerResponse.body.data.accessToken;
    const response = await request(app).get("/api/v1/auth/me").set(authHeaders(token));

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(email);
  });

  it("rejects profile access without a token", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  it("allows admins to fetch users and blocks non-admins", async () => {
    const admin = await registerUser(app, {
      name: "Admin Tester",
      email: uniqueEmail("admin"),
      password: "Password123!",
      role: "ADMIN",
    });

    await registerUser(app, {
      name: "Candidate Tester",
      email: uniqueEmail("candidate"),
      password: "Password123!",
      role: "CANDIDATE",
    });

    const adminResponse = await request(app)
      .get("/api/v1/admin/users?page=1&limit=10")
      .set(authHeaders(admin.body.data.accessToken));

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.data.items.length).toBeGreaterThanOrEqual(2);

    const recruiter = await registerUser(app, {
      name: "Recruiter Tester",
      email: uniqueEmail("recruiter"),
      password: "Password123!",
      role: "RECRUITER",
    });

    const forbiddenResponse = await request(app)
      .get("/api/v1/admin/users?page=1&limit=10")
      .set(authHeaders(recruiter.body.data.accessToken));

    expect(forbiddenResponse.status).toBe(403);
    expect(forbiddenResponse.body.message).toBe("Forbidden");
  });
});
