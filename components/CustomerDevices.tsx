import React from 'react';
import { NetworkDevice, DeviceStatus, DeviceType } from '../types';
import { Server, Wifi, Router, Box, Activity, Plus, MapPin, RefreshCw, AlertTriangle, CheckCircle, Globe, Edit2, Trash2 } from 'lucide-react';

interface CustomerDevicesProps {
  devices: NetworkDevice[];
  onAddDevice: () => void;
  onEditDevice: (device: NetworkDevice) => void;
  onDeleteDevice: (id: string) => void;
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
  return <Icon className="w-5 h-5 text-gray-500" />;
};

export const CustomerDevices: React.FC<CustomerDevicesProps> = ({ 
  devices, 
  onAddDevice, 
  onEditDevice, 
  onDeleteDevice 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-gray-900">Assigned Equipment</h3>
            <span className="bg-gray-100 border border-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                {devices.length}
            </span>
        </div>
        <button
            onClick={onAddDevice}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
            <Plus className="w-3 h-3 mr-1" />
            Add Device
        </button>
      </div>

      <div className="p-6">
        {devices.length === 0 ? (
           <div className="text-center py-8 text-gray-500">
              <Router className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No devices assigned to this customer.</p>
              <button 
                onClick={onAddDevice}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                 Assign a router or CPE
              </button>
           </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map(device => (
                 <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                             <DeviceIcon type={device.type} />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-gray-900">{device.name}</h4>
                             <p className="text-xs text-gray-500">{device.ip_address || 'No IP'}</p>
                          </div>
                       </div>
                       <DeviceStatusBadge status={device.status} />
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600 mt-2 pl-1">
                       <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{device.location || 'Location not specified'}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Activity className="w-3 h-3 text-gray-400" />
                          <span>Last Check: {new Date(device.last_check).toLocaleDateString()}</span>
                       </div>
                    </div>

                    <div className="mt-4 flex gap-2 justify-end border-t border-gray-50 pt-3">
                       <button 
                         onClick={() => onEditDevice(device)}
                         className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-primary-600"
                       >
                          <Edit2 className="w-3 h-3" /> Edit
                       </button>
                       <button 
                         onClick={() => onDeleteDevice(device.id)}
                         className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 ml-2"
                       >
                          <Trash2 className="w-3 h-3" /> Remove
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};