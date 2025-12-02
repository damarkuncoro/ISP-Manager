import { useState, useCallback } from 'react';
import { Ticket } from '../types';
import { fetchTickets, createTicket, updateTicket, deleteTicket } from '../services/ticketService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      setError(err);
      throw err; // Re-throw for global error handling if needed
    } finally {
      setLoading(false);
    }
  }, []);

  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at' | 'customer'>) => {
    try {
      const newTicket = await createTicket(ticketData);
      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const editTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const updatedTicket = await updateTicket(id, updates);
      setTickets(prev => prev.map(t => t.id === id ? updatedTicket : t));
      return updatedTicket;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const removeTicket = async (id: string) => {
    try {
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    tickets,
    loading,
    error,
    loadTickets,
    addTicket,
    editTicket,
    removeTicket,
    setTickets // Exposed for specialized updates if necessary (e.g. optimistic UI)
  };
};