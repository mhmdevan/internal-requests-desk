import { z } from "zod";

export const ticketCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be at most 120 characters."),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters.")
    .transform((value) => {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
  status: z.enum(["new", "in_progress", "done"]),
  priority: z.enum(["low", "normal", "high"]),
});

export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
