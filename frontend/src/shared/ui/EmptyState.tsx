type EmptyStateProps = {
  label?: string;
};

export function EmptyState({ label = "No tickets found." }: EmptyStateProps) {
  return <div className="notice">{label}</div>;
}
