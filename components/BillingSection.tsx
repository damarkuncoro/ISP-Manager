import React, { useEffect, useState } from 'react';
import { Customer, Invoice, InvoiceStatus, PaymentMethod, SubscriptionPlan } from '../types';
import { useBilling } from '../hooks/useBilling';
import { formatCurrency } from '../utils/formatters';
import { FileText, CreditCard, Plus, Download, AlertCircle, CheckCircle2, Clock, Landmark, X, MoreVertical, Calendar, Printer, Wifi } from 'lucide-react';

interface BillingSectionProps {
  customer: Customer;
  currency: string;
  plans: SubscriptionPlan[];
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const InvoiceStatusBadge = ({ status }: { status: InvoiceStatus }) => {
  const styles = {
    [InvoiceStatus.PAID]: 'bg-green-100 text-green-800 border-green-200',
    [InvoiceStatus.PENDING]: 'bg-amber-100 text-amber-800 border-amber-200',
    [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800 border-red-200',
    [InvoiceStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const Icons = {
    [InvoiceStatus.PAID]: CheckCircle2,
    [InvoiceStatus.PENDING]: Clock,
    [InvoiceStatus.OVERDUE]: AlertCircle,
    [InvoiceStatus.CANCELLED]: AlertCircle,
  };

  const Icon = Icons[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.toUpperCase()}
    </span>
  );
};

interface InvoiceDetailModalProps {
  invoice: Invoice;
  customer: Customer;
  currency: string;
  onClose: () => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onDownload: (invoice: Invoice) => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, customer, currency, onClose, onUpdateStatus, onDownload }) => {
  // formatDate is now available from module scope

  const handleCancel = () => {
      if (window.confirm("Are you sure you want to cancel this invoice? This action cannot be undone.")) {
          onUpdateStatus(invoice.id, InvoiceStatus.CANCELLED);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          {/* Modal Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
             <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
                <p className="text-sm text-gray-500">{invoice.invoice_number}</p>
             </div>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-6 w-6" />
             </button>
          </div>

          <div className="px-8 py-8 bg-white">
            {/* Invoice Header Status & Dates */}
            <div className="flex justify-between items-start mb-10">
               <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h1>
                  <InvoiceStatusBadge status={invoice.status} />
               </div>
               <div className="text-right space-y-1">
                  <div className="flex justify-between gap-8 text-sm">
                     <span className="text-gray-500">Issued Date:</span>
                     <span className="font-medium text-gray-900">{formatDate(invoice.issued_date)}</span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm">
                     <span className="text-gray-500">Due Date:</span>
                     <span className={`font-medium ${invoice.status === InvoiceStatus.OVERDUE ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(invoice.due_date)}
                     </span>
                  </div>
               </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-2 gap-8 mb-10 border-t border-gray-100 pt-8">
               <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h4>
                  <div className="text-sm text-gray-900 font-medium">{customer.name}</div>
                  {customer.company && <div className="text-sm text-gray-600">{customer.company}</div>}
                  {customer.address && <div className="text-sm text-gray-600">{customer.address}</div>}
                  <div className="text-sm text-gray-600 mt-1">{customer.email}</div>
               </div>
               <div className="text-right">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Pay To</h4>
                  <div className="text-sm text-gray-900 font-medium">Nexus ISP Solutions</div>
                  <div className="text-sm text-gray-600">123 Network Blvd, Suite 400</div>
                  <div className="text-sm text-gray-600">Tech City, TC 90210</div>
                  <div className="text-sm text-gray-600 mt-1">billing@nexus-isp.com</div>
               </div>
            </div>

            {/* Line Items */}
            <div className="mb-10">
               <table className="min-w-full">
                  <thead>
                     <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Description</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     <tr>
                        <td className="py-4 text-sm text-gray-900">{invoice.description || 'Internet Services'}</td>
                        <td className="py-4 text-right text-sm text-gray-900 font-mono">{formatCurrency(invoice.amount, currency)}</td>
                     </tr>
                  </tbody>
                  <tfoot>
                     <tr>
                        <td className="pt-6 text-right text-sm font-medium text-gray-900">Total</td>
                        <td className="pt-6 text-right text-2xl font-bold text-gray-900">{formatCurrency(invoice.amount, currency)}</td>
                     </tr>
                  </tfoot>
               </table>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 print:hidden">
               <div className="flex gap-2">
                   <button 
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => window.print()}
                   >
                      <Printer className="w-4 h-4" /> Print
                   </button>
                   <button 
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => onDownload(invoice)}
                   >
                      <Download className="w-4 h-4" /> Download
                   </button>
               </div>
               
               <div className="flex gap-3">
                  {invoice.status === InvoiceStatus.PENDING || invoice.status === InvoiceStatus.OVERDUE ? (
                     <>
                        <button 
                           onClick={handleCancel}
                           className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                        >
                           Cancel Invoice
                        </button>
                        <button 
                           onClick={() => onUpdateStatus(invoice.id, InvoiceStatus.PAID)}
                           className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm transition-colors"
                        >
                           Mark as Paid
                        </button>
                     </>
                  ) : null}
                  
                  {invoice.status === InvoiceStatus.PAID && (
                     <span className="flex items-center text-green-600 text-sm font-medium">
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Paid on {formatDate(new Date().toISOString())}
                     </span>
                  )}
                  {invoice.status === InvoiceStatus.CANCELLED && (
                     <span className="flex items-center text-gray-500 text-sm font-medium">
                        <X className="w-5 h-5 mr-2" /> Cancelled
                     </span>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BillingSection: React.FC<BillingSectionProps> = ({ customer, currency, plans }) => {
  const { 
    invoices, 
    paymentMethods, 
    loading, 
    loadBillingData, 
    createNewInvoice,
    updateStatus,
    addMethod 
  } = useBilling(customer.id);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Add Method Form State
  const [methodType, setMethodType] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [lastFour, setLastFour] = useState('');
  const [expiry, setExpiry] = useState('');
  const [bankName, setBankName] = useState('');

  // Find the current plan details to relate billing accurately
  const currentPlan = plans.find(p => p.id === customer.plan_id);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const handleGenerateInvoice = async () => {
    // Fallback if no plan found (adhoc)
    const amount = currentPlan ? currentPlan.price : 0;
    const description = currentPlan 
        ? `Monthly Subscription: ${currentPlan.name}` 
        : 'Ad-hoc Service Charge';
        
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Due in 2 weeks
    
    setIsGenerating(true);
    try {
      await createNewInvoice(amount, dueDate, description);
    } catch (e) {
      alert("Failed to generate invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: InvoiceStatus) => {
    try {
      await updateStatus(id, newStatus);
      // If the selected invoice is being updated, update the local view state too
      if (selectedInvoice && selectedInvoice.id === id) {
          setSelectedInvoice(prev => prev ? ({...prev, status: newStatus}) : null);
      }
    } catch (e) {
      alert("Failed to update invoice status");
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #111827; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #0284c7; display: flex; align-items: center; gap: 10px; }
          .logo-box { width: 32px; height: 32px; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; border-radius: 6px; }
          .invoice-details { text-align: right; }
          .invoice-details h1 { margin: 0; font-size: 32px; color: #111827; letter-spacing: -1px; }
          .invoice-details p { margin: 5px 0 0; color: #6b7280; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section-title { font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
          .info { font-size: 14px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; border-bottom: 1px solid #e5e7eb; padding: 12px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; }
          td { border-bottom: 1px solid #e5e7eb; padding: 16px 0; font-size: 14px; }
          .amount-col { text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
          .total-row td { border-top: 2px solid #111827; border-bottom: none; padding-top: 20px; font-weight: 700; font-size: 18px; }
          .footer { margin-top: 80px; text-align: center; font-size: 12px; color: #9ca3af; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
             <div class="logo-box">N</div>
             Nexus ISP
          </div>
          <div class="invoice-details">
            <h1>INVOICE</h1>
            <p>#${invoice.invoice_number}</p>
          </div>
        </div>

        <div class="grid">
          <div>
            <div class="section-title">Bill To</div>
            <div class="info">
              <strong>${customer.name}</strong><br>
              ${customer.company ? customer.company + '<br>' : ''}
              ${customer.address || 'No address provided'}<br>
              ${customer.email}
            </div>
          </div>
          <div style="text-align: right;">
             <div class="section-title">Details</div>
             <div class="info">
               Issued: ${new Date(invoice.issued_date).toLocaleDateString()}<br>
               Due: ${new Date(invoice.due_date).toLocaleDateString()}<br>
               Status: <strong>${invoice.status.toUpperCase()}</strong>
             </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.description || 'Internet Services'}</td>
              <td class="amount-col">${formatCurrency(invoice.amount, currency)}</td>
            </tr>
            <tr class="total-row">
              <td>Total</td>
              <td class="amount-col">${formatCurrency(invoice.amount, currency)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for your business.</p>
          <p>Nexus ISP Solutions • 123 Network Blvd, Tech City • billing@nexus-isp.com</p>
        </div>
        <script>
           // Auto print when opened
           window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoice.invoice_number}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  const isOverdue = (invoice: Invoice) => {
      const due = new Date(invoice.due_date);
      const now = new Date();
      // Only overdue if date is past AND status is not paid/cancelled
      return due < now && 
             invoice.status !== InvoiceStatus.PAID && 
             invoice.status !== InvoiceStatus.CANCELLED;
  };

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
          {lastInvoice && <p className="text-xs text-gray-400 mt-1">Issued: {formatDate(lastInvoice.issued_date)}</p>}
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-sm font-medium text-gray-500">Active Plan</p>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {currentPlan ? currentPlan.name : (customer.subscription_plan || 'No Plan')}
              </p>
              {currentPlan && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {formatCurrency(currentPlan.price, currency)}/mo
                  </span>
                  <span className="text-xs text-gray-400 flex items-center">
                     <Download className="w-3 h-3 mr-0.5" /> {currentPlan.download_speed}
                  </span>
                </div>
              )}
           </div>
           <div className="bg-primary-50 p-2 rounded-lg">
             <Wifi className="w-5 h-5 text-primary-600" />
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
              {isGenerating ? 'Generating...' : 'Generate New Invoice'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No invoices found. Generate one to get started.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr 
                        key={inv.id} 
                        onClick={() => setSelectedInvoice(inv)}
                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{inv.invoice_number}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={inv.description}>
                            {inv.description || 'General Service'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(inv.issued_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                         <div className={`flex items-center gap-1 ${isOverdue(inv) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                             {formatDate(inv.due_date)}
                             {isOverdue(inv) && <AlertCircle className="w-3 h-3" />}
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(inv.amount, currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <InvoiceStatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {/* Download Action */}
                            <button
                               onClick={(e) => {
                                   e.stopPropagation();
                                   handleDownloadInvoice(inv);
                               }}
                               className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200"
                               title="Download Invoice"
                            >
                               <Download className="w-3 h-3" />
                            </button>

                            {inv.status === InvoiceStatus.PENDING || inv.status === InvoiceStatus.OVERDUE ? (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateStatus(inv.id, InvoiceStatus.PAID);
                                    }}
                                    className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-2 py-1 rounded border border-green-200"
                                >
                                    Mark Paid
                                </button>
                            ) : null}
                            {inv.status !== InvoiceStatus.CANCELLED && inv.status !== InvoiceStatus.PAID && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Are you sure you want to cancel this invoice?")) {
                                            handleUpdateStatus(inv.id, InvoiceStatus.CANCELLED);
                                        }
                                    }}
                                    className="text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 px-2 py-1 rounded border border-gray-200"
                                >
                                    Cancel
                                </button>
                            )}
                         </div>
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

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal 
            invoice={selectedInvoice}
            customer={customer}
            currency={currency}
            onClose={() => setSelectedInvoice(null)}
            onUpdateStatus={handleUpdateStatus}
            onDownload={handleDownloadInvoice}
        />
      )}

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
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