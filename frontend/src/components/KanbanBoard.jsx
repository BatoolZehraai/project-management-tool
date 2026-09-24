import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Layers,
  MessageSquare,
  Paperclip,
  CheckSquare,
  ShieldCheck,
  Zap,
  AlertCircle,
  Kanban,
  List
} from 'lucide-react';

export default function KanbanBoard({
  currentProject,
  projectDetails,
  activePhaseId,
  setActivePhaseId,
  isDarkMode,
  authUser,
  stagePermissions,
  onOpenTaskDetail,
  onOpenAddTask,
  onOpenAddPhase,
  onInlineAddTask,
  onDeleteTask,
  onMoveTaskStatus,
  canEditTaskItem,
  getPriorityBadge,
  formatDueDate,
  isOverdue
}) {
  const [boardViewType, setBoardViewType] = useState('board'); // 'board' or 'list'
  const [mobileColumnFilter, setMobileColumnFilter] = useState('ALL');
  const [inlineAddingStatus, setInlineAddingStatus] = useState(null);
  const [inlineCardTitle, setInlineCardTitle] = useState('');

  const phases = projectDetails?.phases || [];
  const tasks = projectDetails?.tasks || [];

  const isSuperAdmin = authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'Admin' || authUser?.role === 'ADMIN' || stagePermissions?.isSuperAdmin;
  const canAddTask = isSuperAdmin || stagePermissions?.canCreateTask || stagePermissions?.canCreate;

  // Filter tasks by active phase
  const filteredTasks = activePhaseId === 'ALL'
    ? tasks
    : tasks.filter(t => t.phase_id === activePhaseId);

  const activePhaseObj = activePhaseId === 'ALL'
    ? null
    : phases.find(p => p.id === activePhaseId);

  const columns = [
    {
      id: 'Planned',
      title: 'Planned / Backlog',
      color: 'border-indigo-500/30',
      dotColor: 'bg-indigo-400',
      tasks: filteredTasks.filter(t => t.status === 'Planned' || t.status === 'Backlog' || t.status === 'Todo' || t.status === 'To Do' || !t.status)
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      color: 'border-blue-500/30',
      dotColor: 'bg-blue-400',
      tasks: filteredTasks.filter(t => t.status === 'In Progress')
    },
    {
      id: 'Completed',
      title: 'Completed',
      color: 'border-emerald-500/30',
      dotColor: 'bg-emerald-400',
      tasks: filteredTasks.filter(t => t.status === 'Completed')
    }
  ];

  const handleInlineSubmit = (status) => {
    if (!inlineCardTitle.trim()) return;
    onInlineAddTask(status, inlineCardTitle.trim());
    setInlineAddingStatus(null);
    setInlineCardTitle('');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Minimal Header Strip */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-colors flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-md'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        {/* Left: Stage Dropdown & Inline Governance Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stage Dropdown */}
          <div className="relative">
            <select
              value={activePhaseId || 'ALL'}
              onChange={(e) => {
                const val = e.target.value;
                setActivePhaseId(val === 'ALL' ? 'ALL' : parseInt(val));
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition max-w-[260px] ${
                isDarkMode
                  ? 'bg-[#16182a] border-zinc-750 text-zinc-100 focus:border-purple-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 shadow-xs'
              }`}
            >
              <option value="ALL">All SDLC Stages ({tasks.length} tasks)</option>
              {phases.map(ph => (
                <option key={ph.id} value={ph.id}>
                  {ph.name} ({tasks.filter(t => t.phase_id === ph.id).length} tasks)
                </option>
              ))}
            </select>
          </div>

          {/* Governance & Authority Badges - Clean Lucide Icons */}
          {isSuperAdmin ? (
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                isDarkMode
                  ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                  : 'bg-violet-50 border-violet-200 text-violet-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>FULL ADMIN ACCESS</span>
            </div>
          ) : activePhaseObj ? (
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                canAddTask
                  ? isDarkMode
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isDarkMode
                    ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {canAddTask ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3 w-3" />}
              <span>
                {canAddTask
                  ? 'STAGE AUTHORITY ACTIVE'
                  : `Governed by: ${activePhaseObj.governing_department || activePhaseObj.role_access || 'Lead'}`}
              </span>
            </div>
          ) : (
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>ALL STAGES VIEW</span>
            </div>
          )}
        </div>

        {/* Right: View Switcher & + New Task Button */}
        <div className="flex items-center space-x-2">
          {/* View Switcher Pill */}
          <div
            className={`p-0.5 rounded-xl border flex items-center text-xs font-bold ${
              isDarkMode ? 'bg-[#151728] border-zinc-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setBoardViewType('board')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                boardViewType === 'board'
                  ? isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-violet-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              type="button"
              onClick={() => setBoardViewType('list')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                boardViewType === 'list'
                  ? isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-violet-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          {/* + New Task Button */}
          <button
            type="button"
            onClick={onOpenAddTask}
            disabled={!canAddTask}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
              canAddTask
                ? isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Mobile Column Switcher (Visible on < md screens in Board View) */}
      {boardViewType === 'board' && (
        <div className="flex md:hidden items-center p-1 rounded-xl border overflow-x-auto scrollbar-none gap-1 bg-slate-100/80 dark:bg-[#131525] border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setMobileColumnFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
              mobileColumnFilter === 'ALL'
                ? isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-violet-700 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>All Columns</span>
            <span className="text-[10px] opacity-75 font-mono">({filteredTasks.length})</span>
          </button>
          {columns.map(col => (
            <button
              key={col.id}
              type="button"
              onClick={() => setMobileColumnFilter(col.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                mobileColumnFilter === col.id
                  ? isDarkMode ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-violet-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
              <span>{col.id}</span>
              <span className="text-[10px] opacity-75 font-mono">({col.tasks.length})</span>
            </button>
          ))}
        </div>
      )}

      {/* Kanban Board Columns View */}
      {boardViewType === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start">
          {columns
            .filter(col => mobileColumnFilter === 'ALL' || mobileColumnFilter === col.id)
            .map(col => (
              <div
                key={col.id}
                className={`rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col min-h-[220px] md:min-h-[580px] ${
                  isDarkMode
                    ? 'bg-[#0f111e]/90 border-zinc-800/80 shadow-lg'
                    : 'bg-slate-50/80 border-slate-200/90 shadow-xs'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-inherit mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className={`font-extrabold text-xs tracking-wider uppercase ${isDarkMode ? 'text-zinc-200' : 'text-slate-800'}`}>
                      {col.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {col.tasks.length}
                  </span>
                </div>

                {/* Task Cards List */}
                <div className="space-y-2.5 sm:space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
                  {col.tasks.length === 0 ? (
                    <div className="py-10 text-center text-zinc-500 text-xs font-medium space-y-1">
                      <p>No cards in {col.title}</p>
                      <p className="text-[10px] opacity-70">Add a card or drag tasks here</p>
                    </div>
                  ) : (
                    col.tasks.map(task => {
                      const isEditable = isSuperAdmin || canEditTaskItem(task);
                      const taskPhase = phases.find(p => p.id === task.phase_id);

                      return (
                        <div
                          key={task.id}
                          onClick={() => onOpenTaskDetail(task)}
                          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
                            isDarkMode
                              ? 'bg-[#151726]/90 border-zinc-800/80 hover:border-purple-500/50 hover:bg-[#1a1d30] shadow-md shadow-black/20'
                              : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-md shadow-xs'
                          }`}
                        >
                          {/* Priority & Phase Tag */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              {getPriorityBadge(task.priority)}
                              {taskPhase && activePhaseId === 'ALL' && (
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border truncate max-w-[110px] ${
                                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {taskPhase.name}
                                </span>
                              )}
                            </div>

                            {task.due_date && (
                              <span
                                className={`text-[9.5px] font-mono font-semibold shrink-0 ${
                                  isOverdue(task.due_date) && task.status !== 'Completed'
                                    ? 'text-rose-400 font-bold'
                                    : isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                                }`}
                              >
                                {formatDueDate(task.due_date)}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className={`font-bold text-xs leading-snug ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                            {task.title}
                          </h4>

                          {/* Description Preview */}
                          {task.description && (
                            <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                              {task.description}
                            </p>
                          )}

                          {/* Bottom Metadata & Actions */}
                          <div className="mt-2.5 pt-2 border-t border-inherit flex items-center justify-between text-[10.5px]">
                            {/* Assignee */}
                            <div className="flex items-center space-x-1.5 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${
                                  isDarkMode ? 'bg-purple-900/60 text-purple-200' : 'bg-violet-100 text-violet-800'
                                }`}
                              >
                                {(task.assignee_name || 'U').charAt(0)}
                              </div>
                              <span className={`truncate max-w-[80px] sm:max-w-[120px] text-[10px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                                {task.assignee_name || 'Unassigned'}
                              </span>
                            </div>

                            {/* Quick Status Mover Buttons */}
                            {isEditable && (
                              <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {col.id !== 'Planned' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMoveTaskStatus(task.id, col.id === 'Completed' ? 'In Progress' : 'Planned');
                                    }}
                                    className={`p-1 rounded-md border transition cursor-pointer ${
                                      isDarkMode
                                        ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                                        : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                    title={`Move Left (${col.id === 'Completed' ? 'In Progress' : 'Planned'})`}
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </button>
                                )}
                                {col.id !== 'Completed' && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMoveTaskStatus(task.id, col.id === 'Planned' ? 'In Progress' : 'Completed');
                                    }}
                                    className={`p-1 rounded-md border transition cursor-pointer ${
                                      isDarkMode
                                        ? 'border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700'
                                        : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                    title={`Move Right (${col.id === 'Planned' ? 'In Progress' : 'Completed'})`}
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Inline Add Card */}
                {canAddTask && (
                  <div className="pt-2.5 sm:pt-3 border-t border-inherit mt-auto">
                    {inlineAddingStatus === col.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={inlineCardTitle}
                          onChange={(e) => setInlineCardTitle(e.target.value)}
                          placeholder="Enter task card title..."
                          className={`w-full text-xs p-2 rounded-xl border outline-none ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleInlineSubmit(col.id);
                            if (e.key === 'Escape') setInlineAddingStatus(null);
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleInlineSubmit(col.id)}
                            className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlineAddingStatus(null)}
                            className="px-2 py-1 text-zinc-400 hover:text-white text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setInlineAddingStatus(col.id);
                          setInlineCardTitle('');
                        }}
                        className={`w-full py-1.5 px-2.5 rounded-xl border border-dashed text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                          isDarkMode
                            ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                            : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Card</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        /* List View Table */
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDarkMode ? 'bg-[#111322] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[560px]">
              <thead className={`border-b ${isDarkMode ? 'bg-[#141626] border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Task Title</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Priority</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Stage</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Assignee</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px]">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {filteredTasks.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => onOpenTaskDetail(t)}
                    className={`hover:bg-zinc-800/30 cursor-pointer transition ${
                      isDarkMode ? 'text-zinc-200' : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <td className="p-3.5 font-bold">{t.title}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : t.status === 'In Progress'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5">{getPriorityBadge(t.priority)}</td>
                    <td className="p-3.5 text-zinc-400">{phases.find(p => p.id === t.phase_id)?.name || 'General'}</td>
                    <td className="p-3.5">{t.assignee_name || 'Unassigned'}</td>
                    <td className="p-3.5 font-mono text-[11px]">{formatDueDate(t.due_date) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

