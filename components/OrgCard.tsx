
import React from 'react';
import { OrgNode } from '../types';
import { ChevronDown, ChevronRight, MoreVertical, User, UserCheck, Users } from 'lucide-react';

interface OrgCardProps {
  node: OrgNode;
  isAdmin: boolean;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  onToggleExpand?: (id: string) => void;
  // Use React.DragEvent instead of undefined DragStartEvent
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  // Use React.DragEvent instead of undefined DragOverEvent
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
}

const getMemberColor = (name: string) => {
  const colors = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-pink-50 text-pink-700 border-pink-200',
    'bg-orange-50 text-orange-700 border-orange-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-cyan-50 text-cyan-700 border-cyan-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-teal-50 text-teal-700 border-teal-200'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const OrgCard: React.FC<OrgCardProps> = ({ 
  node, 
  isAdmin, 
  onContextMenu, 
  onToggleExpand,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const isManager = node.role === 'Manager';
  const isLead = node.role === 'Lead';
  const isMember = node.role === 'Member';

  const baseColors = {
    Manager: 'bg-indigo-600 text-white border-indigo-700 shadow-indigo-100',
    Lead: 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-100',
    Member: getMemberColor(node.name)
  };

  const Icon = isManager ? UserCheck : isLead ? Users : User;

  return (
    <div 
      draggable={isAdmin && isMember}
      onDragStart={(e) => onDragStart?.(e, node.id)}
      onDragOver={isLead ? onDragOver : undefined}
      onDrop={isLead ? (e) => onDrop?.(e, node.id) : undefined}
      className={`
        relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
        min-w-[220px] max-w-[280px] group select-none
        ${baseColors[node.role]}
        ${isAdmin && isMember ? 'cursor-grab active:cursor-grabbing hover:scale-105 hover:z-10' : 'cursor-default'}
        ${isLead && isAdmin ? 'hover:border-dashed hover:border-emerald-400' : ''}
        shadow-sm hover:shadow-md
      `}
      onContextMenu={(e) => onContextMenu(e, node.id)}
    >
      <div className={`p-2 rounded-lg ${isMember ? 'bg-white/50' : 'bg-white/20'}`}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <h3 className="font-bold text-sm leading-tight truncate pr-6" title={node.name}>
          {node.name}
        </h3>
        <p className={`text-[10px] font-bold uppercase tracking-wider opacity-70`}>
          {node.role}
        </p>
      </div>

      {isLead && (
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleExpand?.(node.id); }}
          className="ml-2 p-1 rounded-md hover:bg-black/5 transition-colors"
        >
          {node.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      {isAdmin && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={14} className="opacity-50" />
        </div>
      )}
    </div>
  );
};

export default OrgCard;
