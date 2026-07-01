import { Table, Text, Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { PriorityBadge } from "./PriorityBadge";
import { StatusMenu } from "./StatusMenu";
import { TicketActionsMenu } from "./TicketActionsMenu";
import { Ticket, TicketStatus } from "./types";

type TicketTableProps = {
  tickets: Ticket[];
  isAdmin: boolean;
  isMutating: boolean;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
  onDelete: (ticketId: number) => void;
};

export function TicketTable({
  tickets,
  isAdmin,
  isMutating,
  onStatusChange,
  onDelete,
}: TicketTableProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-GB" : "ru-RU";

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value));
  }

  return (
    <Table.ScrollContainer minWidth={860}>
      <Table
        striped
        highlightOnHover
        verticalSpacing={6}
        horizontalSpacing="sm"
        className="requests-table"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th className="col-title">{t("tickets.titleLabel")}</Table.Th>
            <Table.Th className="col-description">{t("tickets.descriptionLabel")}</Table.Th>
            <Table.Th className="col-status">{t("tickets.statusLabel")}</Table.Th>
            <Table.Th className="col-priority">{t("tickets.priorityFilter")}</Table.Th>
            <Table.Th className="col-date">{t("tickets.createdAt")}</Table.Th>
            <Table.Th className="col-date">{t("tickets.updatedAt")}</Table.Th>
            <Table.Th className="col-actions" aria-label={t("tickets.actions")} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tickets.map((ticket) => {
            const isDone = ticket.status === "done";
            const description = ticket.description || t("tickets.noDescription");

            return (
              <Table.Tr key={ticket.id}>
                <Table.Td className="col-title">
                  <Text fw={600} size="sm" lineClamp={1}>
                    {ticket.title}
                  </Text>
                </Table.Td>
                <Table.Td className="col-description">
                  <Tooltip label={description} disabled={!ticket.description} multiline>
                    <Text
                      size="sm"
                      c={ticket.description ? undefined : "dimmed"}
                      className="description-cell"
                    >
                      {description}
                    </Text>
                  </Tooltip>
                </Table.Td>
                <Table.Td className="col-status">
                  <StatusMenu
                    value={ticket.status}
                    ticketTitle={ticket.title}
                    disabled={isDone || isMutating}
                    onChange={(status) => onStatusChange(ticket.id, status)}
                  />
                </Table.Td>
                <Table.Td className="col-priority">
                  <PriorityBadge priority={ticket.priority} />
                </Table.Td>
                <Table.Td className="col-date">
                  <Text size="xs" className="date-cell">
                    {formatDate(ticket.created_at)}
                  </Text>
                </Table.Td>
                <Table.Td className="col-date">
                  <Text size="xs" className="date-cell">
                    {formatDate(ticket.updated_at)}
                  </Text>
                </Table.Td>
                <Table.Td className="col-actions">
                  <TicketActionsMenu
                    ticketTitle={ticket.title}
                    isAdmin={isAdmin}
                    isDone={isDone}
                    isMutating={isMutating}
                    onDelete={() => onDelete(ticket.id)}
                  />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
