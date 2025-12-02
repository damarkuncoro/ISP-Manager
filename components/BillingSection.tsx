import React, { useEffect, useState } from 'react';
import { Customer, Invoice, InvoiceStatus, PaymentMethod } from '../types';
import { useBilling } from '../hooks/useBilling';
import { formatCurrency } from '../utils/formatters';
import { FileText, CreditCard, Plus, Download, AlertCircle, CheckCircle2, Clock, Landmark, X } from 'lucide-react';

interface BillingSectionProps {
  customer: Customer;
  currency: string;
}

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const styles = {
    [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
    [InvoiceStatus.PENDING]: 'bg-amber-100 text-amber-800',
    [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800',
    [InvoiceStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  };

  const Icons = {
    [InvoiceStatus.PAID]: CheckCircle2,
    [InvoiceStatus.PENDING]: Clock,
    [InvoiceStatus.OVERDUE]: AlertCircle,
    [InvoiceStatus.CANCELLED]: AlertCircle,
  };

  const Icon = Icons[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.toUpperCase()}
    </span>
  );
};

export const BillingSection: React.FC<BillingSectionProps> = ({ customer, currency }) => {
  const { 
    invoices, 
    paymentMethods, 
    loading, 
    loadBillingData, 
    createNewInvoice,
    addMethod 
  } = useBilling(customer.id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Method Form State
  const [methodType, setMethodType] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [lastFour, setLastFour] = useState('');
  const [expiry, setExpiry] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleGenerateInvoice = async () => {
    // This is a mock generator for demo purposes
    // In a real app, this would calculate based on the plan
    const amount = 49.99; // Default mock amount
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Due in 2 weeks
    
    setIsGenerating(true);
    try {
      await createNewInvoice(amount, dueDate);
    } catch (e) {
      alert("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastFour) return;

    try {
      await addMethod({
        type: methodType,
        last_four: lastFour,
        expiry_date: methodType === 'credit_card' ? expiry : undefined,
        bank_name: methodType === 'bank_transfer' ? bankName : undefined
      });
      setShowAddModal(false);
      setLastFour('');
      setExpiry('');
      setBankName('');
    } catch (e) {
      alert("Failed to add payment method");
    }
  };

  // Calculate Stats
  const totalDue = invoices
    .filter(inv => inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE)
    .reduce((sum, inv) => sum + inv.amount, 0);

  const lastInvoice = invoices[0];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Amount Due</p>
          <p className={`text-2xl font-bold mt-1 ${totalDue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(totalDue, currency)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Last Invoice</p>
          <div className="flex items-center justify-between mt-1">
             <p className="text-lg font-bold text-gray-900">
               {lastInvoice ? formatCurrency(lastInvoice.amount, currency) : 'N/A'}
             </p>
             {lastInvoice && <InvoiceStatusBadge status={lastInvoice.status} />}
          </div>
          {lastInvoice && <p className="text-xs text-gray-400 mt-1">Issued: {new Date(lastInvoice.issued_date).toLocaleDateString()}</p>}
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-gray-500">Active Plan</p>
              <p className="text-lg font-bold text-primary-600 mt-1">{customer.subscription_plan || 'No Plan'}</p>
           </div>
           <div className="bg-primary-50 p-2 rounded-lg">
             <FileText className="w-5 h-5 text-primary-600" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Invoice History</h3>
            <button 
              onClick={handleGenerateInvoice}
              disabled={isGenerating}
              className="text-sm flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inv.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inv.issued_date).toLocaleDateString()}
                        <div className="text-xs text-gray-400">Due: {new Date(inv.due_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(inv.amount, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-gray-400 hover:text-gray-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
                <button onClick={() => setShowAddModal(true)} className="text-gray-400 hover:text-gray-600">
                   <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-3">
                 {paymentMethods.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No payment methods saved.</p>
                 ) : (
                    paymentMethods.map(pm => (
                       <div key={pm.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-white rounded border border-gray-200 text-gray-600">
                                {pm.type === 'bank_transfer' ? (
                                    <Landmark className="w-5 h-5" />
                                ) : (
                                    <CreditCard className="w-5 h-5" />
                                )}
                             </div>
                             <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {pm.type === 'bank_transfer' ? pm.bank_name || 'Bank Account' : 'Credit Card'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {pm.type === 'bank_transfer' ? 'Acct ending ' : 'Ending '} •••• {pm.last_four}
                                </p>
                                {pm.expiry_date && (
                                    <p className="text-xs text-gray-400">Exp: {pm.expiry_date}</p>
                                )}
                             </div>
                          </div>
                          {pm.is_default && (
                             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Default</span>
                          )}
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Add Payment Method</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                            checked={methodType === 'credit_card'}
                                            onChange={() => setMethodType('credit_card')}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Credit Card</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                            checked={methodType === 'bank_transfer'}
                                            onChange={() => setMethodType('bank_transfer')}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Bank Transfer</span>
                                    </label>
                                </div>
                            </div>

                            {methodType === 'bank_transfer' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="e.g. Chase, BCA, HSBC"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    {methodType === 'credit_card' ? 'Last 4 Digits' : 'Account Number Last 4'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    maxLength={4}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="XXXX"
                                    value={lastFour}
                                    onChange={(e) => setLastFour(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                />
                            </div>

                            {methodType === 'credit_card' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="MM/YY"
                                        value={expiry}
                                        onChange={(e) => setExpiry(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                                >
                                    Add Method
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};