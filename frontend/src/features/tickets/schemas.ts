import { TFunction } from "i18next";
import { z } from "zod";

import { TicketPriority } from "./types";

export type TicketCreateInput = {
  title: string;
  description?: string;
  priority: TicketPriority;
};

export function getTicketCreateSchema(t: TFunction) {
  return z.object({
    title: z.string().trim().min(3, t("validation.titleMin")).max(120, t("validation.titleMax")),
    description: z
      .string()
      .max(1000, t("validation.descriptionMax"))
      .transform((value) => {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      }),
    priority: z.enum(["low", "normal", "high"]),
  });
}
