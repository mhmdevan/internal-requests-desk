import { TicketStatus } from "./types";

type StatusSelectProps = {
  value: TicketStatus;
  ticketTitle: string;
  disabled: boolean;
  onChange: (status: TicketStatus) => void;
};

export function StatusSelect({ value, ticketTitle, disabled, onChange }: StatusSelectProps) {
  return (
    <select
      className="select table-select"
      aria-label={`Status for ${ticketTitle}`}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as TicketStatus)}
    >
      <option value="new">New</option>
      <option value="in_progress">In progress</option>
      <option value="done">Done</option>
    </select>
  );
}
