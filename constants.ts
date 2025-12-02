// Supabase Configuration
// Note: In a production environment, these should be environment variables.
// However, per the user's request and prompt context, they are included here for the generated app to function immediately.

export const SUPABASE_URL = "https://ihqptcjerwcgwibxeyqc.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlocXB0Y2plcndjZ3dpYnhleXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2NTA4NTcsImV4cCI6MjA4MDIyNjg1N30.C0IHrSJ6qEcEKQGLNMUR8FVeAcq7Cava_HZrt39YtjA";

export const APP_NAME = "Cakramedia ISP Manager";

export const SETUP_SQL = `-- 0. Reset Schema (DROP ALL TABLES)
-- WARNING: This will delete all existing data!
DROP TABLE IF EXISTS public.ticket_comments CASCADE;
DROP TABLE IF EXISTS public.payment_methods CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.network_devices CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.ticket_categories CASCADE;

-- 1. Create Plans Table
create table public.plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  price numeric not null,
  download_speed text,
  upload_speed text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Ticket Categories Table
create table public.ticket_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  sla_hours int default 24 not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Customers Table (ISP Enhanced with UUID)
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  company text,
  address text,
  subscription_plan text,
  plan_id uuid references public.plans(id) on delete set null,
  account_status text default 'active' not null check (account_status in ('active', 'suspended', 'pending', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Tickets Table (ISP Enhanced with UUID)
create table public.tickets (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'open' not null check (status in ('open', 'in_progress', 'closed')),
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high')),
  category text default 'internet_issue' not null, -- Dynamic category allowed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  customer_id uuid references public.customers(id) on delete set null,
  is_escalated boolean default false,
  assigned_to text,
  due_date timestamp with time zone,
  resolution_notes text
);

-- 5. Create Invoices Table
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  invoice_number text not null,
  amount numeric not null,
  status text default 'pending' not null check (status in ('paid', 'pending', 'overdue', 'cancelled')),
  issued_date date default CURRENT_DATE not null,
  due_date date not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Payment Methods Table
create table public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  type text not null check (type in ('credit_card', 'bank_transfer')),
  last_four text,
  expiry_date text,
  bank_name text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Ticket Comments Table
create table public.ticket_comments (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.tickets(id) on delete cascade not null,
  content text not null,
  author_name text default 'Support Agent',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Network Devices Table
create table public.network_devices (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  ip_address text,
  type text not null,
  status text default 'online',
  location text,
  last_check timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  model text,
  serial_number text,
  firmware_version text
);

-- 9. Create Employees Table
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  role text default 'support' not null check (role in ('admin', 'manager', 'support', 'technician')),
  status text default 'active' not null check (status in ('active', 'inactive', 'on_leave')),
  phone text,
  department text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create Indexes (Optimization)
create index tickets_customer_id_idx on public.tickets(customer_id);
create index customers_plan_id_idx on public.customers(plan_id);
create index invoices_customer_id_idx on public.invoices(customer_id);
create index payment_methods_customer_id_idx on public.payment_methods(customer_id);
create index ticket_comments_ticket_id_idx on public.ticket_comments(ticket_id);
create index network_devices_customer_id_idx on public.network_devices(customer_id);

-- 11. Enable Row Level Security (RLS)
alter table public.customers enable row level security;
alter table public.tickets enable row level security;
alter table public.plans enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_methods enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.network_devices enable row level security;
alter table public.employees enable row level security;
alter table public.ticket_categories enable row level security;

-- 12. Create Public Access Policies (for demo)
create policy "Public Access Customers" on public.customers for all using (true);
create policy "Public Access Tickets" on public.tickets for all using (true);
create policy "Public Access Plans" on public.plans for all using (true);
create policy "Public Access Invoices" on public.invoices for all using (true);
create policy "Public Access Payment Methods" on public.payment_methods for all using (true);
create policy "Public Access Comments" on public.ticket_comments for all using (true);
create policy "Public Access Network Devices" on public.network_devices for all using (true);
create policy "Public Access Employees" on public.employees for all using (true);
create policy "Public Access Categories" on public.ticket_categories for all using (true);

-- 13. Seed Default Data
insert into public.plans (name, price, download_speed, upload_speed) values 
('Home Fiber Starter', 29.99, '50 Mbps', '10 Mbps'),
('Home Fiber Plus', 49.99, '100 Mbps', '50 Mbps'),
('Business Pro', 99.99, '1 Gbps', '1 Gbps');

insert into public.employees (name, email, role, department, status) values 
('Admin User', 'admin@nexus-isp.com', 'admin', 'Management', 'active'),
('John Tech', 'john@nexus-isp.com', 'technician', 'Field Ops', 'active'),
('Sarah Support', 'sarah@nexus-isp.com', 'support', 'Customer Service', 'active');

insert into public.ticket_categories (name, code, sla_hours, description) values
('Internet Issue', 'internet_issue', 4, 'Connectivity problems, slow speeds, packet loss.'),
('Billing', 'billing', 24, 'Invoice inquiries, payment issues, plan changes.'),
('Hardware', 'hardware', 48, 'Router malfunction, cable breaks, equipment replacement.'),
('Installation', 'installation', 72, 'New service setup, moving services.'),
('Other', 'other', 24, 'General inquiries and feedback.');
