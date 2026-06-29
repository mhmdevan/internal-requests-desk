type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading tickets..." }: LoadingStateProps) {
  return (
    <div className="notice" role="status">
      {label}
    </div>
  );
}
