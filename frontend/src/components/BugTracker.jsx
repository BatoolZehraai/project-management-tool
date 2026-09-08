import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Bug,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  CheckCheck,
  RotateCcw,
  XCircle,
  User,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ChevronRight,
  Shield,
  Layers,
  FileText,
  Activity,
  History,
  Calendar,
  Sparkles,
  LayoutGrid,
  Columns,
  Table as TableIcon,
  Trash2,
  Edit,
  ExternalLink,
  Info,
  Check,
  Flame,
  ArrowLeft,
  RefreshCw,
  Send,
  UserCheck
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'Critical',
    bgLight: 'bg-rose-50 border-rose-200 text-rose-700',
    bgDark: 'bg-rose-950/40 border-rose-800/50 text-rose-300',
    dot: 'bg-rose-500',
    badge: 'bg-rose-500 text-white',
    icon: Flame
  },
  HIGH: {
    label: 'High',
    bgLight: 'bg-amber-50 border-amber-200 text-amber-700',
    bgDark: 'bg-amber-950/40 border-amber-800/50 text-amber-300',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500 text-white',
    icon: AlertTriangle
  },
  MEDIUM: {
    label: 'Medium',
    bgLight: 'bg-blue-50 border-blue-200 text-blue-700',
    bgDark: 'bg-blue-950/40 border-blue-800/50 text-blue-300',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500 text-white',
    icon: AlertCircle
  },
  LOW: {
    label: 'Low',
    bgLight: 'bg-slate-100 border-slate-200 text-slate-700',
    bgDark: 'bg-zinc-800/60 border-zinc-700 text-zinc-300',
    dot: 'bg-slate-400',
    badge: 'bg-slate-500 text-white',
    icon: Info
  }
};

const STATUS_PIPELINE = [
  { key: 'NEW', label: 'New', color: 'slate', icon: Sparkles },
  { key: 'ASSIGNED', label: 'Assigned', color: 'indigo', icon: UserCheck },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'amber', icon: Play },
  { key: 'RESOLVED', label: 'Resolved', color: 'cyan', icon: CheckCircle2 },
  { key: 'VERIFIED', label: 'Verified', color: 'emerald', icon: CheckCheck },
  { key: 'CLOSED', label: 'Closed', color: 'zinc', icon: XCircle },
  { key: 'REOPENED', label: 'Reopened', color: 'rose', icon: RotateCcw }
];

export default function BugTracker({ activeProject, isDarkMode, authUser, onBack }) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [phaseFilter, setPhaseFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'grid' | 'table'

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeBugModal, setActiveBugModal] = useState(null); // Bug details & Stepper
  const [bugHistory, setBugHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Form State
  const [newBugForm, setNewBugForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    phase_id: '',
    task_id: '',
    assigned_to_id: ''
  });
  const [submittingBug, setSubmittingBug] = useState(false);

  // Status update transition state in modal
  const [transitionComment, setTransitionComment] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [customTargetStatus, setCustomTargetStatus] = useState('');

  const token = localStorage.getItem('authToken');
  const isSuperAdmin = authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'Admin';
  const userDept = (authUser?.department || '').toLowerCase();
  const isQA = userDept.includes('qa') || userDept.includes('quality');
  const isDev = userDept.includes('software') || userDept.includes('engineering') || userDept.includes('dev');

  const [projectData, setProjectData] = useState(activeProject);

  // Fetch bugs, users, phases, and tasks
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      let projId = activeProject?.id || projectData?.id;
      if (!projId) {
        const pList = await axios.get(`${API_BASE}/projects`, { headers });
        if (pList.data && pList.data.length > 0) {
          projId = pList.data[0].id;
          setProjectData(pList.data[0]);
        }
      }

      if (!projId) {
        setLoading(false);
        return;
      }

      const [bugsRes, usersRes, projRes] = await Promise.all([
        axios.get(`${API_BASE}/projects/${projId}/bugs`, { headers }),
        axios.get(`${API_BASE}/users/approved`, { headers }),
        axios.get(`${API_BASE}/projects/${projId}`, { headers })
      ]);

      setBugs(bugsRes.data || []);
      setUsers(usersRes.data || []);
      setPhases(projRes.data?.phases || []);
      setProjectData(projRes.data || activeProject);

      // Extract tasks
      const allTasks = [];
      if (projRes.data?.phases) {
        projRes.data.phases.forEach(ph => {
          if (ph.tasks) allTasks.push(...ph.tasks);
        });
      }
      setTasks(allTasks);

      // Default phase for new bug form
      if (projRes.data?.phases?.length > 0 && !newBugForm.phase_id) {
        setNewBugForm(prev => ({ ...prev, phase_id: projRes.data.phases[0].id }));
      }
    } catch (err) {
      console.error('Error fetching bug tracker data:', err);
      setError(err.response?.data?.error || 'Failed to load defect tracking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeProject?.id]);

  // Fetch Bug History
  const fetchBugHistory = async (bugId) => {
    if (!bugId || !token) return;
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${API_BASE}/bugs/${bugId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBugHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch bug history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open Modal
  const handleOpenBugModal = (bug) => {
    setActiveBugModal(bug);
    setTransitionComment('');
    setCustomTargetStatus(bug.status);
    fetchBugHistory(bug.id);
  };

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const total = bugs.length;
    const critical = bugs.filter(b => b.severity === 'CRITICAL' && b.status !== 'CLOSED').length;
    const high = bugs.filter(b => b.severity === 'HIGH' && b.status !== 'CLOSED').length;
    const inProgress = bugs.filter(b => b.status === 'IN_PROGRESS' || b.status === 'ASSIGNED').length;
    const resolved = bugs.filter(b => b.status === 'RESOLVED' || b.status === 'VERIFIED').length;
    const closed = bugs.filter(b => b.status === 'CLOSED').length;
    const velocity = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 100;

    return { total, critical, high, inProgress, resolved, closed, velocity };
  }, [bugs]);

  // Filtered Bugs
  const filteredBugs = useMemo(() => {
    return bugs.filter(b => {
      const matchSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bug_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.assigned_to_name && b.assigned_to_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSeverity = severityFilter === 'ALL' || b.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      const matchPhase = phaseFilter === 'ALL' || String(b.phase_id) === String(phaseFilter);

      return matchSearch && matchSeverity && matchStatus && matchPhase;
    });
  }, [bugs, searchQuery, severityFilter, statusFilter, phaseFilter]);

  // Submit New Bug Report
  const handleReportBug = async (e) => {
    e.preventDefault();
    if (!newBugForm.title.trim() || !newBugForm.phase_id) return;

    setSubmittingBug(true);
    try {
      const res = await axios.post(
        `${API_BASE}/phases/${newBugForm.phase_id}/bugs`,
        {
          title: newBugForm.title.trim(),
          description: newBugForm.description.trim(),
          severity: newBugForm.severity,
          task_id: newBugForm.task_id ? parseInt(newBugForm.task_id) : null,
          assigned_to_id: newBugForm.assigned_to_id ? parseInt(newBugForm.assigned_to_id) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBugs(prev => [res.data, ...prev]);
      setIsReportModalOpen(false);
      setNewBugForm({
        title: '',
        description: '',
        severity: 'MEDIUM',
        phase_id: phases[0]?.id || '',
        task_id: '',
        assigned_to_id: ''
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to report defect.');
    } finally {
      setSubmittingBug(false);
    }
  };

  // Transition Bug Status
  const handleTransitionStatus = async (targetStatus, override = false) => {
    if (!activeBugModal || !targetStatus) return;
    setTransitioning(true);
    try {
      const res = await axios.patch(
        `${API_BASE}/bugs/${activeBugModal.id}/status`,
        {
          status: targetStatus,
          comment: transitionComment.trim(),
          override
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local bug
      setBugs(prev => prev.map(b => (b.id === activeBugModal.id ? res.data : b)));
      setActiveBugModal(res.data);
      setTransitionComment('');
      fetchBugHistory(activeBugModal.id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update defect state.');
    } finally {
      setTransitioning(false);
    }
  };

  // Reassign Bug
  const handleReassign = async (bugId, newAssigneeId) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/bugs/${bugId}/status`,
        {
          status: activeBugModal?.status || 'ASSIGNED',
          assigned_to_id: newAssigneeId ? parseInt(newAssigneeId) : 0,
          comment: 'Reassigned defect'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBugs(prev => prev.map(b => (b.id === bugId ? res.data : b)));
      if (activeBugModal?.id === bugId) {
        setActiveBugModal(res.data);
        fetchBugHistory(bugId);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reassign defect.');
    }
  };

  // Delete Bug
  const handleDeleteBug = async (bugId) => {
    if (!confirm('Are you sure you want to permanently delete this defect record?')) return;
    try {
      await axios.delete(`${API_BASE}/bugs/${bugId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBugs(prev => prev.filter(b => b.id !== bugId));
      if (activeBugModal?.id === bugId) {
        setActiveBugModal(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete defect.');
    }
  };

  return (
    <div className={`min-h-screen pb-16 transition-colors duration-200 ${
      isDarkMode ? 'bg-[#090a12] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Breadcrumb & Actions Bar */}
      <div className={`border-b sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 ${
        isDarkMode ? 'bg-[#0e0f1a]/95 border-zinc-800 shadow-md shadow-black/20' : 'bg-white/95 border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              isDarkMode 
                ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-300' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Board</span>
          </button>

          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl border flex items-center justify-center ${
              isDarkMode ? 'bg-rose-950/40 border-rose-800/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
            }`}>
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight">Defect & Bug Lifecycle Governance</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDarkMode ? 'bg-purple-950/40 border-purple-800/40 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700'
                }`}>
                  ISO 20022 Audit Ready
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Active Workspace: <span className="font-semibold">{activeProject?.name || 'Loading Project...'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchData}
            title="Refresh Defect Register"
            className={`p-2 rounded-lg border transition cursor-pointer ${
              isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-300' : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Report Defect</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* KPI Metric Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
            isDarkMode ? 'bg-[#0f111d] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Total Defects</span>
              <Bug className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black">{metrics.total}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Registered</span>
            </div>
          </div>

          {/* Critical Severity */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
            isDarkMode 
              ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' 
              : 'bg-rose-50/70 border-rose-200 text-rose-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold text-rose-500">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>Critical</span>
              </div>
              <Flame className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-rose-500">{metrics.critical}</span>
              <span className="text-[10px] text-rose-400/80 font-mono">Immediate Fix</span>
            </div>
          </div>

          {/* High Severity */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
            isDarkMode ? 'bg-amber-950/20 border-amber-900/40 text-amber-300' : 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-500">
              <span>High Severity</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-500">{metrics.high}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">Priority</span>
            </div>
          </div>

          {/* In Progress */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
            isDarkMode ? 'bg-[#0f111d] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>In Triage / Fix</span>
              <Play className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black">{metrics.inProgress}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Active</span>
            </div>
          </div>

          {/* Resolved / Verified */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
            isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-500">
              <span>QA Verified</span>
              <CheckCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-500">{metrics.resolved}</span>
              <span className="text-[10px] text-emerald-400/80 font-mono">Ready to Close</span>
            </div>
          </div>

          {/* Resolution Velocity */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between transition ${
            isDarkMode ? 'bg-[#0f111d] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span>Resolution Rate</span>
              <Activity className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-indigo-400">{metrics.velocity}%</span>
              <span className="text-[10px] text-zinc-500 font-mono">{metrics.closed} Closed</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters, View Modes */}
        <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode ? 'bg-[#0e0f1a] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search by BUG ID, title, description, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs outline-none transition ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-750 text-zinc-100 placeholder:text-zinc-500 focus:border-rose-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-rose-500'
              }`}
            />
          </div>

          {/* Filter Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition cursor-pointer ${
                isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition cursor-pointer ${
                isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="VERIFIED">Verified</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
            </select>

            {/* Stage / Phase Filter */}
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium outline-none transition cursor-pointer max-w-[160px] truncate ${
                isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="ALL">All SDLC Stages</option>
              {phases.map(ph => (
                <option key={ph.id} value={ph.id}>{ph.name}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className={`p-0.5 rounded-lg border flex items-center ${
              isDarkMode ? 'bg-zinc-900 border-zinc-750' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('board')}
                title="Kanban Board View"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'board'
                    ? isDarkMode ? 'bg-zinc-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Card Grid View"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'grid'
                    ? isDarkMode ? 'bg-zinc-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                title="Tabular Data View"
                className={`p-1.5 rounded-md transition cursor-pointer ${
                  viewMode === 'table'
                    ? isDarkMode ? 'bg-zinc-800 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MAIN DEFECT VIEW AREA */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
            <p className="text-xs font-semibold text-zinc-400">Loading defect lifecycle register...</p>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className={`p-12 rounded-2xl border text-center space-y-3 ${
            isDarkMode ? 'bg-[#0e0f1a] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className={`mx-auto w-12 h-12 rounded-2xl border flex items-center justify-center ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}>
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold">No Defects Found Matching Criteria</h3>
            <p className={`text-xs max-w-sm mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Try resetting the filters, or click "+ Report Defect" to log a new defect under the active project stage.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSeverityFilter('ALL'); setStatusFilter('ALL'); setPhaseFilter('ALL'); }}
              className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'board' ? (
          /* KANBAN BOARD VIEW (COLUMNS BY LIFECYCLE STATE) */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3.5 items-start overflow-x-auto pb-4">
            {STATUS_PIPELINE.map(stage => {
              const colBugs = filteredBugs.filter(b => b.status === stage.key);
              const StageIcon = stage.icon;

              return (
                <div
                  key={stage.key}
                  className={`rounded-xl border p-3 flex flex-col min-w-[210px] ${
                    isDarkMode ? 'bg-[#0d0f19] border-zinc-800/80' : 'bg-slate-50/80 border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/40">
                    <div className="flex items-center space-x-1.5">
                      <StageIcon className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs font-bold tracking-tight">{stage.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {colBugs.length}
                    </span>
                  </div>

                  {/* Bug Cards inside Column */}
                  <div className="space-y-2.5 min-h-[140px]">
                    {colBugs.length === 0 ? (
                      <div className="h-24 flex items-center justify-center text-[10.5px] text-zinc-500 italic border border-dashed border-zinc-800/40 rounded-lg">
                        No defects in {stage.label}
                      </div>
                    ) : (
                      colBugs.map(bug => {
                        const sev = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.MEDIUM;
                        const SevIcon = sev.icon;

                        return (
                          <div
                            key={bug.id}
                            onClick={() => handleOpenBugModal(bug)}
                            className={`p-3 rounded-lg border transition shadow-xs hover:scale-[1.01] cursor-pointer group ${
                              isDarkMode 
                                ? 'bg-[#121422] border-zinc-750 hover:border-purple-500/50 hover:shadow-black/40' 
                                : 'bg-white border-slate-200 hover:border-violet-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="font-mono text-[10px] font-extrabold text-purple-400">
                                {bug.bug_code}
                              </span>
                              <div className={`flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                                isDarkMode ? sev.bgDark : sev.bgLight
                              }`}>
                                <SevIcon className="h-2.5 w-2.5 shrink-0" />
                                <span>{sev.label}</span>
                              </div>
                            </div>

                            <h4 className="text-xs font-bold line-clamp-2 mb-1.5 group-hover:text-purple-400 transition">
                              {bug.title}
                            </h4>

                            <div className={`text-[10px] truncate mb-2 flex items-center gap-1 ${
                              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                            }`}>
                              <Layers className="h-3 w-3 shrink-0 text-zinc-500" />
                              <span className="truncate">{bug.phase_name || 'Stage'}</span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 text-[10px]">
                              <div className="flex items-center gap-1 text-zinc-400">
                                <User className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[80px]">{bug.assigned_to_name || 'Unassigned'}</span>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-500">
                                <History className="h-3 w-3" />
                                <span>{bug.history_count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'grid' ? (
          /* CARD GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBugs.map(bug => {
              const sev = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.MEDIUM;
              const SevIcon = sev.icon;
              const st = STATUS_PIPELINE.find(s => s.key === bug.status) || STATUS_PIPELINE[0];
              const StIcon = st.icon;

              return (
                <div
                  key={bug.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition group ${
                    isDarkMode ? 'bg-[#0e0f1a] border-zinc-800 hover:border-purple-500/40' : 'bg-white border-slate-200 shadow-xs hover:border-violet-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-purple-400">{bug.bug_code}</span>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isDarkMode ? sev.bgDark : sev.bgLight
                        }`}>
                          <SevIcon className="h-3 w-3" />
                          <span>{sev.label}</span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isDarkMode ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        <StIcon className="h-3 w-3 text-purple-400" />
                        <span>{st.label}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => handleOpenBugModal(bug)}
                      className="text-sm font-bold mb-2 cursor-pointer hover:text-purple-400 transition"
                    >
                      {bug.title}
                    </h3>

                    {bug.description && (
                      <p className={`text-xs line-clamp-2 mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                        {bug.description}
                      </p>
                    )}

                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <Layers className="h-3.5 w-3.5 text-zinc-500" />
                        <span className="font-semibold text-zinc-300">{bug.phase_name}</span>
                      </div>
                      {bug.task_title && (
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10.5px]">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">Linked Task: {bug.task_title}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium text-[11px]">{bug.assigned_to_name || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenBugModal(bug)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                          isDarkMode 
                            ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-200' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <History className="h-3 w-3 text-purple-400" />
                        <span>Lifecycle</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* DATA TABLE VIEW */
          <div className={`rounded-xl border overflow-hidden ${
            isDarkMode ? 'bg-[#0e0f1a] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`border-b font-bold ${
                  isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <tr>
                    <th className="px-4 py-3">Defect ID</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">SDLC Stage</th>
                    <th className="px-4 py-3">Assignee</th>
                    <th className="px-4 py-3">Reported By</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-zinc-800/60' : 'divide-slate-200'}`}>
                  {filteredBugs.map(bug => {
                    const sev = SEVERITY_CONFIG[bug.severity] || SEVERITY_CONFIG.MEDIUM;
                    const st = STATUS_PIPELINE.find(s => s.key === bug.status) || STATUS_PIPELINE[0];

                    return (
                      <tr
                        key={bug.id}
                        className={`transition hover:bg-purple-500/5 cursor-pointer ${
                          isDarkMode ? 'text-zinc-200' : 'text-slate-800'
                        }`}
                        onClick={() => handleOpenBugModal(bug)}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-purple-400 whitespace-nowrap">
                          {bug.bug_code}
                        </td>
                        <td className="px-4 py-3 font-semibold max-w-[280px] truncate">
                          {bug.title}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${
                            isDarkMode ? sev.bgDark : sev.bgLight
                          }`}>
                            {sev.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${
                            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400 max-w-[160px] truncate">
                          {bug.phase_name}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                          {bug.assigned_to_name || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                          {bug.reported_by_name}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenBugModal(bug)}
                            className="text-xs font-bold text-purple-400 hover:text-purple-300 hover:underline mr-3"
                          >
                            Inspect
                          </button>
                          {(isSuperAdmin || bug.reported_by_id === authUser?.id) && (
                            <button
                              onClick={() => handleDeleteBug(bug.id)}
                              className="text-zinc-500 hover:text-rose-400 p-1"
                              title="Delete Defect"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REPORT DEFECT */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-[#0f111d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-zinc-800 bg-[#141624]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <Bug className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Report New SDLC Defect</h3>
                  <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Submit an audit-tracked defect to the governance engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className={`p-1.5 rounded-lg border transition ${
                  isDarkMode ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleReportBug} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">Defect Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 20022 Pacs.008 XML Parser Buffer Overflow"
                  value={newBugForm.title}
                  onChange={(e) => setNewBugForm({ ...newBugForm, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-rose-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Severity Pill Selector */}
              <div>
                <label className="block text-xs font-bold mb-1.5">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sevKey => {
                    const cfg = SEVERITY_CONFIG[sevKey];
                    const isSelected = newBugForm.severity === sevKey;

                    return (
                      <button
                        type="button"
                        key={sevKey}
                        onClick={() => setNewBugForm({ ...newBugForm, severity: sevKey })}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          isSelected
                            ? isDarkMode ? `${cfg.bgDark} ring-2 ring-rose-500/50` : `${cfg.bgLight} ring-2 ring-rose-500/50`
                            : isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phase & Task Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Target SDLC Stage *</label>
                  <select
                    required
                    value={newBugForm.phase_id}
                    onChange={(e) => setNewBugForm({ ...newBugForm, phase_id: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition cursor-pointer ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {phases.map(ph => (
                      <option key={ph.id} value={ph.id}>{ph.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Optional Linked Task</label>
                  <select
                    value={newBugForm.task_id}
                    onChange={(e) => setNewBugForm({ ...newBugForm, task_id: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition cursor-pointer ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="">No linked task</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-xs font-bold mb-1">Initial Assignee</label>
                <select
                  value={newBugForm.assigned_to_id}
                  onChange={(e) => setNewBugForm({ ...newBugForm, assigned_to_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition cursor-pointer ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="">Unassigned (Status will be NEW)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.department} - {u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold mb-1">Detailed Technical Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide step-by-step reproduction steps, stack traces, or expected vs actual payload behavior..."
                  value={newBugForm.description}
                  onChange={(e) => setNewBugForm({ ...newBugForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-rose-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBug}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {submittingBug ? 'Registering Defect...' : 'Register Defect in SDLC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INTERACTIVE LIFECYCLE STEPPER & AUDIT TIMELINE */}
      {activeBugModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
            isDarkMode ? 'bg-[#0f111d] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-zinc-800 bg-[#131525]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-base font-black text-purple-400">{activeBugModal.bug_code}</span>
                <div className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isDarkMode 
                    ? SEVERITY_CONFIG[activeBugModal.severity]?.bgDark 
                    : SEVERITY_CONFIG[activeBugModal.severity]?.bgLight
                }`}>
                  {activeBugModal.severity}
                </div>
                <h3 className="text-sm font-bold truncate max-w-md">{activeBugModal.title}</h3>
              </div>

              <div className="flex items-center space-x-2">
                {(isSuperAdmin || activeBugModal.reported_by_id === authUser?.id) && (
                  <button
                    onClick={() => handleDeleteBug(activeBugModal.id)}
                    title="Delete Defect"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setActiveBugModal(null)}
                  className={`p-1.5 rounded-lg border transition ${
                    isDarkMode ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-800' : 'border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* 1. VISUAL LIFECYCLE STEPPER BAR */}
              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-[#141626] border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Defect Lifecycle State Machine
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Current: {activeBugModal.status}
                  </span>
                </div>

                {/* Pipeline Stepper Nodes */}
                <div className="relative flex items-center justify-between overflow-x-auto py-2">
                  {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED'].map((stKey, index) => {
                    const stObj = STATUS_PIPELINE.find(s => s.key === stKey);
                    const isCurrent = activeBugModal.status === stKey;
                    const isPassed =
                      ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED'].indexOf(activeBugModal.status) > index;

                    return (
                      <div key={stKey} className="flex-1 flex flex-col items-center relative group min-w-[70px]">
                        {/* Connecting Line */}
                        {index > 0 && (
                          <div className={`absolute top-4 -left-1/2 right-1/2 h-0.5 -z-0 transition-colors ${
                            isPassed || isCurrent 
                              ? 'bg-purple-500' 
                              : isDarkMode ? 'bg-zinc-800' : 'bg-slate-200'
                          }`} />
                        )}

                        {/* Node Bubble */}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs z-10 transition-all ${
                          isCurrent
                            ? 'bg-purple-600 border-purple-300 text-white ring-4 ring-purple-500/30 shadow-lg scale-110'
                            : isPassed
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-500' : 'bg-white border-slate-300 text-slate-400'
                        }`}>
                          {isPassed ? <Check className="h-4 w-4 stroke-[3]" /> : index + 1}
                        </div>

                        {/* Label */}
                        <span className={`mt-2 text-[10px] font-bold whitespace-nowrap ${
                          isCurrent 
                            ? 'text-purple-400' 
                            : isPassed 
                            ? 'text-emerald-500' 
                            : isDarkMode ? 'text-zinc-500' : 'text-slate-400'
                        }`}>
                          {stObj?.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reopened Banner Notice if active */}
                {activeBugModal.status === 'REOPENED' && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 shrink-0 animate-spin" />
                    <span>This defect was rejected or regressed during verification and is currently in <strong>REOPENED</strong> state.</span>
                  </div>
                )}
              </div>

              {/* 2. GOVERNED STATE TRANSITION ACTIONS */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDarkMode ? 'bg-[#121422] border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Authorized Lifecycle Transitions</span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <span>Role: <strong className="text-purple-400">{authUser?.role}</strong></span>
                    <span>•</span>
                    <span>Dept: <strong className="text-zinc-300">{authUser?.department}</strong></span>
                  </div>
                </div>

                {/* Transition Notes Input */}
                <div>
                  <input
                    type="text"
                    placeholder="Enter audit notes / resolution commit / verification summary (optional)..."
                    value={transitionComment}
                    onChange={(e) => setTransitionComment(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none transition ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500'
                    }`}
                  />
                </div>

                {/* Dynamic Action Buttons based on state */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* Developers Actions */}
                  {activeBugModal.status === 'NEW' && (
                    <button
                      disabled={transitioning}
                      onClick={() => handleTransitionStatus('ASSIGNED')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Move to ASSIGNED</span>
                    </button>
                  )}

                  {(activeBugModal.status === 'ASSIGNED' || activeBugModal.status === 'NEW' || activeBugModal.status === 'REOPENED') && (
                    <button
                      disabled={transitioning}
                      onClick={() => handleTransitionStatus('IN_PROGRESS')}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Work (IN_PROGRESS)</span>
                    </button>
                  )}

                  {activeBugModal.status === 'IN_PROGRESS' && (
                    <button
                      disabled={transitioning}
                      onClick={() => handleTransitionStatus('RESOLVED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark RESOLVED (Submit to QA)</span>
                    </button>
                  )}

                  {/* QA Actions */}
                  {activeBugModal.status === 'RESOLVED' && (
                    <>
                      <button
                        disabled={transitioning}
                        onClick={() => handleTransitionStatus('VERIFIED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>QA Verify Fix</span>
                      </button>
                      <button
                        disabled={transitioning}
                        onClick={() => handleTransitionStatus('REOPENED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reject & Reopen</span>
                      </button>
                    </>
                  )}

                  {activeBugModal.status === 'VERIFIED' && (
                    <>
                      <button
                        disabled={transitioning}
                        onClick={() => handleTransitionStatus('CLOSED')}
                        className="px-3.5 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Officially Close Defect</span>
                      </button>
                      <button
                        disabled={transitioning}
                        onClick={() => handleTransitionStatus('REOPENED')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reopen Defect</span>
                      </button>
                    </>
                  )}

                  {activeBugModal.status === 'CLOSED' && (
                    <button
                      disabled={transitioning}
                      onClick={() => handleTransitionStatus('REOPENED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reopen Closed Defect</span>
                    </button>
                  )}

                  {/* Super Admin Master Override Controls */}
                  {isSuperAdmin && (
                    <div className="ml-auto flex items-center space-x-2 pt-2 sm:pt-0">
                      <select
                        value={customTargetStatus}
                        onChange={(e) => setCustomTargetStatus(e.target.value)}
                        className={`px-2 py-1 rounded border text-[11px] font-bold outline-none cursor-pointer ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-700 text-purple-300' : 'bg-slate-50 border-slate-300 text-purple-700'
                        }`}
                      >
                        {STATUS_PIPELINE.map(s => (
                          <option key={s.key} value={s.key}>Override to: {s.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleTransitionStatus(customTargetStatus, true)}
                        className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition cursor-pointer"
                      >
                        Super Admin Override
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. DEFECT METADATA GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  isDarkMode ? 'bg-[#121422] border-zinc-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Governance Context</h4>
                  <div>
                    <span className="text-zinc-500">SDLC Phase:</span>
                    <p className="font-semibold text-zinc-200">{activeBugModal.phase_name}</p>
                  </div>
                  {activeBugModal.task_title && (
                    <div>
                      <span className="text-zinc-500">Linked SDLC Task:</span>
                      <p className="font-semibold text-zinc-200">{activeBugModal.task_title}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-zinc-500">Reported By:</span>
                    <p className="font-semibold text-zinc-200">
                      {activeBugModal.reported_by_name} ({activeBugModal.reported_by_dept || 'Reporter'})
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border space-y-2.5 ${
                  isDarkMode ? 'bg-[#121422] border-zinc-800' : 'bg-white border-slate-200'
                }`}>
                  <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">Assignment & Triage</h4>
                  <div>
                    <label className="text-zinc-500 block mb-1">Assigned Developer / QA:</label>
                    <select
                      value={activeBugModal.assigned_to_id || ''}
                      onChange={(e) => handleReassign(activeBugModal.id, e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-none transition cursor-pointer ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Unassigned</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department} - {u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-zinc-500">Registered:</span>
                    <p className="font-mono text-zinc-300">
                      {activeBugModal.created_at ? new Date(activeBugModal.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. CHRONOLOGICAL AUDIT TRAIL */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDarkMode ? 'bg-[#121422] border-zinc-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="h-4 w-4 text-purple-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Immutable Regulatory Audit Timeline</h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">{bugHistory.length} Transition Events</span>
                </div>

                {loadingHistory ? (
                  <div className="py-6 text-center text-xs text-zinc-500">Loading audit history...</div>
                ) : bugHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-zinc-500 italic">No transition events recorded yet.</div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {bugHistory.map((item, idx) => (
                      <div key={item.id || idx} className="relative group">
                        {/* Marker */}
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-[#0f111d]" />

                        <div className={`p-3 rounded-lg border text-xs ${
                          isDarkMode ? 'bg-zinc-900/70 border-zinc-800' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-zinc-200">{item.user_name}</span>
                              <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                                isDarkMode ? 'bg-purple-950/60 text-purple-300' : 'bg-purple-100 text-purple-700'
                              }`}>
                                {item.user_role}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-purple-400 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300">
                              {item.previous_state || 'NONE'}
                            </span>
                            <ArrowRight className="h-3 w-3 text-zinc-500" />
                            <span className="px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
                              {item.new_state}
                            </span>
                          </div>

                          <p className={`text-[11.5px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                            {item.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-3.5 border-t flex items-center justify-between shrink-0 ${
              isDarkMode ? 'border-zinc-800 bg-[#131525]' : 'border-slate-200 bg-slate-50'
            }`}>
              <span className="text-[10.5px] text-zinc-500 font-mono">Bank AL Habib SDLC Governance • Defect Tracker</span>
              <button
                onClick={() => setActiveBugModal(null)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isDarkMode ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
