import request from "supertest";
import type { Application } from "express";
import { authHeaders, createJob, registerUser, uniqueEmail } from "../helpers/api";
import { clearDatabase, setupTestApp, teardownTestApp } from "../helpers/testApp";

describe("Application APIs", () => {
  let app: Application;
  let emitToUserRoomSpy: jest.SpyInstance;
  let sendApplicationStatusEmailSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await setupTestApp();
  });

  beforeEach(async () => {
    await clearDatabase();
    const socketModule = await import("../../src/socket/socket");
    const emailModule = await import("../../src/services/emailService");

    emitToUserRoomSpy = jest.spyOn(socketModule, "emitToUserRoom").mockImplementation(() => undefined);
    sendApplicationStatusEmailSpy = jest
      .spyOn(emailModule, "sendApplicationStatusEmail")
      .mockResolvedValue(true);
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  afterEach(() => {
    emitToUserRoomSpy.mockRestore();
    sendApplicationStatusEmailSpy.mockRestore();
  });

  it("allows a candidate to apply to a job successfully", async () => {
    const recruiter = await registerUser(app, {
      name: "Recruiter",
      email: uniqueEmail("recruiter-apply"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const candidate = await registerUser(app, {
      name: "Candidate",
      email: uniqueEmail("candidate-apply"),
      password: "Password123!",
      role: "CANDIDATE",
      candidateProfile: {
        skills: ["node"],
        experience: 2,
        location: "India",
        resume: "",
      },
    });
    const job = await createJob(app, recruiter.body.data.accessToken);

    const response = await request(app)
      .post(`/api/v1/jobs/${job.body.data._id}/apply`)
      .set(authHeaders(candidate.body.data.accessToken))
      .send({
        expectedSalary: 1800,
        availability: "Immediate",
        note: "This is my application note.",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe("Applied");

    const { NotificationEntity } = await import("../../src/modules/notifications/notification.model");
    const recruiterNotifications = await NotificationEntity.find({
      userId: recruiter.body.data.user.id,
    }).lean();
    expect(recruiterNotifications).toHaveLength(1);
    expect(recruiterNotifications[0]?.type).toBe("job_applied");
    expect(emitToUserRoomSpy).toHaveBeenCalledWith(
      recruiter.body.data.user.id,
      "notification",
      expect.objectContaining({
        type: "job_applied",
      })
    );
  });

  it("returns validation errors for an invalid application payload", async () => {
    const recruiter = await registerUser(app, {
      name: "Recruiter",
      email: uniqueEmail("recruiter-validation"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const candidate = await registerUser(app, {
      name: "Candidate",
      email: uniqueEmail("candidate-validation"),
      password: "Password123!",
      role: "CANDIDATE",
    });
    const job = await createJob(app, recruiter.body.data.accessToken);

    const response = await request(app)
      .post(`/api/v1/jobs/${job.body.data._id}/apply`)
      .set(authHeaders(candidate.body.data.accessToken))
      .send({
        expectedSalary: -1,
        availability: "A",
        note: "bad",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
  });

  it("blocks candidates from updating application status", async () => {
    const recruiter = await registerUser(app, {
      name: "Recruiter",
      email: uniqueEmail("recruiter-status"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const candidate = await registerUser(app, {
      name: "Candidate",
      email: uniqueEmail("candidate-status"),
      password: "Password123!",
      role: "CANDIDATE",
    });
    const job = await createJob(app, recruiter.body.data.accessToken);
    const application = await request(app)
      .post(`/api/v1/jobs/${job.body.data._id}/apply`)
      .set(authHeaders(candidate.body.data.accessToken))
      .send({
        expectedSalary: 1800,
        availability: "Immediate",
        note: "Applying for unauthorized test.",
      });

    const response = await request(app)
      .patch(`/api/v1/applications/${application.body.data._id}/status`)
      .set(authHeaders(candidate.body.data.accessToken))
      .send({ status: "Shortlisted" });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  it("allows recruiters to update application status", async () => {
    const recruiter = await registerUser(app, {
      name: "Recruiter",
      email: uniqueEmail("recruiter-success"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const candidate = await registerUser(app, {
      name: "Candidate",
      email: uniqueEmail("candidate-success"),
      password: "Password123!",
      role: "CANDIDATE",
    });
    const job = await createJob(app, recruiter.body.data.accessToken);
    const application = await request(app)
      .post(`/api/v1/jobs/${job.body.data._id}/apply`)
      .set(authHeaders(candidate.body.data.accessToken))
      .send({
        expectedSalary: 1800,
        availability: "Immediate",
        note: "Applying for successful update test.",
      });
    emitToUserRoomSpy.mockClear();
    sendApplicationStatusEmailSpy.mockClear();

    const response = await request(app)
      .patch(`/api/v1/applications/${application.body.data._id}/status`)
      .set(authHeaders(recruiter.body.data.accessToken))
      .send({ status: "Shortlisted" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("Shortlisted");
    expect(sendApplicationStatusEmailSpy).toHaveBeenCalledWith({
      to: candidate.body.data.user.email,
      candidateName: candidate.body.data.user.name,
      jobTitle: job.body.data.title,
      status: "Shortlisted",
    });
    expect(emitToUserRoomSpy).toHaveBeenCalledWith(
      candidate.body.data.user.id,
      "notification",
      expect.objectContaining({
        type: "application_status_updated",
      })
    );
    expect(emitToUserRoomSpy).toHaveBeenCalledWith(
      candidate.body.data.user.id,
      "application_status_updated",
      expect.objectContaining({
        type: "application_status_updated",
      })
    );

    const { NotificationEntity } = await import("../../src/modules/notifications/notification.model");
    const candidateNotifications = await NotificationEntity.find({
      userId: candidate.body.data.user.id,
    }).lean();
    const statusNotifications = candidateNotifications.filter(
      (notification) => notification.type === "application_status_updated"
    );
    expect(statusNotifications).toHaveLength(1);
    expect(statusNotifications[0]).toMatchObject({
      type: "application_status_updated",
      title: "Application status updated",
      message: expect.stringContaining(job.body.data.title),
    });
    expect(statusNotifications[0]?.data).toMatchObject({
      applicationId: application.body.data._id,
      jobId: job.body.data._id,
      jobTitle: job.body.data.title,
      status: "Shortlisted",
      candidateId: candidate.body.data.user.id,
    });
  });

  it("returns not found when the application candidate record no longer exists", async () => {
    const recruiter = await registerUser(app, {
      name: "Recruiter",
      email: uniqueEmail("recruiter-missing-candidate"),
      password: "Password123!",
      role: "RECRUITER",
    });
    const candidate = await registerUser(app, {
      name: "Candidate",
      email: uniqueEmail("candidate-missing-candidate"),
      password: "Password123!",
      role: "CANDIDATE",
    });
    const job = await createJob(app, recruiter.body.data.accessToken);
    const application = await request(app)
      .post(`/api/v1/jobs/${job.body.data._id}/apply`)
      .set(authHeaders(candidate.body.data.accessToken))
      .send({
        expectedSalary: 1800,
        availability: "Immediate",
        note: "Applying before candidate removal.",
      });

    const { UserEntity } = await import("../../src/modules/users/user.model");
    await UserEntity.deleteOne({ _id: candidate.body.data.user.id });
    emitToUserRoomSpy.mockClear();
    sendApplicationStatusEmailSpy.mockClear();

    const response = await request(app)
      .patch(`/api/v1/applications/${application.body.data._id}/status`)
      .set(authHeaders(recruiter.body.data.accessToken))
      .send({ status: "Shortlisted" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Candidate not found");
    expect(emitToUserRoomSpy).not.toHaveBeenCalled();
    expect(sendApplicationStatusEmailSpy).not.toHaveBeenCalled();
  });
});
