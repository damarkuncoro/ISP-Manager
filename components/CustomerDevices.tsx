
import React, { useState } from 'react';
import { NetworkDevice, DeviceStatus, DeviceType } from '../types';
import { Server, Wifi, Router, Box, Activity, Plus, MapPin, RefreshCw, AlertTriangle, CheckCircle, Globe, Edit2, Trash2, X, Clock, Hash, Cpu, Signal, Monitor } from 'lucide-react';

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

const DeviceIcon = ({ type, className = "w-5 h-5" }: { type: DeviceType, className?: string }) => {
  const icons = {
    [DeviceType.ROUTER]: Router,
    [DeviceType.SWITCH]: Box,
    [DeviceType.OLT]: Server,
    [DeviceType.SERVER]: Globe,
    [DeviceType.CPE]: Wifi,
    [DeviceType.OTHER]: Activity,
  };
  const Icon = icons[type] || Activity;
  return <Icon className={`${className} text-gray-500`} />;
};

interface DeviceDetailModalProps {
  device: NetworkDevice;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const DeviceDetailModal: React.FC<DeviceDetailModalProps> = ({ device, onClose, onEdit, onDelete }) => {
  // Use real data where available, fallback to placeholders for demo visual richness
  const displayStats = {
      uptime: '14d 2h 15m', // Placeholder for live data
      latency: '12ms',       // Placeholder
      packetLoss: '0%',      // Placeholder
      firmware: device.firmware_version || 'N/A',
      serial: device.serial_number || 'N/A',
      model: device.model || 'Standard Device'
  };

  const mockLogs = [
      { id: 1, time: 'Today, 09:41 AM', event: 'Connection established', type: 'success' },
      { id: 2, time: 'Yesterday, 11:30 PM', event: 'Scheduled maintenance check', type: 'info' },
      { id: 3, time: 'Yesterday, 04:15 PM', event: 'IP Address renewed', type: 'info' },
  ];

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <DeviceIcon type={device.type} className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg leading-6 font-bold text-gray-900">{device.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{device.ip_address || '0.0.0.0'}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="p-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Current Status</p>
                        <DeviceStatusBadge status={device.status} />
                    </div>
                    <div className="text-right">
                         <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Last Seen</p>
                         <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(device.last_check).toLocaleString()}
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Technical Details */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-primary-500" /> Technical Specs
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-500">Device Type</span>
                                <span className="text-sm font-medium text-gray-900 capitalize">{device.type}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-500">Model</span>
                                <span className="text-sm font-medium text-gray-900">{displayStats.model}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-500">Serial Number</span>
                                <span className="text-sm font-medium text-gray-900 font-mono">{displayStats.serial}</span>
                            </div>
                             <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-sm text-gray-500">Firmware</span>
                                <span className="text-sm font-medium text-gray-900">{displayStats.firmware}</span>
                            </div>
                             <div className="flex justify-between pt-1">
                                <span className="text-sm text-gray-500">Location</span>
                                <span className="text-sm font-medium text-gray-900">{device.location || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Stats */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary-500" /> Performance
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-gray-200 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 mb-1">Uptime</p>
                                <p className="text-sm font-bold text-gray-900">{displayStats.uptime}</p>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 mb-1">Latency</p>
                                <p className="text-sm font-bold text-gray-900 text-green-600">{displayStats.latency}</p>
                            </div>
                             <div className="bg-white border border-gray-200 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 mb-1">Signal</p>
                                <p className="text-sm font-bold text-gray-900">-45 dBm</p>
                            </div>
                             <div className="bg-white border border-gray-200 p-3 rounded-lg text-center">
                                <p className="text-xs text-gray-500 mb-1">Packet Loss</p>
                                <p className="text-sm font-bold text-gray-900">{displayStats.packetLoss}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="mb-8">
                     <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-primary-500" /> Recent Activity
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        {mockLogs.map(log => (
                            <div key={log.id} className="flex items-start gap-3 text-sm">
                                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                <div>
                                    <p className="text-gray-900 font-medium">{log.event}</p>
                                    <p className="text-xs text-gray-500">{log.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        onClick={() => {
                            onDelete();
                            onClose();
                        }}
                        className="flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Device
                    </button>
                    <button 
                        onClick={() => {
                            onEdit();
                            onClose();
                        }}
                        className="flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Configuration
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const CustomerDevices: React.FC<CustomerDevicesProps> = ({ 
  devices, 
  onAddDevice, 
  onEditDevice, 
  onDeleteDevice 
}) => {
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);

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
                 <div 
                    key={device.id} 
                    onClick={() => setSelectedDevice(device)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group bg-white hover:border-primary-200"
                 >
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                             <DeviceIcon type={device.type} className="w-5 h-5 group-hover:text-primary-600" />
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary-700">{device.name}</h4>
                             <p className="text-xs text-gray-500 font-mono">{device.ip_address || 'No IP'}</p>
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

                    <div className="mt-4 flex gap-2 justify-end border-t border-gray-50 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             onEditDevice(device);
                         }}
                         className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-primary-600 px-2 py-1 rounded hover:bg-gray-100"
                       >
                          <Edit2 className="w-3 h-3" /> Edit
                       </button>
                       <button 
                         onClick={(e) => {
                             e.stopPropagation();
                             onDeleteDevice(device.id);
                         }}
                         className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                       >
                          <Trash2 className="w-3 h-3" /> Remove
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDevice && (
          <DeviceDetailModal 
            device={selectedDevice} 
            onClose={() => setSelectedDevice(null)}
            onEdit={() => onEditDevice(selectedDevice)}
            onDelete={() => onDeleteDevice(selectedDevice.id)}
          />
      )}
    </div>
  );
};