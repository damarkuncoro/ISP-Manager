
import React, { useState } from 'react';
import { Employee, EmployeeRole, EmployeeStatus } from '../types';
import { Search, Mail, Phone, Briefcase, Trash2, Edit2, Shield, User, Wrench, Headphones, MoreHorizontal, ChevronRight } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  onSelect?: (employee: Employee) => void;
}

const RoleBadge = ({ role }: { role: EmployeeRole }) => {
  const config = {
    [EmployeeRole.ADMIN]: { color: 'bg-purple-100 text-purple-800', icon: Shield },
    [EmployeeRole.MANAGER]: { color: 'bg-blue-100 text-blue-800', icon: Briefcase },
    [EmployeeRole.SUPPORT]: { color: 'bg-green-100 text-green-800', icon: Headphones },
    [EmployeeRole.TECHNICIAN]: { color: 'bg-orange-100 text-orange-800', icon: Wrench },
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

export const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onDelete, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {filteredEmployees.map((employee) => (
          <li 
            key={employee.id} 
            onClick={() => onSelect && onSelect(employee)}
            className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer group`}
          >
            <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {employee.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-600 transition-colors">{employee.name}</h3>
                    <RoleBadge role={employee.role} />
                    <StatusBadge status={employee.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Mail className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    {employee.phone && (
                        <div className="flex items-center">
                        <Phone className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{employee.phone}</span>
                        </div>
                    )}
                    {employee.department && (
                        <div className="flex items-center">
                        <Briefcase className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-gray-400" />
                        <span className="truncate">{employee.department}</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(employee);
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                    >
                    <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(employee.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                {onSelect && <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400" />}
              </div>
            </div>
          </li>
        ))}
        {filteredEmployees.length === 0 && (
          <li className="px-4 py-12 text-center text-gray-500 text-sm">
            No team members found.
          </li>
        )}
      </ul>
    </div>
  );
};
