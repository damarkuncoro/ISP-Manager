import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus } from '../types';
import { Search, Mail, Building, Trash2, MapPin, Wifi, ChevronRight } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onDelete: (id: string) => void;
  onSelect?: (customer: Customer) => void;
  initialSearch?: string;
}

const CustomerStatusBadge = ({ status }: { status: CustomerStatus }) => {
  const styles = {
    [CustomerStatus.ACTIVE]: 'bg-green-100 text-green-800',
    [CustomerStatus.PENDING]: 'bg-blue-100 text-blue-800',
    [CustomerStatus.SUSPENDED]: 'bg-red-100 text-red-800',
    [CustomerStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status ? status.toUpperCase() : 'UNKNOWN'}
    </span>
  );
};

export const CustomerList: React.FC<CustomerListProps> = ({ customers, onDelete, onSelect, initialSearch = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Update local search term if the prop changes (e.g. navigation from another component)
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {filteredCustomers.map((customer) => (
          <li 
            key={customer.id} 
            onClick={() => onSelect && onSelect(customer)}
            className={`hover:bg-gray-50 transition-colors duration-150 group ${onSelect ? 'cursor-pointer' : ''}`}
          >
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{customer.name}</h3>
                  <CustomerStatusBadge status={customer.account_status} />
                  {customer.company && (
                     <span className="flex items-center text-xs text-gray-400">
                        <Building className="w-3 h-3 mr-1" />
                        {customer.company}
                     </span>
                  )}
                </div>
                
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.subscription_plan && (
                    <div className="flex items-center">
                      <Wifi className="flex-shrink-0 mr-1.5 h-4 w-4 text-primary-400" />
                      <span className="font-medium text-gray-700">{customer.subscription_plan}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center col-span-1 sm:col-span-2">
                      <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-4 flex items-center gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    onDelete(customer.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Customer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                {onSelect && (
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />
                )}
              </div>
            </div>
          </li>
        ))}
        {filteredCustomers.length === 0 && (
          <li className="px-4 py-12 text-center text-gray-500 text-sm">
            {customers.length === 0 
              ? "No subscribers yet. Create one to get started." 
              : "No subscribers found matching your search."}
          </li>
        )}
      </ul>
    </div>
  );
};