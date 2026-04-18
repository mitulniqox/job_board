import { z } from "zod";
import { applicationStatuses } from "./application.model";

export const applySchema = z.object({
  body: z.object({
    expectedSalary: z.number().min(0),
    availability: z.string().min(2),
    note: z.string().min(5),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(applicationStatuses),
  }),
});
