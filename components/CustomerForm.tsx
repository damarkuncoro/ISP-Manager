import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus, SubscriptionPlan } from '../types';
import { X, Save } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Customer, 'id' | 'created_at'>) => Promise<void>;
  plans?: SubscriptionPlan[]; // Added plans prop
  currency: string;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ isOpen, onClose, onSubmit, plans = [], currency }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [accountStatus, setAccountStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If there are no plans fetched (setup issue), we can allow manual entry or just show empty
  // For this implementation, we will assume we want to enforce selection if plans exist
  const hasPlans = plans && plans.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Find selected plan details to store the name (for backward compatibility/display) and ID
    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    try {
      await onSubmit({ 
        name, 
        email, 
        company: company || undefined,
        address: address || undefined,
        plan_id: selectedPlanId || undefined,
        subscription_plan: selectedPlan ? selectedPlan.name : undefined, // Fallback/Cache
        account_status: accountStatus
      });
      setName('');
      setEmail('');
      setCompany('');
      setAddress('');
      setSelectedPlanId('');
      setAccountStatus(CustomerStatus.ACTIVE);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Add New Subscriber
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Service Address</label>
                <input
                  type="text"
                  id="address"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Fiber Optic Way, Tech City"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="plan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
                  {hasPlans ? (
                    <select
                      id="plan"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                    >
                      <option value="">-- Select Plan --</option>
                      {plans.map(plan => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} ({formatCurrency(plan.price, currency)})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      placeholder="No plans defined"
                      className="mt-1 block w-full bg-gray-100 rounded-md border-gray-300 shadow-sm sm:text-sm border p-2"
                    />
                  )}
                  {!hasPlans && (
                      <p className="text-xs text-red-500 mt-1">Please add plans in Settings first.</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company (Optional)</label>
                  <input
                    type="text"
                    id="company"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Account Status</label>
                <select
                  id="status"
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={accountStatus}
                  onChange={(e) => setAccountStatus(e.target.value as CustomerStatus)}
                >
                  <option value={CustomerStatus.ACTIVE}>Active</option>
                  <option value={CustomerStatus.PENDING}>Pending Installation</option>
                  <option value={CustomerStatus.SUSPENDED}>Suspended (Non-payment)</option>
                  <option value={CustomerStatus.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <div className="mt-5 sm:mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Subscriber
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};