import React, { useState } from 'react';
import { Customer, Ticket, CustomerStatus, NetworkDevice } from '../types';
import { ArrowLeft, Mail, Building, MapPin, Wifi, Calendar, Shield, CreditCard, LayoutDashboard, Plus, Router } from 'lucide-react';
import { TicketList } from './TicketList';
import { BillingSection } from './BillingSection';
import { CustomerDevices } from './CustomerDevices';

interface CustomerDetailProps {
  customer: Customer;
  tickets: Ticket[];
  onBack: () => void;
  onTicketEdit: (ticket: Ticket) => void;
  onTicketDelete: (id: string) => void;
  currency?: string;
  onPlanClick?: (planId: string) => void;
  onCreateTicket?: () => void;
  onTicketClick?: (ticket: Ticket) => void;
  // Device Props
  devices?: NetworkDevice[];
  onAddDevice?: () => void;
  onEditDevice?: (device: NetworkDevice) => void;
  onDeleteDevice?: (id: string) => void;
}

const CustomerStatusBadge = ({ status }: { status: CustomerStatus }) => {
  const styles = {
    [CustomerStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [CustomerStatus.PENDING]: 'bg-blue-100 text-blue-800',
    [CustomerStatus.SUSPENDED]: 'bg-red-100 text-red-800',
    [CustomerStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status ? status.toUpperCase() : 'UNKNOWN'}
    </span>
  );
};

export const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  customer, 
  tickets, 
  onBack,
  onTicketEdit,
  onTicketDelete,
  currency = 'USD',
  onPlanClick,
  onCreateTicket,
  onTicketClick,
  devices = [],
  onAddDevice,
  onEditDevice,
  onDeleteDevice
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'devices'>('overview');

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        {/* Header with Back button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 pb-6">
            <button 
              onClick={onBack} 
              className="self-start sm:self-center p-2 hover:bg-white bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-sm"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                <CustomerStatusBadge status={customer.account_status} />
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                ID: <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{customer.id}</span>
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'overview' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'billing' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                </button>
                <button
                    onClick={() => setActiveTab('devices')}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'devices' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Router className="w-4 h-4 mr-2" />
                    Devices
                </button>
            </div>
        </div>

        {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Details Grid */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-medium text-gray-900">Subscriber Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Email</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{customer.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Building className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{customer.company || 'Residential Customer'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Service Address</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{customer.address || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Wifi className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Plan</p>
                                {customer.plan_id && onPlanClick ? (
                                    <button 
                                      onClick={() => onPlanClick(customer.plan_id!)}
                                      className="text-sm font-medium text-primary-600 hover:text-primary-800 hover:underline mt-1 text-left"
                                    >
                                      {customer.subscription_plan || 'Standard'}
                                    </button>
                                ) : (
                                    <p className="text-sm font-medium text-gray-900 mt-1">{customer.subscription_plan || 'Standard'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Since</p>
                                <p className="text-sm font-medium text-gray-900 mt-1">{new Date(customer.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Associated Tickets */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-medium text-gray-900">Support Ticket History</h2>
                            <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                                {tickets.length}
                            </span>
                        </div>
                        {onCreateTicket && (
                            <button
                                onClick={onCreateTicket}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                New Ticket
                            </button>
                        )}
                    </div>
                    
                    <div className="p-0">
                        {tickets.length > 0 ? (
                            <TicketList 
                                tickets={tickets} 
                                onEdit={onTicketEdit} 
                                onDelete={onTicketDelete} 
                                onTicketClick={onTicketClick}
                                compact 
                            />
                        ) : (
                            <div className="text-center py-12">
                                <Shield className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                                <p className="mt-1 text-sm text-gray-500">This customer hasn't reported any issues yet.</p>
                                {onCreateTicket && (
                                    <button 
                                        onClick={onCreateTicket}
                                        className="mt-4 inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Create their first ticket &rarr;
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'billing' && (
             <div className="animate-in fade-in duration-300">
                <BillingSection customer={customer} currency={currency} />
             </div>
        )}

        {activeTab === 'devices' && (
            <div className="animate-in fade-in duration-300">
                <CustomerDevices 
                    devices={devices} 
                    onAddDevice={onAddDevice ?? (() => {})} 
                    onEditDevice={onEditDevice ?? (() => {})} 
                    onDeleteDevice={onDeleteDevice ?? (() => {})}
                />
            </div>
        )}
    </div>
  );
};