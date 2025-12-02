import { supabase } from './supabaseClient';
import { Ticket } from '../types';

export const fetchTickets = async (): Promise<Ticket[]> => {
  // First try to fetch with customer data joined
  const { data, error } = await supabase
    .from('tickets')
    .select('*, customer:customers(*)') // Join with customers table
    .order('created_at', { ascending: false });

  if (error) {
    // If the error is about missing relationship (PGRST200) or column (42703), 
    // fallback to fetching simple ticket data so the app doesn't crash.
    if (error.code === 'PGRST200' || error.code === '42703' || error.message?.includes('relationship')) {
      console.warn("Relationship lookup failed, fetching tickets without customer data.");
      const { data: simpleData, error: simpleError } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (simpleError) throw simpleError;
      return simpleData as Ticket[];
    }
    throw error;
  }
  return data as Ticket[];
};

export const createTicket = async (ticket: Omit<Ticket, 'id' | 'created_at' | 'customer'>): Promise<Ticket> => {
  // Try to create and fetch back with customer data
  const { data, error } = await supabase
    .from('tickets')
    .insert([ticket])
    .select('*, customer:customers(*)')
    .single();

  if (error) {
    // If join fails during create, try simpler return
    if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
       const { data: simpleData, error: simpleError } = await supabase
        .from('tickets')
        .insert([ticket])
        .select()
        .single();
        
       if (simpleError) throw simpleError;
       return simpleData as Ticket;
    }
    throw error;
  }
  return data as Ticket;
};

export const updateTicket = async (id: string, updates: Partial<Ticket>): Promise<Ticket> => {
  // Remove the joined customer object if present before sending to update
  const { customer, ...cleanUpdates } = updates;
  
  const { data, error } = await supabase
    .from('tickets')
    .update(cleanUpdates)
    .eq('id', id)
    .select('*, customer:customers(*)')
    .single();

  if (error) {
     // If join fails during update, try simpler return
     if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
       const { data: simpleData, error: simpleError } = await supabase
        .from('tickets')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
        
       if (simpleError) throw simpleError;
       return simpleData as Ticket;
     }
    throw error;
  }
  return data as Ticket;
};

export const deleteTicket = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};