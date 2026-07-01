import { Badge } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { TicketPriority } from "./types";

type PriorityBadgeProps = {
  priority: TicketPriority;
};

function getPriorityColor(priority: TicketPriority) {
  const colors: Record<TicketPriority, string> = {
    low: "gray",
    normal: "teal",
    high: "red",
  };
  return colors[priority];
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge
      color={getPriorityColor(priority)}
      variant="light"
      size="xs"
      radius="sm"
      fullWidth={false}
    >
      {t(`tickets.priority.${priority}`)}
    </Badge>
  );
}
