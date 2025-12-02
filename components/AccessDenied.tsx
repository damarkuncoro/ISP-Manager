
import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  onBack: () => void;
  requiredRole?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onBack, requiredRole }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="bg-red-50 p-6 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-500 max-w-md mb-8">
        You do not have permission to view this page. 
        {requiredRole && <span> This area is restricted to <strong>{requiredRole}</strong> roles.</span>}
      </p>
      <button
        onClick={onBack}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Dashboard
      </button>
    </div>
  );
};
