import request from "supertest";
import type { Application } from "express";
import { authHeaders, createJob, registerUser, uniqueEmail } from "../helpers/api";
import { clearDatabase, setupTestApp, teardownTestApp } from "../helpers/testApp";

describe("Job APIs", () => {
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

  it("blocks admins from creating jobs", async () => {
    const admin = await registerUser(app, {
      name: "Admin",
      email: uniqueEmail("admin-job-create"),
      password: "Password123!",
      role: "ADMIN",
    });

    const response = await request(app)
      .post("/api/v1/jobs")
      .set(authHeaders(admin.body.data.accessToken))
      .send({
        title: "Forbidden Admin Job",
        description: "This job should not be created by an administrator account.",
        skills: ["typescript"],
        salaryMin: 1000,
        salaryMax: 2000,
        jobType: "FULL_TIME",
        location: "India",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  it("limits recruiters to their own jobs in list/get/delete flows", async () => {
    const recruiterOne = await registerUser(app, {
      name: "Recruiter One",
      email: uniqueEmail("recruiter-one"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const recruiterTwo = await registerUser(app, {
      name: "Recruiter Two",
      email: uniqueEmail("recruiter-two"),
      password: "Password123!",
      role: "RECRUITER",
    });

    const ownJob = await createJob(app, recruiterOne.body.data.accessToken, {
      title: "Own Recruiter Job",
    });
    const otherJob = await createJob(app, recruiterTwo.body.data.accessToken, {
      title: "Other Recruiter Job",
    });

    const listResponse = await request(app)
      .get("/api/v1/jobs")
      .set(authHeaders(recruiterOne.body.data.accessToken));

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.jobs).toHaveLength(1);
    expect(listResponse.body.data.jobs[0].title).toBe("Own Recruiter Job");

    const getOtherResponse = await request(app)
      .get(`/api/v1/jobs/${otherJob.body.data._id}`)
      .set(authHeaders(recruiterOne.body.data.accessToken));

    expect(getOtherResponse.status).toBe(403);
    expect(getOtherResponse.body.message).toBe("Forbidden");

    const deleteOtherResponse = await request(app)
      .delete(`/api/v1/jobs/${otherJob.body.data._id}`)
      .set(authHeaders(recruiterOne.body.data.accessToken));

    expect(deleteOtherResponse.status).toBe(403);
    expect(deleteOtherResponse.body.message).toBe("Forbidden");

    const ownGetResponse = await request(app)
      .get(`/api/v1/jobs/${ownJob.body.data._id}`)
      .set(authHeaders(recruiterOne.body.data.accessToken));

    expect(ownGetResponse.status).toBe(200);
    expect(ownGetResponse.body.data.title).toBe("Own Recruiter Job");
  });

  it("allows candidates to bookmark and unbookmark jobs", async () => {
    const recruiter = await registerUser(app, {
      name: "Recruiter",
      email: uniqueEmail("bookmark-recruiter"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const candidate = await registerUser(app, {
      name: "Candidate",
      email: uniqueEmail("bookmark-candidate"),
      password: "Password123!",
      role: "CANDIDATE",
    });

    const job = await createJob(app, recruiter.body.data.accessToken, {
      title: "Saved Role",
    });

    const bookmarkResponse = await request(app)
      .post(`/api/v1/jobs/${job.body.data._id}/bookmark`)
      .set(authHeaders(candidate.body.data.accessToken));

    expect(bookmarkResponse.status).toBe(200);
    expect(bookmarkResponse.body.data).toEqual({
      jobId: job.body.data._id,
      bookmarked: true,
    });

    const idsResponse = await request(app)
      .get("/api/v1/jobs/bookmarks/me/ids")
      .set(authHeaders(candidate.body.data.accessToken));

    expect(idsResponse.status).toBe(200);
    expect(idsResponse.body.data).toContain(job.body.data._id);

    const savedJobsResponse = await request(app)
      .get("/api/v1/jobs/bookmarks/me")
      .set(authHeaders(candidate.body.data.accessToken));

    expect(savedJobsResponse.status).toBe(200);
    expect(savedJobsResponse.body.data.jobs).toHaveLength(1);
    expect(savedJobsResponse.body.data.jobs[0].title).toBe("Saved Role");

    const removeResponse = await request(app)
      .delete(`/api/v1/jobs/${job.body.data._id}/bookmark`)
      .set(authHeaders(candidate.body.data.accessToken));

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.data).toEqual({
      jobId: job.body.data._id,
      bookmarked: false,
    });

    const emptySavedJobsResponse = await request(app)
      .get("/api/v1/jobs/bookmarks/me")
      .set(authHeaders(candidate.body.data.accessToken));

    expect(emptySavedJobsResponse.status).toBe(200);
    expect(emptySavedJobsResponse.body.data.jobs).toHaveLength(0);
  });
});
