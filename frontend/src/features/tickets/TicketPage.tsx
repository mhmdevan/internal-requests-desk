import { Alert, Button, Card, Group, Modal, Skeleton, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconChecks,
  IconClockHour4,
  IconInbox,
  IconTicket,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { getErrorMessage } from "../../shared/api/http";
import { Pagination } from "./Pagination";
import { TicketCreateForm } from "./TicketCreateForm";
import { TicketFilters } from "./TicketFilters";
import { TicketTable } from "./TicketTable";
import { useChangeTicketStatus, useCreateTicket, useDeleteTicket, useTickets } from "./hooks";
import { TicketCreateInput } from "./schemas";
import { Ticket, TicketFilterState, TicketQueryParams, TicketStatus } from "./types";

const defaultFilters: TicketFilterState = {
  q: "",
  status: "",
  priority: "",
  sort_by: "created_at",
  sort_order: "desc",
  page: 1,
  page_size: 10,
};

function toQueryParams(filters: TicketFilterState): TicketQueryParams {
  return {
    q: filters.q.trim() || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    page: filters.page,
    page_size: filters.page_size,
  };
}

function buildSummary(items: Ticket[]) {
  return {
    total: items.length,
    new: items.filter((ticket) => ticket.status === "new").length,
    inProgress: items.filter((ticket) => ticket.status === "in_progress").length,
    done: items.filter((ticket) => ticket.status === "done").length,
  };
}

type TicketPageProps = {
  isAdmin: boolean;
};

export function TicketPage({ isAdmin }: TicketPageProps) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TicketFilterState>(defaultFilters);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const queryParams = useMemo(() => toQueryParams(filters), [filters]);
  const ticketsQuery = useTickets(queryParams);
  const createMutation = useCreateTicket();
  const statusMutation = useChangeTicketStatus();
  const deleteMutation = useDeleteTicket();

  const summary = buildSummary(ticketsQuery.data?.items ?? []);

  async function handleCreate(input: TicketCreateInput) {
    try {
      await createMutation.mutateAsync(input);
      notifications.show({
        color: "green",
        title: t("tickets.createSuccess"),
        message: input.title,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: t("errors.create"),
        message: getErrorMessage(error),
      });
      throw error;
    }
  }

  function handleStatusChange(ticketId: number, status: TicketStatus) {
    statusMutation.mutate(
      { ticketId, status },
      {
        onSuccess: () => {
          notifications.show({
            color: "green",
            title: t("tickets.updateSuccess"),
            message: t(`tickets.status.${status}`),
          });
        },
        onError: (error) => {
          notifications.show({
            color: "red",
            title: t("errors.update"),
            message: getErrorMessage(error),
          });
        },
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        notifications.show({
          color: "green",
          title: t("tickets.deleteSuccess"),
          message: deleteTarget.title,
        });
        setDeleteTarget(null);
      },
      onError: (error) => {
        notifications.show({
          color: "red",
          title: t("errors.delete"),
          message: getErrorMessage(error),
        });
      },
    });
  }

  const isMutating = statusMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div className="dashboard-grid">
        <Stack gap="md">
          <TicketCreateForm onCreate={handleCreate} isSubmitting={createMutation.isPending} />
        </Stack>

        <Card withBorder shadow="sm" radius="lg" padding="md" component="section">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start" gap="md">
              <div>
                <Title order={2} size="h3">
                  {t("app.dashboard")}
                </Title>
                <Text c="dimmed" size="sm">
                  {t("app.dashboardDescription")}
                </Text>
              </div>
            </Group>

            <SummaryBar summary={summary} />

            <TicketFilters filters={filters} onChange={setFilters} />

            {ticketsQuery.isLoading ? (
              <Stack gap="sm" role="status" aria-label={t("tickets.loading")}>
                <Skeleton height={44} radius="md" />
                <Skeleton height={44} radius="md" />
                <Skeleton height={44} radius="md" />
              </Stack>
            ) : null}

            {ticketsQuery.isError ? (
              <Alert color="red" icon={<IconAlertCircle size={18} />} role="alert">
                {t("errors.withMessage", { message: getErrorMessage(ticketsQuery.error) })}
              </Alert>
            ) : null}

            {ticketsQuery.isSuccess && ticketsQuery.data.items.length === 0 ? (
              <Card withBorder radius="lg" padding="xl" ta="center">
                <Stack align="center" gap="xs">
                  <IconInbox size={32} />
                  <Title order={3} size="h4">
                    {t("tickets.empty")}
                  </Title>
                  <Text c="dimmed">{t("tickets.emptyDescription")}</Text>
                </Stack>
              </Card>
            ) : null}

            {ticketsQuery.isSuccess && ticketsQuery.data.items.length > 0 ? (
              <>
                <TicketTable
                  tickets={ticketsQuery.data.items}
                  isAdmin={isAdmin}
                  isMutating={isMutating}
                  onStatusChange={handleStatusChange}
                  onDelete={(ticketId) => {
                    const ticket = ticketsQuery.data.items.find((item) => item.id === ticketId);
                    if (ticket) {
                      setDeleteTarget(ticket);
                    }
                  }}
                />
                <Pagination
                  page={ticketsQuery.data.page}
                  pages={ticketsQuery.data.pages}
                  total={ticketsQuery.data.total}
                  onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
                />
              </>
            ) : null}
          </Stack>
        </Card>
      </div>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t("tickets.deleteConfirmTitle")}
        centered
      >
        <Stack gap="md">
          <Text>
            {t("tickets.deleteConfirmBody")}{" "}
            {deleteTarget ? (
              <Text span fw={700}>
                {deleteTarget.title}
              </Text>
            ) : null}
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => setDeleteTarget(null)}>
              {t("tickets.cancel")}
            </Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={confirmDelete}>
              {t("tickets.confirmDelete")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

function SummaryBar({ summary }: { summary: ReturnType<typeof buildSummary> }) {
  const { t } = useTranslation();
  const items = [
    { label: t("tickets.summary.total"), value: summary.total, icon: <IconTicket size={15} /> },
    { label: t("tickets.summary.new"), value: summary.new, icon: <IconInbox size={15} /> },
    {
      label: t("tickets.summary.inProgress"),
      value: summary.inProgress,
      icon: <IconClockHour4 size={15} />,
    },
    { label: t("tickets.summary.done"), value: summary.done, icon: <IconChecks size={15} /> },
  ];

  return (
    <Card withBorder radius="md" padding="xs" className="summary-bar">
      <Group justify="space-between" gap="xs">
        <Text size="xs" fw={600} c="dimmed" className="summary-scope">
          {t("tickets.summary.scope")}
        </Text>
        <Group gap="xs" wrap="wrap">
          {items.map((item) => (
            <Group key={item.label} gap={6} className="summary-item" wrap="nowrap">
              <span className="summary-icon">{item.icon}</span>
              <Text size="xs" c="dimmed">
                {item.label}
              </Text>
              <Text size="sm" fw={700}>
                {item.value}
              </Text>
            </Group>
          ))}
        </Group>
      </Group>
    </Card>
  );
}
