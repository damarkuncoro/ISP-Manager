import React from 'react';
import { SubscriptionPlan, Customer, CustomerStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ArrowLeft, Users, Wifi, TrendingUp, Trash2, Edit2, Mail, MapPin } from 'lucide-react';

interface PlanDetailProps {
  plan: SubscriptionPlan;
  customers: Customer[];
  onBack: () => void;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (id: string) => void;
  onCustomerClick: (id: string) => void;
  currency: string;
}

const CustomerStatusBadge = ({ status }: { status: CustomerStatus }) => {
    const styles = {
      [CustomerStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [CustomerStatus.PENDING]: 'bg-blue-100 text-blue-800',
      [CustomerStatus.SUSPENDED]: 'bg-red-100 text-red-800',
      [CustomerStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
    };
  
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {status ? status.toUpperCase() : 'UNKNOWN'}
      </span>
    );
  };

export const PlanDetail: React.FC<PlanDetailProps> = ({ 
  plan, 
  customers, 
  onBack, 
  onEdit, 
  onDelete, 
  onCustomerClick, 
  currency 
}) => {
  const planCustomers = customers.filter(c => c.plan_id === plan.id);
  const monthlyRevenue = planCustomers.length * plan.price;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-white bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
             <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
             <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span className="font-medium text-primary-600">{formatCurrency(plan.price, currency)}/mo</span>
                <span className="text-gray-300">•</span>
                <span>{plan.download_speed} ↓ / {plan.upload_speed} ↑</span>
             </p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => onEdit(plan)}
             className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
           >
             <Edit2 className="w-4 h-4 mr-2" />
             Edit
           </button>
           <button 
             onClick={() => onDelete(plan.id)}
             className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
           >
             <Trash2 className="w-4 h-4 mr-2" />
             Delete
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Users className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Active Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">{planCustomers.length}</p>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue, currency)}</p>
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <Wifi className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">Service Type</p>
                <p className="text-lg font-bold text-gray-900">Fiber Optic</p>
            </div>
        </div>
      </div>

      {/* Customer Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
           <h3 className="text-lg font-medium text-gray-900">Assigned Customers</h3>
        </div>
        
        {planCustomers.length === 0 ? (
           <div className="p-12 text-center text-gray-500">
              No customers are currently assigned to this plan.
           </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {planCustomers.map((customer) => (
                            <tr 
                                key={customer.id} 
                                onClick={() => onCustomerClick(customer.id)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                                    <div className="text-xs text-gray-500">{customer.company}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <CustomerStatusBadge status={customer.account_status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {customer.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="truncate max-w-xs">{customer.address || 'N/A'}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

    </div>
  );
};