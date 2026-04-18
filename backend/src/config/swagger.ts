import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IBL Finance API",
      version: "1.0.0",
      description: "REST API documentation for authentication, users, jobs, and applications.",
    },
    servers: [
      {
        url: "/api/v1",
        description: "Current API server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: {},
          },
        },
        ApiError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Unauthorized" },
          },
        },
        ValidationError: {
          allOf: [
            { $ref: "#/components/schemas/ApiError" },
            {
              type: "object",
              properties: {
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      path: { type: "string", example: "body.email" },
                      message: { type: "string", example: "Invalid email" },
                    },
                  },
                },
              },
            },
          ],
        },
        CandidateProfile: {
          type: "object",
          properties: {
            skills: { type: "array", items: { type: "string" } },
            experience: { type: "number", example: 3 },
            location: { type: "string", example: "India" },
            resume: { type: "string", example: "https://example.com/resume.pdf" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["CANDIDATE", "RECRUITER", "ADMIN"] },
            isActive: { type: "boolean" },
            candidateProfile: { $ref: "#/components/schemas/CandidateProfile" },
            createdAt: { type: "string", format: "date-time", nullable: true },
          },
        },
        Job: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            skills: { type: "array", items: { type: "string" } },
            salaryMin: { type: "number" },
            salaryMax: { type: "number" },
            jobType: { type: "string" },
            location: { type: "string" },
            deadline: { type: "string", format: "date-time" },
            recruiterId: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Application: {
          type: "object",
          properties: {
            _id: { type: "string" },
            jobId: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Job" }] },
            candidateId: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/User" }] },
            expectedSalary: { type: "number" },
            availability: { type: "string" },
            note: { type: "string" },
            status: {
              type: "string",
              enum: ["Applied", "Shortlisted", "Interviewed", "Rejected", "Hired"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
  },
  apis: [
    path.join(process.cwd(), "src/modules/**/*.routes.ts"),
    path.join(process.cwd(), "dist/src/modules/**/*.routes.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
