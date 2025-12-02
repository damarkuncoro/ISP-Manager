
import { supabase } from './supabaseClient';
import { Invoice, PaymentMethod, InvoiceStatus } from '../types';

export const fetchInvoices = async (customerId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .order('issued_date', { ascending: false });

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as Invoice[];
};

export const fetchPaymentMethods = async (customerId: string): Promise<PaymentMethod[]> => {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false }); // Default first

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') return [];
    throw error;
  }
  return data as PaymentMethod[];
};

export const generateInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) throw error;
  return data as Invoice;
};

export const updateInvoiceStatus = async (id: string, status: InvoiceStatus): Promise<Invoice> => {
  const { data, error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Invoice;
};

export const addPaymentMethod = async (method: Omit<PaymentMethod, 'id' | 'created_at'>): Promise<PaymentMethod> => {
  // If this is default, remove default from others
  if (method.is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('customer_id', method.customer_id);
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert([method])
    .select()
    .single();

  if (error) throw error;
  return data as PaymentMethod;
};
