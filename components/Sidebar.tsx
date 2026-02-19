
import React from 'react';
import { OrgNode, UserRole } from '../types';
import { LogIn, LogOut, Download, Upload, Shield, Users, LayoutDashboard, CheckCircle } from 'lucide-react';

interface SidebarProps {
  data: OrgNode;
  userRole: UserRole;
  onLogin: () => void;
  onLogout: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ data, userRole, onLogin, onLogout, onExport, onImport }) => {
  const isAdmin = userRole === 'Admin';

  const renderList = (node: OrgNode, depth = 0) => {
    return (
      <div key={node.id} className="flex flex-col">
        <div 
          className={`flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors text-sm ${depth === 0 ? 'font-bold text-indigo-700' : ''}`}
          style={{ paddingLeft: `${depth * 1 + 0.5}rem` }}
        >
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${node.role === 'Manager' ? 'bg-indigo-500' : node.role === 'Lead' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          <span className="truncate" title={node.name}>{node.name}</span>
        </div>
        {node.children.map(child => renderList(child, depth + 1))}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col shadow-sm flex-shrink-0 z-30 relative overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-100">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 leading-tight tracking-tight">AURUS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Team Manager</p>
          </div>
        </div>

        <div className="space-y-3">
          {isAdmin ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2 px-4 rounded-xl text-xs font-bold border border-indigo-100">
                <CheckCircle size={14} />
                Admin Session Active
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2 px-4 rounded-xl transition-all text-sm shadow-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-md shadow-indigo-100 text-sm"
            >
              <LogIn size={16} />
              Admin Login
            </button>
          )}

          <div className="flex gap-2">
            <button 
              onClick={onExport}
              className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-2 rounded-lg text-xs transition-colors"
            >
              <Download size={14} /> Export
            </button>
            {isAdmin && (
              <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-2 rounded-lg text-xs transition-colors cursor-pointer text-center">
                <Upload size={14} /> Import
                <input type="file" className="hidden" accept=".json" onChange={onImport} />
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        <div className="flex items-center gap-2 px-2 mb-4 text-slate-400">
          <Users size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Quick Navigation</span>
        </div>
        <div className="space-y-0.5">
          {renderList(data)}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Shield size={12} />
            <span>Role: <strong className={isAdmin ? 'text-indigo-600' : ''}>{userRole}</strong></span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
