import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { connectSocket } from '../lib/socket';
import type { CommentItem, Ticket } from '../types/ticket';

export function useRealtimeTickets(isEnabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isEnabled) return;

    const socket = connectSocket();

    const handleTicketCreated = (_payload: { ticket: Ticket }) => {
      // Invalidate tickets query to fetch new items into dashboard and tickets list
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    };

    const handleTicketUpdated = (payload: { ticket: Ticket }) => {
      // Invalidate ticket list and the specific ticket details query
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      if (payload.ticket?._id) {
        queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticket._id] });
      }
    };

    const handleCommentAdded = (payload: { ticketId: string; comment: CommentItem }) => {
      // Invalidate specific ticket details to display the fresh comment and activity
      if (payload.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['ticket', payload.ticketId] });
      }
    };

    socket.on('ticket:created', handleTicketCreated);
    socket.on('ticket:updated', handleTicketUpdated);
    socket.on('ticket:comment_added', handleCommentAdded);

    return () => {
      socket.off('ticket:created', handleTicketCreated);
      socket.off('ticket:updated', handleTicketUpdated);
      socket.off('ticket:comment_added', handleCommentAdded);
    };
  }, [isEnabled, queryClient]);
}
