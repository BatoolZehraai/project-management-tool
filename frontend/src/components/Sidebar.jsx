import React, { useState } from 'react';
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  FolderOpen,
  Bug,
  Terminal,
  Users,
  ShieldCheck,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  User,
  Plus,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentProject,
  projects = [],
  onOpenProjectDirectory,
  onOpenNewProject,
  authUser,
  isDarkMode,
  onToggleTheme,
  onOpenProfile,
  onLogout,
  bahlLogo,
  bugCount = 0,
  pendingUserCount = 0
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const userRole = authUser?.role || 'TEAM_MEMBER';
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'Admin' || userRole === 'ADMIN';

  const navItems = [
    {
      id: 'overview',
      label: 'Overview & Metrics',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'board',
      label: 'Kanban Board',
      icon: Kanban,
      badge: null
    },
    {
      id: 'planner',
      label: 'Timeline / Planner',
      icon: Calendar,
      badge: null
    },
    {
      id: 'stage_files',
      label: 'Stage Files',
      icon: FolderOpen,
      badge: null
    },
    {
      id: 'bug_tracker',
      label: 'Defects & Bugs',
      icon: Bug,
      badge: bugCount > 0 ? bugCount : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'api_studio',
      label: 'API Studio',
      icon: Terminal,
      badge: null
    },
    {
      id: 'team_approvals',
      label: 'Team & Approvals',
      icon: Users,
      badge: pendingUserCount > 0 ? pendingUserCount : null,
      badgeColor: 'bg-amber-500 text-white',
      adminOnly: true
    },
    {
      id: 'audit_trail',
      label: 'Audit Trail',
      icon: ShieldCheck,
      badge: null
    }
  ];

  const userInitials = (authUser?.name || 'User')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={`shrink-0 flex flex-col justify-between border-r transition-all duration-300 ease-in-out select-none z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${
        isDarkMode
          ? 'bg-[#0c0e1a] border-zinc-800/80 text-zinc-100'
          : 'bg-white border-slate-200/90 text-slate-900 shadow-xs'
      }`}
      style={{ minHeight: '100vh', height: '100vh', position: 'sticky', top: 0 }}
    >
      {/* Top Header: Brand, Workspace Switcher & Collapse Toggle */}
      <div className={`border-b border-inherit transition-all duration-300 ${isCollapsed ? 'p-2.5 space-y-2.5' : 'p-4 space-y-3.5'}`}>
        {/* Brand Crest + Collapse Toggle */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2 justify-center' : 'justify-between space-x-2'}`}>
          <div className="flex items-center space-x-2.5 min-w-0">
            <div
              className={`p-1 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer ${
                isDarkMode
                  ? 'bg-white/95 border-emerald-500/30 shadow-black/40'
                  : 'bg-white border-slate-200 shadow-slate-200'
              }`}
              title="Bank AL Habib Limited - SDLC Governance Engine"
              onClick={() => isCollapsed && handleToggleCollapse()}
            >
              <img src={bahlLogo} alt="Bank AL Habib Logo" className="h-7 w-auto object-contain" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-extrabold tracking-tight text-xs leading-none truncate">
                  Bank AL Habib
                </h1>
                <p
                  className={`text-[9px] font-semibold tracking-wider uppercase mt-0.5 truncate ${
                    isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  SDLC Governance
                </p>
              </div>
            )}
          </div>

          {/* Toggle Expand/Collapse Button */}
          <button
            type="button"
            onClick={handleToggleCollapse}
            className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
              isDarkMode
                ? 'bg-[#141624] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-xs'
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Project Switcher */}
        {!isCollapsed ? (
          <div className="relative">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={onOpenProjectDirectory}
                className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer group min-w-0 ${
                  isDarkMode
                    ? 'bg-[#141624] border-zinc-800 text-zinc-200 hover:bg-[#1a1d30] hover:border-purple-500/40'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-violet-300 shadow-xs'
                }`}
                title="Switch project workspace"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <Layers
                    className={`h-3.5 w-3.5 shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-violet-600'}`}
                  />
                  <span className="truncate font-bold text-[11px]">
                    {currentProject
                      ? `[PRJ-${String(currentProject.id).padStart(3, '0')}] ${currentProject.name}`
                      : 'Select Project'}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                  }`}
                />
              </button>

              {isAdmin && onOpenNewProject && (
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  className={`p-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                    isDarkMode
                      ? 'bg-[#141624] border-zinc-800 text-purple-400 hover:bg-purple-950/40 hover:border-purple-500/50'
                      : 'bg-slate-50 border-slate-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 shadow-xs'
                  }`}
                  title="Create New Project"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onOpenProjectDirectory}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDarkMode
                  ? 'bg-[#141624] border-zinc-800 text-purple-400 hover:bg-[#1a1d30]'
                  : 'bg-slate-50 border-slate-200 text-violet-600 hover:bg-slate-100 shadow-xs'
              }`}
              title={currentProject ? `Project: ${currentProject.name}` : 'Switch Project'}
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Navigation Links */}
      <div className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? 'p-2' : 'px-3 py-3'}`}>
        {!isCollapsed && (
          <div
            className={`px-3 py-1 text-[9.5px] font-black tracking-wider uppercase ${
              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
            }`}
          >
            Workspaces
          </div>
        )}

        {navItems.map(item => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={`${item.label}${item.badge !== null ? ` (${item.badge})` : ''}`}
                className={`w-full relative flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer group ${
                  isActive
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-950/30'
                      : 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-800 border border-violet-200 shadow-xs font-black'
                    : isDarkMode
                      ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <IconComponent
                  className={`h-4 w-4 transition-colors ${
                    isActive
                      ? isDarkMode
                        ? 'text-purple-400'
                        : 'text-violet-600'
                      : isDarkMode
                        ? 'text-zinc-400 group-hover:text-zinc-200'
                        : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                {item.badge !== null && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-zinc-900" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                isActive
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-200 border border-purple-500/40 shadow-sm shadow-purple-950/30'
                    : 'bg-gradient-to-r from-violet-600/10 to-indigo-600/10 text-violet-800 border border-violet-200 shadow-xs font-black'
                  : isDarkMode
                    ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <IconComponent
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? isDarkMode
                        ? 'text-purple-400'
                        : 'text-violet-600'
                      : isDarkMode
                        ? 'text-zinc-400 group-hover:text-zinc-200'
                        : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                    item.badgeColor || (isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer: User Identity & Utilities */}
      <div className={`border-t border-inherit space-y-2 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {/* User Identity Card */}
        {!isCollapsed ? (
          <div
            onClick={onOpenProfile}
            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition group ${
              isDarkMode
                ? 'bg-[#121422] border-zinc-800/80 hover:bg-[#1a1d30] hover:border-purple-500/30'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 hover:border-violet-300 shadow-xs'
            }`}
            title="Manage user account & profile settings"
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                isDarkMode
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  : 'bg-violet-100 border border-violet-200 text-violet-700'
              }`}
            >
              {authUser?.avatar_url ? (
                <img
                  src={`http://127.0.0.1:5000${authUser.avatar_url}`}
                  alt={authUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-xs truncate">
                  {authUser?.name || 'Corporate User'}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                    isAdmin
                      ? isDarkMode
                        ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                        : 'bg-violet-50 border-violet-200 text-violet-700'
                      : isDarkMode
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              onClick={onOpenProfile}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer border transition ${
                isDarkMode
                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 hover:border-purple-400'
                  : 'bg-violet-100 border-violet-200 text-violet-700 hover:border-violet-400'
              }`}
              title={`${authUser?.name || 'User'} (${userRole}) - Click to manage profile`}
            >
              {authUser?.avatar_url ? (
                <img
                  src={`http://127.0.0.1:5000${authUser.avatar_url}`}
                  alt={authUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                userInitials
              )}
            </div>
          </div>
        )}

        {/* Action Controls: Theme Switcher & Logout */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-[#141624] border-zinc-800 text-amber-400 hover:bg-zinc-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="text-[11px]">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                isDarkMode
                  ? 'border-zinc-800 text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/50'
                  : 'border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-xs'
              }`}
              title="Sign out of Bank AL Habib Platform"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[11px]">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1 pt-1">
            <button
              type="button"
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDarkMode
                  ? 'bg-[#141624] border-zinc-800 text-amber-400 hover:bg-zinc-800'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDarkMode
                  ? 'border-zinc-800 text-rose-400 hover:bg-rose-950/30'
                  : 'border-slate-200 text-rose-600 hover:bg-rose-50 shadow-xs'
              }`}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
