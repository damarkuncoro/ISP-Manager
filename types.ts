export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Keep enum for code references / default fallbacks, but data will drive UI
export enum TicketCategory {
  INTERNET = 'internet_issue',
  BILLING = 'billing',
  HARDWARE = 'hardware',
  INSTALLATION = 'installation',
  OTHER = 'other',
}

export interface TicketCategoryConfig {
  id: string;
  name: string;
  code: string;
  sla_hours: number;
  description: string;
  created_at?: string;
}

export enum CustomerStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum InvoiceStatus {
  PAID = 'paid',
  PENDING = 'pending',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  WARNING = 'warning',
  MAINTENANCE = 'maintenance',
}

export enum DeviceType {
  ROUTER = 'router',
  SWITCH = 'switch',
  OLT = 'olt',
  SERVER = 'server',
  CPE = 'cpe',
  OTHER = 'other',
}

export enum EmployeeRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPPORT = 'support',
  TECHNICIAN = 'technician',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  download_speed: string;
  upload_speed: string;
  created_at: string;
}

export interface Customer {
  id: string; 
  name: string;
  email: string;
  company?: string;
  address?: string;
  subscription_plan?: string; 
  plan_id?: string; 
  account_status: CustomerStatus;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  phone?: string;
  department?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Ticket {
  id: string; 
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string; // Changed from enum to string to support dynamic values
  created_at: string;
  customer_id?: string | null; 
  customer?: Customer;
  is_escalated?: boolean; 
  assigned_to?: string;
  due_date?: string;
  resolution_notes?: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  status: InvoiceStatus;
  issued_date: string;
  due_date: string;
  description?: string; 
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  type: 'credit_card' | 'bank_transfer';
  last_four?: string;
  expiry_date?: string;
  bank_name?: string;
  is_default: boolean;
  created_at: string;
}

export interface NetworkDevice {
  id: string;
  customer_id?: string; 
  name: string;
  ip_address: string;
  type: DeviceType;
  status: DeviceStatus;
  location?: string;
  last_check: string;
  created_at: string;
  model?: string;
  serial_number?: string;
  firmware_version?: string;
}

export type TicketStats = {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  highPriority: number;
}