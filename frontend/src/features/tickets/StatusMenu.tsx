import { Badge, Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { TicketStatus } from "./types";

type StatusMenuProps = {
  value: TicketStatus;
  ticketTitle: string;
  disabled: boolean;
  onChange: (status: TicketStatus) => void;
};

const statusOptions: TicketStatus[] = ["new", "in_progress", "done"];

function getStatusColor(status: TicketStatus) {
  const colors: Record<TicketStatus, string> = {
    new: "blue",
    in_progress: "yellow",
    done: "green",
  };
  return colors[status];
}

export function StatusMenu({ value, ticketTitle, disabled, onChange }: StatusMenuProps) {
  const { t } = useTranslation();
  const label = t(`tickets.status.${value}`);

  const trigger = (
    <UnstyledButton
      className="status-trigger"
      disabled={disabled}
      aria-label={`${t("tickets.statusLabel")} ${ticketTitle}`}
      data-testid={`status-menu-${ticketTitle}`}
    >
      <Badge
        color={getStatusColor(value)}
        variant="light"
        size="sm"
        radius="sm"
        rightSection={!disabled ? <IconChevronDown size={12} aria-hidden /> : null}
      >
        {label}
      </Badge>
    </UnstyledButton>
  );

  if (disabled) {
    return (
      <Tooltip label={t("tickets.doneLocked")}>
        <span>{trigger}</span>
      </Tooltip>
    );
  }

  return (
    <Menu shadow="md" width={180} position="bottom-start" withinPortal>
      <Menu.Target>{trigger}</Menu.Target>
      <Menu.Dropdown>
        {statusOptions.map((status) => (
          <Menu.Item
            key={status}
            disabled={status === value}
            onClick={() => onChange(status)}
            data-testid={`status-option-${ticketTitle}-${status}`}
          >
            {t(`tickets.status.${status}`)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
