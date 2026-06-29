type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="notice notice-error" role="alert">
      {message}
    </div>
  );
}
