import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Group,
  NativeSelect,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconCirclePlus } from "@tabler/icons-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TicketCreateInput, getTicketCreateSchema } from "./schemas";

type TicketCreateFormProps = {
  onCreate: (input: TicketCreateInput) => Promise<unknown>;
  isSubmitting: boolean;
};

export function TicketCreateForm({ onCreate, isSubmitting }: TicketCreateFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => getTicketCreateSchema(t), [t]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketCreateInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: "normal",
    },
  });

  async function submit(input: TicketCreateInput) {
    await onCreate(input);
    reset();
  }

  return (
    <Card withBorder shadow="sm" radius="lg" padding="md" component="section">
      <form onSubmit={handleSubmit(submit)}>
        <Stack gap="sm">
          <Group gap="xs">
            <IconCirclePlus size={17} aria-hidden />
            <Title order={2} size="h4">
              {t("tickets.create")}
            </Title>
          </Group>
          <TextInput
            size="sm"
            id="create-title"
            label={t("tickets.titleLabel")}
            placeholder={t("tickets.titlePlaceholder")}
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            size="sm"
            id="description"
            label={t("tickets.descriptionLabel")}
            placeholder={t("tickets.descriptionPlaceholder")}
            minRows={3}
            autosize
            error={errors.description?.message}
            {...register("description")}
          />
          <NativeSelect
            size="sm"
            id="ticket-priority"
            label={t("tickets.priorityLabel")}
            error={errors.priority?.message}
            data={[
              { label: t("tickets.priority.low"), value: "low" },
              { label: t("tickets.priority.normal"), value: "normal" },
              { label: t("tickets.priority.high"), value: "high" },
            ]}
            {...register("priority")}
          />
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            leftSection={<IconCirclePlus size={16} />}
          >
            {t("tickets.createButton")}
          </Button>
        </Stack>
      </form>
    </Card>
  );
}
