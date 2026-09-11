import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  PieChart,
  BarChart3,
  Activity,
  Plus,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function OverviewMetrics({
  currentProject,
  projectDetails,
  isDarkMode,
  setActiveTab,
  onOpenAddTask,
  authUser
}) {
  const tasks = projectDetails?.tasks || [];
  const phases = projectDetails?.phases || [];
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const plannedTasks = tasks.filter(t => t.status === 'Planned' || t.status === 'Backlog' || t.status === 'Todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Bugs calculation
  const bugs = projectDetails?.bugs || [];
  const criticalBugs = bugs.filter(
    b => (b.severity === 'CRITICAL' || b.severity === 'HIGH') && b.status !== 'CLOSED' && b.status !== 'VERIFIED'
  ).length;
  const totalBugs = bugs.length;

  // Priority counts
  const criticalTasks = tasks.filter(t => t.priority === 'Critical').length;
  const highTasks = tasks.filter(t => t.priority === 'High').length;
  const medTasks = tasks.filter(t => t.priority === 'Medium').length;
  const lowTasks = tasks.filter(t => t.priority === 'Low' || !t.priority).length;

  // Donut chart calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const completedStroke = totalTasks > 0 ? (completedTasks / totalTasks) * circumference : 0;
  const inProgressStroke = totalTasks > 0 ? (inProgressTasks / totalTasks) * circumference : 0;
  const plannedStroke = totalTasks > 0 ? (plannedTasks / totalTasks) * circumference : circumference;

  // Velocity trends mock data points
  const trendPoints = [
    { label: 'Mon', val: Math.max(1, Math.round(totalTasks * 0.2)) },
    { label: 'Tue', val: Math.max(2, Math.round(totalTasks * 0.35)) },
    { label: 'Wed', val: Math.max(3, Math.round(totalTasks * 0.5)) },
    { label: 'Thu', val: Math.max(4, Math.round(totalTasks * 0.7)) },
    { label: 'Fri', val: Math.max(5, Math.round(totalTasks * 0.85)) },
    { label: 'Today', val: totalTasks }
  ];
  const maxTrend = Math.max(...trendPoints.map(p => p.val), 6);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div
        className={`p-6 rounded-2xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#121426] via-[#101222] to-[#151228] border-zinc-800/80 shadow-xl'
            : 'bg-gradient-to-r from-white via-violet-50/40 to-indigo-50/30 border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                isDarkMode
                  ? 'bg-purple-950/60 border-purple-800 text-purple-300'
                  : 'bg-violet-100 border-violet-200 text-violet-800'
              }`}
            >
              {currentProject ? `PRJ-${String(currentProject.id).padStart(3, '0')}` : 'PRJ-001'}
            </span>
            <h2
              className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                isDarkMode ? 'text-zinc-100' : 'text-slate-900'
              }`}
            >
              {currentProject?.name || 'Enterprise SDLC Pipeline'}
            </h2>
          </div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            {currentProject?.description || 'Corporate banking system workflow governance, compliance checkpoints, and delivery analytics.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenAddTask}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/20'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isDarkMode
                ? 'bg-[#16182a] border-zinc-750 text-zinc-200 hover:bg-[#1f2238] hover:border-purple-500/40'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
            }`}
          >
            <span>Kanban Board</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Top KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-md'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Total Tasks
            </span>
            <div
              className={`p-2 rounded-xl border ${
                isDarkMode ? 'bg-purple-950/40 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
              }`}
            >
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              {totalTasks}
            </span>
            <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {phases.length} SDLC Stages
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-[11px] text-zinc-400">
            <span className="text-emerald-400 font-bold">{completedTasks} completed</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">{inProgressTasks} active</span>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-md'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              In Progress
            </span>
            <div
              className={`p-2 rounded-xl border ${
                isDarkMode ? 'bg-blue-950/40 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-black text-blue-400`}>
              {inProgressTasks}
            </span>
            <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0}% Active Load
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Critical Defects */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-md'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Critical Defects
            </span>
            <div
              className={`p-2 rounded-xl border ${
                criticalBugs > 0
                  ? isDarkMode ? 'bg-rose-950/40 border-rose-800 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700'
                  : isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              {criticalBugs > 0 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                criticalBugs > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {criticalBugs}
            </span>
            <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {totalBugs} Total Defects
            </span>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setActiveTab('bug_tracker')}
              className={`text-[11px] font-bold hover:underline cursor-pointer flex items-center space-x-1 ${
                isDarkMode ? 'text-purple-400' : 'text-violet-700'
              }`}
            >
              <span>View Defect Tracker</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Overall Stage Completion */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-md'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Stage Completion
            </span>
            <div
              className={`p-2 rounded-xl border ${
                isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">
              {completionRate}%
            </span>
            <span className={`text-xs font-bold font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              {completedTasks} of {totalTasks} Tasks
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2x2 Clean Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Task Velocity & Trends (Line Chart) */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-lg'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-inherit">
            <div className="flex items-center space-x-2">
              <div
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-purple-950/40 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Task Completion Velocity
                </h3>
                <p className={`text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Daily task progression and status transitions
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              +18.4% this week
            </span>
          </div>

          {/* SVG Smooth Curve Line Chart */}
          <div className="h-48 w-full relative flex items-center justify-center pt-2">
            <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={isDarkMode ? '#8b5cf6' : '#7c3aed'} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke={isDarkMode ? '#27272a' : '#e2e8f0'} strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="480" y2="80" stroke={isDarkMode ? '#27272a' : '#e2e8f0'} strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="480" y2="130" stroke={isDarkMode ? '#27272a' : '#e2e8f0'} strokeDasharray="4 4" />

              {/* Area Fill */}
              <path
                d="M 50,130 Q 130,110 210,85 T 370,45 T 470,25 L 470,135 L 50,135 Z"
                fill="url(#velocityGrad)"
              />

              {/* Curve Line */}
              <path
                d="M 50,130 Q 130,110 210,85 T 370,45 T 470,25"
                fill="none"
                stroke={isDarkMode ? '#a78bfa' : '#7c3aed'}
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Points */}
              {[
                { cx: 50, cy: 130, label: 'Mon' },
                { cx: 130, cy: 110, label: 'Tue' },
                { cx: 210, cy: 85, label: 'Wed' },
                { cx: 290, cy: 65, label: 'Thu' },
                { cx: 370, cy: 45, label: 'Fri' },
                { cx: 470, cy: 25, label: 'Today' }
              ].map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.cx}
                    cy={pt.cy}
                    r="5"
                    fill={isDarkMode ? '#1e1b4b' : '#ffffff'}
                    stroke={isDarkMode ? '#c4b5fd' : '#7c3aed'}
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.cx}
                    y="150"
                    textAnchor="middle"
                    fontSize="10"
                    fill={isDarkMode ? '#a1a1aa' : '#64748b'}
                    fontWeight="bold"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* 2. Project Status Breakdown (Donut / Ring Chart) */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-lg'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-inherit">
            <div className="flex items-center space-x-2">
              <div
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-indigo-950/40 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}
              >
                <PieChart className="h-4 w-4" />
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Workflow Distribution
                </h3>
                <p className={`text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Task state breakdown across full SDLC
                </p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              {totalTasks} Total Items
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={isDarkMode ? '#27272a' : '#e2e8f0'}
                  strokeWidth="14"
                />
                {/* Planned Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={isDarkMode ? '#6366f1' : '#4f46e5'}
                  strokeWidth="14"
                  strokeDasharray={`${plannedStroke} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                {/* In Progress Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={isDarkMode ? '#38bdf8' : '#0284c7'}
                  strokeWidth="14"
                  strokeDasharray={`${inProgressStroke} ${circumference}`}
                  strokeDashoffset={`-${plannedStroke}`}
                  strokeLinecap="round"
                />
                {/* Completed Segment */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={isDarkMode ? '#34d399' : '#10b981'}
                  strokeWidth="14"
                  strokeDasharray={`${completedStroke} ${circumference}`}
                  strokeDashoffset={`-${plannedStroke + inProgressStroke}`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Center Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black">{completionRate}%</span>
                <span className={`text-[9px] uppercase font-bold tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Done
                </span>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-2.5 flex-1 min-w-[180px]">
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'}>Completed</span>
                </div>
                <span className="font-mono">{completedTasks} ({totalTasks > 0 ? Math.round((completedTasks/totalTasks)*100) : 0}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <span className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'}>In Progress</span>
                </div>
                <span className="font-mono">{inProgressTasks} ({totalTasks > 0 ? Math.round((inProgressTasks/totalTasks)*100) : 0}%)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className={isDarkMode ? 'text-zinc-300' : 'text-slate-700'}>Planned / Backlog</span>
                </div>
                <span className="font-mono">{plannedTasks} ({totalTasks > 0 ? Math.round((plannedTasks/totalTasks)*100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Task Priority Breakdown */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-lg'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-inherit">
            <div className="flex items-center space-x-2">
              <div
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-amber-950/40 border-amber-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  Task Priority Breakdown
                </h3>
                <p className={`text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Criticality classification of active tasks
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Critical', count: criticalTasks, color: 'bg-rose-500', text: 'text-rose-400' },
              { label: 'High', count: highTasks, color: 'bg-orange-500', text: 'text-orange-400' },
              { label: 'Medium', count: medTasks, color: 'bg-blue-500', text: 'text-blue-400' },
              { label: 'Low', count: lowTasks, color: 'bg-zinc-500', text: 'text-zinc-400' }
            ].map(p => {
              const pct = totalTasks > 0 ? Math.round((p.count / totalTasks) * 100) : 0;
              return (
                <div key={p.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={p.text}>{p.label} Priority</span>
                    <span className="font-mono text-zinc-400">{p.count} tasks ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Stage Velocity & Milestone Completion */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-4 ${
            isDarkMode
              ? 'bg-[#111322]/90 border-zinc-800/80 shadow-lg'
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-inherit">
            <div className="flex items-center space-x-2">
              <div
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className={`text-xs sm:text-sm font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                  SDLC Stage Velocity
                </h3>
                <p className={`text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  Completion rate per governance stage
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('board')}
              className={`text-[11px] font-bold hover:underline cursor-pointer flex items-center space-x-1 ${
                isDarkMode ? 'text-purple-400' : 'text-violet-700'
              }`}
            >
              <span>Board View</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3 pt-1 max-h-52 overflow-y-auto pr-1">
            {phases.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No stages configured yet.</p>
            ) : (
              phases.map(ph => {
                const phaseTasks = tasks.filter(t => t.phase_id === ph.id);
                const phaseDone = phaseTasks.filter(t => t.status === 'Completed').length;
                const phasePct = phaseTasks.length > 0 ? Math.round((phaseDone / phaseTasks.length) * 100) : 0;

                return (
                  <div key={ph.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="truncate">{ph.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase ${
                            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {ph.governing_department || ph.role_access || 'General'}
                        </span>
                      </div>
                      <span className="font-mono text-zinc-400 shrink-0 ml-2">
                        {phaseDone}/{phaseTasks.length} ({phasePct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${phasePct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
