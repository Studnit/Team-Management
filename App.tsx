
import React, { useState, useEffect, useCallback } from 'react';
import { OrgNode, UserRole, ContextMenuState } from './types';
import { INITIAL_DATA, STORAGE_KEY, ADMIN_PASSWORD } from './constants';
import { updateNode, addNode, removeNode, findNode, findParent, moveMember, generateId } from './utils/hierarchy';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import OrgCard from './components/OrgCard';
import ContextMenu from './components/ContextMenu';

const App: React.FC = () => {
  const [data, setData] = useState<OrgNode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [userRole, setUserRole] = useState<UserRole>('Viewer');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, nodeId: '', visible: false });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleLogin = useCallback(() => {
    const pass = window.prompt('Enter Admin Password:');
    if (pass === ADMIN_PASSWORD) {
      setUserRole('Admin');
    } else if (pass !== null) {
      alert('Incorrect password. Use: admin123');
    }
  }, []);

  const handleLogout = useCallback(() => setUserRole('Viewer'), []);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurus-team-hierarchy.json`;
    a.click();
  }, [data]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.role === 'Manager') {
          setData(json);
        } else {
          alert('Invalid hierarchy format');
        }
      } catch (err) {
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleShift = (id: string, direction: 'up' | 'down') => {
    const parent = findParent(data, id);
    if (!parent) return;

    const children = [...parent.children];
    const index = children.findIndex(c => c.id === id);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      [children[index], children[index - 1]] = [children[index - 1], children[index]];
    } else if (direction === 'down' && index < children.length - 1) {
      [children[index], children[index + 1]] = [children[index + 1], children[index]];
    } else {
      return;
    }

    setData(prev => updateNode(prev, parent.id, { children }));
  };

  const handleAction = (action: string, id: string) => {
    if (userRole !== 'Admin') return;

    if (action === 'rename') {
      const node = findNode(data, id);
      const newName = prompt('Enter new name:', node?.name);
      if (newName) setData(prev => updateNode(prev, id, { name: newName }));
    } else if (action === 'add_lead') {
      const name = prompt('Enter lead name:');
      if (name) setData(prev => addNode(prev, id, { id: generateId(), name, role: 'Lead', expanded: true, children: [] }));
    } else if (action === 'add_member') {
      const name = prompt('Enter member name:');
      if (name) setData(prev => addNode(prev, id, { id: generateId(), name, role: 'Member', children: [] }));
    } else if (action === 'delete') {
      if (confirm('Are you sure you want to delete this node?')) {
        setData(prev => removeNode(prev, id));
      }
    } else if (action === 'expand') {
      setData(prev => updateNode(prev, id, { expanded: true }));
    } else if (action === 'collapse') {
      setData(prev => updateNode(prev, id, { expanded: false }));
    } else if (action === 'move_up') {
      handleShift(id, 'up');
    } else if (action === 'move_down') {
      handleShift(id, 'down');
    }
  };

  const handleToggleExpand = (id: string) => {
    const node = findNode(data, id);
    if (node) setData(prev => updateNode(prev, id, { expanded: !node.expanded }));
  };

  // Correcting drag event type
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (userRole !== 'Admin') return;
    e.dataTransfer.setData('nodeId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Correcting drag event type
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const memberId = e.dataTransfer.getData('nodeId');
    if (memberId && memberId !== targetId) {
      const targetNode = findNode(data, targetId);
      if (targetNode && targetNode.role === 'Lead') {
        setData(prev => {
          const updated = moveMember(prev, memberId, targetId);
          return updateNode(updated, targetId, { expanded: true });
        });
      }
    }
  };

  const renderMembersRow = (members: OrgNode[]) => {
    return (
      <div className="relative pt-8 pl-12 flex flex-row flex-wrap gap-x-6 gap-y-10 items-start">
        <div className="member-v-stub" />
        <div className="member-h-line" />
        {members.map((member) => (
          <div key={member.id} className="relative pt-6">
            <div className="member-drop-connector" />
            <OrgCard 
              node={member}
              isAdmin={userRole === 'Admin'}
              onContextMenu={(e, id) => {
                e.preventDefault();
                if (userRole === 'Admin') {
                  setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id, visible: true });
                }
              }}
              onDragStart={onDragStart}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderTreeRecursive = (node: OrgNode, isLast = false) => {
    const isExpanded = node.expanded !== false;
    const hasChildren = node.children && node.children.length > 0;
    const isLead = node.role === 'Lead';

    return (
      <div key={node.id} className={`relative flex flex-col ${isLast ? 'last-item' : ''}`}>
        <div className="flex items-center gap-4 relative mb-4">
          {node.role !== 'Manager' && <div className="h-connector" />}
          {node.role === 'Manager' && hasChildren && isExpanded && <div className="v-connector" />}
          {node.role === 'Lead' && !isLast && <div className="v-connector" />}
          
          <OrgCard 
            node={node}
            isAdmin={userRole === 'Admin'}
            onContextMenu={(e, id) => {
              e.preventDefault();
              if (userRole === 'Admin') {
                setContextMenu({ x: e.clientX, y: e.clientY, nodeId: id, visible: true });
              }
            }}
            onToggleExpand={handleToggleExpand}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
          />
        </div>

        {hasChildren && isExpanded && (
          isLead ? (
            renderMembersRow(node.children)
          ) : (
            <div className="pl-12 flex flex-col">
              {node.children.map((child, index) => (
                renderTreeRecursive(child, index === node.children.length - 1)
              ))}
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar 
        data={data}
        userRole={userRole}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar">
          <div className="max-w-[1600px] mx-auto">
            <Analytics data={data} />
            
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 lg:p-16 shadow-sm min-h-[800px] relative">
              <div className="absolute top-8 right-8 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${userRole === 'Admin' ? 'bg-indigo-500 shadow-md shadow-indigo-200' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {userRole === 'Admin' ? 'Admin Mode Active' : 'Viewer Mode'}
                </span>
              </div>
              <div className="flex flex-col items-start">
                {renderTreeRecursive(data, true)}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ContextMenu 
        state={contextMenu}
        role={findNode(data, contextMenu.nodeId)?.role || 'Member'}
        onAction={handleAction}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
      />
    </div>
  );
};

export default App;
