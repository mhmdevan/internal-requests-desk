import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getErrorMessage } from "../../shared/api/http";
import { Button } from "../../shared/ui/Button";
import { ErrorMessage } from "../../shared/ui/ErrorMessage";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { TicketCreateInput, ticketCreateSchema } from "./schemas";

type TicketCreateFormProps = {
  onCreate: (input: TicketCreateInput) => Promise<unknown>;
  isSubmitting: boolean;
  error: unknown;
};

export function TicketCreateForm({ onCreate, isSubmitting, error }: TicketCreateFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketCreateInput>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "new",
      priority: "normal",
    },
  });

  async function submit(input: TicketCreateInput) {
    await onCreate(input);
    reset();
  }

  return (
    <section className="panel" aria-labelledby="create-ticket-heading">
      <h2 id="create-ticket-heading">Create ticket</h2>
      <form className="create-form" onSubmit={handleSubmit(submit)}>
        <Input
          id="create-title"
          label="Title"
          {...register("title")}
          error={errors.title?.message}
        />
        <label className="field" htmlFor="description">
          <span>Description</span>
          <textarea id="description" className="textarea" rows={4} {...register("description")} />
          {errors.description?.message ? (
            <span className="field-error">{errors.description.message}</span>
          ) : null}
        </label>
        <div className="form-row">
          <Select
            id="initial-status"
            label="Initial status"
            {...register("status")}
            error={errors.status?.message}
            options={[
              { label: "New", value: "new" },
              { label: "In progress", value: "in_progress" },
              { label: "Done", value: "done" },
            ]}
          />
          <Select
            id="ticket-priority"
            label="Initial priority"
            {...register("priority")}
            error={errors.priority?.message}
            options={[
              { label: "Low", value: "low" },
              { label: "Normal", value: "normal" },
              { label: "High", value: "high" },
            ]}
          />
        </div>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create ticket"}
        </Button>
        {error ? <ErrorMessage message={getErrorMessage(error)} /> : null}
      </form>
    </section>
  );
}
