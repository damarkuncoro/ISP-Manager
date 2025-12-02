import React, { useState } from 'react';
import { NetworkDevice, DeviceStatus, DeviceType } from '../types';
import { Server, Wifi, Router, Box, Activity, Plus, Search, MapPin, Globe, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface NetworkViewProps {
  devices: NetworkDevice[];
  onAddDevice: () => void;
  onEditDevice: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string) => void;
  onRefresh: () => void;
}

const DeviceStatusBadge = ({ status }: { status: DeviceStatus }) => {
  const config = {
    [DeviceStatus.ONLINE]: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    [DeviceStatus.OFFLINE]: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    [DeviceStatus.WARNING]: { color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
    [DeviceStatus.MAINTENANCE]: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
  };
  const { color, icon: Icon } = config[status] || config[DeviceStatus.OFFLINE];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.toUpperCase()}
    </span>
  );
};

const DeviceIcon = ({ type }: { type: DeviceType }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.SERVER]: Globe,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className="w-6 h-6 text-gray-500" />;
};

export const NetworkView: React.FC<NetworkViewProps> = ({ 
  devices, 
  onAddDevice, 
  onEditDevice, 
  onDeleteDevice,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.ip_address?.includes(searchTerm) ||
    d.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === DeviceStatus.ONLINE).length,
    offline: devices.filter(d => d.status === DeviceStatus.OFFLINE).length,
    warning: devices.filter(d => d.status === DeviceStatus.WARNING).length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-gray-500">Total Devices</p>
               <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
               <Server className="w-6 h-6 text-gray-600" />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-gray-500">Online</p>
               <p className="text-2xl font-bold text-green-600 mt-1">{stats.online}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
               <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-gray-500">Offline</p>
               <p className="text-2xl font-bold text-red-600 mt-1">{stats.offline}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
               <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-gray-500">Warning</p>
               <p className="text-2xl font-bold text-amber-600 mt-1">{stats.warning}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg">
               <Activity className="w-6 h-6 text-amber-600" />
            </div>
         </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search devices, IP, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <button 
             onClick={onRefresh}
             className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
           >
             <RefreshCw className="w-4 h-4" />
             Check Status
           </button>
           <button 
             onClick={onAddDevice}
             className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
           >
             <Plus className="w-4 h-4" />
             Add Device
           </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredDevices.map(device => (
            <div key={device.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
               <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <DeviceIcon type={device.type} />
                     </div>
                     <DeviceStatusBadge status={device.status} />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 truncate">{device.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{device.ip_address || 'No IP Configured'}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{device.location || 'Unspecified Location'}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <span>Type: {device.type.toUpperCase()}</span>
                     </div>
                  </div>
               </div>
               <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                  <span>Checked: {new Date(device.last_check).toLocaleTimeString()}</span>
                  <div className="flex gap-2">
                     <button onClick={() => onEditDevice(device)} className="text-primary-600 hover:text-primary-800 font-medium">Edit</button>
                     <button onClick={() => onDeleteDevice(device.id)} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </div>
               </div>
            </div>
         ))}
         
         {filteredDevices.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
               <Server className="w-12 h-12 text-gray-300 mx-auto mb-3" />
               <h3 className="text-sm font-medium text-gray-900">No devices found</h3>
               <p className="text-sm text-gray-500">Add network devices to start monitoring.</p>
            </div>
         )}
      </div>
    </div>
  );
};