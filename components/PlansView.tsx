import React from 'react';
import { SubscriptionPlan, Customer } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Wifi, Users, TrendingUp, ArrowUpRight, ArrowDownRight, MoreHorizontal, Plus } from 'lucide-react';

interface PlansViewProps {
  plans: SubscriptionPlan[];
  customers: Customer[];
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currency: string;
}

export const PlansView: React.FC<PlansViewProps> = ({ plans, customers, onSelectPlan, currency }) => {
  
  // Helper to calculate stats per plan
  const getPlanStats = (planId: string) => {
    const planCustomers = customers.filter(c => c.plan_id === planId);
    return {
      count: planCustomers.length,
      revenue: planCustomers.length * (plans.find(p => p.id === planId)?.price || 0)
    };
  };

  const totalRevenue = customers.reduce((sum, customer) => {
    const plan = plans.find(p => p.id === customer.plan_id);
    return sum + (plan?.price || 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-500">Active Plans</p>
             <p className="text-3xl font-bold text-gray-900 mt-1">{plans.length}</p>
           </div>
           <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
             <Wifi className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-500">Total Subscribed Users</p>
             <p className="text-3xl font-bold text-gray-900 mt-1">
                {customers.filter(c => c.plan_id).length}
                <span className="text-sm font-normal text-gray-400 ml-2">/ {customers.length} total</span>
             </p>
           </div>
           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
             <Users className="w-6 h-6" />
           </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
           <div>
             <p className="text-sm font-medium text-gray-500">Est. Monthly Revenue</p>
             <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue, currency)}</p>
           </div>
           <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
             <TrendingUp className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => {
            const stats = getPlanStats(plan.id);
            return (
              <div 
                key={plan.id} 
                onClick={() => onSelectPlan(plan)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                      <Wifi className="w-6 h-6" />
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {stats.count} Users
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(plan.price, currency)}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <ArrowDownRight className="w-4 h-4 text-emerald-500" /> Download
                      </span>
                      <span className="font-medium text-gray-900">{plan.download_speed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-blue-500" /> Upload
                      </span>
                      <span className="font-medium text-gray-900">{plan.upload_speed}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                   <span className="text-xs text-gray-500">
                     Revenue: {formatCurrency(stats.revenue, currency)}
                   </span>
                   <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                     View Details →
                   </span>
                </div>
              </div>
            );
          })}
          
          {/* Add New Plan Card placeholder if needed, though button is usually in header */}
          {plans.length === 0 && (
             <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p>No plans created yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};