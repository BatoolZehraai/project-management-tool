import React, { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  Users,
  Link2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileText,
  Mail,
  Trash2,
  X,
  Search,
  Filter,
  Layers,
  ChevronRight,
  PlayCircle,
  CalendarPlus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react';
import axios from 'axios';

export default function MeetingsView({
  currentProject,
  projectDetails,
  activePhaseId,
  setActivePhaseId,
  isDarkMode,
  authUser,
  API_BASE,
  showSuccess,
  showError,
  onJoinMeeting
}) {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedMeetingId, setCopiedMeetingId] = useState(null);
  
  // View MoM Modal State
  const [selectedMoMMeeting, setSelectedMoMMeeting] = useState(null);
  const [isEmailingMoM, setIsEmailingMoM] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [selectedPhaseId, setSelectedPhaseId] = useState(activePhaseId !== 'ALL' ? activePhaseId : '');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    return `${String(d.getHours()).padStart(2, '0')}:00`;
  });
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [agenda, setAgenda] = useState('');
  const [inviteeInput, setInviteeInput] = useState('');
  const [inviteeEmails, setInviteeEmails] = useState([]);

  const phases = projectDetails?.phases || [];

  const fetchMeetings = async () => {
    if (!currentProject?.id) return;
    try {
      setIsLoading(true);
      const url = activePhaseId && activePhaseId !== 'ALL'
        ? `${API_BASE}/projects/${currentProject.id}/meetings?phase_id=${activePhaseId}`
        : `${API_BASE}/projects/${currentProject.id}/meetings`;
      const res = await axios.get(url);
      setMeetings(res.data);
    } catch (err) {
      showError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [currentProject?.id, activePhaseId]);

  const handleAddInvitee = () => {
    const clean = inviteeInput.trim().toLowerCase();
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (clean && emailRegex.test(clean)) {
      if (!inviteeEmails.includes(clean)) {
        setInviteeEmails([...inviteeEmails, clean]);
      }
      setInviteeInput('');
    }
  };

  const handleInviteeKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddInvitee();
    }
  };

  const handleRemoveInvitee = (emailToRemove) => {
    setInviteeEmails(inviteeEmails.filter(e => e !== emailToRemove));
  };

  const handleCreateMeeting = async (isInstant = false) => {
    if (!isInstant && !title.trim()) {
      alert('Please provide a meeting title.');
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduledDateTime = isInstant
        ? new Date().toISOString()
        : new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const payload = {
        title: isInstant ? `Instant Governance Sync: ${currentProject.name}` : title.trim(),
        phase_id: selectedPhaseId || null,
        agenda: agenda.trim(),
        duration_minutes: durationMinutes,
        scheduled_at: scheduledDateTime,
        invitees: inviteeEmails,
        is_instant: isInstant,
        base_url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      };

      const res = await axios.post(`${API_BASE}/projects/${currentProject.id}/meetings`, payload);
      showSuccess(isInstant ? 'Instant meeting created!' : 'Governance meeting scheduled & invitations sent!');
      setShowScheduleModal(false);
      resetForm();
      fetchMeetings();

      if (isInstant && onJoinMeeting) {
        onJoinMeeting(res.data);
      }
    } catch (err) {
      showError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Are you sure you want to cancel and delete this meeting session?')) return;
    try {
      await axios.delete(`${API_BASE}/meetings/${meetingId}`);
      showSuccess('Meeting removed successfully');
      fetchMeetings();
    } catch (err) {
      showError(err);
    }
  };

  const handleCopyLink = async (meeting) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = meeting?.meeting_link && !meeting.meeting_link.includes('sdlc.bankalhabib.com')
      ? meeting.meeting_link
      : `${origin}/meet/${meeting?.room_name}`;
    
    if (!link) return;

    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
        success = true;
      }
    } catch (e) {
      success = false;
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        textArea.remove();
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
    }

    setCopiedMeetingId(meeting.id);
    showSuccess('Meeting invitation link copied to clipboard!');
    setTimeout(() => setCopiedMeetingId(null), 2500);
  };

  const handleEmailMoM = async (meetingId) => {
    try {
      setIsEmailingMoM(true);
      const res = await axios.post(`${API_BASE}/projects/${currentProject.id}/meetings/${meetingId}/mom/email`, {});
      showSuccess(res.data.message || 'MoM summary emailed to all attendees!');
    } catch (err) {
      showError(err);
    } finally {
      setIsEmailingMoM(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSelectedPhaseId(activePhaseId !== 'ALL' ? activePhaseId : '');
    setAgenda('');
    setInviteeEmails([]);
    setInviteeInput('');
    setDurationMinutes(30);
  };

  const upcomingMeetings = meetings.filter(m => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS');
  const pastMeetings = meetings.filter(m => m.status === 'COMPLETED' || m.status === 'CANCELLED');

  const displayedMeetings = (activeSubTab === 'upcoming' ? upcomingMeetings : pastMeetings).filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.title.toLowerCase().includes(q) || (m.agenda && m.agenda.toLowerCase().includes(q)) || (m.phase_name && m.phase_name.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-xl backdrop-blur-md'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-2.5 rounded-xl border shrink-0 transition-transform hover:scale-105 ${
              isDarkMode
                ? 'bg-purple-950/40 border-purple-800/60 text-purple-400 shadow-md shadow-purple-950/30'
                : 'bg-violet-50 border-violet-200 text-violet-700 shadow-xs'
            }`}
          >
            <Video className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Corporate Video Meetings & MoM
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isDarkMode 
                  ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' 
                  : 'bg-violet-50 border-violet-200 text-violet-700'
              }`}>
                Governance
              </span>
            </div>
            <p className={`text-[11.5px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Virtual stage gate reviews, architecture discussions, and immutable Minutes of Meeting (MoM)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Stage Selector */}
          <select
            value={activePhaseId || 'ALL'}
            onChange={(e) => {
              const val = e.target.value;
              setActivePhaseId(val === 'ALL' ? 'ALL' : parseInt(val));
            }}
            className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer transition ${
              isDarkMode
                ? 'bg-[#16182a] border-zinc-750 text-zinc-100 hover:border-zinc-600'
                : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300 shadow-xs'
            }`}
          >
            <option value="ALL">All Stages Meetings</option>
            {phases.map(ph => (
              <option key={ph.id} value={ph.id}>{ph.name}</option>
            ))}
          </select>

          {/* Start Instant Meeting */}
          <button
            type="button"
            onClick={() => handleCreateMeeting(true)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-850 border-zinc-700 text-zinc-200 hover:bg-zinc-750 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
          >
            <PlayCircle className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">Instant Meeting</span>
          </button>

          {/* Schedule Meeting Button */}
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowScheduleModal(true);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
              isDarkMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-950/40'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/20'
            }`}
          >
            <CalendarPlus className="h-4 w-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div
        className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition ${
          isDarkMode ? 'bg-[#0f111e] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center space-x-1 bg-inherit">
          <button
            type="button"
            onClick={() => setActiveSubTab('upcoming')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'upcoming'
                ? isDarkMode
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-violet-600 text-white shadow-xs'
                : isDarkMode
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Upcoming & Active ({upcomingMeetings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('past')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'past'
                ? isDarkMode
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-violet-600 text-white shadow-xs'
                : isDarkMode
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Past MoMs & Archive ({pastMeetings.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetings by title, agenda..."
            className={`w-full text-xs pl-8.5 pr-3 py-1.5 rounded-xl border outline-none transition focus:ring-1 ${
              isDarkMode
                ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
            }`}
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-2 text-zinc-400">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
          <p className="text-xs">Loading meetings repository...</p>
        </div>
      ) : displayedMeetings.length === 0 ? (
        <div
          className={`rounded-2xl border p-12 text-center space-y-3 transition ${
            isDarkMode ? 'bg-[#0e101d] border-zinc-800/80' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${
            isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            <Video className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-300">
              {activeSubTab === 'upcoming' ? 'No upcoming governance meetings scheduled' : 'No past meeting records or MoMs found'}
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Click "Schedule Meeting" or "Instant Meeting" to organize a virtual governance review session.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMeetings.map((meeting) => {
            const isCompleted = meeting.status === 'COMPLETED';
            const isLive = meeting.status === 'IN_PROGRESS';
            const formattedDate = new Date(meeting.scheduled_at).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={meeting.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group shadow-sm hover:shadow-md ${
                  isDarkMode
                    ? 'bg-[#141627] border-zinc-800 hover:border-purple-500/40'
                    : 'bg-white border-slate-200 hover:border-violet-300'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-inherit">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 flex items-center gap-1 animate-pulse'
                        : isCompleted
                          ? 'bg-zinc-700/30 border-zinc-600 text-zinc-300'
                          : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    }`}>
                      {isLive ? 'LIVE NOW' : meeting.status}
                    </span>

                    <span className={`text-[10px] font-semibold truncate max-w-[150px] ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`} title={meeting.phase_name}>
                      {meeting.phase_name || 'All Stages'}
                    </span>
                  </div>

                  {/* Title & Agenda */}
                  <div className="pt-3">
                    <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${
                      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
                    }`} title={meeting.title}>
                      {meeting.title}
                    </h3>
                    {meeting.agenda && (
                      <p className={`text-[11.5px] line-clamp-2 mt-1.5 ${
                        isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                      }`}>
                        {meeting.agenda}
                      </p>
                    )}
                  </div>

                  {/* Schedule Details */}
                  <div className="mt-3 space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Clock3 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span>{formattedDate} ({meeting.duration_minutes}m)</span>
                    </div>

                    <div className="flex items-center space-x-2 text-zinc-400">
                      <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {meeting.attendees?.length || 1} Attendee(s)
                      </span>
                    </div>
                  </div>

                  {/* MoM Badge if present */}
                  {meeting.mom && (
                    <div className="mt-3 pt-2.5 border-t border-inherit flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-400">Stage Gate Decision:</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                        meeting.mom.signoff_status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : meeting.mom.signoff_status === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}>
                        {meeting.mom.signoff_status}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(meeting)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isDarkMode
                          ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Copy meeting link"
                    >
                      {copiedMeetingId === meeting.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {meeting.mom ? (
                      <button
                        type="button"
                        onClick={() => setSelectedMoMMeeting(meeting)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center space-x-1 ${
                          isDarkMode
                            ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60'
                            : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
                        }`}
                      >
                        <FileText className="h-3 w-3" />
                        <span>View MoM</span>
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete meeting"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onJoinMeeting && onJoinMeeting(meeting)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition flex items-center space-x-1.5 shadow-sm cursor-pointer ${
                      isLive
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : isDarkMode
                          ? 'bg-purple-600 hover:bg-purple-500'
                          : 'bg-violet-600 hover:bg-violet-500'
                    }`}
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>{isLive ? 'Join Live' : 'Open Room'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Governance Meeting Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`max-w-lg w-full p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <CalendarPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Schedule Governance Meeting</h3>
                  <p className="text-[11px] text-zinc-400">Invites can be sent to any external or corporate email addresses</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sprint 4 Stage Gate Review & Architecture Sign-Off"
                  className={`w-full px-3 py-2 rounded-xl border outline-none font-medium transition ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 focus:border-violet-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Target SDLC Stage</label>
                  <select
                    value={selectedPhaseId}
                    onChange={(e) => setSelectedPhaseId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-medium cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="">General / All Stages</option>
                    {phases.map(ph => (
                      <option key={ph.id} value={ph.id}>{ph.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-medium cursor-pointer ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-medium ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Start Time (UTC)</label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border outline-none font-medium ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Meeting Agenda & Topics</label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Outline key discussion items, architectural decisions, or compliance checklists..."
                  className={`w-full px-3 py-2 rounded-xl border outline-none font-medium transition resize-none ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-800 focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 focus:border-violet-500'
                  }`}
                />
              </div>

              {/* Invitee Emails Chip Input */}
              <div>
                <label className="block font-semibold mb-1">
                  Invitee Emails (External & Corporate)
                </label>
                <div
                  className={`p-2 rounded-xl border flex flex-wrap items-center gap-1.5 min-h-[44px] ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {inviteeEmails.map((email) => (
                    <span
                      key={email}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                        isDarkMode
                          ? 'bg-purple-950/50 border-purple-800/60 text-purple-300'
                          : 'bg-violet-50 border-violet-200 text-violet-700'
                      }`}
                    >
                      <Mail size={12} />
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInvitee(email)}
                        className="hover:text-rose-400 p-0.5 cursor-pointer ml-1"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}

                  <input
                    type="email"
                    value={inviteeInput}
                    onChange={(e) => setInviteeInput(e.target.value)}
                    onKeyDown={handleInviteeKeyDown}
                    onBlur={handleAddInvitee}
                    placeholder={inviteeEmails.length === 0 ? "Type email (@gmail.com, @yahoo.com, etc.) and press Enter" : "Add another email..."}
                    className="flex-1 min-w-[200px] bg-transparent border-none outline-none text-xs p-1"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Press Enter or comma after each email. Invitations include meeting details and a calendar (.ics) sync invite.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-medium transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleCreateMeeting(false)}
                disabled={isSubmitting || !title.trim()}
                className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus size={14} />
                    <span>Schedule & Send Invites</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Minutes of Meeting (MoM) Modal */}
      {selectedMoMMeeting && selectedMoMMeeting.mom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`max-w-2xl w-full p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isDarkMode
                ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold tracking-tight">
                    Minutes of Meeting (MoM)
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    selectedMoMMeeting.mom.signoff_status === 'APPROVED'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : selectedMoMMeeting.mom.signoff_status === 'REJECTED'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {selectedMoMMeeting.mom.signoff_status}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {selectedMoMMeeting.title} • Recorded by {selectedMoMMeeting.mom.recorded_by_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMoMMeeting(null)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Key Decisions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Key Decisions Taken</span>
              </h4>
              {selectedMoMMeeting.mom.decisions?.length > 0 ? (
                <ul className="space-y-1.5 text-xs">
                  {selectedMoMMeeting.mom.decisions.map((dec, idx) => (
                    <li
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-start space-x-2 ${
                        isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{dec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-500 italic">No key decisions formally listed.</p>
              )}
            </div>

            {/* Action Items */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Clock3 size={13} />
                <span>Action Items & Commitments</span>
              </h4>
              {selectedMoMMeeting.mom.action_items?.length > 0 ? (
                <div className="border rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className={isDarkMode ? 'bg-slate-950/80 text-zinc-400' : 'bg-slate-100 text-slate-600'}>
                      <tr>
                        <th className="p-2 font-semibold">Action Item</th>
                        <th className="p-2 font-semibold">Assignee</th>
                        <th className="p-2 font-semibold">Due Date</th>
                        <th className="p-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {selectedMoMMeeting.mom.action_items.map((item, idx) => (
                        <tr key={idx} className={isDarkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                          <td className="p-2 font-medium">{item.description}</td>
                          <td className="p-2 text-zinc-400">{item.assignee || 'Unassigned'}</td>
                          <td className="p-2 text-zinc-400 font-mono text-[11px]">{item.due_date || 'N/A'}</td>
                          <td className="p-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {item.status || 'Open'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 italic">No structured action items defined.</p>
              )}
            </div>

            {/* Notes */}
            {selectedMoMMeeting.mom.content_markdown && (
              <div className="space-y-1.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <FileText size={13} />
                  <span>Discussion Notes</span>
                </h4>
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {selectedMoMMeeting.mom.content_markdown}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={() => handleEmailMoM(selectedMoMMeeting.id)}
                disabled={isEmailingMoM}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center space-x-1.5 transition cursor-pointer hover:bg-purple-600/20 text-purple-400 border-purple-500/30"
              >
                <Mail size={13} />
                <span>{isEmailingMoM ? 'Sending Email...' : 'Email MoM to Attendees'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMoMMeeting(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
