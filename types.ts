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

export enum TicketCategory {
  INTERNET = 'internet_issue',
  BILLING = 'billing',
  HARDWARE = 'hardware',
  INSTALLATION = 'installation',
  OTHER = 'other',
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
  phone?: string;
  company?: string;
  address?: string;
  subscription_plan?: string;
  plan_id?: string;
  account_status: CustomerStatus;
  created_at: string;
}

export interface Ticket {
  id: string; 
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  created_at: string;
  customer_id?: string | null; 
  customer?: Customer;
  is_escalated?: boolean; // New field for escalation
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
  customer_id?: string; // Linked to a customer (e.g. CPE)
  name: string;
  ip_address: string;
  type: DeviceType;
  status: DeviceStatus;
  location?: string;
  last_check: string;
  created_at: string;
}

export type TicketStats = {
  total: number;
  open: number;
  inProgress: number;
  closed: number;
  highPriority: number;
};