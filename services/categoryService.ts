import { supabase } from './supabaseClient';
import { TicketCategoryConfig } from '../types';

export const fetchCategories = async (): Promise<TicketCategoryConfig[]> => {
  const { data, error } = await supabase
    .from('ticket_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    // If the table doesn't exist yet, return empty (setup required)
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as TicketCategoryConfig[];
};

export const createCategory = async (category: Omit<TicketCategoryConfig, 'id' | 'created_at'>): Promise<TicketCategoryConfig> => {
  const { data, error } = await supabase
    .from('ticket_categories')
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data as TicketCategoryConfig;
};

export const updateCategory = async (id: string, updates: Partial<TicketCategoryConfig>): Promise<TicketCategoryConfig> => {
  const { data, error } = await supabase
    .from('ticket_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TicketCategoryConfig;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('ticket_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};