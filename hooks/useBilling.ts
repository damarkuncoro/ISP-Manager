
import { useState, useCallback } from 'react';
import { Invoice, PaymentMethod, InvoiceStatus } from '../types';
import { fetchInvoices, fetchPaymentMethods, generateInvoice, addPaymentMethod, updateInvoiceStatus } from '../services/billingService';
import { getSafeErrorMessage } from '../utils/errorHelpers';

export const useBilling = (customerId: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const loadBillingData = useCallback(async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    try {
      const [invData, pmData] = await Promise.all([
        fetchInvoices(customerId),
        fetchPaymentMethods(customerId)
      ]);
      setInvoices(invData);
      setPaymentMethods(pmData);
    } catch (err) {
      setError(err);
      console.warn("Failed to load billing data", err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const createNewInvoice = async (amount: number, dueDate: Date, description?: string) => {
    try {
      const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;
      const newInvoice = await generateInvoice({
        customer_id: customerId,
        invoice_number: invoiceNum,
        amount,
        status: InvoiceStatus.PENDING,
        issued_date: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        description: description || 'General Service',
      });
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const updateStatus = async (id: string, status: InvoiceStatus) => {
    try {
      const updated = await updateInvoiceStatus(id, status);
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      return updated;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  const addMethod = async (data: { 
    type: 'credit_card' | 'bank_transfer', 
    last_four: string, 
    expiry_date?: string,
    bank_name?: string 
  }) => {
    try {
      const newMethod = await addPaymentMethod({
        customer_id: customerId,
        type: data.type,
        last_four: data.last_four,
        expiry_date: data.expiry_date,
        bank_name: data.bank_name,
        is_default: paymentMethods.length === 0 // Make default if it's the first one
      });
      
      // If new one is default, update local state to reflect that
      if (newMethod.is_default) {
         setPaymentMethods(prev => prev.map(p => ({...p, is_default: false})).concat(newMethod).sort((a,b) => (a.is_default === b.is_default) ? 0 : a.is_default ? -1 : 1));
      } else {
         setPaymentMethods(prev => [...prev, newMethod]);
      }
      return newMethod;
    } catch (err) {
      throw new Error(getSafeErrorMessage(err));
    }
  };

  return {
    invoices,
    paymentMethods,
    loading,
    error,
    loadBillingData,
    createNewInvoice,
    updateStatus,
    addMethod
  };
};
