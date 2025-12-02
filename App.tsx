import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { StatsOverview } from './components/StatsOverview';
import { TicketList } from './components/TicketList';
import { TicketForm } from './components/TicketForm';
import { TicketDetail } from './components/TicketDetail';
import { CustomerList } from './components/CustomerList';
import { CustomerForm } from './components/CustomerForm';
import { CustomerDetail } from './components/CustomerDetail';
import { PlansView } from './components/PlansView';
import { PlanDetail } from './components/PlanDetail';
import { PlanForm } from './components/PlanForm';
import { NetworkView } from './components/NetworkView';
import { DeviceForm } from './components/DeviceForm';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeDetail } from './components/EmployeeDetail';
import { SettingsView } from './components/SettingsView';
import { AccessDenied } from './components/AccessDenied';
import { Ticket, Customer, SubscriptionPlan, NetworkDevice, Employee } from './types';
import { AlertCircle, Plus, Loader2, Database, Copy, Check } from 'lucide-react';
import { SETUP_SQL } from './constants';
import { useTickets } from './hooks/useTickets';
import { useCustomers } from './hooks/useCustomers';
import { usePlans } from './hooks/usePlans';
import { useDevices } from './hooks/useDevices';
import { useEmployees } from './hooks/useEmployees';
import { useCategories } from './hooks/useCategories';
import { useAuth } from './contexts/AuthContext';
import { getSafeErrorMessage, isSetupError } from './utils/errorHelpers';

export const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings' | 'employees'>('dashboard');
  
  // Auth Context
  const { hasPermission, currentUser } = useAuth();

  // Global Settings State
  const [currency, setCurrency] = useState<string>('USD');

  // Custom Hooks for Data Management
  const { 
    tickets, 
    loading: ticketsLoading, 
    error: ticketsError, 
    loadTickets, 
    addTicket, 
    editTicket, 
    removeTicket 
  } = useTickets();

  const {
    customers,
    loading: customersLoading,
    error: customersError, 
    loadCustomers,
    addCustomer,
    removeCustomer
  } = useCustomers();

  const {
    plans,
    loading: plansLoading,
    loadPlans,
    addPlan,
    removePlan,
  } = usePlans();

  const {
    devices,
    loading: devicesLoading,
    loadDevices,
    addDevice,
    editDevice,
    removeDevice
  } = useDevices();

  const {
    employees,
    loading: employeesLoading,
    loadEmployees,
    addEmployee,
    editEmployee,
    removeEmployee
  } = useEmployees();

  // Hook for Categories
  const {
    categories,
    loading: categoriesLoading,
    loadCategories
  } = useCategories();

  // Aggregate State
  const loading = ticketsLoading || customersLoading || plansLoading || devicesLoading || employeesLoading || categoriesLoading;
  const globalError = ticketsError || customersError;
  const [setupError, setSetupError] = useState(false);

  // UI State
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [isDeviceFormOpen, setIsDeviceFormOpen] = useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  
  const [editingTicket, setEditingTicket] = useState<Partial<Ticket> | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editingDevice, setEditingDevice] = useState<NetworkDevice | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deviceCustomerId, setDeviceCustomerId] = useState<string | undefined>(undefined);
  
  const [copied, setCopied] = useState(false);
  
  // Navigation State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [customerSearch, setCustomerSearch] = useState(''); 
  const [previousView, setPreviousView] = useState<typeof view | null>(null); // Track navigation history

  // Initialize Settings
  useEffect(() => {
    const savedCurrency = localStorage.getItem('nexus_currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('nexus_currency', newCurrency);
  };

  // Initial Data Load
  const loadData = useCallback(async () => {
    setSetupError(false);
    try {
      await Promise.all([loadTickets(), loadCustomers(), loadPlans(), loadDevices(), loadEmployees(), loadCategories()]);
    } catch (err) {
      console.error("Data load failed via hooks");
    }
  }, [loadTickets, loadCustomers, loadPlans, loadDevices, loadEmployees, loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check for setup errors specifically
  useEffect(() => {
    if (ticketsError && isSetupError(ticketsError)) setSetupError(true);
    if (customersError && isSetupError(customersError)) setSetupError(true);
  }, [ticketsError, customersError]);

  // --- View Handlers ---
  const handleViewChange = (newView: typeof view) => {
    setPreviousView(null); 
    setView(newView);
    if (newView !== 'customers') { setSelectedCustomer(null); setCustomerSearch(''); }
    if (newView !== 'plans') setSelectedPlan(null);
    if (newView !== 'tickets') setSelectedTicket(null);
    if (newView !== 'employees') setSelectedEmployee(null);
  };

  const handleCustomerClick = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) { setSelectedCustomer(customer); setView('customers'); }
  };

  const handlePlanClick = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) { setSelectedPlan(plan); setView('plans'); }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setPreviousView(view);
    setSelectedTicket(ticket);
    setView('tickets');
  };

  // --- Actions Handlers ---
  const handleCreateTicket = async (ticketData: any) => {
    try { await addTicket(ticketData); setIsTicketFormOpen(false); } catch (err) { alert("Failed: " + getSafeErrorMessage(err)); }
  };
  const handleUpdateTicket = async (id: string, updates: any) => {
    try { 
        const updated = await editTicket(id, updates); 
        setIsTicketFormOpen(false); setEditingTicket(null); 
        if (selectedTicket && selectedTicket.id === id) setSelectedTicket(updated);
    } catch (err) { alert("Failed: " + getSafeErrorMessage(err)); }
  };
  const handleDeleteTicket = async (id: string) => {
    if(!window.confirm("Delete ticket?")) return;
    try { 
        await removeTicket(id); 
        if (selectedTicket?.id === id) { setSelectedTicket(null); if (previousView) setView(previousView as any); }
    } catch (err) { alert("Failed to delete"); }
  };

  const handleCreateCustomer = async (d:any) => { try { await addCustomer(d); setIsCustomerFormOpen(false); } catch(e) { alert(e); }};
  const handleDeleteCustomer = async (id:string) => { if(window.confirm("Delete customer?")) try { await removeCustomer(id); if(selectedCustomer?.id===id) setSelectedCustomer(null); loadTickets(); } catch(e) { alert(e); }};
  
  const handleCreatePlan = async (d:any) => { try { await addPlan(d); setIsPlanFormOpen(false); } catch(e) { alert(e); }};
  const handleDeletePlan = async (id:string) => { if(window.confirm("Delete plan?")) try { await removePlan(id); if(selectedPlan?.id===id) setSelectedPlan(null); } catch(e) { alert(e); }};

  const handleCreateDevice = async (d:any) => { try { await addDevice(d); setIsDeviceFormOpen(false); setDeviceCustomerId(undefined); } catch(e) { alert(e); }};
  const handleUpdateDevice = async (d:any) => { if(editingDevice) try { await editDevice(editingDevice.id, d); setIsDeviceFormOpen(false); setEditingDevice(null); setDeviceCustomerId(undefined); } catch(e) { alert(e); }};
  const handleDeleteDevice = async (id:string) => { if(window.confirm("Delete device?")) try { await removeDevice(id); } catch(e) { alert(e); }};

  const handleCreateEmployee = async (d:any) => { try { await addEmployee(d); setIsEmployeeFormOpen(false); } catch(e) { alert(e); }};
  const handleUpdateEmployee = async (d:any) => { if(editingEmployee) try { await editEmployee(editingEmployee.id, d); setIsEmployeeFormOpen(false); setEditingEmployee(null); if(selectedEmployee?.id===editingEmployee.id) setSelectedEmployee({...selectedEmployee, ...d}); } catch(e) { alert(e); }};
  const handleDeleteEmployee = async (id:string) => { if(window.confirm("Delete employee?")) try { await removeEmployee(id); if(selectedEmployee?.id===id) setSelectedEmployee(null); } catch(e) { alert(e); }};

  const handleCopySQL = () => { navigator.clipboard.writeText(SETUP_SQL); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // Helper for title
  const getPageTitle = () => {
      if (view === 'dashboard') return 'Dashboard Overview';
      if (view === 'customers') return selectedCustomer ? 'Subscriber Details' : 'Subscriber Management';
      if (view === 'plans') return selectedPlan ? 'Plan Details' : 'Service Packages';
      if (view === 'network') return 'Network Infrastructure';
      if (view === 'settings') return 'System Settings';
      if (view === 'tickets') return selectedTicket ? 'Ticket Details' : 'Ticket Management';
      if (view === 'employees') return selectedEmployee ? 'Team Member Profile' : 'Team Management';
      return 'Nexus ISP Manager';
  };

  // Helper for description
  const getPageDescription = () => {
      if (view === 'dashboard') return 'Overview of key metrics and recent activities';
      if (view === 'customers') return selectedCustomer ? 'View and edit subscriber information' : 'Manage subscriber database and accounts';
      if (view === 'plans') return selectedPlan ? 'View and edit service plan details' : 'Configure internet subscription packages';
      if (view === 'network') return 'Monitor status of routers, switches and OLTs';
      if (view === 'settings') return 'System configuration and database management';
      if (view === 'tickets') return selectedTicket ? 'View ticket conversation and details' : 'Track and resolve customer support requests';
      if (view === 'employees') return selectedEmployee ? 'View team member details' : 'Manage staff roles and access';
      return 'ISP Management System';
  };

  const openCreateTicketModal = (preselectedCustomer?: Customer) => {
    setEditingTicket(preselectedCustomer ? { customer_id: preselectedCustomer.id } : null);
    setIsTicketFormOpen(true);
  };

  const openEditTicketModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsTicketFormOpen(true);
  };

  const renderContent = () => {
    if (view === 'settings' && !hasPermission('manage_settings')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin" />;
    if (view === 'employees' && !hasPermission('manage_team')) return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin or Manager" />;

    if (view === 'settings') return <SettingsView connectionStatus={globalError ? 'error' : 'connected'} currency={currency} onCurrencyChange={handleCurrencyChange} />;

    if (globalError) {
        return (
            <div className={`mb-6 rounded-lg p-4 border ${setupError ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex">
                    <div className="ml-3 w-full">
                        <h3 className={`text-sm font-medium ${setupError ? 'text-blue-800' : 'text-red-800'}`}>
                            {setupError ? 'Database Setup Required' : 'Error Occurred'}
                        </h3>
                        {setupError ? (
                            <div className="mt-2 text-sm text-blue-700">
                                <p className="mb-2">Run this SQL in Supabase:</p>
                                <div className="relative group">
                                    <pre className="p-4 bg-gray-800 text-gray-300 rounded-lg text-xs font-mono overflow-x-auto border border-gray-700 max-h-48">{SETUP_SQL}</pre>
                                    <button onClick={handleCopySQL} className="absolute top-2 right-2 px-2 py-1 bg-white/10 text-white text-xs rounded">{copied ? 'Copied' : 'Copy'}</button>
                                </div>
                                <button onClick={loadData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded shadow-sm">Refresh Data</button>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-red-700">{getSafeErrorMessage(globalError)}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin w-8 h-8 text-primary-500" /></div>;

    switch (view) {
        case 'dashboard': return <><StatsOverview tickets={tickets} /><div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"><div className="flex justify-between items-center mb-6"><h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2><button onClick={() => setView('tickets')} className="text-primary-600 text-sm font-medium">View All</button></div><TicketList tickets={tickets.slice(0, 5)} onEdit={openEditTicketModal} onDelete={handleDeleteTicket} onTicketClick={handleTicketClick} compact /></div></>;
        case 'tickets': return selectedTicket ? <TicketDetail ticket={selectedTicket} onBack={() => {setSelectedTicket(null); if(previousView) setView(previousView as any);}} onEdit={openEditTicketModal} onDelete={handleDeleteTicket} onCustomerClick={handleCustomerClick} employees={employees} /> : <TicketList tickets={tickets} onEdit={openEditTicketModal} onDelete={handleDeleteTicket} onCustomerClick={handleCustomerClick} onTicketClick={handleTicketClick} />;
        case 'customers': return selectedCustomer ? <CustomerDetail customer={selectedCustomer} tickets={tickets.filter(t => t.customer_id === selectedCustomer.id)} onBack={() => setSelectedCustomer(null)} onTicketEdit={openEditTicketModal} onTicketDelete={handleDeleteTicket} currency={currency} onPlanClick={handlePlanClick} onCreateTicket={() => openCreateTicketModal(selectedCustomer)} onTicketClick={handleTicketClick} devices={devices.filter(d => d.customer_id === selectedCustomer.id)} onAddDevice={() => {setDeviceCustomerId(selectedCustomer.id); setEditingDevice(null); setIsDeviceFormOpen(true);}} onEditDevice={(d) => {setEditingDevice(d); setDeviceCustomerId(selectedCustomer.id); setIsDeviceFormOpen(true);}} onDeleteDevice={handleDeleteDevice} plans={plans} /> : <CustomerList customers={customers} onDelete={handleDeleteCustomer} onSelect={setSelectedCustomer} initialSearch={customerSearch} />;
        case 'plans': return selectedPlan ? <PlanDetail plan={selectedPlan} customers={customers} onBack={() => setSelectedPlan(null)} onEdit={(p) => {setEditingPlan(p); setIsPlanFormOpen(true);}} onDelete={handleDeletePlan} onCustomerClick={handleCustomerClick} currency={currency} /> : <PlansView plans={plans} customers={customers} onSelectPlan={setSelectedPlan} currency={currency} />;
        case 'network': return <NetworkView devices={devices} onAddDevice={() => {setEditingDevice(null); setIsDeviceFormOpen(true);}} onEditDevice={(d) => {setEditingDevice(d); setIsDeviceFormOpen(true);}} onDeleteDevice={handleDeleteDevice} onRefresh={loadDevices} />;
        case 'employees': return selectedEmployee ? <EmployeeDetail employee={selectedEmployee} assignedTickets={tickets.filter(t => t.assigned_to === selectedEmployee.name)} onBack={() => setSelectedEmployee(null)} onEdit={(e) => {setEditingEmployee(e); setIsEmployeeFormOpen(true);}} onDelete={handleDeleteEmployee} onTicketClick={handleTicketClick} /> : <EmployeeList employees={employees} onEdit={(e) => {setEditingEmployee(e); setIsEmployeeFormOpen(true);}} onDelete={handleDeleteEmployee} onSelect={setSelectedEmployee} />;
        default: return null;
    }
  };

  const shouldShowAddButton = () => {
      if (['dashboard', 'network', 'settings'].includes(view) || globalError || selectedCustomer || selectedPlan || selectedTicket || selectedEmployee) return false;
      if (view === 'employees' && !hasPermission('manage_team')) return false;
      return true;
  };

  return (
    <Layout currentView={view} onViewChange={handleViewChange}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h1>
            <p className="mt-1 text-sm text-gray-500">{getPageDescription()}</p>
          </div>
          {shouldShowAddButton() && (
            <button
              onClick={() => {
                  if (view === 'customers') setIsCustomerFormOpen(true);
                  else if (view === 'plans') { setEditingPlan(null); setIsPlanFormOpen(true); }
                  else if (view === 'employees') { setEditingEmployee(null); setIsEmployeeFormOpen(true); }
                  else openCreateTicketModal();
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              {view === 'customers' ? 'New Customer' : view === 'plans' ? 'New Plan' : view === 'employees' ? 'New Member' : 'New Ticket'}
            </button>
          )}
        </div>

        {renderContent()}

        {isTicketFormOpen && <TicketForm isOpen={isTicketFormOpen} onClose={() => setIsTicketFormOpen(false)} onSubmit={editingTicket && editingTicket.id ? (d) => handleUpdateTicket(editingTicket.id!, d) : handleCreateTicket} initialData={editingTicket || undefined} isLoading={false} customers={customers} employees={employees} categories={categories} />}
        {isCustomerFormOpen && <CustomerForm isOpen={isCustomerFormOpen} onClose={() => setIsCustomerFormOpen(false)} onSubmit={handleCreateCustomer} plans={plans} currency={currency} />}
        {isPlanFormOpen && <PlanForm isOpen={isPlanFormOpen} onClose={() => setIsPlanFormOpen(false)} onSubmit={handleCreatePlan} initialData={editingPlan || undefined} currency={currency} />}
        {isDeviceFormOpen && <DeviceForm isOpen={isDeviceFormOpen} onClose={() => setIsDeviceFormOpen(false)} onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice} initialData={editingDevice || undefined} customerId={deviceCustomerId} />}
        {isEmployeeFormOpen && <EmployeeForm isOpen={isEmployeeFormOpen} onClose={() => setIsEmployeeFormOpen(false)} onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee} initialData={editingEmployee || undefined} />}
      </div>
    </Layout>
  );
};