import React, { useState, useMemo } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '../types';
import { Search, Filter, MoreHorizontal, Clock, AlertCircle, CheckCircle2, User, Wifi, CreditCard, Router, Wrench, HelpCircle, ChevronRight, AlertTriangle, LayoutList, Kanban, Calendar, Tag } from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  onCustomerClick?: (customerId: string) => void;
  onTicketClick?: (ticket: Ticket) => void;
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
    [TicketPriority.LOW]: 'text-gray-600 bg-gray-100 border-gray-200',
    [TicketPriority.MEDIUM]: 'text-orange-600 bg-orange-50 border-orange-100',
    [TicketPriority.HIGH]: 'text-red-600 bg-red-50 border-red-100',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${styles[priority] || styles[TicketPriority.MEDIUM]}`}>
      {(priority || 'MEDIUM').toUpperCase()}
    </span>
  );
};

// Generic Badge for dynamic categories
const CategoryBadge = ({ categoryCode }: { categoryCode: string }) => {
  // Simple mapping for common defaults to keep nice icons, fallback to generic
  let Icon = Tag;
  let color = 'text-gray-600 bg-gray-50';

  if (categoryCode.includes('internet')) { Icon = Wifi; color = 'text-indigo-600 bg-indigo-50'; }
  else if (categoryCode.includes('billing')) { Icon = CreditCard; color = 'text-emerald-600 bg-emerald-50'; }
  else if (categoryCode.includes('hardware')) { Icon = Router; color = 'text-purple-600 bg-purple-50'; }
  else if (categoryCode.includes('install')) { Icon = Wrench; color = 'text-slate-600 bg-slate-50'; }
  else { Icon = HelpCircle; }

  // Convert snake_case to Title Case for display
  const label = categoryCode.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
};

export const TicketList: React.FC<TicketListProps> = ({ tickets, onEdit, onDelete, onCustomerClick, onTicketClick, compact = false }) => {
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ticket.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Helper to render a card content
  const TicketCardContent = ({ ticket }: { ticket: Ticket }) => {
      const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED;
      
      return (
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-gray-400">#{String(ticket.id).slice(0, 6)}</span>
                    <PriorityBadge priority={ticket.priority} />
                    {ticket.is_escalated && (
                        <span className="text-[10px] font-bold text-red-600 flex items-center bg-red-50 px-1 rounded">
                            <AlertTriangle className="w-3 h-3 mr-0.5" /> Esc
                        </span>
                    )}
                </div>
                {viewMode === 'board' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(ticket); }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                )}
            </div>
            
            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{ticket.title}</h4>
            
            <div className="flex items-center gap-2 mb-3">
                {ticket.customer ? (
                    <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                        <User className="w-3 h-3 mr-1" />
                        {ticket.customer.name}
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 italic">No customer</span>
                )}
                {ticket.category && <CategoryBadge categoryCode={ticket.category} />}
            </div>

            <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-2">
                    {ticket.assigned_to ? (
                        <div className="flex items-center gap-1" title={`Assigned to ${ticket.assigned_to}`}>
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                {ticket.assigned_to.charAt(0)}
                            </div>
                            <span className="max-w-[80px] truncate">{ticket.assigned_to}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic flex items-center">
                            <User className="w-3 h-3 mr-1" /> Unassigned
                        </span>
                    )}
                </div>
                <div className={`flex items-center ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : new Date(ticket.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                </div>
            </div>
        </div>
      );
  };

  // --- Render Empty State ---
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

  // --- Render Board View ---
  if (viewMode === 'board' && !compact) {
      const columns = [
          { id: TicketStatus.OPEN, label: 'Open', color: 'bg-blue-50 border-blue-100', items: filteredTickets.filter(t => t.status === TicketStatus.OPEN) },
          { id: TicketStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-amber-50 border-amber-100', items: filteredTickets.filter(t => t.status === TicketStatus.IN_PROGRESS) },
          { id: TicketStatus.CLOSED, label: 'Closed', color: 'bg-green-50 border-green-100', items: filteredTickets.filter(t => t.status === TicketStatus.CLOSED) },
      ];

      return (
          <div className="space-y-4">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value as any)}
                            className="block w-full pl-3 pr-8 py-2 text-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500 rounded-lg"
                        >
                            <option value="all">All Priorities</option>
                            <option value={TicketPriority.HIGH}>High</option>
                            <option value={TicketPriority.MEDIUM}>Medium</option>
                            <option value={TicketPriority.LOW}>Low</option>
                        </select>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setViewMode('list')} className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all"><LayoutList className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('board')} className="p-1.5 rounded bg-white text-primary-600 shadow-sm"><Kanban className="w-4 h-4" /></button>
                        </div>
                  </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)] overflow-x-auto pb-4">
                  {columns.map(col => (
                      <div key={col.id} className={`flex flex-col h-full rounded-xl border ${col.color} bg-opacity-50`}>
                          <div className="p-4 flex justify-between items-center border-b border-gray-200/50">
                              <h3 className="font-semibold text-gray-700">{col.label}</h3>
                              <span className="bg-white text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">{col.items.length}</span>
                          </div>
                          <div className="p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                              {col.items.map(ticket => (
                                  <div 
                                    key={ticket.id}
                                    onClick={() => onTicketClick && onTicketClick(ticket)}
                                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                                  >
                                      <TicketCardContent ticket={ticket} />
                                  </div>
                              ))}
                              {col.items.length === 0 && (
                                  <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                                      No tickets
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  // --- Render List View (Default) ---
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
          
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
             <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="block pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg"
             >
                <option value="all">All Statuses</option>
                <option value={TicketStatus.OPEN}>Open</option>
                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                <option value={TicketStatus.CLOSED}>Closed</option>
             </select>
             <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="block pl-3 pr-8 py-2 text-sm border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-lg"
             >
                <option value="all">All Priorities</option>
                <option value={TicketPriority.HIGH}>High</option>
                <option value={TicketPriority.MEDIUM}>Medium</option>
                <option value={TicketPriority.LOW}>Low</option>
             </select>
             <div className="flex bg-gray-200 p-1 rounded-lg ml-2">
                <button onClick={() => setViewMode('list')} className="p-1.5 rounded bg-white text-primary-600 shadow-sm"><LayoutList className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('board')} className="p-1.5 rounded text-gray-500 hover:text-gray-900 hover:bg-white transition-all"><Kanban className="w-4 h-4" /></button>
             </div>
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
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                    )}
                    {isOverdue && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">OVERDUE</span>
                    )}
                    {ticket.category && <CategoryBadge categoryCode={ticket.category} />}
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
                   <div className="mt-2 flex items-center text-sm text-gray-500 gap-4 flex-wrap">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className="flex items-center gap-1 text-xs">
                       <Clock className="w-3 h-3" />
                       Created: {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    {ticket.due_date && (
                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(ticket.due_date).toLocaleDateString()}
                        </span>
                    )}
                    {ticket.assigned_to ? (
                        <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            <User className="w-3 h-3" />
                            {ticket.assigned_to}
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                            <User className="w-3 h-3" />
                            Unassigned
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
                        title="Edit"
                      >
                        <MoreHorizontal className="w-5 h-5" />
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