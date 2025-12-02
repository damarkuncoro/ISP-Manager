
import React from 'react';
import { Employee, EmployeeRole, EmployeeStatus, Ticket, TicketStatus } from '../types';
import { ArrowLeft, Mail, Phone, Briefcase, Shield, Calendar, Edit2, Trash2, CheckCircle, Ticket as TicketIcon, User } from 'lucide-react';
import { TicketList } from './TicketList';

interface EmployeeDetailProps {
  employee: Employee;
  assignedTickets: Ticket[];
  onBack: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onTicketClick: (ticket: Ticket) => void;
}

const RoleBadge = ({ role }: { role: EmployeeRole }) => {
  const config = {
    [EmployeeRole.ADMIN]: { color: 'bg-purple-100 text-purple-800', icon: Shield },
    [EmployeeRole.MANAGER]: { color: 'bg-blue-100 text-blue-800', icon: Briefcase },
    [EmployeeRole.SUPPORT]: { color: 'bg-green-100 text-green-800', icon: User },
    [EmployeeRole.TECHNICIAN]: { color: 'bg-orange-100 text-orange-800', icon: User },
  };
  
  const { color, icon: Icon } = config[role] || { color: 'bg-gray-100 text-gray-800', icon: User };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

const StatusBadge = ({ status }: { status: EmployeeStatus }) => {
    const styles = {
      [EmployeeStatus.ACTIVE]: 'bg-green-50 text-green-700 ring-green-600/20',
      [EmployeeStatus.INACTIVE]: 'bg-gray-50 text-gray-600 ring-gray-500/10',
      [EmployeeStatus.ON_LEAVE]: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
    };
  
    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

export const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ 
  employee, 
  assignedTickets, 
  onBack, 
  onEdit, 
  onDelete,
  onTicketClick
}) => {
  
  const stats = {
      totalAssigned: assignedTickets.length,
      active: assignedTickets.filter(t => t.status !== TicketStatus.CLOSED).length,
      resolved: assignedTickets.filter(t => t.status === TicketStatus.CLOSED).length
  };

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
          
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                {employee.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                    <RoleBadge role={employee.role} />
                    <StatusBadge status={employee.status} />
                </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 self-end sm:self-auto">
           <button 
             onClick={() => onEdit(employee)}
             className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
           >
             <Edit2 className="w-4 h-4 mr-2" />
             Edit Profile
           </button>
           <button 
             onClick={() => onDelete(employee.id)}
             className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
           >
             <Trash2 className="w-4 h-4 mr-2" />
             Delete
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Email</p>
                              <p className="text-sm text-gray-900">{employee.email}</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Phone</p>
                              <p className="text-sm text-gray-900">{employee.phone || 'N/A'}</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Department</p>
                              <p className="text-sm text-gray-900">{employee.department || 'General'}</p>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                              <p className="text-xs text-gray-500 uppercase font-medium">Joined</p>
                              <p className="text-sm text-gray-900">{new Date(employee.created_at).toLocaleDateString()}</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-4">Performance Overview</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
                              <p className="text-xs text-blue-600 font-medium">Active Tasks</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                              <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                              <p className="text-xs text-green-600 font-medium">Resolved</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Assigned Work */}
          <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <TicketIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900">Assigned Tickets</h3>
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          {stats.totalAssigned} Total
                      </span>
                  </div>
                  
                  {assignedTickets.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                         {assignedTickets.map(ticket => (
                             <div 
                                key={ticket.id} 
                                onClick={() => onTicketClick(ticket)}
                                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                             >
                                 <div className="flex items-center gap-3">
                                     <div className={`p-2 rounded-full ${ticket.status === TicketStatus.CLOSED ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                         {ticket.status === TicketStatus.CLOSED ? <CheckCircle className="w-4 h-4" /> : <TicketIcon className="w-4 h-4" />}
                                     </div>
                                     <div>
                                         <p className="text-sm font-medium text-gray-900 group-hover:text-primary-600">{ticket.title}</p>
                                         <p className="text-xs text-gray-500">
                                            #{String(ticket.id).slice(0,8)} • {ticket.customer?.name || 'Unknown Customer'}
                                         </p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                         ticket.status === TicketStatus.CLOSED ? 'bg-green-50 text-green-700' : 
                                         ticket.status === TicketStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-700' : 
                                         'bg-blue-50 text-blue-700'
                                     }`}>
                                         {ticket.status.replace('_', ' ').toUpperCase()}
                                     </span>
                                     <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                 </div>
                             </div>
                         ))}
                      </div>
                  ) : (
                      <div className="p-12 text-center text-gray-500">
                          <p>No tickets currently assigned to this employee.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
