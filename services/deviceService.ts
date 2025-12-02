import { supabase } from './supabaseClient';
import { NetworkDevice } from '../types';

export const fetchDevices = async (): Promise<NetworkDevice[]> => {
  const { data, error } = await supabase
    .from('network_devices')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as NetworkDevice[];
};

export const createDevice = async (device: Omit<NetworkDevice, 'id' | 'created_at' | 'last_check'>): Promise<NetworkDevice> => {
  const { data, error } = await supabase
    .from('network_devices')
    .insert([{
        ...device,
        last_check: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as NetworkDevice;
};

export const updateDevice = async (id: string, updates: Partial<NetworkDevice>): Promise<NetworkDevice> => {
  const { data, error } = await supabase
    .from('network_devices')
    .update({
        ...updates,
        last_check: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as NetworkDevice;
};

export const deleteDevice = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('network_devices')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};