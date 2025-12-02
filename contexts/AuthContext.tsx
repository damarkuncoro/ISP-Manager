
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Employee, EmployeeRole, EmployeeStatus } from '../types';

// Mock User Interface
export interface User extends Employee {
  // Add auth-specific fields if needed
}

interface AuthContextType {
  currentUser: User | null;
  loginAs: (role: EmployeeRole) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

export type Permission = 
  | 'manage_team'       // Create/Edit/Delete Employees
  | 'manage_settings'   // Edit System Settings, SQL
  | 'manage_network'    // Add/Edit/Delete Network Devices
  | 'delete_records'    // Delete Customers, Tickets, Plans
  | 'view_billing';     // See financial info

const PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  [EmployeeRole.ADMIN]: ['manage_team', 'manage_settings', 'manage_network', 'delete_records', 'view_billing'],
  [EmployeeRole.MANAGER]: ['manage_team', 'delete_records', 'view_billing'],
  [EmployeeRole.TECHNICIAN]: ['manage_network'],
  [EmployeeRole.SUPPORT]: ['view_billing'] // Support can view but mostly just read/write tickets/customers
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users for Simulation
const MOCK_USERS: Record<EmployeeRole, User> = {
  [EmployeeRole.ADMIN]: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@nexus-isp.com',
    role: EmployeeRole.ADMIN,
    status: EmployeeStatus.ACTIVE,
    created_at: new Date().toISOString()
  },
  [EmployeeRole.MANAGER]: {
    id: 'manager-1',
    name: 'Karen Manager',
    email: 'karen@nexus-isp.com',
    role: EmployeeRole.MANAGER,
    status: EmployeeStatus.ACTIVE,
    department: 'Operations',
    created_at: new Date().toISOString()
  },
  [EmployeeRole.SUPPORT]: {
    id: 'support-1',
    name: 'Sarah Support',
    email: 'sarah@nexus-isp.com',
    role: EmployeeRole.SUPPORT,
    status: EmployeeStatus.ACTIVE,
    department: 'Customer Service',
    created_at: new Date().toISOString()
  },
  [EmployeeRole.TECHNICIAN]: {
    id: 'tech-1',
    name: 'Mike Tech',
    email: 'mike@nexus-isp.com',
    role: EmployeeRole.TECHNICIAN,
    status: EmployeeStatus.ACTIVE,
    department: 'Field Ops',
    created_at: new Date().toISOString()
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to Admin for first load
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[EmployeeRole.ADMIN]);

  const loginAs = (role: EmployeeRole) => {
    setCurrentUser(MOCK_USERS[role]);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return PERMISSIONS[currentUser.role].includes(permission);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loginAs, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
