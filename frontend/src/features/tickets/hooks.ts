import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { changeTicketStatus, createTicket, deleteTicket, fetchTickets } from "./api";
import { TicketQueryParams } from "./types";

const ticketsKey = ["tickets"] as const;

export function useTickets(params: TicketQueryParams) {
  return useQuery({
    queryKey: [...ticketsKey, params],
    queryFn: () => fetchTickets(params),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketsKey }),
  });
}

export function useChangeTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeTicketStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketsKey }),
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ticketsKey }),
  });
}
