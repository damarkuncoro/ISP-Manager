import React, { useState, useEffect } from 'react';
import { NetworkDevice, DeviceType, DeviceStatus } from '../types';
import { X, Save, Server } from 'lucide-react';

interface DeviceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: NetworkDevice;
  customerId?: string; // New optional prop for linking to a customer
}

export const DeviceForm: React.FC<DeviceFormProps> = ({ isOpen, onClose, onSubmit, initialData, customerId }) => {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [type, setType] = useState<DeviceType>(DeviceType.ROUTER);
  const [status, setStatus] = useState<DeviceStatus>(DeviceStatus.ONLINE);
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setIpAddress(initialData.ip_address || '');
      setType(initialData.type);
      setStatus(initialData.status);
      setLocation(initialData.location || '');
    } else {
      setName('');
      setIpAddress('');
      setType(customerId ? DeviceType.CPE : DeviceType.ROUTER); // Default to CPE if adding for a customer
      setStatus(DeviceStatus.ONLINE);
      setLocation(customerId ? 'Customer Premises' : '');
    }
  }, [initialData, isOpen, customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        ip_address: ipAddress,
        type,
        status,
        location,
        customer_id: customerId // Include customer ID in submission
      });
      onClose();
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {initialData ? 'Edit Network Device' : customerId ? 'Add Subscriber Device' : 'Add Network Device'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Device Name</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Server className="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     type="text"
                     required
                     className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md border p-2"
                     placeholder={customerId ? "e.g. Living Room Router" : "e.g. Core Router 01"}
                     value={name}
                     onChange={e => setName(e.target.value)}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">IP Address</label>
                <input
                  type="text"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                  placeholder="192.168.1.1"
                  value={ipAddress}
                  onChange={e => setIpAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={type}
                      onChange={e => setType(e.target.value as DeviceType)}
                    >
                      <option value={DeviceType.CPE}>CPE / Access Point</option>
                      <option value={DeviceType.ROUTER}>Router</option>
                      <option value={DeviceType.SWITCH}>Switch</option>
                      <option value={DeviceType.OLT}>OLT</option>
                      <option value={DeviceType.SERVER}>Server</option>
                      <option value={DeviceType.OTHER}>Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      value={status}
                      onChange={e => setStatus(e.target.value as DeviceStatus)}
                    >
                      <option value={DeviceStatus.ONLINE}>Online</option>
                      <option value={DeviceStatus.OFFLINE}>Offline</option>
                      <option value={DeviceStatus.WARNING}>Warning</option>
                      <option value={DeviceStatus.MAINTENANCE}>Maintenance</option>
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                <input
                  type="text"
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md border p-2"
                  placeholder={customerId ? "e.g. Installation Address" : "Data Center A, Rack 2"}
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <div className="mt-5 sm:mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Device
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};