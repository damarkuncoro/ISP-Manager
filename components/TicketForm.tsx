import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory, Customer, Employee, TicketCategoryConfig } from '../types';
import { X, Save, User, Calendar, Briefcase, FileText, Tag, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TicketFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Partial<Ticket>;
  isLoading: boolean;
  customers: Customer[];
  employees: Employee[];
  categories: TicketCategoryConfig[]; // New Prop
}

export const TicketForm: React.FC<TicketFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  customers,
  employees,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>(TicketStatus.OPEN);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [category, setCategory] = useState<string>('internet_issue'); // Default fallback
  const [customerId, setCustomerId] = useState<string>('');
  
  // New Fields
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Determine if we are editing an existing ticket or creating a new one
  const isEditMode = !!(initialData && initialData.id);

  // Set default category on load if we have categories
  useEffect(() => {
      if (categories.length > 0 && !category) {
          setCategory(categories[0].code);
      }
  }, [categories]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || TicketStatus.OPEN);
      setPriority(initialData.priority || TicketPriority.MEDIUM);
      // Use existing code, or fallback to first category code
      setCategory(initialData.category || (categories.length > 0 ? categories[0].code : 'internet_issue'));
      setCustomerId(initialData.customer_id || '');
      setAssignedTo(initialData.assigned_to || '');
      setDueDate(initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '');
      setResolutionNotes(initialData.resolution_notes || '');
    } else {
      resetForm();
      if (categories.length > 0) {
          const defaultCat = categories[0];
          setCategory(defaultCat.code);
          updateDueDateFromSLA(defaultCat);
      }
    }
  }, [initialData, isOpen, categories]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(TicketStatus.OPEN);
    setPriority(TicketPriority.MEDIUM);
    // category reset handled in useEffect based on available categories
    setCustomerId('');
    setAssignedTo('');
    setDueDate('');
    setResolutionNotes('');
    setErrors({});
  };

  // Helper to calculate Due Date based on category SLA settings
  const updateDueDateFromSLA = (catConfig: TicketCategoryConfig) => {
      // Only auto-update if not in edit mode (don't overwrite existing due dates on edit)
      if (isEditMode) return;

      const date = new Date();
      date.setHours(date.getHours() + (catConfig.sla_hours || 24));
      setDueDate(date.toISOString().split('T')[0]);
  };

  const handleCategoryChange = (newCode: string) => {
      setCategory(newCode);
      const catConfig = categories.find(c => c.code === newCode);
      if (catConfig) {
          updateDueDateFromSLA(catConfig);
      }
  };

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!title.trim()) newErrors.title = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

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
    <div className="fixed inset-0 z-[80] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                    {isEditMode ? 'Edit Support Ticket' : 'New Support Ticket'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                    {isEditMode ? `Updating Ticket #${initialData?.id?.substring(0, 8)}` : 'Create a new ticket to track a customer issue.'}
                </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-200 p-2 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Issue Details */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="border-b border-gray-100 pb-2 mb-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-600" /> Issue Details
                            </h4>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="title"
                                className={`block w-full rounded-lg shadow-sm sm:text-sm p-2.5 border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}`}
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if(errors.title) setErrors({...errors, title: false});
                                }}
                                placeholder="e.g. No Internet Connection"
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">Subject is required.</p>}
                        </div>

                        <div>
                            <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">Subscriber</label>
                            <div className="relative">
                                <select
                                    id="customer"
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                >
                                    <option value="">-- Select Subscriber --</option>
                                    {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.address ? `• ${c.address}` : ''}
                                    </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Link this ticket to a customer record for history tracking.</p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                rows={6}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-3 border"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue, troubleshooting steps taken, and any error codes..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Triage & Assignment */}
                    <div className="space-y-5 lg:pl-6 lg:border-l lg:border-gray-100">
                        <div className="border-b border-gray-100 pb-2 mb-4">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Tag className="w-4 h-4 text-primary-600" /> Triage
                            </h4>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Priority</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`px-2 py-2 text-xs font-medium rounded-md border text-center transition-all ${
                                            priority === p
                                            ? p === TicketPriority.HIGH 
                                                ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-500' 
                                                : p === TicketPriority.MEDIUM 
                                                    ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-500' 
                                                    : 'bg-gray-100 border-gray-300 text-gray-800 ring-1 ring-gray-500'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {p.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                id="category"
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                value={category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                {categories.length > 0 ? (
                                    categories.map((cat) => (
                                        <option key={cat.id} value={cat.code}>
                                            {cat.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="internet_issue">Internet Issue (Default)</option>
                                )}
                            </select>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <div className="relative">
                                <select
                                    id="status"
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TicketStatus)}
                                >
                                    <option value={TicketStatus.OPEN}>Open</option>
                                    <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                                    <option value={TicketStatus.CLOSED}>Closed</option>
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    {status === TicketStatus.OPEN && <AlertCircle className="h-4 w-4 text-blue-500" />}
                                    {status === TicketStatus.IN_PROGRESS && <Clock className="h-4 w-4 text-amber-500" />}
                                    {status === TicketStatus.CLOSED && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">Assigned Agent</label>
                            <div className="relative">
                                <select
                                    id="assignedTo"
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none"
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
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    id="dueDate"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                            {!isEditMode && (
                                <p className="text-xs text-gray-400 mt-1">Auto-calculated based on category SLA.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resolution Notes - Full Width, Conditional */}
                <div className={`mt-6 transition-all duration-500 ease-in-out overflow-hidden ${status === TicketStatus.CLOSED ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                        <label htmlFor="resolution" className="block text-sm font-bold text-green-800 mb-2 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Resolution Notes
                        </label>
                        <textarea
                            id="resolution"
                            rows={3}
                            className="block w-full rounded-md border-green-200 shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm border p-3"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            placeholder="Describe how the issue was resolved..."
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center rounded-b-xl">
                <div className="text-xs text-gray-500">
                    <span className="text-red-500">*</span> Required fields
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {isEditMode ? 'Update Ticket' : 'Create Ticket'}
                        </>
                        )}
                    </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};