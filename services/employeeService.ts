
import { supabase } from './supabaseClient';
import { Employee } from '../types';

export const fetchEmployees = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as Employee[];
};

export const createEmployee = async (employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employee])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as Employee;
};

export const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<Employee> => {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as Employee;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};
