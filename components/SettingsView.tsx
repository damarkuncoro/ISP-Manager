
import React, { useState, useEffect } from 'react';
import { Copy, Check, Database, Server, ShieldCheck, Download, Globe, Tag, Save } from 'lucide-react';
import { SETUP_SQL, SUPABASE_URL } from '../constants';
import { AVAILABLE_CURRENCIES } from '../utils/formatters';
import { TicketCategory } from '../types';

interface SettingsViewProps {
  connectionStatus: 'connected' | 'error' | 'loading';
  currency: string;
  onCurrencyChange: (code: string) => void;
}

// Configuration interface for categories
interface CategoryConfig {
  id: TicketCategory;
  label: string;
  slaHours: number;
  description: string;
}

// Default configuration
const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: TicketCategory.INTERNET, label: 'Internet Issue', slaHours: 4, description: 'Connectivity problems, slow speeds, packet loss.' },
  { id: TicketCategory.BILLING, label: 'Billing', slaHours: 24, description: 'Invoice inquiries, payment issues, plan changes.' },
  { id: TicketCategory.HARDWARE, label: 'Hardware', slaHours: 48, description: 'Router malfunction, cable breaks, equipment replacement.' },
  { id: TicketCategory.INSTALLATION, label: 'Installation', slaHours: 72, description: 'New service setup, moving services.' },
  { id: TicketCategory.OTHER, label: 'Other', slaHours: 24, description: 'General inquiries and feedback.' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  connectionStatus, 
  currency,
  onCurrencyChange
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'categories'>('general');
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Load category settings from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('nexus_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all enum values exist if new ones were added
        const merged = DEFAULT_CATEGORIES.map(def => {
            const existing = parsed.find((p: any) => p.id === def.id);
            return existing || def;
        });
        setCategories(merged);
      } catch (e) {
        console.error("Failed to parse saved categories");
      }
    }
  }, []);

  const handleSaveCategories = () => {
    localStorage.setItem('nexus_categories', JSON.stringify(categories));
    setEditingCategory(null);
    alert("Category configurations saved successfully! New tickets will use these SLA settings.");
  };

  const updateCategory = (id: string, field: keyof CategoryConfig, value: any) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
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
      
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            General & System
        </button>
        <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'categories' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            Ticket Categories & SLA
        </button>
      </div>

      {activeTab === 'general' && (
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
                    <p className="text-xs text-gray-400 mt-1 truncate">{SUPABASE_URL}</p>
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

            {/* Database Setup Card */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
      )}

      {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-gray-500" />
                        Ticket Categories & SLA
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Configure default service level agreements (SLA) for each category.</p>
                  </div>
                  {editingCategory && (
                    <button 
                        onClick={handleSaveCategories}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                  )}
              </div>
              
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category ID</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">SLA (Hours)</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {categories.map((cat) => (
                              <tr key={cat.id} className={`transition-colors ${editingCategory === cat.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                  <td className="px-6 py-4">
                                      <div className="text-sm font-bold text-gray-900">{cat.label}</div>
                                      <div className="text-xs text-gray-400 font-mono mt-0.5">{cat.id}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="flex items-center">
                                          {editingCategory === cat.id ? (
                                              <input 
                                                type="number" 
                                                min="1"
                                                className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border text-right mr-2"
                                                value={cat.slaHours}
                                                onChange={(e) => updateCategory(cat.id, 'slaHours', parseInt(e.target.value) || 0)}
                                              />
                                          ) : (
                                              <span className={`text-sm font-bold mr-2 ${cat.slaHours <= 4 ? 'text-red-600' : 'text-gray-700'}`}>{cat.slaHours}</span>
                                          )}
                                          <span className="text-xs text-gray-500">hours</span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      {editingCategory === cat.id ? (
                                          <input 
                                            type="text" 
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                            value={cat.description}
                                            onChange={(e) => updateCategory(cat.id, 'description', e.target.value)}
                                          />
                                      ) : (
                                          <div className="text-sm text-gray-500">{cat.description}</div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      {editingCategory === cat.id ? (
                                          <div className="flex gap-2 justify-end">
                                              <button 
                                                onClick={handleSaveCategories}
                                                className="text-green-600 hover:text-green-800 text-sm font-medium"
                                              >
                                                  Save
                                              </button>
                                          </div>
                                      ) : (
                                          <button 
                                            onClick={() => setEditingCategory(cat.id)}
                                            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                          >
                                              Edit
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 italic">
                      Note: Changes to SLA times will affect the default due date for new tickets created under these categories.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};
