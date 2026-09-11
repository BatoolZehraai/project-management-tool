import React from 'react';
import {
  ShieldCheck,
  History,
  Filter,
  Archive,
  RefreshCw,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function AuditTrailView({
  currentProject,
  projectActivities = [],
  activityPagination = { total: 0, has_more: false, current_page: 1 },
  activityFilter = 'ALL',
  activityTimeframe = '7_days',
  isActivitiesLoading = false,
  isActivitiesLoadingMore = false,
  isArchivingActivities = false,
  collapsedSections = { today: false, yesterday: false, earlier: true },
  onTimeframeChange,
  onFilterTypeChange,
  onLoadMore,
  onArchiveOlder,
  onToggleCollapse,
  onRefresh,
  onOpenTaskDetail,
  projectDetails,
  authUser,
  isDarkMode,
  formatTimeAgo,
  groupActivitiesByDate
}) {
  const groups = groupActivitiesByDate ? groupActivitiesByDate(projectActivities) : { today: [], yesterday: [], earlier: projectActivities };

  const renderActivityItem = (a) => {
    const initials = (a.user_name || 'User')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const matchedTask = a.task_id && projectDetails?.tasks ? projectDetails.tasks.find(t => t.id === a.task_id) : null;

    return (
      <div
        key={a.id}
        className={`p-3.5 sm:p-4 rounded-xl border transition flex items-start space-x-3.5 group ${
          isDarkMode
            ? 'bg-[#141624]/85 border-zinc-800/80 hover:border-purple-500/40 hover:bg-[#1a1d2e] shadow-md shadow-black/20'
            : 'bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-violet-300 hover:shadow-xs shadow-xs'
        }`}
      >
        {/* User Avatar with initials */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 shadow-xs ${
            isDarkMode
              ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
              : 'bg-purple-50 border border-purple-200 text-purple-700'
          }`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center space-x-2">
              <span className={`font-extrabold text-xs ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                {a.user_name}
              </span>
              <span
                className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                  isDarkMode
                    ? 'bg-zinc-900 border-zinc-800 text-purple-300'
                    : 'bg-purple-50 border border-purple-200 text-purple-700 font-bold'
                }`}
              >
                {a.user_role}
              </span>
              {a.is_archived && (
                <span
                  className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    isDarkMode
                      ? 'bg-amber-950/50 border-amber-800 text-amber-400'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}
                >
                  Archived
                </span>
              )}
            </div>

            <span
              className={`text-[10px] font-mono shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400 font-semibold'}`}
              title={a.created_at ? new Date(a.created_at.endsWith('Z') ? a.created_at : a.created_at + 'Z').toLocaleString() : ''}
            >
              {formatTimeAgo(a.created_at)}
            </span>
          </div>

          {/* Action Description */}
          <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-zinc-200' : 'text-slate-700 font-medium'}`}>
            {a.details}
          </p>

          {/* State Transition Badge (if present) */}
          {a.previous_state && a.new_state && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10.5px]">
              <span
                className={`px-2 py-0.5 rounded border font-medium ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {a.previous_state}
              </span>
              <ArrowRight className={`h-3 w-3 shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-violet-600'}`} />
              <span
                className={`px-2 py-0.5 rounded border font-bold ${
                  a.new_state === 'Completed' || a.new_state === 'CLOSED' || a.new_state === 'VERIFIED'
                    ? isDarkMode ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : a.new_state === 'In Progress' || a.new_state === 'IN_PROGRESS'
                      ? isDarkMode ? 'bg-blue-950/60 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800'
                      : isDarkMode ? 'bg-purple-950/60 border-purple-800 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-800'
                }`}
              >
                {a.new_state}
              </span>

              {matchedTask && onOpenTaskDetail && (
                <button
                  type="button"
                  onClick={() => onOpenTaskDetail(matchedTask)}
                  className={`ml-auto text-[10px] font-bold hover:underline cursor-pointer flex items-center space-x-1 ${
                    isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'
                  }`}
                >
                  <span>View Task #{matchedTask.id}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-md'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-purple-950/40 border-purple-800 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-base sm:text-lg font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Compliance Audit Trail & Activity Feed
              </h2>
              <span className="flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>Live</span>
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Immutable regulatory audit log with permanent database retention and full state-transition history.
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1.5">
            <Filter className={`h-3.5 w-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} />
            <select
              value={activityTimeframe}
              onChange={(e) => onTimeframeChange(e.target.value)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold outline-none cursor-pointer ${
                isDarkMode ? 'bg-[#141624] border-zinc-750 text-zinc-200' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
              }`}
            >
              <option value="7_days">Last 7 Days (Default)</option>
              <option value="today">Today</option>
              <option value="30_days">Last 30 Days</option>
              <option value="all_time">All Time (Archive)</option>
            </select>
          </div>

          {/* Admin Archive */}
          {authUser?.role === 'SUPER_ADMIN' && onArchiveOlder && (
            <button
              type="button"
              onClick={onArchiveOlder}
              disabled={isArchivingActivities}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-bold transition cursor-pointer ${
                isDarkMode ? 'bg-amber-950/30 border-amber-800 text-amber-300 hover:bg-amber-900/50' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 shadow-xs'
              }`}
            >
              <Archive className={`h-3.5 w-3.5 ${isArchivingActivities ? 'animate-spin' : ''}`} />
              <span>Archive &gt;30d</span>
            </button>
          )}

          {/* Refresh */}
          <button
            type="button"
            onClick={onRefresh}
            className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-bold transition cursor-pointer ${
              isDarkMode ? 'bg-[#141624] border-zinc-750 text-zinc-300 hover:bg-[#1e2136]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isActivitiesLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {[
          { key: 'ALL', label: 'All Activity' },
          { key: 'STATUS_CHANGE', label: 'Status Shifts' },
          { key: 'STAGE_SHIFT', label: 'Stage Moves' },
          { key: 'CREATE_TASK', label: 'Creations' },
          { key: 'UPDATE_TASK', label: 'Task Edits' }
        ].map(f => {
          const isSelected = activityFilter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterTypeChange(f.key)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? isDarkMode
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs'
                  : isDarkMode
                    ? 'bg-[#121424] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
              }`}
            >
              <span>{f.label}</span>
              {isSelected && (
                <span className="text-[9.5px] px-1.5 py-0.2 rounded-full font-mono bg-white/20 text-white">
                  {projectActivities.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Stream */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${
          isDarkMode ? 'bg-[#0f111e] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {isActivitiesLoading && projectActivities.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <RefreshCw className="h-6 w-6 text-purple-400 animate-spin mx-auto opacity-70" />
            <p className="text-xs text-zinc-400 font-medium">Fetching verified compliance logs...</p>
          </div>
        ) : projectActivities.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-zinc-500">
            <Clock className="h-7 w-7 text-purple-400 mx-auto opacity-40" />
            <p className="text-xs font-bold">No activity records found in this timeframe and filter.</p>
            <p className="text-[11px] text-zinc-400">All lifecycle events are recorded immutably in real time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* TODAY */}
            {groups.today.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                    <span className="text-xs font-black tracking-wide uppercase text-purple-400">Today</span>
                    <span className="text-[9.5px] px-2 py-0.2 rounded-full font-mono font-bold bg-purple-950/80 border border-purple-800 text-purple-300">
                      {groups.today.length} items
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleCollapse('today')}
                    className="text-[10.5px] font-bold text-zinc-400 hover:text-zinc-200 cursor-pointer flex items-center space-x-1"
                  >
                    <span>{collapsedSections.today ? 'Expand' : 'Collapse'}</span>
                    {collapsedSections.today ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </button>
                </div>
                {!collapsedSections.today && (
                  <div className="space-y-2.5">
                    {groups.today.map(renderActivityItem)}
                  </div>
                )}
              </div>
            )}

            {/* YESTERDAY */}
            {groups.yesterday.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs font-black tracking-wide uppercase text-indigo-400">Yesterday</span>
                    <span className="text-[9.5px] px-2 py-0.2 rounded-full font-mono font-bold bg-indigo-950/80 border border-indigo-800 text-indigo-300">
                      {groups.yesterday.length} items
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleCollapse('yesterday')}
                    className="text-[10.5px] font-bold text-zinc-400 hover:text-zinc-200 cursor-pointer flex items-center space-x-1"
                  >
                    <span>{collapsedSections.yesterday ? 'Expand' : 'Collapse'}</span>
                    {collapsedSections.yesterday ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                  </button>
                </div>
                {!collapsedSections.yesterday && (
                  <div className="space-y-2.5">
                    {groups.yesterday.map(renderActivityItem)}
                  </div>
                )}
              </div>
            )}

            {/* EARLIER / OLDER */}
            {groups.earlier.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-[#121422]/60">
                <button
                  type="button"
                  onClick={() => onToggleCollapse('earlier')}
                  className="w-full flex items-center justify-between p-3.5 cursor-pointer text-left group"
                >
                  <div className="flex items-center space-x-2.5">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold uppercase text-zinc-200">Earlier / Historical Activities</span>
                        <span className="text-[9.5px] px-2 py-0.2 rounded-full font-mono font-bold bg-zinc-800 border border-zinc-700 text-zinc-300">
                          {groups.earlier.length} items
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {collapsedSections.earlier ? 'Click to expand historical compliance logs' : 'Click to collapse historical compliance logs'}
                      </p>
                    </div>
                  </div>
                  {collapsedSections.earlier ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronUp className="h-4 w-4 text-zinc-400" />}
                </button>
                {!collapsedSections.earlier && (
                  <div className="p-3.5 pt-0 space-y-2.5 border-t border-dashed border-zinc-800 mt-1">
                    <div className="pt-2 space-y-2.5">
                      {groups.earlier.map(renderActivityItem)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        <div className="pt-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-medium text-zinc-400">
            Showing <span className="font-bold text-purple-400">{projectActivities.length}</span> of <span className="font-bold">{activityPagination.total}</span> total records
          </p>

          {activityPagination.has_more ? (
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isActivitiesLoadingMore}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md cursor-pointer"
            >
              {isActivitiesLoadingMore ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Loading Older Logs...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Load Older Activities (+10)</span>
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All records loaded</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
