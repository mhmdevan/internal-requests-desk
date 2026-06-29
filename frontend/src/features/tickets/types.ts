export type TicketStatus = "new" | "in_progress" | "done";
export type TicketPriority = "low" | "normal" | "high";
export type TicketSortBy = "created_at" | "priority";
export type SortOrder = "asc" | "desc";

export type Ticket = {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
};

export type TicketListResponse = {
  items: Ticket[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type TicketQueryParams = {
  q?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  sort_by: TicketSortBy;
  sort_order: SortOrder;
  page: number;
  page_size: number;
};

export type TicketFilterState = {
  q: string;
  status: "" | TicketStatus;
  priority: "" | TicketPriority;
  sort_by: TicketSortBy;
  sort_order: SortOrder;
  page: number;
  page_size: number;
};
