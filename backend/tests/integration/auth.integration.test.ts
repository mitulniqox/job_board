import request from "supertest";
import type { Application } from "express";
import { uniqueEmail } from "../helpers/api";
import { clearDatabase, setupTestApp, teardownTestApp } from "../helpers/testApp";

describe("Auth APIs", () => {
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

  it("registers a user successfully", async () => {
    const email = uniqueEmail("auth");
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Auth Tester",
      email,
      password: "Password123!",
      role: "CANDIDATE",
      candidateProfile: {
        skills: ["node"],
        experience: 2,
        location: "India",
        resume: "",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it("returns validation errors for invalid registration payloads", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation error");
  });

  it("rejects invalid login credentials", async () => {
    const email = uniqueEmail("login");
    await request(app).post("/api/v1/auth/register").send({
      name: "Login Tester",
      email,
      password: "Password123!",
      role: "CANDIDATE",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("logs in and returns access and refresh tokens", async () => {
    const email = uniqueEmail("login-success");
    await request(app).post("/api/v1/auth/register").send({
      name: "Login Success Tester",
      email,
      password: "Password123!",
      role: "CANDIDATE",
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!",
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.refreshToken).toEqual(expect.any(String));
  });

  it("refreshes an access token with a valid refresh token", async () => {
    const email = uniqueEmail("refresh");
    const registerResponse = await request(app).post("/api/v1/auth/register").send({
      name: "Refresh Tester",
      email,
      password: "Password123!",
      role: "CANDIDATE",
    });

    const response = await request(app).post("/api/v1/auth/refresh-token").send({
      refreshToken: registerResponse.body.data.refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
  });

  it("invalidates the refresh token on logout", async () => {
    const email = uniqueEmail("logout");
    const registerResponse = await request(app).post("/api/v1/auth/register").send({
      name: "Logout Tester",
      email,
      password: "Password123!",
      role: "CANDIDATE",
    });

    const refreshToken = registerResponse.body.data.refreshToken;

    const logoutResponse = await request(app).post("/api/v1/auth/logout").send({
      refreshToken,
    });

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);

    const refreshResponse = await request(app).post("/api/v1/auth/refresh-token").send({
      refreshToken,
    });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.success).toBe(false);
    expect(refreshResponse.body.message).toBe("Invalid refresh token");
  });
});
