
import React from 'react';
import { ContextMenuState, Role } from '../types';
import { Edit2, Plus, Trash2, Maximize2, Minimize2, ArrowUp, ArrowDown } from 'lucide-react';

interface ContextMenuProps {
  state: ContextMenuState;
  role: Role;
  onAction: (action: string, id: string) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ state, role, onAction, onClose }) => {
  if (!state.visible) return null;

  const isManager = role === 'Manager';
  const isLead = role === 'Lead';
  const isMember = role === 'Member';

  const items = [
    { label: 'Rename', icon: Edit2, action: 'rename', show: true },
    { label: 'Add Lead', icon: Plus, action: 'add_lead', show: isManager },
    { label: 'Add Member', icon: Plus, action: 'add_member', show: isLead },
    { label: 'Move Up', icon: ArrowUp, action: 'move_up', show: !isManager },
    { label: 'Move Down', icon: ArrowDown, action: 'move_down', show: !isManager },
    { label: 'Expand', icon: Maximize2, action: 'expand', show: isLead },
    { label: 'Collapse', icon: Minimize2, action: 'collapse', show: isLead },
    { label: 'Delete', icon: Trash2, action: 'delete', show: !isManager, danger: true },
  ];

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }} 
      />
      <div 
        className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 min-w-[180px] animate-in fade-in zoom-in duration-100"
        style={{ top: state.y, left: state.x }}
      >
        {items.filter(i => i.show).map((item) => (
          <button
            key={item.action}
            onClick={() => { onAction(item.action, state.nodeId); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'}`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export default ContextMenu;
