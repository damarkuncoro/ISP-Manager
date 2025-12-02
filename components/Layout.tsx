import React from 'react';
import { LayoutDashboard, Ticket as TicketIcon, Settings, Menu, X, Bell, Users, Wifi, Server } from 'lucide-react';
import { APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings';
  onViewChange: (view: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: 'dashboard' | 'tickets' | 'customers' | 'plans' | 'network' | 'settings', icon: any, label: string }) => (
    <button
      onClick={() => {
        onViewChange(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
        currentView === view
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${currentView === view ? 'text-primary-600' : 'text-gray-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Nexus ISP</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="tickets" icon={TicketIcon} label="All Tickets" />
          <NavItem view="customers" icon={Users} label="Subscribers" />
          <NavItem view="plans" icon={Wifi} label="Service Plans" />
          <NavItem view="network" icon={Server} label="Network Devices" />
        </div>

        <div className="p-4 border-t border-gray-100">
          <NavItem view="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed w-full bg-white z-20 border-b border-gray-200 h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="text-lg font-bold text-gray-900">Nexus ISP</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-gray-800 bg-opacity-50 pt-16">
          <div className="bg-white w-full h-auto pb-6 shadow-xl rounded-b-2xl">
            <div className="px-4 py-2 space-y-1">
               <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
               <NavItem view="tickets" icon={TicketIcon} label="All Tickets" />
               <NavItem view="customers" icon={Users} label="Subscribers" />
               <NavItem view="plans" icon={Wifi} label="Service Plans" />
               <NavItem view="network" icon={Server} label="Network Devices" />
               <div className="border-t border-gray-100 my-2 pt-2">
                 <NavItem view="settings" icon={Settings} label="Settings" />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        {/* Top Navbar (Desktop) */}
        <div className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 sticky top-0 z-10">
           <div className="text-sm text-gray-500">
              Welcome back, <span className="font-semibold text-gray-900">Admin</span>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                AD
              </div>
           </div>
        </div>
        
        {children}
      </main>
    </div>
  );
};