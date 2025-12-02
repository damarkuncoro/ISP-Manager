
import React, { useState } from 'react';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types';
import { ArrowLeft, Edit2, Trash2, User, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, Wifi, CreditCard, Router, Wrench, HelpCircle, FileText, Activity, Send, AlertTriangle, CheckSquare } from 'lucide-react';
import { useComments } from '../hooks/useComments';

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (id: string) => void;
  onCustomerClick: (customerId: string) => void;
}

const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const styles = {
    [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800 border-blue-200',
    [TicketStatus.IN_PROGRESS]: 'bg-amber-100 text-amber-800 border-amber-200',
    [TicketStatus.CLOSED]: 'bg-green-100 text-green-800 border-green-200',
  };
  
  const icons = {
    [TicketStatus.OPEN]: AlertCircle,
    [TicketStatus.IN_PROGRESS]: Clock,
    [TicketStatus.CLOSED]: CheckCircle2,
  };

  const Icon = icons[status] || AlertCircle;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
      <Icon className="w-4 h-4 mr-1.5" />
      {(status || 'OPEN').replace('_', ' ').toUpperCase()}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: TicketPriority }) => {
  const styles = {
    [TicketPriority.LOW]: 'text-gray-600 bg-gray-100',
    [TicketPriority.MEDIUM]: 'text-orange-700 bg-orange-50 ring-1 ring-inset ring-orange-600/20',
    [TicketPriority.HIGH]: 'text-red-700 bg-red-50 ring-1 ring-inset ring-red-600/10',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${styles[priority]}`}>
      {(priority || 'MEDIUM').toUpperCase()} Priority
    </span>
  );
};

const CategoryIcon = ({ category }: { category: TicketCategory }) => {
  const config = {
    [TicketCategory.INTERNET]: { icon: Wifi, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    [TicketCategory.BILLING]: { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    [TicketCategory.HARDWARE]: { icon: Router, color: 'text-purple-600', bg: 'bg-purple-50' },
    [TicketCategory.INSTALLATION]: { icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-50' },
    [TicketCategory.OTHER]: { icon: HelpCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
  };

  const cat = config[category] || config[TicketCategory.OTHER];
  const Icon = cat.icon;

  return (
    <div className={`p-2 rounded-lg ${cat.bg} ${cat.color} inline-block`}>
      <Icon className="w-6 h-6" />
    </div>
  );
};

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket, onBack, onEdit, onDelete, onCustomerClick }) => {
  const { comments, loading: commentsLoading, addComment } = useComments(ticket.id);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment(newComment);
      setNewComment('');
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEscalate = async () => {
    if(window.confirm("Escalate this ticket to Tier 2 Support?")) {
        await addComment("SYSTEM: Ticket escalated to Tier 2 due to critical impact.", "System");
        onEdit({...ticket, is_escalated: true, priority: TicketPriority.HIGH});
    }
  };
  
  const isOverdue = ticket.due_date && new Date(ticket.due_date) < new Date() && ticket.status !== TicketStatus.CLOSED;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-start gap-4">
          <button 
            onClick={onBack} 
            className="mt-1 p-2 hover:bg-white bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div>
             <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                {ticket.is_escalated && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-600 text-white animate-pulse">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        ESCALATED
                    </span>
                )}
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">#{String(ticket.id).slice(0,8)}</span>
             </div>
             <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
             <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created on {new Date(ticket.created_at).toLocaleString()}
             </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 self-end sm:self-start">
           {!ticket.is_escalated && ticket.status !== TicketStatus.CLOSED && (
               <button 
                onClick={handleEscalate}
                className="inline-flex items-center px-4 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
               >
                 <AlertTriangle className="w-4 h-4 mr-2" />
                 Escalate
               </button>
           )}
           <button 
             onClick={() => onEdit(ticket)}
             className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
           >
             <Edit2 className="w-4 h-4 mr-2" />
             Edit Ticket
           </button>
           <button 
             onClick={() => onDelete(ticket.id)}
             className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
           >
             <Trash2 className="w-4 h-4 mr-2" />
             Delete
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content: Description */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-gray-500" />
                 <h3 className="text-lg font-medium text-gray-900">Description</h3>
              </div>
              <div className="p-6">
                 <div className="flex gap-4">
                    <CategoryIcon category={ticket.category} />
                    <div className="prose prose-sm text-gray-600 max-w-none">
                       {ticket.description ? (
                         <p className="whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                       ) : (
                         <p className="text-gray-400 italic">No description provided.</p>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Resolution (Visible if Closed) */}
           {ticket.status === TicketStatus.CLOSED && (
               <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 overflow-hidden">
                   <div className="px-6 py-4 border-b border-green-100 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-green-700" />
                        <h3 className="text-lg font-medium text-green-800">Resolution</h3>
                   </div>
                   <div className="p-6 text-green-900">
                        {ticket.resolution_notes ? (
                            <p className="whitespace-pre-wrap">{ticket.resolution_notes}</p>
                        ) : (
                            <p className="italic text-green-700">No resolution notes recorded.</p>
                        )}
                   </div>
               </div>
           )}

           {/* Updates & Comments */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                 <Activity className="w-5 h-5 text-gray-500" />
                 <h3 className="text-lg font-medium text-gray-900">Updates & Comments</h3>
                 <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {comments.length}
                 </span>
              </div>
              
              <div className="p-6 space-y-6">
                 {/* Comment List */}
                 <div className="space-y-6">
                    {comments.length === 0 ? (
                       <div className="text-center py-6 text-gray-500 text-sm italic border-b border-gray-100 pb-8">
                          No updates yet. Start the conversation below.
                       </div>
                    ) : (
                       comments.map((comment) => (
                          <div key={comment.id} className="flex gap-4 group">
                             <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                                   {comment.author_name.charAt(0)}
                                </div>
                             </div>
                             <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                   <h4 className="text-sm font-bold text-gray-900">{comment.author_name}</h4>
                                   <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg rounded-tl-none">
                                   {comment.content}
                                </div>
                             </div>
                          </div>
                       ))
                    )}
                 </div>

                 {/* New Comment Form */}
                 <form onSubmit={handleSubmitComment} className="mt-6 flex gap-3 items-start">
                    <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold">
                           A
                        </div>
                    </div>
                    <div className="flex-1 relative">
                       <textarea
                          rows={2}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-3 resize-y min-h-[80px]"
                          placeholder="Add an update or internal note..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          disabled={isSubmittingComment}
                       />
                       <div className="mt-2 flex justify-end">
                          <button
                             type="submit"
                             disabled={!newComment.trim() || isSubmittingComment}
                             className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                             {isSubmittingComment ? 'Posting...' : (
                                <>
                                   <Send className="w-3 h-3 mr-1.5" />
                                   Post Update
                                </>
                             )}
                          </button>
                       </div>
                    </div>
                 </form>
              </div>
           </div>
        </div>

        {/* Sidebar: Metadata & Info */}
        <div className="space-y-6">
           {/* Assignment & SLA */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Ticket Info</h3>
               </div>
               <div className="p-4 space-y-4">
                   {/* Assigned To */}
                   <div>
                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Agent</span>
                       <div className="mt-1 flex items-center gap-2">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ticket.assigned_to ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                               {ticket.assigned_to ? ticket.assigned_to.charAt(0) : '?'}
                           </div>
                           <p className={`text-sm font-medium ${ticket.assigned_to ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                               {ticket.assigned_to || 'Unassigned'}
                           </p>
                       </div>
                   </div>
                   
                   {/* Due Date */}
                   <div>
                       <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date (SLA)</span>
                       <div className="mt-1 flex items-center gap-2">
                           <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                           <p className={`text-sm font-medium ${isOverdue ? 'text-red-600 font-bold' : ticket.due_date ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                               {ticket.due_date ? new Date(ticket.due_date).toLocaleDateString() : 'No Deadline'}
                           </p>
                           {isOverdue && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">OVERDUE</span>}
                       </div>
                   </div>

                   {/* Category */}
                   <div>
                     <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</span>
                     <p className="mt-1 text-sm font-medium text-gray-900 capitalize">{ticket.category.replace('_', ' ')}</p>
                  </div>
               </div>
           </div>

           {/* Customer Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                 <User className="w-5 h-5 text-gray-500" />
                 <h3 className="text-lg font-medium text-gray-900">Subscriber</h3>
              </div>
              {ticket.customer ? (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                        {ticket.customer.name.charAt(0)}
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900">{ticket.customer.name}</h4>
                        <p className="text-xs text-gray-500">{ticket.customer.email}</p>
                     </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                     {ticket.customer.address && (
                       <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <span>{ticket.customer.address}</span>
                       </div>
                     )}
                     {ticket.customer.subscription_plan && (
                       <div className="flex items-center gap-2 text-gray-600">
                          <Wifi className="w-4 h-4 text-gray-400" />
                          <span>{ticket.customer.subscription_plan}</span>
                       </div>
                     )}
                  </div>

                  <button 
                    onClick={() => ticket.customer?.id && onCustomerClick(ticket.customer.id)}
                    className="mt-6 w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    View Subscriber Profile
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500 text-sm italic">
                   No customer linked to this ticket.
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
