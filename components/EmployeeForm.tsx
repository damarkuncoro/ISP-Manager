
import React, { useState, useEffect } from 'react';
import { Employee, EmployeeRole, EmployeeStatus } from '../types';
import { X, Save } from 'lucide-react';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Employee;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<EmployeeRole>(EmployeeRole.SUPPORT);
  const [status, setStatus] = useState<EmployeeStatus>(EmployeeStatus.ACTIVE);
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRole(initialData.role);
      setStatus(initialData.status);
      setPhone(initialData.phone || '');
      setDepartment(initialData.department || '');
    } else {
      setName('');
      setEmail('');
      setRole(EmployeeRole.SUPPORT);
      setStatus(EmployeeStatus.ACTIVE);
      setPhone('');
      setDepartment('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        role,
        status,
        phone: phone || undefined,
        department: department || undefined,
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
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {initialData ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@nexus-isp.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={role}
                        onChange={e => setRole(e.target.value as EmployeeRole)}
                    >
                        <option value={EmployeeRole.SUPPORT}>Support Agent</option>
                        <option value={EmployeeRole.TECHNICIAN}>Technician</option>
                        <option value={EmployeeRole.MANAGER}>Manager</option>
                        <option value={EmployeeRole.ADMIN}>Administrator</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={status}
                        onChange={e => setStatus(e.target.value as EmployeeStatus)}
                    >
                        <option value={EmployeeStatus.ACTIVE}>Active</option>
                        <option value={EmployeeStatus.INACTIVE}>Inactive</option>
                        <option value={EmployeeStatus.ON_LEAVE}>On Leave</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <input
                        type="text"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="e.g. Field Ops"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                        type="tel"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-2"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                    />
                 </div>
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
                      Save Member
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
