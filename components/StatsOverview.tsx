import React, { useMemo } from 'react';
import { Ticket, TicketStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Ticket as TicketIcon, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  tickets: Ticket[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ tickets }) => {
  const stats = useMemo(() => {
    if (!tickets || !Array.isArray(tickets)) {
      return { total: 0, open: 0, inProgress: 0, closed: 0 };
    }
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      closed: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
    };
  }, [tickets]);

  const chartData = [
    { name: 'Open', value: stats.open, color: '#3b82f6' }, // blue-500
    { name: 'In Progress', value: stats.inProgress, color: '#f59e0b' }, // amber-500
    { name: 'Closed', value: stats.closed, color: '#22c55e' }, // green-500
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }: any) => (
    <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          title="Total Tickets" 
          value={stats.total} 
          icon={TicketIcon} 
          colorClass="text-primary-600" 
          bgClass="bg-primary-50" 
        />
        <StatCard 
          title="Open Issues" 
          value={stats.open} 
          icon={AlertCircle} 
          colorClass="text-blue-600" 
          bgClass="bg-blue-50" 
        />
        <StatCard 
          title="Resolved" 
          value={stats.closed} 
          icon={CheckCircle2} 
          colorClass="text-green-600" 
          bgClass="bg-green-50" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Status Distribution</h3>
          <TrendingUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10 }} 
                hide // Hiding axis for cleaner look in small card
              />
              <Tooltip 
                 cursor={{fill: 'transparent'}}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
            <span>Open</span>
            <span>In Progress</span>
            <span>Closed</span>
        </div>
      </div>
    </div>
  );
};
