import { supabase } from './supabaseClient';
import { SubscriptionPlan } from '../types';

export const fetchPlans = async (): Promise<SubscriptionPlan[]> => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    // If the table doesn't exist yet, return empty to prevent crash
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as SubscriptionPlan[];
};

export const createPlan = async (plan: Omit<SubscriptionPlan, 'id' | 'created_at'>): Promise<SubscriptionPlan> => {
  const { data, error } = await supabase
    .from('plans')
    .insert([plan])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as SubscriptionPlan;
};

export const deletePlan = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};