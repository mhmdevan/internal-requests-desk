import { Button } from "../../shared/ui/Button";

type PaginationProps = {
  page: number;
  pages: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  const visiblePages = Math.max(pages, 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <Button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page} of {visiblePages} · {total} total
      </span>
      <Button
        type="button"
        disabled={pages === 0 || page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
