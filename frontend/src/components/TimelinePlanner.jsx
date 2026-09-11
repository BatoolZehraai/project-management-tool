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
  Sparkles
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

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-lg'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-purple-950/40 border-purple-800/60 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}
          >
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              Timeline & Milestone Schedule
            </h2>
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Scheduled task deliverables, sprint deadlines, and governance milestone tracker
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Stage Filter */}
          {phases.length > 0 && (
            <div className="flex items-center space-x-1.5">
              <Filter className={`h-3.5 w-3.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
              <select
                value={selectedPhaseFilter}
                onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                className={`text-xs rounded-xl px-2.5 py-1.5 border font-medium focus:outline-hidden transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#16182a] border-zinc-750 text-zinc-200 focus:border-purple-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-violet-500 shadow-xs'
                }`}
              >
                <option value="ALL">All SDLC Stages ({allTasks.length})</option>
                {phases.map(p => {
                  const count = allTasks.filter(t => t.phase_id === p.id).length;
                  return (
                    <option key={p.id} value={p.id}>
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
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isCurrentMonthActive
                ? isDarkMode
                  ? 'bg-purple-950/50 border-purple-500/50 text-purple-300'
                  : 'bg-purple-50 border-purple-300 text-purple-700'
                : isDarkMode
                  ? 'border-zinc-750 hover:bg-zinc-800/80 text-zinc-300'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Today
          </button>

          {/* Month Navigation */}
          <div className="flex items-center space-x-1 border rounded-xl p-0.5 border-zinc-750/60">
            <button
              type="button"
              onClick={prevMonth}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={`font-bold text-xs px-3 font-mono ${isDarkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isDarkMode ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700'
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20'
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 overflow-x-auto ${
          isDarkMode ? 'bg-[#0e101d] border-zinc-800/80 shadow-md' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center font-extrabold text-[11px] pb-3 border-b uppercase tracking-wider text-zinc-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Date cells grid */}
        <div className="grid grid-cols-7 gap-2 pt-3">
          {days.map((d, i) => {
            const dayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(d.dateStr));
            const isToday = d.dateStr === todayStr;

            return (
              <div
                key={i}
                onClick={() => {
                  if (d.isCurrentMonth && onOpenAddTask) {
                    onOpenAddTask(d.dateStr);
                  }
                }}
                className={`min-h-[110px] p-2 rounded-xl border flex flex-col justify-between transition group ${
                  d.isCurrentMonth
                    ? isToday
                      ? isDarkMode
                        ? 'bg-purple-950/20 border-purple-500/60 shadow-md shadow-purple-950/30 cursor-pointer'
                        : 'bg-purple-50/70 border-purple-400 shadow-xs cursor-pointer'
                      : isDarkMode
                        ? 'bg-[#141628]/90 border-zinc-800/80 hover:border-purple-500/40 hover:bg-[#181a30] cursor-pointer'
                        : 'bg-slate-50/70 border-slate-200/90 hover:border-violet-300 hover:bg-slate-100/70 cursor-pointer'
                    : isDarkMode
                      ? 'opacity-30 border-transparent bg-zinc-950/30 cursor-default'
                      : 'opacity-30 border-transparent bg-slate-100/40 cursor-default'
                }`}
                title={d.isCurrentMonth ? `Click to schedule task on ${d.dateStr}` : ''}
              >
                {/* Cell Header: Bordered Day Number + Quick Add Plus Button */}
                <div className="flex items-center justify-between">
                  {/* Distinct Bordered Day Number */}
                  <div
                    className={`transition ${
                      isToday
                        ? 'w-7 h-7 rounded-lg border-2 border-purple-500 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-purple-500/30 ring-2 ring-purple-400/30'
                        : d.isCurrentMonth
                          ? isDarkMode
                            ? 'w-6.5 h-6.5 rounded-md border border-zinc-700 bg-zinc-900/80 text-zinc-200 font-bold text-xs flex items-center justify-center group-hover:border-purple-400 group-hover:text-purple-300 group-hover:bg-purple-950/40'
                            : 'w-6.5 h-6.5 rounded-md border border-slate-300 bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center group-hover:border-violet-500 group-hover:text-violet-700 group-hover:bg-purple-50'
                          : 'w-6 h-6 rounded-md border border-zinc-800/40 text-zinc-600 text-xs flex items-center justify-center font-medium'
                    }`}
                  >
                    <span>{d.dayNum}</span>
                  </div>

                  {/* + Button for New Task on this specific date */}
                  {d.isCurrentMonth && onOpenAddTask && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAddTask(d.dateStr);
                      }}
                      className={`p-1 rounded-md transition cursor-pointer flex items-center justify-center ${
                        isDarkMode
                          ? 'opacity-40 group-hover:opacity-100 hover:bg-purple-600/30 text-purple-300 hover:text-purple-100 border border-transparent hover:border-purple-500/40'
                          : 'opacity-40 group-hover:opacity-100 hover:bg-violet-100 text-violet-600 hover:text-violet-800 border border-transparent hover:border-violet-300'
                      }`}
                      title={`Add task for ${d.dateStr}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Tasks List for this date */}
                <div className="space-y-1.5 my-1.5 overflow-y-auto max-h-[75px] pr-0.5">
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
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold truncate transition flex items-center space-x-1.5 cursor-pointer shadow-xs ${
                          isCompleted
                            ? isDarkMode
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/50'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : isCritical
                              ? isDarkMode
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/50'
                                : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                              : isDarkMode
                                ? 'bg-purple-950/40 text-purple-200 border border-purple-500/40 hover:bg-purple-900/50'
                                : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                        }`}
                        title={`${t.title} (${t.status || 'Planned'} • ${t.priority || 'Medium'})`}
                      >
                        {/* Status / Priority Indicator */}
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-400'
                              : isCritical
                                ? 'bg-rose-500 animate-pulse'
                                : 'bg-purple-400'
                          }`}
                        />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Empty cell placeholder / task count indicator */}
                {dayTasks.length > 0 ? (
                  <div className="text-[9px] font-mono text-right text-zinc-500">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </div>
                ) : (
                  <div className="h-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend Bar */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDarkMode ? 'bg-[#0f111e] border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 ring-1 ring-purple-400" />
            <span className="font-medium text-[11px]">Today's Date</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-medium text-[11px]">Critical / High Risk Task</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="font-medium text-[11px]">Standard Milestone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium text-[11px]">Completed Deliverable</span>
          </div>
        </div>

        <div className="text-[11px] font-medium text-zinc-500 flex items-center space-x-1">
          <span>Click any date or</span>
          <span className="inline-flex items-center px-1 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px] mx-0.5">
            <Plus className="h-3 w-3 inline" />
          </span>
          <span>to schedule deliverables.</span>
        </div>
      </div>
    </div>
  );
}

