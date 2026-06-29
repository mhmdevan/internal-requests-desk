import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { TicketFilterState } from "./types";

type TicketFiltersProps = {
  filters: TicketFilterState;
  onChange: (filters: TicketFilterState) => void;
};

export function TicketFilters({ filters, onChange }: TicketFiltersProps) {
  function update(patch: Partial<TicketFilterState>) {
    onChange({ ...filters, ...patch, page: 1 });
  }

  return (
    <section className="panel" aria-label="Ticket filters">
      <div className="filters-grid">
        <Input
          label="Search tickets"
          value={filters.q}
          onChange={(event) => update({ q: event.target.value })}
          placeholder="Search title or description"
        />
        <Select
          id="filter-status"
          label="Status"
          value={filters.status}
          onChange={(event) =>
            update({ status: event.target.value as TicketFilterState["status"] })
          }
          options={[
            { label: "All statuses", value: "" },
            { label: "New", value: "new" },
            { label: "In progress", value: "in_progress" },
            { label: "Done", value: "done" },
          ]}
        />
        <Select
          id="filter-priority"
          label="Priority"
          value={filters.priority}
          onChange={(event) =>
            update({ priority: event.target.value as TicketFilterState["priority"] })
          }
          options={[
            { label: "All priorities", value: "" },
            { label: "Low", value: "low" },
            { label: "Normal", value: "normal" },
            { label: "High", value: "high" },
          ]}
        />
        <Select
          label="Sort by"
          value={filters.sort_by}
          onChange={(event) =>
            update({ sort_by: event.target.value as TicketFilterState["sort_by"] })
          }
          options={[
            { label: "Created at", value: "created_at" },
            { label: "Priority", value: "priority" },
          ]}
        />
        <Select
          label="Sort order"
          value={filters.sort_order}
          onChange={(event) =>
            update({ sort_order: event.target.value as TicketFilterState["sort_order"] })
          }
          options={[
            { label: "Descending", value: "desc" },
            { label: "Ascending", value: "asc" },
          ]}
        />
        <Select
          label="Page size"
          value={String(filters.page_size)}
          onChange={(event) => update({ page_size: Number(event.target.value) })}
          options={[
            { label: "10", value: "10" },
            { label: "25", value: "25" },
            { label: "50", value: "50" },
          ]}
        />
      </div>
    </section>
  );
}
