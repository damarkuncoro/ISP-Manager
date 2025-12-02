import React, { useState } from 'react';
import { Copy, Check, Database, Server, ShieldCheck, Download, Globe } from 'lucide-react';
import { SETUP_SQL } from '../constants';
import { AVAILABLE_CURRENCIES } from '../utils/formatters';

interface SettingsViewProps {
  connectionStatus: 'connected' | 'error' | 'loading';
  currency: string;
  onCurrencyChange: (code: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  connectionStatus, 
  currency,
  onCurrencyChange
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopySQL = () => {
    navigator.clipboard.writeText(SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const blob = new Blob([SETUP_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-gray-500" />
                System Status
            </h3>
            </div>
            <div className="p-6">
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Database Connection</p>
                <div className="mt-2 flex items-center gap-2">
                <span className={`flex w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-900 font-medium">
                    {connectionStatus === 'connected' ? 'Connected to Supabase' : 'Connection Failed'}
                </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{import.meta.env.VITE_SUPABASE_URL}</p>
            </div>
            
            <div>
                <p className="text-sm font-medium text-gray-500">Environment</p>
                <div className="mt-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-gray-900">Production Mode</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">v1.0.0</p>
            </div>
            </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-500" />
                Regional Settings
            </h3>
            </div>
            <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Currency</label>
            <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
            >
                {AVAILABLE_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                    {c.label}
                </option>
                ))}
            </select>
            <p className="mt-2 text-xs text-gray-500">
                This currency setting is saved to your browser and affects how plan prices are displayed.
            </p>
            </div>
        </div>
        </div>

        {/* Database Setup Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-500" />
            Database Configuration (SQL)
            </h3>
            <div className="flex gap-2">
            <button
                onClick={handleDownloadSQL}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors shadow-sm"
            >
                <Download className="w-4 h-4" />
                Download .sql
            </button>
            <button
                onClick={handleCopySQL}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Script'}
            </button>
            </div>
        </div>
        <div className="p-6">
            <p className="text-sm text-gray-600 mb-4">
            Run the following SQL script in your Supabase SQL Editor to create the necessary tables, relationships, and security policies.
            This script matches your current application features (Customers, Tickets with Status/Priority constraints, and Plans).
            </p>
            <div className="relative group">
            <pre className="p-4 bg-slate-900 text-slate-300 rounded-lg text-xs font-mono overflow-x-auto border border-slate-700 leading-relaxed shadow-inner h-64">
                {SETUP_SQL}
            </pre>
            </div>
        </div>
      </div>
    </div>
  );
};