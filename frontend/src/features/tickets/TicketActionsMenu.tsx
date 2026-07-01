import { ActionIcon, Menu, Tooltip } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type TicketActionsMenuProps = {
  ticketTitle: string;
  isAdmin: boolean;
  isDone: boolean;
  isMutating: boolean;
  onDelete: () => void;
};

export function TicketActionsMenu({
  ticketTitle,
  isAdmin,
  isDone,
  isMutating,
  onDelete,
}: TicketActionsMenuProps) {
  const { t } = useTranslation();
  const disabledReason = !isAdmin
    ? t("auth.deleteHint")
    : isDone
      ? t("tickets.doneDeleteLocked")
      : undefined;
  const canDelete = isAdmin && !isDone;

  return (
    <Menu shadow="md" width={190} position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          aria-label={`${t("tickets.actions")} ${ticketTitle}`}
          data-testid={`ticket-actions-${ticketTitle}`}
        >
          <IconDotsVertical size={16} aria-hidden />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Tooltip label={disabledReason} disabled={canDelete} position="left">
          <div>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} aria-hidden />}
              disabled={!canDelete || isMutating}
              onClick={onDelete}
              data-testid={`delete-action-${ticketTitle}`}
            >
              {t("tickets.delete")}
            </Menu.Item>
          </div>
        </Tooltip>
      </Menu.Dropdown>
    </Menu>
  );
}
