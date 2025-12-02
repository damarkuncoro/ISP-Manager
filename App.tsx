
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

  // Aggregate State
  const loading = ticketsLoading || customersLoading || plansLoading || devicesLoading || employeesLoading;
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
      await Promise.all([loadTickets(), loadCustomers(), loadPlans(), loadDevices(), loadEmployees()]);
    } catch (err) {
      console.error("Data load failed via hooks");
    }
  }, [loadTickets, loadCustomers, loadPlans, loadDevices, loadEmployees]);

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
    setPreviousView(null); // Clear history on manual navigation
    setView(newView);
    // Reset specific view states when navigating away
    if (newView !== 'customers') {
      setSelectedCustomer(null);
      setCustomerSearch('');
    }
    if (newView !== 'plans') {
      setSelectedPlan(null);
    }
    if (newView !== 'tickets') {
      setSelectedTicket(null);
    }
    if (newView !== 'employees') {
      setSelectedEmployee(null);
    }
  };

  const handleCustomerClick = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setView('customers');
    }
  };

  const handlePlanClick = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setView('plans');
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setPreviousView(view); // Save where we came from (e.g., customers detail)
    setSelectedTicket(ticket);
    setView('tickets');
  };

  // --- Ticket Handlers ---

  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at' | 'customer'>) => {
    try {
      await addTicket(ticketData);
      setIsTicketFormOpen(false);
    } catch (err) {
      alert("Failed to create ticket: " + getSafeErrorMessage(err));
    }
  };

  const handleUpdateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const updated = await editTicket(id, updates);
      setIsTicketFormOpen(false);
      setEditingTicket(null);
      // Update selected ticket view if currently open
      if (selectedTicket && selectedTicket.id === id) {
         setSelectedTicket(updated);
      }
    } catch (err) {
      alert("Failed to update ticket: " + getSafeErrorMessage(err));
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!hasPermission('delete_records')) {
      alert("You do not have permission to delete tickets.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await removeTicket(id);
      if (selectedTicket?.id === id) {
          setSelectedTicket(null);
          if (previousView && previousView !== 'tickets') {
              setView(previousView);
              setPreviousView(null);
          }
      }
    } catch (err) {
      alert("Failed to delete ticket: " + getSafeErrorMessage(err));
    }
  };

  const openCreateTicketModal = (preselectedCustomer?: Customer) => {
    if (preselectedCustomer) {
      // Initialize with customer ID but NO ticket ID, indicating a "Create" action
      setEditingTicket({ customer_id: preselectedCustomer.id });
    } else {
      setEditingTicket(null);
    }
    setIsTicketFormOpen(true);
  };

  const openEditTicketModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsTicketFormOpen(true);
  };

  // --- Customer Handlers ---

  const handleCreateCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      await addCustomer(customerData);
      setIsCustomerFormOpen(false);
    } catch (err) {
      alert("Failed to create customer: " + getSafeErrorMessage(err));
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!hasPermission('delete_records')) {
      alert("You do not have permission to delete customers.");
      return;
    }
    if (!window.confirm("Are you sure? This will delete the customer and might affect linked tickets.")) return;
    try {
      await removeCustomer(id);
      if (selectedCustomer?.id === id) {
          setSelectedCustomer(null);
      }
      await loadTickets(); // Refresh tickets as some might be deleted or unlinked
    } catch (err) {
      alert("Failed to delete customer.");
    }
  };

  // --- Plan Handlers ---

  const handleCreatePlan = async (planData: Omit<SubscriptionPlan, 'id' | 'created_at'>) => {
    try {
        await addPlan(planData);
        setIsPlanFormOpen(false);
    } catch (err) {
        alert("Failed to create plan: " + getSafeErrorMessage(err));
    }
  };

  const handleDeletePlan = async (id: string) => {
      if (!hasPermission('delete_records')) {
        alert("You do not have permission to delete plans.");
        return;
      }
      if (!window.confirm("Delete this plan? Customers on this plan will keep their data but lose the link.")) return;
      try {
          await removePlan(id);
          if (selectedPlan?.id === id) {
              setSelectedPlan(null);
          }
      } catch (err) {
          alert("Failed to delete plan.");
      }
  };

  // --- Device Handlers ---

  const handleCreateDevice = async (deviceData: Omit<NetworkDevice, 'id' | 'created_at' | 'last_check'>) => {
    if (!hasPermission('manage_network')) {
       alert("You do not have permission to add network devices.");
       return;
    }
    try {
      await addDevice(deviceData);
      setIsDeviceFormOpen(false);
      setDeviceCustomerId(undefined); // Reset customer context
    } catch (err) {
      alert("Failed to create device: " + getSafeErrorMessage(err));
    }
  };

  const handleUpdateDevice = async (deviceData: any) => {
    if (!hasPermission('manage_network')) {
        alert("You do not have permission to edit network devices.");
        return;
    }
    if (!editingDevice) return;
    try {
      await editDevice(editingDevice.id, deviceData);
      setIsDeviceFormOpen(false);
      setEditingDevice(null);
      setDeviceCustomerId(undefined);
    } catch (err) {
      alert("Failed to update device: " + getSafeErrorMessage(err));
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!hasPermission('manage_network')) {
        alert("You do not have permission to delete network devices.");
        return;
    }
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await removeDevice(id);
    } catch (err) {
      alert("Failed to delete device.");
    }
  };
  
  const openAddDeviceForCustomer = (customerId: string) => {
      setDeviceCustomerId(customerId);
      setEditingDevice(null);
      setIsDeviceFormOpen(true);
  };

  // --- Employee Handlers ---

  const handleCreateEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      await addEmployee(employeeData);
      setIsEmployeeFormOpen(false);
    } catch (err) {
      alert("Failed to create employee: " + getSafeErrorMessage(err));
    }
  };

  const handleUpdateEmployee = async (employeeData: any) => {
    if (!editingEmployee) return;
    try {
      await editEmployee(editingEmployee.id, employeeData);
      setIsEmployeeFormOpen(false);
      setEditingEmployee(null);
      // Update selected employee view if open
      if (selectedEmployee && selectedEmployee.id === editingEmployee.id) {
          setSelectedEmployee({...selectedEmployee, ...employeeData});
      }
    } catch (err) {
      alert("Failed to update employee: " + getSafeErrorMessage(err));
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      await removeEmployee(id);
      if (selectedEmployee?.id === id) {
          setSelectedEmployee(null);
      }
    } catch (err) {
      alert("Failed to delete employee.");
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPageTitle = () => {
    switch (view) {
      case 'dashboard': return 'Dashboard Overview';
      case 'customers': return selectedCustomer ? 'Subscriber Details' : 'Subscriber Management';
      case 'plans': return selectedPlan ? 'Plan Details' : 'Service Packages';
      case 'network': return 'Network Infrastructure';
      case 'settings': return 'System Settings';
      case 'tickets': return selectedTicket ? 'Ticket Details' : 'Ticket Management';
      case 'employees': return selectedEmployee ? 'Team Member Profile' : 'Team Management';
      default: return 'Nexus ISP Manager';
    }
  };

  const getPageDescription = () => {
    switch (view) {
      case 'dashboard': return 'Get a bird\'s eye view of your support performance.';
      case 'customers': return selectedCustomer ? 'View profile, billing and support history.' : 'Manage your customer database.';
      case 'plans': return selectedPlan ? 'View plan statistics and active subscribers.' : 'Manage internet subscription packages.';
      case 'network': return 'Monitor routers, switches, OLTs and link status.';
      case 'settings': return 'Configure database connections and system parameters.';
      case 'tickets': return selectedTicket ? 'View full ticket history and information.' : 'Manage, track, and resolve support tickets.';
      case 'employees': return selectedEmployee ? 'View employee details and assigned tasks.' : 'Manage support agents, technicians, and administrators.';
      default: return 'Manage, track, and resolve support tickets.';
    }
  };

  // Determine which component to render
  const renderContent = () => {
    // Role-Based Access Control Checks
    if (view === 'settings' && !hasPermission('manage_settings')) {
        return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin" />;
    }
    if (view === 'employees' && !hasPermission('manage_team')) {
        return <AccessDenied onBack={() => setView('dashboard')} requiredRole="Admin or Manager" />;
    }

    if (view === 'settings') {
      return (
        <SettingsView 
          connectionStatus={globalError ? 'error' : 'connected'} 
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
        />
      );
    }

    if (globalError) {
      const errorMessage = getSafeErrorMessage(globalError);
      
      return (
          <div className={`mb-6 rounded-lg p-4 border ${setupError ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {setupError ? (
                   <Database className="h-5 w-5 text-blue-400" aria-hidden="true" />
                ) : (
                   <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                )}
              </div>
              <div className="ml-3 w-full">
                <h3 className={`text-sm font-medium ${setupError ? 'text-blue-800' : 'text-red-800'}`}>
                  {setupError ? 'Database Setup Required' : 'Error Occurred'}
                </h3>
                
                {setupError ? (
                   <div className="mt-2 text-sm text-blue-700">
                      <p className="mb-3">The required tables or relationships were not found in Supabase. To fix this:</p>
                      <ol className="list-decimal list-inside space-y-1 mb-4 ml-1">
                        <li>Go to your Supabase Project Dashboard.</li>
                        <li>Open the <strong>SQL Editor</strong>.</li>
                        <li>Paste and run the following command:</li>
                      </ol>
                      
                      <div className="relative group">
                        <pre className="p-4 bg-gray-800 text-gray-300 rounded-lg text-xs font-mono overflow-x-auto border border-gray-700">
                          {SETUP_SQL}
                        </pre>
                        <button 
                          onClick={handleCopySQL}
                          className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded transition-colors border border-white/10"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'Copied!' : 'Copy SQL'}
                        </button>
                      </div>
                      
                      <div className="mt-4 flex gap-4">
                         <button
                            type="button"
                            onClick={loadData}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                          >
                            I've created the tables, Refresh
                          </button>
                          
                          {hasPermission('manage_settings') && (
                              <button
                                type="button"
                                onClick={() => setView('settings')}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
                              >
                                Go to Settings
                              </button>
                          )}
                      </div>
                   </div>
                ) : (
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errorMessage}</p>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={loadData}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      );
    }

    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading data...</p>
        </div>
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <StatsOverview tickets={tickets} />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button 
                  onClick={() => handleViewChange('tickets')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All Tickets
                </button>
              </div>
              <TicketList 
                tickets={tickets.slice(0, 5)} 
                onEdit={openEditTicketModal} 
                onDelete={handleDeleteTicket}
                onCustomerClick={handleCustomerClick}
                onTicketClick={handleTicketClick}
                compact
              />
            </div>
          </div>
        );
      case 'tickets':
        if (selectedTicket) {
          return (
            <TicketDetail 
              ticket={selectedTicket}
              onBack={() => {
                  setSelectedTicket(null);
                  if (previousView && previousView !== 'tickets') {
                      setView(previousView);
                      setPreviousView(null);
                  }
              }}
              onEdit={openEditTicketModal}
              onDelete={handleDeleteTicket}
              onCustomerClick={handleCustomerClick}
              employees={employees}
            />
          );
        }
        return (
          <div className="animate-in slide-in-from-right-4 duration-500">
            <TicketList 
              tickets={tickets} 
              onEdit={openEditTicketModal} 
              onDelete={handleDeleteTicket}
              onCustomerClick={handleCustomerClick}
              onTicketClick={handleTicketClick}
            />
          </div>
        );
      case 'customers':
        if (selectedCustomer) {
           return (
              <CustomerDetail 
                customer={selectedCustomer}
                tickets={tickets.filter(t => t.customer_id === selectedCustomer.id)}
                onBack={() => setSelectedCustomer(null)}
                onTicketEdit={openEditTicketModal}
                onTicketDelete={handleDeleteTicket}
                currency={currency}
                onPlanClick={handlePlanClick}
                onCreateTicket={() => openCreateTicketModal(selectedCustomer)}
                onTicketClick={handleTicketClick}
                devices={devices.filter(d => d.customer_id === selectedCustomer.id)}
                onAddDevice={() => openAddDeviceForCustomer(selectedCustomer.id)}
                onEditDevice={(device) => {
                    setEditingDevice(device);
                    setDeviceCustomerId(selectedCustomer.id);
                    setIsDeviceFormOpen(true);
                }}
                onDeleteDevice={handleDeleteDevice}
                plans={plans} // Pass plans for billing relation
              />
           )
        }
        return (
          <div className="animate-in slide-in-from-right-4 duration-500">
            <CustomerList
              customers={customers}
              onDelete={handleDeleteCustomer}
              onSelect={setSelectedCustomer}
              initialSearch={customerSearch}
            />
          </div>
        );
      case 'plans':
          if (selectedPlan) {
              return (
                  <PlanDetail
                    plan={selectedPlan}
                    customers={customers}
                    onBack={() => setSelectedPlan(null)}
                    onEdit={(plan) => {
                        setEditingPlan(plan);
                        setIsPlanFormOpen(true);
                    }}
                    onDelete={handleDeletePlan}
                    onCustomerClick={handleCustomerClick}
                    currency={currency}
                  />
              );
          }
          return (
              <PlansView 
                plans={plans}
                customers={customers}
                onSelectPlan={setSelectedPlan}
                currency={currency}
              />
          );
      case 'network':
          return (
              <NetworkView 
                devices={devices}
                onAddDevice={() => {
                    setEditingDevice(null);
                    setDeviceCustomerId(undefined);
                    setIsDeviceFormOpen(true);
                }}
                onEditDevice={(device) => {
                    setEditingDevice(device);
                    setDeviceCustomerId(device.customer_id);
                    setIsDeviceFormOpen(true);
                }}
                onDeleteDevice={handleDeleteDevice}
                onRefresh={loadDevices}
              />
          );
      case 'employees':
          if (selectedEmployee) {
              return (
                  <EmployeeDetail 
                    employee={selectedEmployee}
                    assignedTickets={tickets.filter(t => t.assigned_to === selectedEmployee.name)}
                    onBack={() => setSelectedEmployee(null)}
                    onEdit={(emp) => {
                        setEditingEmployee(emp);
                        setIsEmployeeFormOpen(true);
                    }}
                    onDelete={handleDeleteEmployee}
                    onTicketClick={handleTicketClick}
                  />
              );
          }
          return (
              <div className="animate-in slide-in-from-right-4 duration-500">
                  <EmployeeList 
                      employees={employees}
                      onEdit={(emp) => {
                          setEditingEmployee(emp);
                          setIsEmployeeFormOpen(true);
                      }}
                      onDelete={handleDeleteEmployee}
                      onSelect={setSelectedEmployee}
                  />
              </div>
          );
      default:
        return null;
    }
  };

  const shouldShowAddButton = () => {
    if (view === 'dashboard' || view === 'network' || globalError || selectedCustomer || selectedPlan || selectedTicket || selectedEmployee) return false;
    
    // Add permission checks
    if (view === 'settings') return false; 
    if (view === 'employees' && !hasPermission('manage_team')) return false;

    return true;
  };

  return (
    <Layout currentView={view} onViewChange={handleViewChange}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {getPageDescription()}
            </p>
          </div>
          
          {shouldShowAddButton() && (
            <button
              onClick={() => {
                  if (view === 'customers') setIsCustomerFormOpen(true);
                  else if (view === 'plans') { setEditingPlan(null); setIsPlanFormOpen(true); }
                  else if (view === 'employees') { setEditingEmployee(null); setIsEmployeeFormOpen(true); }
                  else openCreateTicketModal();
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="w-5 h-5 mr-2" />
              {view === 'customers' ? 'New Customer' : view === 'plans' ? 'New Plan' : view === 'employees' ? 'New Member' : 'New Ticket'}
            </button>
          )}
        </div>

        {renderContent()}

        {/* Create/Edit Ticket Modal */}
        {isTicketFormOpen && (
          <TicketForm
            isOpen={isTicketFormOpen}
            onClose={() => setIsTicketFormOpen(false)}
            onSubmit={editingTicket && editingTicket.id ? (data) => handleUpdateTicket(editingTicket.id!, data) : handleCreateTicket}
            initialData={editingTicket || undefined}
            isLoading={false}
            customers={customers}
            employees={employees}
          />
        )}

        {/* Create Customer Modal */}
        {isCustomerFormOpen && (
          <CustomerForm 
            isOpen={isCustomerFormOpen}
            onClose={() => setIsCustomerFormOpen(false)}
            onSubmit={handleCreateCustomer}
            plans={plans}
            currency={currency}
          />
        )}

        {/* Create/Edit Plan Modal */}
        {isPlanFormOpen && (
            <PlanForm
                isOpen={isPlanFormOpen}
                onClose={() => setIsPlanFormOpen(false)}
                onSubmit={handleCreatePlan}
                initialData={editingPlan || undefined}
                currency={currency}
            />
        )}

        {/* Create/Edit Device Modal */}
        {isDeviceFormOpen && (
            <DeviceForm
                isOpen={isDeviceFormOpen}
                onClose={() => setIsDeviceFormOpen(false)}
                onSubmit={editingDevice ? handleUpdateDevice : handleCreateDevice}
                initialData={editingDevice || undefined}
                customerId={deviceCustomerId}
            />
        )}
        
        {/* Create/Edit Employee Modal */}
        {isEmployeeFormOpen && (
            <EmployeeForm
                isOpen={isEmployeeFormOpen}
                onClose={() => setIsEmployeeFormOpen(false)}
                onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
                initialData={editingEmployee || undefined}
            />
        )}

      </div>
    </Layout>
  );
};
