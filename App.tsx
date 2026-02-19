
import React, { useState, useEffect, useCallback } from 'react';
import { OrgNode, UserRole, ContextMenuState } from './types';
import { INITIAL_DATA, STORAGE_KEY, ADMIN_PASSWORD } from './constants';
import { updateNode, addNode, removeNode, findNode, findParent, moveMember, generateId } from './utils/hierarchy';
import Sidebar from './components/Sidebar';
import Analytics from './components/Analytics';
import OrgCard from './components/OrgCard';
import ContextMenu from './components/ContextMenu';
import { Shield, Lock, X, AlertCircle, Menu, Eye, EyeOff, LayoutDashboard, Undo2, Redo2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<OrgNode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // History stacks
  const [past, setPast] = useState<OrgNode[]>([]);
  const [future, setFuture] = useState<OrgNode[]>([]);

  const [userRole, setUserRole] = useState<UserRole>('Viewer');
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, nodeId: '', visible: false });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Helper to commit a new state to history
  const commitState = useCallback((newState: OrgNode) => {
    setPast(prev => [...prev, data]);
    setFuture([]);
    setData(newState);
  }, [data]);

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [data, ...prev]);
    setPast(newPast);
    setData(previous);
  }, [past, data]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, data]);
    setFuture(newFuture);
    setData(next);
  }, [future, data]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (userRole !== 'Admin') return;
      
      const isZ = e.key.toLowerCase() === 'z';
      const isY = e.key.toLowerCase() === 'y';
      const isMod = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isMod && isZ && !isShift) {
        e.preventDefault();
        handleUndo();
      } else if ((isMod && isY) || (isMod && isShift && isZ)) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, userRole]);

  const handleLoginSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loginPassword === ADMIN_PASSWORD) {
      setUserRole('Admin');
      setShowLoginModal(false);
      setLoginPassword('');
      setLoginError(false);
      setShowPassword(false);
    } else {
      setLoginError(true);
      if ('vibrate' in navigator) navigator.vibrate(50);
    }
  };

  const handleLogout = useCallback(() => {
    setUserRole('Viewer');
    setPast([]);
    setFuture([]);
  }, []);

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
          commitState(json);
        } else {
          alert('Invalid hierarchy format. Root must be a Manager.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  }, [commitState]);

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

    const newState = updateNode(data, parent.id, { children });
    commitState(newState);
  };

  const handleAction = (action: string, id: string) => {
    if (userRole !== 'Admin') return;

    if (action === 'rename') {
      const node = findNode(data, id);
      const newName = window.prompt('Enter new name:', node?.name);
      if (newName) {
        commitState(updateNode(data, id, { name: newName }));
      }
    } else if (action === 'add_lead') {
      const name = window.prompt('Enter lead name:');
      if (name) {
        commitState(addNode(data, id, { id: generateId(), name, role: 'Lead', expanded: true, children: [] }));
      }
    } else if (action === 'add_member') {
      const name = window.prompt('Enter member name:');
      if (name) {
        commitState(addNode(data, id, { id: generateId(), name, role: 'Member', children: [] }));
      }
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this node? All children will be removed.')) {
        commitState(removeNode(data, id));
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

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (userRole !== 'Admin') return;
    e.dataTransfer.setData('nodeId', id);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.currentTarget;
    target.style.opacity = '0.5';
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
  };

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
        const movedState = moveMember(data, memberId, targetId);
        const finalState = updateNode(movedState, targetId, { expanded: true });
        commitState(finalState);
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
              // @ts-ignore
              onDragEnd={onDragEnd}
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        data={data}
        userRole={userRole}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-20 p-2.5 bg-white border border-slate-200 rounded-xl shadow-md text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all group"
            title="Open Sidebar"
          >
            <Menu size={20} className="group-hover:scale-110 transition-transform" />
          </button>
        )}

        <div className="flex-1 overflow-auto p-6 lg:p-10 hide-scrollbar">
          <div className="max-w-[1600px] min-w-[900px] mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                   <LayoutDashboard size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Team Hierarchy</h2>
                  <p className="text-sm text-slate-500 font-medium">Manage and visualize your organizational structure</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Undo/Redo Controls */}
                {userRole === 'Admin' && (
                  <div className="bg-white px-2 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1">
                    <button 
                      onClick={handleUndo}
                      disabled={past.length === 0}
                      className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-all"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 size={18} />
                    </button>
                    <div className="w-px h-4 bg-slate-100 mx-1" />
                    <button 
                      onClick={handleRedo}
                      disabled={future.length === 0}
                      className="p-2 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-all"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 size={18} />
                    </button>
                  </div>
                )}

                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${userRole === 'Admin' ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {userRole === 'Admin' ? 'Administrator' : 'Viewer Mode'}
                  </span>
                </div>
              </div>
            </div>

            <Analytics data={data} />
            
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 lg:p-16 shadow-sm min-h-[800px] relative overflow-visible">
              <div className="flex flex-col items-start">
                {renderTreeRecursive(data, true)}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 scale-in-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-indigo-600 p-8 flex justify-between items-start text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
               <div className="relative z-10">
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                    <Shield size={24} />
                  </div>
                  <h2 className="font-black text-2xl tracking-tight">Admin Access</h2>
                  <p className="text-indigo-100 text-sm font-medium mt-1">Unlock organizational management tools</p>
               </div>
               <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError(false);
                  setLoginPassword('');
                  setShowPassword(false);
                }} 
                className="hover:bg-white/20 p-2 rounded-xl transition-colors relative z-10"
               >
                  <X size={20} />
               </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="p-8 space-y-8 bg-white">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Master Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${loginError ? 'text-red-400' : 'text-slate-400 group-focus-within:text-indigo-500'}`} size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError(false);
                    }}
                    placeholder="••••••••"
                    autoFocus
                    className={`w-full bg-slate-50 border-2 ${loginError ? 'border-red-100 ring-red-50 bg-red-50/30' : 'border-slate-100 ring-indigo-50 focus:border-indigo-500/50'} rounded-2xl py-4 pl-12 pr-12 text-slate-800 font-medium outline-none focus:ring-4 transition-all placeholder:text-slate-300`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {loginError && (
                  <div className="flex items-center gap-2 text-red-500 text-[11px] font-bold mt-2 animate-in slide-in-from-top-2 bg-red-50 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    <span>Access Denied. Please verify credentials.</span>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                >
                  Confirm Unlock
                </button>
                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider mt-6">
                   Default password: <span className="text-indigo-400">admin123</span>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

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
