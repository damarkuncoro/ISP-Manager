import React, { useState, useEffect } from 'react';
import { Copy, Check, Database, Server, ShieldCheck, Download, Globe, Tag, Save, Plus, Trash2, Edit2, X } from 'lucide-react';
import { SETUP_SQL, SUPABASE_URL } from '../constants';
import { AVAILABLE_CURRENCIES } from '../utils/formatters';
import { TicketCategoryConfig } from '../types';
import { useCategories } from '../hooks/useCategories';

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
  const [activeTab, setActiveTab] = useState<'general' | 'categories'>('general');
  
  // Categories Logic
  const { categories, loadCategories, addCategory, editCategory, removeCategory } = useCategories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<TicketCategoryConfig>>({});

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const startEdit = (cat: TicketCategoryConfig) => {
    setFormData(cat);
    setEditingId(cat.id);
    setIsAdding(false);
  };

  const startAdd = () => {
    setFormData({ name: '', code: '', sla_hours: 24, description: '' });
    setEditingId(null);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setFormData({});
    setEditingId(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.sla_hours) {
        alert("Please fill in required fields (Name, Code, SLA)");
        return;
    }

    try {
        if (isAdding) {
            await addCategory(formData as any);
        } else if (editingId) {
            await editCategory(editingId, formData);
        }
        cancelEdit();
    } catch (e: any) {
        alert("Failed to save: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
      if(!window.confirm("Delete this category?")) return;
      try {
          await removeCategory(id);
      } catch (e: any) {
          alert("Failed to delete: " + e.message);
      }
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
                  {!isAdding && !editingId && (
                    <button 
                        onClick={startAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                  )}
              </div>
              
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code (Slug)</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">SLA (Hours)</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {isAdding && (
                              <tr className="bg-blue-50">
                                  <td className="px-6 py-4">
                                      <input 
                                        type="text" 
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                        placeholder="e.g. VoIP"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                      />
                                  </td>
                                  <td className="px-6 py-4">
                                      <input 
                                        type="text" 
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                        placeholder="e.g. voip_issue"
                                        value={formData.code || ''}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                                      />
                                  </td>
                                  <td className="px-6 py-4">
                                      <input 
                                        type="number" 
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border text-right"
                                        value={formData.sla_hours || 24}
                                        onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value)})}
                                      />
                                  </td>
                                  <td className="px-6 py-4">
                                      <input 
                                        type="text" 
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                        placeholder="Description..."
                                        value={formData.description || ''}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                      />
                                  </td>
                                  <td className="px-6 py-4 text-right whitespace-nowrap">
                                      <div className="flex gap-2 justify-end">
                                          <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save className="w-4 h-4" /></button>
                                          <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                                      </div>
                                  </td>
                              </tr>
                          )}
                          
                          {categories.map((cat) => (
                              <tr key={cat.id} className={`transition-colors ${editingId === cat.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                  <td className="px-6 py-4">
                                      {editingId === cat.id ? (
                                          <input 
                                            type="text" 
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                          />
                                      ) : (
                                          <div className="text-sm font-bold text-gray-900">{cat.name}</div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4">
                                      {editingId === cat.id ? (
                                          <input 
                                            type="text" 
                                            disabled // Code usually shouldn't change as it breaks relations
                                            className="block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm p-1 border text-gray-500 cursor-not-allowed"
                                            value={formData.code || ''}
                                          />
                                      ) : (
                                          <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded w-fit">{cat.code}</div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4">
                                      {editingId === cat.id ? (
                                          <div className="flex items-center">
                                              <input 
                                                type="number" 
                                                min="1"
                                                className="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border text-right mr-2"
                                                value={formData.sla_hours || 0}
                                                onChange={(e) => setFormData({...formData, sla_hours: parseInt(e.target.value) || 0})}
                                              />
                                              <span className="text-xs text-gray-500">hrs</span>
                                          </div>
                                      ) : (
                                          <div className="flex items-center">
                                              <span className={`text-sm font-bold mr-2 ${cat.sla_hours <= 4 ? 'text-red-600' : 'text-gray-700'}`}>{cat.sla_hours}</span>
                                              <span className="text-xs text-gray-500">hours</span>
                                          </div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4">
                                      {editingId === cat.id ? (
                                          <input 
                                            type="text" 
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-1 border"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                          />
                                      ) : (
                                          <div className="text-sm text-gray-500 truncate max-w-xs">{cat.description}</div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 text-right whitespace-nowrap">
                                      {editingId === cat.id ? (
                                          <div className="flex gap-2 justify-end">
                                              <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save className="w-4 h-4" /></button>
                                              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                                          </div>
                                      ) : (
                                          <div className="flex gap-2 justify-end">
                                              <button onClick={() => startEdit(cat)} className="text-primary-600 hover:text-primary-800"><Edit2 className="w-4 h-4" /></button>
                                              <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {categories.length === 0 && (
                      <div className="text-center py-8 text-gray-500 italic">No categories found. Add one or run SQL setup.</div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};