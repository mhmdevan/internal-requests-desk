import { Button } from "../../shared/ui/Button";
import { StatusSelect } from "./StatusSelect";
import { Ticket, TicketStatus } from "./types";

type TicketTableProps = {
  tickets: Ticket[];
  isAdmin: boolean;
  isMutating: boolean;
  onStatusChange: (ticketId: number, status: TicketStatus) => void;
  onDelete: (ticketId: number) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketTable({
  tickets,
  isAdmin,
  isMutating,
  onStatusChange,
  onDelete,
}: TicketTableProps) {
  return (
    <div className="table-wrap">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => {
            const isDone = ticket.status === "done";

            return (
              <tr key={ticket.id}>
                <td>
                  <strong>{ticket.title}</strong>
                </td>
                <td>{ticket.description || "No description"}</td>
                <td>
                  <StatusSelect
                    value={ticket.status}
                    ticketTitle={ticket.title}
                    disabled={isDone || isMutating}
                    onChange={(status) => onStatusChange(ticket.id, status)}
                  />
                </td>
                <td className={`priority priority-${ticket.priority}`}>{ticket.priority}</td>
                <td>{formatDate(ticket.updated_at)}</td>
                <td>
                  {isAdmin ? (
                    <Button
                      type="button"
                      variant="danger"
                      disabled={isDone || isMutating}
                      aria-label={`Delete ${ticket.title}`}
                      onClick={() => onDelete(ticket.id)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
