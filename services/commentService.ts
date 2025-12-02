import { supabase } from './supabaseClient';
import { TicketComment } from '../types';

export const fetchComments = async (ticketId: string): Promise<TicketComment[]> => {
  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as TicketComment[];
};

export const createComment = async (comment: Omit<TicketComment, 'id' | 'created_at'>): Promise<TicketComment> => {
  const { data, error } = await supabase
    .from('ticket_comments')
    .insert([comment])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as TicketComment;
};
