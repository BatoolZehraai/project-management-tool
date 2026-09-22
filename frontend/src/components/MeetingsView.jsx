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
  Clock3,
  UserX,
  ListOrdered,
  CheckSquare,
  FileCheck,
  Share2,
  Send,
  MessageCircle,
  UserPlus
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
  
  // Share / Invite Modal State
  const [sharingMeeting, setSharingMeeting] = useState(null);
  const [shareQuickEmail, setShareQuickEmail] = useState('');
  const [isSendingShareEmail, setIsSendingShareEmail] = useState(false);
  const [copiedShareFull, setCopiedShareFull] = useState(false);
  const [copiedShareDirect, setCopiedShareDirect] = useState(false);
  const [copiedShareRoomId, setCopiedShareRoomId] = useState(false);

  // Join by ID Modal State
  const [showJoinByIdModal, setShowJoinByIdModal] = useState(false);
  const [joinMeetingInput, setJoinMeetingInput] = useState('');

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

    const projectId = currentProject?.id || 1;
    const projectName = currentProject?.name || 'Core Banking Modernization';

    try {
      setIsSubmitting(true);
      const scheduledDateTime = isInstant
        ? new Date().toISOString()
        : new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

      const payload = {
        title: isInstant ? `Instant Governance Sync: ${projectName}` : title.trim(),
        phase_id: selectedPhaseId || null,
        agenda: agenda.trim(),
        duration_minutes: durationMinutes,
        scheduled_at: scheduledDateTime,
        invitees: inviteeEmails,
        is_instant: isInstant,
        base_url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      };

      const res = await axios.post(`${API_BASE}/projects/${projectId}/meetings`, payload);
      if (showSuccess) showSuccess(isInstant ? 'Instant meeting created!' : 'Governance meeting scheduled & invitations sent!');
      setShowScheduleModal(false);
      resetForm();
      fetchMeetings();

      if (isInstant && onJoinMeeting) {
        onJoinMeeting(res.data);
      }
    } catch (err) {
      if (isInstant && onJoinMeeting) {
        onJoinMeeting({
          id: Date.now(),
          project_id: projectId,
          room_name: `bahl-instant-${Date.now().toString(36)}`,
          title: `Instant Governance Sync: ${projectName}`,
          phase_name: 'Live Review',
          scheduled_at: new Date().toISOString(),
          status: 'IN_PROGRESS'
        });
      } else {
        if (showError) showError(err);
      }
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

  const copyTextToClipboard = async (text, setSuccessState) => {
    let success = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        success = true;
      }
    } catch (e) {
      success = false;
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
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

    if (setSuccessState) setSuccessState(true);
    showSuccess('Copied to clipboard!');
    if (setSuccessState) setTimeout(() => setSuccessState(false), 2500);
  };

  const handleDispatchShareEmail = async (e) => {
    if (e) e.preventDefault();
    if (!sharingMeeting) return;
    const emailToInvite = shareQuickEmail.trim().toLowerCase();
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailToInvite || !emailRegex.test(emailToInvite)) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      setIsSendingShareEmail(true);
      const res = await axios.post(`${API_BASE}/meetings/${sharingMeeting.id}/invite`, {
        email: emailToInvite,
        meeting_link: sharingMeeting.meeting_link,
        meeting_title: sharingMeeting.title
      });
      showSuccess(res.data.message || `Invitation dispatched to ${emailToInvite}`);
      setShareQuickEmail('');
      setSharingMeeting(null);
      fetchMeetings();
    } catch (err) {
      showError(err);
    } finally {
      setIsSendingShareEmail(false);
    }
  };

  const handleJoinByIdOrLink = async (e) => {
    if (e) e.preventDefault();
    const raw = joinMeetingInput.trim();
    if (!raw) return;

    let clean = raw;
    if (clean.includes('/meet/')) {
      clean = clean.split('/meet/')[1].split('?')[0].split('#')[0].trim();
    } else if (clean.includes('meet=')) {
      const match = clean.match(/meet=([^&]+)/);
      if (match) clean = match[1].trim();
    } else if (clean.includes('room=')) {
      const match = clean.match(/room=([^&]+)/);
      if (match) clean = match[1].trim();
    }

    // Check in locally loaded meetings
    const localMatch = meetings.find(m => 
      String(m.id) === clean ||
      m.room_name === clean ||
      m.room_name === `bahl-sdlc-${clean}` ||
      clean.endsWith(String(m.id))
    );
    if (localMatch) {
      setShowJoinByIdModal(false);
      setJoinMeetingInput('');
      if (onJoinMeeting) onJoinMeeting(localMatch);
      return;
    }

    // Fetch from backend public endpoint
    try {
      const res = await axios.get(`${API_BASE}/meetings/public/${clean}`);
      if (res.data) {
        setShowJoinByIdModal(false);
        setJoinMeetingInput('');
        if (onJoinMeeting) onJoinMeeting(res.data);
        return;
      }
    } catch (err) {
      // Fallback
    }

    const dynamicMeeting = {
      room_name: clean.startsWith('bahl-') ? clean : `bahl-${clean}`,
      title: `Live Session (${clean})`,
      phase_name: 'External Join',
      status: 'IN_PROGRESS'
    };
    setShowJoinByIdModal(false);
    setJoinMeetingInput('');
    if (onJoinMeeting) onJoinMeeting(dynamicMeeting);
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

          {/* Join Meeting by ID / Link */}
          <button
            type="button"
            onClick={() => setShowJoinByIdModal(true)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isDarkMode
                ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/40 hover:text-white'
                : 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 shadow-xs'
            }`}
            title="Join an active meeting using its Room ID or Link"
          >
            <Link2 className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">Join by ID</span>
          </button>

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

                    <div className="flex items-center justify-between text-zinc-400">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Link2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[140px] font-semibold text-zinc-300" title={meeting.room_name}>
                          {meeting.room_name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyTextToClipboard(meeting.room_name)}
                        className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1 cursor-pointer"
                        title="Copy Room ID"
                      >
                        <Copy size={11} />
                        <span>Copy ID</span>
                      </button>
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
                      onClick={() => setSharingMeeting(meeting)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center space-x-1 ${
                        isDarkMode
                          ? 'bg-purple-950/40 border-purple-800/60 text-purple-300 hover:bg-purple-900/60'
                          : 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100'
                      }`}
                      title="Share meeting invitation link"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(meeting)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isDarkMode
                          ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                      title="Quick copy link"
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
      {selectedMoMMeeting && selectedMoMMeeting.mom && (() => {
        const mom = selectedMoMMeeting.mom;
        let struct = {};
        try {
          struct = typeof mom.structured_data === 'string' ? JSON.parse(mom.structured_data) : (mom.structured_data || {});
        } catch (e) {
          struct = {};
        }

        const attendees = struct.attendees || [];
        const absentees = struct.absentees || [];
        const agendaList = struct.agenda_items || [];
        const discussions = struct.discussion_summaries || [];
        const decisions = mom.decisions || [];
        const actions = mom.action_items || [];

        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
            <div
              className={`max-w-3xl w-full p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
                isDarkMode
                  ? 'bg-[#0f121d] border-slate-800 text-slate-100 shadow-black/80'
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
                      mom.signoff_status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : mom.signoff_status === 'REJECTED'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {mom.signoff_status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {selectedMoMMeeting.title} • Recorded by {mom.recorded_by_name || 'Governance Officer'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMoMMeeting(null)}
                  className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 1. Basic Info Summary */}
              <div className={`p-3.5 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-zinc-400 font-semibold block text-[10.5px]">Meeting Date & Time:</span>
                  <span className="font-mono text-slate-200 font-semibold">{struct.meeting_datetime || selectedMoMMeeting.scheduled_at || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold block text-[10.5px]">Location / Link:</span>
                  <span className="text-purple-400 truncate block text-[11px] font-mono">{struct.location_link || selectedMoMMeeting.meeting_link || 'Direct In-App Room'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold block text-[10.5px]">Adjournment Time:</span>
                  <span className="font-mono text-slate-200">{struct.time_of_adjournment || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 font-semibold block text-[10.5px]">Previous MoM Status:</span>
                  <span className="text-emerald-400 font-medium">{struct.prev_minutes_approval || 'Approved without amendments'}</span>
                </div>
              </div>

              {/* 2. Attendance & Absentees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1 text-[11px] uppercase">
                    <Users size={12} />
                    <span>Attendees Present ({attendees.length})</span>
                  </h4>
                  <ul className="space-y-1 text-[11.5px] max-h-24 overflow-y-auto">
                    {attendees.length > 0 ? (
                      attendees.map((a, i) => <li key={i} className="text-slate-300">• {a}</li>)
                    ) : (
                      <li className="text-zinc-500 italic">None recorded</li>
                    )}
                  </ul>
                </div>

                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="font-bold text-rose-400 flex items-center gap-1 text-[11px] uppercase">
                    <UserX size={12} />
                    <span>Absentees ({absentees.length})</span>
                  </h4>
                  <ul className="space-y-1 text-[11.5px] max-h-24 overflow-y-auto">
                    {absentees.length > 0 ? (
                      absentees.map((a, i) => <li key={i} className="text-zinc-400">• {a}</li>)
                    ) : (
                      <li className="text-zinc-500 italic">No absentees</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* 3. Ordered Agenda Items */}
              {agendaList.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <ListOrdered size={13} />
                    <span>Agenda Items in Order</span>
                  </h4>
                  <ol className={`p-3 rounded-xl border space-y-1 text-xs list-decimal list-inside ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    {agendaList.map((item, idx) => (
                      <li key={idx} className="leading-snug">{item}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* 4. Discussion Summaries */}
              {discussions.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <FileText size={13} />
                    <span>Discussion Summaries</span>
                  </h4>
                  <div className="space-y-2">
                    {discussions.map((d, idx) => (
                      <div key={idx} className={`p-2.5 rounded-xl border text-xs ${
                        isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <span className="font-bold text-purple-300 block">{d.topic}</span>
                        <p className="text-zinc-300 mt-0.5">{d.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Key Decisions & Voting Results */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Decisions Made & Voting Results</span>
                </h4>
                {decisions.length > 0 ? (
                  <ul className="space-y-1.5 text-xs">
                    {decisions.map((dec, idx) => {
                      const decText = typeof dec === 'object' ? dec.decision : dec;
                      const vote = typeof dec === 'object' ? dec.voting_result : null;
                      return (
                        <li
                          key={idx}
                          className={`p-2.5 rounded-xl border flex items-start justify-between gap-2 ${
                            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <span className="text-purple-400 font-bold">•</span>
                            <span className="font-semibold text-slate-200">{decText}</span>
                          </div>
                          {vote && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/50 border border-purple-800/40 text-purple-300 shrink-0">
                              {vote}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No formal decisions listed.</p>
                )}
              </div>

              {/* 6. Action Items & Commitments */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock3 size={13} />
                  <span>Action Items & Assigned Tasks</span>
                </h4>
                {actions.length > 0 ? (
                  <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className={isDarkMode ? 'bg-slate-950/80 text-zinc-400' : 'bg-slate-100 text-slate-600'}>
                        <tr>
                          <th className="p-2.5 font-semibold">Task Description</th>
                          <th className="p-2.5 font-semibold">Responsible</th>
                          <th className="p-2.5 font-semibold">Deadline</th>
                          <th className="p-2.5 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {actions.map((item, idx) => {
                          const desc = typeof item === 'object' ? item.description : item;
                          const assignee = typeof item === 'object' ? item.assignee : 'Unassigned';
                          const due = typeof item === 'object' ? item.due_date : 'N/A';
                          const st = typeof item === 'object' ? item.status : 'Open';
                          return (
                            <tr key={idx} className={isDarkMode ? 'hover:bg-slate-950/40' : 'hover:bg-slate-50'}>
                              <td className="p-2.5 font-medium text-slate-200">{desc}</td>
                              <td className="p-2.5 text-zinc-400">{assignee || 'Unassigned'}</td>
                              <td className="p-2.5 text-zinc-400 font-mono text-[11px]">{due || 'N/A'}</td>
                              <td className="p-2.5">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {st || 'Open'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No structured action items defined.</p>
                )}
              </div>

              {/* 7. Next Steps & Future Meeting */}
              {(struct.next_meeting_datetime || struct.next_steps) && (
                <div className={`p-3 rounded-xl border space-y-1 text-xs ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="font-bold text-purple-400 text-xs">Next Steps & Future Meeting</h4>
                  {struct.next_meeting_datetime && (
                    <p className="text-zinc-300"><strong>Next Meeting:</strong> <span className="font-mono">{struct.next_meeting_datetime}</span></p>
                  )}
                  {struct.next_steps && (
                    <p className="text-zinc-400 mt-1">{struct.next_steps}</p>
                  )}
                </div>
              )}

              {/* 8. Additional Discussion Notes */}
              {mom.content_markdown && (
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <FileText size={13} />
                    <span>Additional Meeting Notes</span>
                  </h4>
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed whitespace-pre-wrap ${
                      isDarkMode ? 'bg-slate-950/60 border-slate-800 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {mom.content_markdown}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => handleEmailMoM(selectedMoMMeeting.id)}
                  disabled={isEmailingMoM}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border flex items-center space-x-1.5 transition cursor-pointer hover:bg-purple-600/20 text-purple-400 border-purple-500/30"
                >
                  <Mail size={13} />
                  <span>{isEmailingMoM ? 'Sending Email...' : 'Email MoM to Stakeholders'}</span>
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
        );
      })()}

      {/* SHARE / INVITE MEETING MODAL */}
      {sharingMeeting && (() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const directLink = sharingMeeting.meeting_link?.startsWith('http')
          ? sharingMeeting.meeting_link
          : `${origin}${sharingMeeting.meeting_link || `/meet/${sharingMeeting.room_name}`}`;

        const formattedDate = new Date(sharingMeeting.scheduled_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const fullInviteText = `BANK AL HABIB SDLC VIDEO GOVERNANCE MEETING\n---------------------------------------------\nTopic: ${sharingMeeting.title}\nStage: ${sharingMeeting.phase_name || 'Stage Gate Review'}\nDate & Time: ${formattedDate}\nDirect Join Link: ${directLink}\n\nNote: Anyone can click this link to join directly from Chrome, Edge, Safari, or Mobile (No login required for guests).`;

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullInviteText)}`;
        const mailtoUrl = `mailto:?subject=${encodeURIComponent('Meeting Invitation: ' + sharingMeeting.title)}&body=${encodeURIComponent(fullInviteText)}`;

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
            <div
              className={`max-w-md w-full rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-4 ${
                isDarkMode ? 'bg-[#111322] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-inherit">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Share2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Share Meeting Invitation</h3>
                    <p className="text-[11px] text-zinc-400">Share live Room ID or send real-time link</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSharingMeeting(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 1. Real-Time Room ID / Meeting Code Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] uppercase font-bold tracking-wider text-purple-300">
                    Live Meeting ID / Room Code
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-purple-300">
                    {sharingMeeting.phase_name || 'All Stages'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-sm sm:text-base font-extrabold text-white tracking-wide truncate select-all">
                    {sharingMeeting.room_name}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyTextToClipboard(sharingMeeting.room_name, setCopiedShareRoomId)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-sm"
                    title="Copy Meeting ID"
                  >
                    {copiedShareRoomId ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                    <span>{copiedShareRoomId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-tight">
                  {sharingMeeting.title} &bull; {formattedDate} ({sharingMeeting.duration_minutes}m)
                </p>
              </div>

              {/* 2. Direct Join URL */}
              <div className="space-y-1.5 text-xs">
                <label className="font-semibold text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Link2 size={13} className="text-cyan-400" />
                    <span>Direct Meeting URL (Zero-Login Access)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Instant Join</span>
                </label>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={directLink}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-purple-300 px-1 truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyTextToClipboard(directLink, setCopiedShareDirect)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer shrink-0"
                  >
                    {copiedShareDirect ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                    <span>{copiedShareDirect ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* 3. Send Real-Time Invite via Email */}
              <div className="space-y-1.5 pt-2 border-t border-inherit text-xs">
                <label className="font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <Mail size={13} className="text-emerald-400" />
                  <span>Send Real-Time Link via Email</span>
                </label>
                <form onSubmit={handleDispatchShareEmail} className="flex items-center space-x-1.5">
                  <input
                    type="email"
                    value={shareQuickEmail}
                    onChange={(e) => setShareQuickEmail(e.target.value)}
                    placeholder="e.g. auditor@bankalhabib.com or user@gmail.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500 placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingShareEmail || !shareQuickEmail.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {isSendingShareEmail ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* 4. Channels (WhatsApp & Email App) */}
              <div className="pt-2 border-t border-inherit text-xs">
                <label className="block font-semibold mb-1.5 text-zinc-300">
                  Quick Share to Apps
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer text-center"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={mailtoUrl}
                    className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer text-center"
                  >
                    <Mail size={15} />
                    <span>Email App</span>
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex items-center justify-end pt-2 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setSharingMeeting(null)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* JOIN MEETING BY ID / CODE MODAL */}
      {showJoinByIdModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`max-w-md w-full rounded-2xl border p-5 sm:p-6 shadow-2xl space-y-4 ${
              isDarkMode ? 'bg-[#111322] border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Link2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Join Meeting by ID or Code</h3>
                  <p className="text-[11px] text-zinc-400">Enter a Room Code, ID, or direct URL to connect</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJoinByIdModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleJoinByIdOrLink} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-300">
                  Meeting ID / Room Code or Link
                </label>
                <input
                  type="text"
                  value={joinMeetingInput}
                  onChange={(e) => setJoinMeetingInput(e.target.value)}
                  placeholder="e.g. bahl-sdlc-10, 10, or http://.../meet/..."
                  required
                  autoFocus
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs outline-none transition ${
                    isDarkMode
                      ? 'bg-slate-950 border-zinc-750 text-purple-300 focus:border-cyan-500 placeholder-zinc-600'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-cyan-500 placeholder-slate-400'
                  }`}
                />
                <p className="text-[10.5px] text-zinc-500">
                  Paste the full invite link or type the Room Code to jump directly into the live call.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setShowJoinByIdModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinMeetingInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center space-x-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Video size={14} />
                  <span>Connect & Join Call</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
