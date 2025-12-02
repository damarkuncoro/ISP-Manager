
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, Customer, Employee } from '../types';
import { X, Save, User, Calendar, Briefcase } from 'lucide-react';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Partial<Ticket>;
  isLoading: boolean;
  customers: Customer[];
  employees: Employee[];
}

export const TicketForm: React.FC<TicketFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  customers,
  employees
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>(TicketStatus.OPEN);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.INTERNET);
  const [customerId, setCustomerId] = useState<string>('');
  
  // New Fields
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if we are editing an existing ticket or creating a new one
  const isEditMode = !!(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || TicketStatus.OPEN);
      setPriority(initialData.priority || TicketPriority.MEDIUM);
      setCategory(initialData.category || TicketCategory.INTERNET);
      setCustomerId(initialData.customer_id || '');
      setAssignedTo(initialData.assigned_to || '');
      // Format date for input[type="date"]
      setDueDate(initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '');
      setResolutionNotes(initialData.resolution_notes || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus(TicketStatus.OPEN);
      setPriority(TicketPriority.MEDIUM);
      setCategory(TicketCategory.INTERNET);
      setCustomerId('');
      setAssignedTo('');
      setDueDate('');
      setResolutionNotes('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        title, 
        description, 
        status, 
        priority,
        category,
        customer_id: customerId === '' ? null : customerId,
        assigned_to: assignedTo || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        resolution_notes: resolutionNotes || null
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {isEditMode ? 'Edit Support Ticket' : 'Create New Support Ticket'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Issue Subject</label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. No Internet Connection"
                />
              </div>

              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Subscriber (Optional)</label>
                <div className="relative mt-1">
                  <select
                    id="customer"
                    className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                  >
                    <option value="">-- Select Subscriber --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.address ? `(${c.address})` : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                     <User className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Detailed Description</label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the problem, error lights on router, etc..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To</label>
                    <div className="relative mt-1">
                      <select
                        id="assignedTo"
                        className="block w-full py-2 pl-3 pr-10 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                      >
                        <option value="">-- Unassigned --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name} ({emp.role})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                         <Briefcase className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                 </div>
                 <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                    <div className="relative mt-1">
                        <input
                        type="date"
                        id="dueDate"
                        className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        />
                         <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <Calendar className="h-4 w-4 text-gray-400" />
                         </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="category"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  >
                    <option value={TicketCategory.INTERNET}>Internet Issue</option>
                    <option value={TicketCategory.BILLING}>Billing</option>
                    <option value={TicketCategory.HARDWARE}>Hardware / Router</option>
                    <option value={TicketCategory.INSTALLATION}>Installation</option>
                    <option value={TicketCategory.OTHER}>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    id="status"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  >
                    <option value={TicketStatus.OPEN}>Open</option>
                    <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                    <option value={TicketStatus.CLOSED}>Closed</option>
                  </select>
                </div>
              </div>
              
              <div>
                 <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    id="priority"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  >
                    <option value={TicketPriority.LOW}>Low</option>
                    <option value={TicketPriority.MEDIUM}>Medium</option>
                    <option value={TicketPriority.HIGH}>High</option>
                  </select>
              </div>

              {/* Only show resolution notes if ticket is closed or user wants to close it */}
              {(status === TicketStatus.CLOSED || isEditMode) && (
                  <div className={`transition-all duration-300 ${status === TicketStatus.CLOSED ? 'opacity-100' : 'opacity-70'}`}>
                      <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 flex justify-between">
                          Resolution Notes
                          {status !== TicketStatus.CLOSED && <span className="text-xs text-gray-400 font-normal">(Visible when closed)</span>}
                      </label>
                      <textarea
                        id="resolution"
                        rows={3}
                        className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Explain how the issue was resolved..."
                      />
                  </div>
              )}

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
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Update Ticket' : 'Create Ticket'}
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
