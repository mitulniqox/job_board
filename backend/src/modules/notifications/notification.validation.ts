import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    unreadOnly: z.enum(["true", "false"]).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    notificationId: z.string().min(1),
  }),
});
