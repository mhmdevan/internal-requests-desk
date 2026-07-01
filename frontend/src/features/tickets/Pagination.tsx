import { Button, Group, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

type PaginationProps = {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  const { t } = useTranslation();
  const visiblePages = Math.max(pages, 1);

  return (
    <Group component="nav" aria-label={t("tickets.pagination.label")} justify="flex-end" gap="sm">
      <Button
        type="button"
        variant="light"
        size="xs"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {t("tickets.pagination.previous")}
      </Button>
      <Text size="sm" c="dimmed">
        {t("tickets.pagination.page", { page, pages: visiblePages })} ·{" "}
        {t("tickets.pagination.total", { total })}
      </Text>
      <Button
        type="button"
        variant="light"
        size="xs"
        disabled={pages === 0 || page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        {t("tickets.pagination.next")}
      </Button>
    </Group>
  );
}
