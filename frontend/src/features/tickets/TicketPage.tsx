import { useMemo, useState } from "react";

import { getErrorMessage } from "../../shared/api/http";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { LoadingState } from "../../shared/ui/LoadingState";
import { Pagination } from "./Pagination";
import { TicketCreateForm } from "./TicketCreateForm";
import { TicketFilters } from "./TicketFilters";
import { TicketTable } from "./TicketTable";
import { TicketCreateInput } from "./schemas";
import { useChangeTicketStatus, useCreateTicket, useDeleteTicket, useTickets } from "./hooks";
import { TicketFilterState, TicketQueryParams, TicketStatus } from "./types";

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

type TicketPageProps = {
  isAdmin: boolean;
};

export function TicketPage({ isAdmin }: TicketPageProps) {
  const [filters, setFilters] = useState<TicketFilterState>(defaultFilters);
  const queryParams = useMemo(() => toQueryParams(filters), [filters]);
  const ticketsQuery = useTickets(queryParams);
  const createMutation = useCreateTicket();
  const statusMutation = useChangeTicketStatus();
  const deleteMutation = useDeleteTicket();

  function handleCreate(input: TicketCreateInput) {
    return createMutation.mutateAsync(input);
  }

  function handleStatusChange(ticketId: number, status: TicketStatus) {
    statusMutation.mutate({ ticketId, status });
  }

  function handleDelete(ticketId: number) {
    deleteMutation.mutate(ticketId);
  }

  const mutationError = statusMutation.error ?? deleteMutation.error;
  const isMutating = statusMutation.isPending || deleteMutation.isPending;

  return (
    <div className="desk-grid">
      <TicketCreateForm
        onCreate={handleCreate}
        isSubmitting={createMutation.isPending}
        error={createMutation.error}
      />

      <section className="panel ticket-list" aria-labelledby="tickets-heading">
        <h2 id="tickets-heading">Tickets</h2>
        <TicketFilters filters={filters} onChange={setFilters} />

        {mutationError ? <ErrorMessage message={getErrorMessage(mutationError)} /> : null}

        {ticketsQuery.isLoading ? <LoadingState /> : null}
        {ticketsQuery.isError ? (
          <ErrorMessage message={getErrorMessage(ticketsQuery.error)} />
        ) : null}

        {ticketsQuery.isSuccess && ticketsQuery.data.items.length === 0 ? <EmptyState /> : null}

        {ticketsQuery.isSuccess && ticketsQuery.data.items.length > 0 ? (
          <>
            <TicketTable
              tickets={ticketsQuery.data.items}
              isAdmin={isAdmin}
              isMutating={isMutating}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
            <Pagination
              page={ticketsQuery.data.page}
              pages={ticketsQuery.data.pages}
              total={ticketsQuery.data.total}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
