import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  CheckSquare,
  Flame,
  CalendarDays,
  Target,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function TimelinePlanner({
  currentProject,
  projectDetails,
  isDarkMode,
  plannerMonth,
  setPlannerMonth,
  onOpenTaskDetail,
  onOpenAddTask,
  getPriorityBadge,
  formatDueDate,
  isOverdue,
  getDaysInMonth,
  authUser
}) {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('ALL');
  
  const allTasks = projectDetails?.tasks || [];
  const phases = projectDetails?.phases || [];

  // Filter tasks if a phase filter is applied
  const tasks = selectedPhaseFilter === 'ALL'
    ? allTasks
    : allTasks.filter(t => t.phase_id === Number(selectedPhaseFilter));

  const days = getDaysInMonth(plannerMonth);

  const prevMonth = () => {
    const d = new Date(plannerMonth);
    d.setMonth(d.getMonth() - 1);
    setPlannerMonth(d);
  };

  const nextMonth = () => {
    const d = new Date(plannerMonth);
    d.setMonth(d.getMonth() + 1);
    setPlannerMonth(d);
  };

  const goToToday = () => {
    setPlannerMonth(new Date());
  };

  const monthName = plannerMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Today's date string format: YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isCurrentMonthActive = 
    now.getFullYear() === plannerMonth.getFullYear() && 
    now.getMonth() === plannerMonth.getMonth();

  // Metrics for Current Month
  const currentMonthPrefix = `${plannerMonth.getFullYear()}-${String(plannerMonth.getMonth() + 1).padStart(2, '0')}`;
  const tasksInCurrentMonth = tasks.filter(t => t.due_date && t.due_date.startsWith(currentMonthPrefix));
  const completedInMonth = tasksInCurrentMonth.filter(t => t.status === 'Completed');
  const criticalInMonth = tasksInCurrentMonth.filter(t => t.priority === 'Critical' || t.priority === 'High');
  const inProgressInMonth = tasksInCurrentMonth.filter(t => t.status === 'In Progress');

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Master Header Strip */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-xl backdrop-blur-md'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        {/* Left: Section Title & Icon */}
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-2.5 rounded-xl border shrink-0 transition-transform hover:scale-105 ${
              isDarkMode
                ? 'bg-purple-950/50 border-purple-800/60 text-purple-400 shadow-md shadow-purple-950/40'
                : 'bg-violet-50 border-violet-200 text-violet-700 shadow-xs'
            }`}
          >
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Timeline & Milestone Schedule
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isDarkMode 
                  ? 'bg-purple-900/30 border-purple-700/50 text-purple-300' 
                  : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}>
                Planner
              </span>
            </div>
            <p className={`text-[11.5px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Scheduled task deliverables, sprint deadlines, and governance milestone tracker
            </p>
          </div>
        </div>

        {/* Right: Controls Strip (Stage Filter, Month Navigator, Today, New Task) */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-between xl:justify-end">
          {/* Stage Filter Dropdown */}
          {phases.length > 0 && (
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                isDarkMode
                  ? 'bg-[#16182a] border-zinc-750 text-zinc-200 hover:border-zinc-600'
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs'
              }`}
            >
              <Filter className={`h-3.5 w-3.5 shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-violet-600'}`} />
              <select
                value={selectedPhaseFilter}
                onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-medium cursor-pointer"
              >
                <option value="ALL" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                  All Stages ({allTasks.length})
                </option>
                {phases.map(p => {
                  const count = allTasks.filter(t => t.phase_id === p.id).length;
                  return (
                    <option key={p.id} value={p.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                      {p.name.split(' (')[0]} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              isCurrentMonthActive
                ? isDarkMode
                  ? 'bg-purple-950/60 border-purple-500/60 text-purple-300 shadow-xs shadow-purple-950/40'
                  : 'bg-purple-50 border-purple-300 text-purple-700'
                : isDarkMode
                  ? 'border-zinc-750 hover:bg-zinc-800/80 text-zinc-300 hover:text-white'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Jump to Current Month"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isCurrentMonthActive ? 'bg-purple-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span>Today</span>
          </button>

          {/* Month Navigation Pill */}
          <div
            className={`flex items-center space-x-1 border rounded-xl p-1 transition ${
              isDarkMode ? 'bg-[#151728] border-zinc-750/80' : 'bg-slate-50 border-slate-200 shadow-xs'
            }`}
          >
            <button
              type="button"
              onClick={prevMonth}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`font-bold text-xs px-2 font-mono min-w-[125px] text-center select-none ${
              isDarkMode ? 'text-zinc-100' : 'text-slate-800'
            }`}>
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Header Add Task Button */}
          {onOpenAddTask && (
            <button
              type="button"
              onClick={() => onOpenAddTask(todayStr)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                  : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Monthly Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-[#111322]/80 border-zinc-800/80 shadow-sm' : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Month Deliverables
            </p>
            <p className={`text-lg font-black font-mono ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {tasksInCurrentMonth.length}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
            <CalendarDays className="h-4 w-4" />
          </div>
        </div>

        <div
          className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-[#111322]/80 border-zinc-800/80 shadow-sm' : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              In Progress
            </p>
            <p className={`text-lg font-black font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {inProgressInMonth.length}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-950/40 text-blue-400 border border-blue-800/40' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
            <Clock className="h-4 w-4" />
          </div>
        </div>

        <div
          className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-[#111322]/80 border-zinc-800/80 shadow-sm' : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Completed
            </p>
            <p className={`text-lg font-black font-mono ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {completedInMonth.length}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div
          className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between transition ${
            isDarkMode ? 'bg-[#111322]/80 border-zinc-800/80 shadow-sm' : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="space-y-0.5">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              High / Critical Risk
            </p>
            <p className={`text-lg font-black font-mono ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>
              {criticalInMonth.length}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-rose-950/40 text-rose-400 border border-rose-800/40' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
            <Flame className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* 3. Calendar Grid Master Table */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xl transition-colors ${
          isDarkMode
            ? 'bg-[#0e101d] border-zinc-800/80'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        {/* Weekday column headers */}
        <div
          className={`grid grid-cols-7 text-center font-extrabold text-[11px] uppercase tracking-wider border-b ${
            isDarkMode
              ? 'bg-[#141628] border-zinc-800/90 text-zinc-400 divide-x divide-zinc-800/60'
              : 'bg-slate-50 border-slate-200 text-slate-600 divide-x divide-slate-200'
          }`}
        >
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
            <div
              key={day}
              className={`py-3 ${idx === 0 || idx === 6 ? (isDarkMode ? 'text-purple-400 font-black' : 'text-violet-600 font-black') : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date cells grid */}
        <div
          className={`grid grid-cols-7 border-collapse ${
            isDarkMode ? 'divide-y divide-zinc-800/60' : 'divide-y divide-slate-200'
          }`}
        >
          {days.map((d, i) => {
            const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(d.dateStr));
            const isToday = d.dateStr === todayStr;
            const isWeekend = d.dayOfWeek === 0 || d.dayOfWeek === 6;

            return (
              <div
                key={i}
                onClick={() => {
                  if (d.isCurrentMonth && onOpenAddTask) {
                    onOpenAddTask(d.dateStr);
                  }
                }}
                className={`min-h-[125px] sm:min-h-[135px] p-2.5 flex flex-col justify-between transition-all group relative border-r last:border-r-0 ${
                  isDarkMode ? 'border-zinc-800/60' : 'border-slate-200'
                } ${
                  d.isCurrentMonth
                    ? isToday
                      ? isDarkMode
                        ? 'bg-purple-950/25 ring-1 ring-inset ring-purple-500/50 hover:bg-purple-950/35 cursor-pointer'
                        : 'bg-purple-50/70 ring-1 ring-inset ring-purple-400 hover:bg-purple-100/70 cursor-pointer'
                      : isWeekend
                        ? isDarkMode
                          ? 'bg-[#111322]/50 hover:bg-[#181a30] cursor-pointer'
                          : 'bg-slate-50/50 hover:bg-slate-100/70 cursor-pointer'
                        : isDarkMode
                          ? 'bg-[#141628]/70 hover:bg-[#181a32] cursor-pointer'
                          : 'bg-white hover:bg-slate-50 cursor-pointer'
                    : isDarkMode
                      ? 'opacity-20 bg-zinc-950/40 cursor-default'
                      : 'opacity-25 bg-slate-100/40 cursor-default'
                }`}
              >
                {/* Cell Header: Date Number Badge + Quick Add (+) */}
                <div className="flex items-center justify-between mb-1.5">
                  {/* Date Badge */}
                  <div
                    className={`transition-all ${
                      isToday
                        ? 'w-7 h-7 rounded-lg border-2 border-purple-400 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-purple-500/40 ring-2 ring-purple-400/30'
                        : d.isCurrentMonth
                          ? isDarkMode
                            ? 'w-6.5 h-6.5 rounded-md border border-zinc-700 bg-zinc-850 text-zinc-200 font-bold text-xs flex items-center justify-center group-hover:border-purple-400 group-hover:text-purple-300 group-hover:bg-purple-950/40 shadow-xs'
                            : 'w-6.5 h-6.5 rounded-md border border-slate-300 bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center group-hover:border-violet-500 group-hover:text-violet-700 group-hover:bg-purple-50 shadow-xs'
                          : 'w-6 h-6 rounded-md border border-zinc-800/40 text-zinc-600 text-xs flex items-center justify-center font-medium'
                    }`}
                  >
                    <span>{d.dayNum}</span>
                  </div>

                  {/* Quick Add Button */}
                  {d.isCurrentMonth && onOpenAddTask && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddTask(d.dateStr);
                      }}
                      className={`w-6 h-6 rounded-md transition flex items-center justify-center cursor-pointer ${
                        isDarkMode
                          ? 'opacity-0 group-hover:opacity-100 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30'
                          : 'opacity-0 group-hover:opacity-100 bg-violet-50 hover:bg-violet-600 text-violet-600 hover:text-white border border-violet-200'
                      }`}
                      title={`Schedule deliverable on ${d.dateStr}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Scheduled Deliverables Pills List */}
                <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[85px] pr-0.5">
                  {dayTasks.map(t => {
                    const isCompleted = t.status === 'Completed';
                    const isCritical = t.priority === 'Critical' || t.priority === 'High';

                    return (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTaskDetail(t);
                        }}
                        className={`p-1.5 rounded-lg text-[10.5px] font-semibold truncate transition-all flex items-center justify-between gap-1 cursor-pointer shadow-xs group/card hover:scale-[1.02] ${
                          isCompleted
                            ? isDarkMode
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            : isCritical
                              ? isDarkMode
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50'
                                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                              : isDarkMode
                                ? 'bg-purple-950/40 text-purple-200 border border-purple-500/40 hover:bg-purple-900/50'
                                : 'bg-violet-50 text-violet-800 border border-violet-200 hover:bg-violet-100'
                        }`}
                        title={`${t.title} (${t.status || 'Planned'} • Priority: ${t.priority || 'Medium'})`}
                      >
                        <div className="flex items-center space-x-1.5 truncate">
                          {/* Indicator Icon / Dot */}
                          {isCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : isCritical ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                          )}
                          
                          <span className={`truncate ${isCompleted ? 'line-through opacity-75' : ''}`}>
                            {t.title}
                          </span>
                        </div>

                        {/* Assignee Initial Pill */}
                        {t.assignee_name && (
                          <span
                            className={`w-4 h-4 rounded-full text-[8.5px] font-black flex items-center justify-center shrink-0 uppercase ${
                              isDarkMode
                                ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                : 'bg-white text-slate-700 border border-slate-300 shadow-xs'
                            }`}
                            title={`Assigned to: ${t.assignee_name}`}
                          >
                            {t.assignee_name.charAt(0)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Day Cell Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-inherit text-[9.5px] font-mono">
                  {dayTasks.length > 0 ? (
                    <span className={isDarkMode ? 'text-purple-400 font-bold' : 'text-violet-600 font-bold'}>
                      {dayTasks.length} {dayTasks.length === 1 ? 'deliverable' : 'deliverables'}
                    </span>
                  ) : (
                    <span className="text-zinc-500/40 italic text-[9px]"></span>
                  )}

                  {isToday && (
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-purple-400">
                      Today
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Footer Legend Bar */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition ${
          isDarkMode ? 'bg-[#0f111e] border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 ring-1 ring-purple-400" />
            <span className="font-semibold text-[11px]">Today's Date</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-[11px]">Critical / High Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-semibold text-[11px]">Milestone / In Progress</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px]">Completed Deliverable</span>
          </div>
        </div>

        <div className="text-[11px] font-medium text-zinc-500 flex items-center space-x-1">
          <span>Click any date cell or</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] mx-0.5">
            <Plus className="h-3 w-3 inline mr-0.5" /> New Task
          </span>
          <span>to schedule deliverables.</span>
        </div>
      </div>
    </div>
  );
}
