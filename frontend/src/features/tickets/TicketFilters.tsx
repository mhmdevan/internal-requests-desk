import { Card, NativeSelect, SimpleGrid, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { TicketFilterState } from "./types";

type TicketFiltersProps = {
  filters: TicketFilterState;
  onChange: (filters: TicketFilterState) => void;
};

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  const { t } = useTranslation();

  function update(patch: Partial<TicketFilterState>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  return (
    <Card withBorder radius="md" padding="sm" component="section" aria-label={t("tickets.filters")}>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xs">
        <TextInput
          size="xs"
          label={t("tickets.search")}
          value={filters.q}
          onChange={(event) => update({ q: event.target.value })}
          placeholder={t("tickets.searchPlaceholder")}
          leftSection={<IconSearch size={16} aria-hidden />}
          data-testid="ticket-search"
        />
        <NativeSelect
          size="xs"
          id="filter-status"
          label={t("tickets.statusLabel")}
          value={filters.status}
          onChange={(event) =>
            update({ status: event.target.value as TicketFilterState["status"] })
          }
          data={[
            { label: t("tickets.allStatuses"), value: "" },
            { label: t("tickets.status.new"), value: "new" },
            { label: t("tickets.status.in_progress"), value: "in_progress" },
            { label: t("tickets.status.done"), value: "done" },
          ]}
          data-testid="status-filter"
        />
        <NativeSelect
          size="xs"
          id="filter-priority"
          label={t("tickets.priorityFilter")}
          value={filters.priority}
          onChange={(event) =>
            update({ priority: event.target.value as TicketFilterState["priority"] })
          }
          data={[
            { label: t("tickets.allPriorities"), value: "" },
            { label: t("tickets.priority.low"), value: "low" },
            { label: t("tickets.priority.normal"), value: "normal" },
            { label: t("tickets.priority.high"), value: "high" },
          ]}
          data-testid="priority-filter"
        />
        <NativeSelect
          size="xs"
          label={t("tickets.sortBy")}
          value={filters.sort_by}
          onChange={(event) =>
            update({ sort_by: event.target.value as TicketFilterState["sort_by"] })
          }
          data={[
            { label: t("tickets.sort.created_at"), value: "created_at" },
            { label: t("tickets.sort.priority"), value: "priority" },
          ]}
          data-testid="sort-by"
        />
        <NativeSelect
          size="xs"
          label={t("tickets.sortOrder")}
          value={filters.sort_order}
          onChange={(event) =>
            update({ sort_order: event.target.value as TicketFilterState["sort_order"] })
          }
          data={[
            { label: t("tickets.sort.desc"), value: "desc" },
            { label: t("tickets.sort.asc"), value: "asc" },
          ]}
          data-testid="sort-order"
        />
        <NativeSelect
          size="xs"
          label={t("tickets.pageSize")}
          value={String(filters.page_size)}
          onChange={(event) => update({ page_size: Number(event.target.value) })}
          data={[
            { label: "10", value: "10" },
            { label: "25", value: "25" },
            { label: "50", value: "50" },
          ]}
          data-testid="page-size"
        />
      </SimpleGrid>
    </Card>
  );
}
