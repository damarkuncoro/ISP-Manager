
import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types';
import { Search, Filter, MoreHorizontal, Clock, AlertCircle, CheckCircle2, User, Wifi, CreditCard, Router, Wrench, HelpCircle, ChevronRight, AlertTriangle } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  onCustomerClick?: (customerId: string) => void;
  onTicketClick?: (ticket: Ticket) => void; // New prop for ticket selection
  compact?: boolean;
}

const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const styles = {
    [TicketStatus.OPEN]: 'bg-blue-50 text-blue-700 border-blue-200',
    [TicketStatus.IN_PROGRESS]: 'bg-amber-50 text-amber-700 border-amber-200',
    [TicketStatus.CLOSED]: 'bg-green-50 text-green-700 border-green-200',
  };
  
  const icons = {
    [TicketStatus.OPEN]: AlertCircle,
    [TicketStatus.IN_PROGRESS]: Clock,
    [TicketStatus.CLOSED]: CheckCircle2,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles[TicketStatus.OPEN]}`}>
      <Icon className="w-3 h-3 mr-1" />
      {(status || 'OPEN').replace('_', ' ').toUpperCase()}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: TicketPriority }) => {
  const styles = {
    [TicketPriority.LOW]: 'text-gray-600 bg-gray-100',
    [TicketPriority.MEDIUM]: 'text-orange-600 bg-orange-50',
    [TicketPriority.HIGH]: 'text-red-600 bg-red-50',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${styles[priority] || styles[TicketPriority.MEDIUM]}`}>
      {(priority || 'MEDIUM').toUpperCase()}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: TicketCategory }) => {
  const config = {
    [TicketCategory.INTERNET]: { label: 'Internet', icon: Wifi, color: 'text-indigo-600 bg-indigo-50' },
    [TicketCategory.BILLING]: { label: 'Billing', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    [TicketCategory.HARDWARE]: { label: 'Hardware', icon: Router, color: 'text-purple-600 bg-purple-50' },
    [TicketCategory.INSTALLATION]: { label: 'Install', icon: Wrench, color: 'text-slate-600 bg-slate-50' },
    [TicketCategory.OTHER]: { label: 'Other', icon: HelpCircle, color: 'text-gray-600 bg-gray-50' },
  };

  const cat = config[category] || config[TicketCategory.OTHER];
  const Icon = cat.icon;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {cat.label}
    </span>
  );
};

export const TicketList: React.FC<TicketListProps> = ({ tickets, onEdit, onDelete, onCustomerClick, onTicketClick, compact = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  if (tickets.length === 0 && !compact) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <Filter className="h-full w-full" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new ticket.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {!compact && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search tickets, subscribers, or agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg"
             >
                <option value="all">All Statuses</option>
                <option value={TicketStatus.OPEN}>Open</option>
                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                <option value={TicketStatus.CLOSED}>Closed</option>
             </select>
          </div>
        </div>
      )}

      <ul className="divide-y divide-gray-100">
        {filteredTickets.map((ticket) => {
            const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED;

            return (
          <li 
            key={ticket.id} 
            className={`hover:bg-gray-50 transition-colors duration-150 group ${onTicketClick ? 'cursor-pointer' : ''}`}
            onClick={() => onTicketClick && onTicketClick(ticket)}
          >
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-primary-600 truncate">
                      #{String(ticket.id).slice(0, 8)}...
                    </p>
                    {ticket.is_escalated && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    {isOverdue && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">OVERDUE</span>
                    )}
                    {ticket.category && <CategoryBadge category={ticket.category} />}
                    {ticket.customer && (
                       onCustomerClick ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if(ticket.customer?.id) onCustomerClick(String(ticket.customer.id));
                          }}
                          className="flex items-center text-xs text-gray-500 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 px-2 py-0.5 rounded-full transition-colors"
                          title="View Customer Details"
                        >
                          <User className="w-3 h-3 mr-1" />
                          {ticket.customer.name}
                        </button>
                       ) : (
                        <span className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <User className="w-3 h-3 mr-1" />
                          {ticket.customer.name}
                        </span>
                       )
                    )}
                  </div>
                  {compact && <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate mr-2">
                    {ticket.title}
                  </p>
                  {compact && <StatusBadge status={ticket.status} />}
                </div>
                {!compact && (
                   <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className="flex items-center gap-1 text-xs">
                       <Clock className="w-3 h-3" />
                       {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    {ticket.assigned_to && (
                        <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            <User className="w-3 h-3" />
                            {ticket.assigned_to}
                        </span>
                    )}
                  </div>
                )}
              </div>
              
              {!compact && (
                <div className="flex items-center gap-2">
                  <div className="hidden group-hover:flex items-center gap-2 transition-opacity">
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           onEdit(ticket);
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           onDelete(String(ticket.id));
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        Delete
                      </button>
                  </div>
                  {onTicketClick && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />}
                </div>
              )}
              {compact && (
                 <div className="flex items-center">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(ticket);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {onTicketClick && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 ml-1" />}
                 </div>
              )}
            </div>
          </li>
        )})}
        {filteredTickets.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500 text-sm">
                No tickets found matching your filters.
            </li>
        )}
      </ul>
    </div>
  );
};
