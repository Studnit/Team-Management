
import React, { useMemo } from 'react';
import { OrgNode, HierarchyStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, UserCheck } from 'lucide-react';

interface AnalyticsProps {
  data: OrgNode;
}

const Analytics: React.FC<AnalyticsProps> = ({ data }) => {
  const stats = useMemo(() => {
    const leads = data.children.length;
    let totalMembers = 0;
    const teamSizes = data.children.map(lead => {
      const count = lead.children.length;
      totalMembers += count;
      return { name: lead.name.split(' ')[0], count };
    });

    return { totalLeads: leads, totalMembers, teamSizes };
  }, [data]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="bg-indigo-50 p-4 rounded-xl text-indigo-600">
          <UserCheck size={28} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Total Leads</p>
          <p className="text-3xl font-bold text-slate-800">{stats.totalLeads}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl text-emerald-600">
          <Users size={28} />
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium">Total Members</p>
          <p className="text-3xl font-bold text-slate-800">{stats.totalMembers}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Team Distribution</h3>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.teamSizes}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.teamSizes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
