import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share2,
  Copy,
  Check,
  FileText,
  Save,
  Mail,
  LogOut,
  X,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Users,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  Send,
  UserPlus
} from 'lucide-react';
import axios from 'axios';

export default function MeetingRoom({
  meeting,
  onLeave,
  currentProject,
  isDarkMode = true,
  authUser,
  API_BASE,
  showSuccess,
  showError,
  isGuest = false
}) {
  const [isMoMOpen, setIsMoMOpen] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedJitsiUrl, setCopiedJitsiUrl] = useState(false);
  const [quickInviteEmail, setQuickInviteEmail] = useState('');
  const [isSendingQuickInvite, setIsSendingQuickInvite] = useState(false);
  const [isSavingMoM, setIsSavingMoM] = useState(false);
  const [isEmailingMoM, setIsEmailingMoM] = useState(false);
  const [jitsiLoading, setJitsiLoading] = useState(true);
  const [copyToast, setCopyToast] = useState(false);

  // MoM Form State
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [decisions, setDecisions] = useState(['']);
  const [actionItems, setActionItems] = useState([
    { description: '', assignee: '', due_date: '', status: 'Open' }
  ]);
  const [signoffStatus, setSignoffStatus] = useState('PENDING'); // APPROVED | PENDING | REJECTED

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const roomName = meeting?.room_name || `bahl-sdlc-${meeting?.id || 'room'}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const directAppMeetingLink = `${origin}/meet/${roomName}`;
  const directJitsiMeetingLink = `https://meet.jit.si/${roomName}`;

  // Timer for meeting duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-load existing MoM if available
  useEffect(() => {
    if (meeting?.mom) {
      setContentMarkdown(meeting.mom.content_markdown || '');
      setDecisions(meeting.mom.decisions?.length > 0 ? meeting.mom.decisions : ['']);
      setActionItems(meeting.mom.action_items?.length > 0 ? meeting.mom.action_items : [
        { description: '', assignee: '', due_date: '', status: 'Open' }
      ]);
      setSignoffStatus(meeting.mom.signoff_status || 'PENDING');
    }
  }, [meeting]);

  // Load and mount Jitsi Meet External API
  useEffect(() => {
    let isMounted = true;

    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }
        const existingScript = document.getElementById('jitsi-external-api-script');
        if (existingScript) {
          existingScript.onload = () => resolve(window.JitsiMeetExternalAPI);
          return;
        }
        const script = document.createElement('script');
        script.id = 'jitsi-external-api-script';
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve(window.JitsiMeetExternalAPI);
        script.onerror = () => reject(new Error('Failed to load Jitsi API script'));
        document.body.appendChild(script);
      });
    };

    loadJitsiScript()
      .then((JitsiAPI) => {
        if (!isMounted || !jitsiContainerRef.current) return;

        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            disableDeepLinking: true,
            toolbarButtons: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'recording',
              'livestreaming',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'tileview',
              'videobackgroundblur',
              'help',
              'mute-everyone',
              'security'
            ]
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'hangup',
              'chat',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'tileview',
              'mute-everyone'
            ]
          },
          userInfo: {
            displayName: authUser?.name || 'Bank AL Habib Delegate',
            email: authUser?.email || 'delegate@bankalhabib.com'
          }
        };

        const api = new JitsiAPI(domain, options);
        jitsiApiRef.current = api;

        api.addEventListener('videoConferenceLeft', () => {
          if (onLeave) onLeave();
        });

        api.addEventListener('videoConferenceJoined', () => {
          setJitsiLoading(false);
        });

        setTimeout(() => setJitsiLoading(false), 2000);
      })
      .catch((err) => {
        console.error('Error mounting Jitsi:', err);
        setJitsiLoading(false);
      });

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Robust clipboard copy helper with legacy textarea fallback
  const copyToClipboard = async (text, setCopiedState) => {
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

    if (success) {
      if (setCopiedState) setCopiedState(true);
      setCopyToast(true);
      if (showSuccess) showSuccess('Meeting invitation link copied to clipboard!');
      setTimeout(() => {
        if (setCopiedState) setCopiedState(false);
        setCopyToast(false);
      }, 3000);
    }
  };

  // Quick email invite sender during call
  const handleSendQuickInvite = async (e) => {
    if (e) e.preventDefault();
    const emailToInvite = quickInviteEmail.trim().toLowerCase();
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailToInvite || !emailRegex.test(emailToInvite)) {
      alert('Please enter a valid email address.');
      return;
    }

    if (!meeting?.id) {
      // In guest/standalone mode, copy link
      copyToClipboard(directAppMeetingLink, setCopiedAppUrl);
      setQuickInviteEmail('');
      return;
    }

    try {
      setIsSendingQuickInvite(true);
      const res = await axios.post(`${API_BASE}/meetings/${meeting.id}/invite`, {
        email: emailToInvite
      });
      if (showSuccess) showSuccess(res.data.message || `Invitation dispatched to ${emailToInvite}`);
      setQuickInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      if (showError) showError(err);
      else alert('Failed to send invitation.');
    } finally {
      setIsSendingQuickInvite(false);
    }
  };

  // Decisions helpers
  const handleAddDecision = () => setDecisions([...decisions, '']);
  const handleUpdateDecision = (idx, val) => {
    const updated = [...decisions];
    updated[idx] = val;
    setDecisions(updated);
  };
  const handleRemoveDecision = (idx) => {
    setDecisions(decisions.filter((_, i) => i !== idx));
  };

  // Action items helpers
  const handleAddActionItem = () => {
    setActionItems([...actionItems, { description: '', assignee: '', due_date: '', status: 'Open' }]);
  };
  const handleUpdateActionItem = (idx, field, val) => {
    const updated = [...actionItems];
    updated[idx][field] = val;
    setActionItems(updated);
  };
  const handleRemoveActionItem = (idx) => {
    setActionItems(actionItems.filter((_, i) => i !== idx));
  };

  // Save MoM
  const handleSaveMoM = async () => {
    if (!meeting?.id || isGuest) return;
    try {
      setIsSavingMoM(true);
      const cleanDecisions = decisions.filter(d => d.trim());
      const cleanActions = actionItems.filter(a => a.description.trim());

      const payload = {
        content_markdown: contentMarkdown,
        decisions: cleanDecisions,
        action_items: cleanActions,
        signoff_status: signoffStatus
      };

      const projectId = currentProject?.id || meeting.project_id;
      const res = await axios.post(
        `${API_BASE}/projects/${projectId}/meetings/${meeting.id}/mom`,
        payload
      );
      if (showSuccess) showSuccess('Minutes of Meeting (MoM) & Stage Gate decision saved!');
    } catch (err) {
      if (showError) showError(err);
    } finally {
      setIsSavingMoM(false);
    }
  };

  // Email MoM
  const handleEmailMoM = async () => {
    if (!meeting?.id || isGuest) return;
    try {
      setIsEmailingMoM(true);
      const projectId = currentProject?.id || meeting.project_id;
      const res = await axios.post(
        `${API_BASE}/projects/${projectId}/meetings/${meeting.id}/mom/email`,
        {}
      );
      if (showSuccess) showSuccess(res.data.message || 'MoM summary successfully emailed to all attendees!');
    } catch (err) {
      if (showError) showError(err);
    } finally {
      setIsEmailingMoM(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] rounded-2xl border overflow-hidden transition-all bg-slate-950 border-slate-800 text-slate-100 shadow-2xl relative">
      {/* Toast Notification for Clipboard Copy */}
      {copyToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-emerald-100 backdrop-blur-xl border border-emerald-500/40 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">Meeting invitation link copied to clipboard!</span>
        </div>
      )}

      {/* Top Meeting Header Bar */}
      <div className="h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Video className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-xs sm:text-sm font-bold truncate max-w-[260px] sm:max-w-md" title={meeting.title}>
                {meeting.title || 'Corporate Video Governance Session'}
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 shrink-0 hidden sm:inline">
                {meeting.phase_name || 'Governance Review'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">
              {currentProject?.name || 'SDLC Platform'} • Room: {roomName}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Call Duration Timer */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-zinc-300 font-mono text-xs">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Invite Button -> Opens Quick Popover/Modal & Copies Link */}
          <button
            type="button"
            onClick={() => {
              copyToClipboard(directAppMeetingLink, setCopiedAppUrl);
              setShowInviteModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition cursor-pointer hover:border-purple-500/50"
            title="Invite attendees or copy link"
          >
            <UserPlus size={13} className="text-purple-400" />
            <span>Invite</span>
          </button>

          {/* Quick Direct Copy Button */}
          <button
            type="button"
            onClick={() => copyToClipboard(directAppMeetingLink, setCopiedAppUrl)}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 transition cursor-pointer"
            title="Copy meeting link to clipboard"
          >
            {copiedAppUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedAppUrl ? 'Copied' : 'Copy Link'}</span>
          </button>

          {/* MoM Drawer Toggle */}
          {!isGuest && (
            <button
              type="button"
              onClick={() => setIsMoMOpen(!isMoMOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                isMoMOpen
                  ? 'bg-purple-600 border-purple-500 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-purple-300'
              }`}
            >
              <FileText size={13} />
              <span className="hidden sm:inline">MoM Notes</span>
            </button>
          )}

          {/* Leave Meeting */}
          <button
            type="button"
            onClick={onLeave}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm cursor-pointer ml-1"
          >
            <LogOut size={13} />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area: Video + MoM Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Video Conference Stream */}
        <div className="flex-1 h-full relative bg-black flex flex-col items-center justify-center">
          {jitsiLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 text-zinc-400 space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
              <p className="text-xs font-semibold">Connecting to Bank AL Habib Secure Video Channel...</p>
            </div>
          )}
          <div ref={jitsiContainerRef} className="w-full h-full" />
        </div>

        {/* Right: Minutes of Meeting (MoM) Side Drawer */}
        {!isGuest && isMoMOpen && (
          <div className="w-full sm:w-96 md:w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col h-full z-20 animate-in slide-in-from-right duration-200 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Minutes of Meeting (MoM)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMoMOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Stage Gate Sign-Off Decision */}
              <div className="space-y-1.5">
                <label className="block font-bold text-zinc-300">Stage Gate Sign-Off Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignoffStatus('APPROVED')}
                    className={`py-1.5 rounded-xl font-bold border transition text-[11px] cursor-pointer ${
                      signoffStatus === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignoffStatus('PENDING')}
                    className={`py-1.5 rounded-xl font-bold border transition text-[11px] cursor-pointer ${
                      signoffStatus === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignoffStatus('REJECTED')}
                    className={`py-1.5 rounded-xl font-bold border transition text-[11px] cursor-pointer ${
                      signoffStatus === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

              {/* Key Decisions Taken */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-300 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-purple-400" />
                    <span>Key Decisions</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDecision}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={11} />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {decisions.map((dec, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={dec}
                        onChange={(e) => handleUpdateDecision(idx, e.target.value)}
                        placeholder="Decision recorded during call..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500"
                      />
                      {decisions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDecision(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-300 flex items-center gap-1">
                    <Clock size={13} className="text-amber-400" />
                    <span>Action Items</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={11} />
                    <span>Add Action</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {actionItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateActionItem(idx, 'description', e.target.value)}
                          placeholder="Action item task description..."
                          className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 font-medium"
                        />
                        {actionItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveActionItem(idx)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                        <input
                          type="text"
                          value={item.assignee}
                          onChange={(e) => handleUpdateActionItem(idx, 'assignee', e.target.value)}
                          placeholder="Assignee (email/name)"
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] outline-none text-slate-300"
                        />
                        <input
                          type="date"
                          value={item.due_date}
                          onChange={(e) => handleUpdateActionItem(idx, 'due_date', e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] outline-none text-slate-300 font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discussion Notes / Markdown */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <label className="block font-bold text-zinc-300">Detailed Discussion Notes</label>
                <textarea
                  rows={4}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  placeholder="Record summary notes, architectural considerations, and governance sign-off details..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3.5 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950">
              <button
                type="button"
                onClick={handleEmailMoM}
                disabled={isEmailingMoM}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                title="Email MoM to all attendees"
              >
                <Mail size={13} />
                <span>{isEmailingMoM ? 'Sending...' : 'Email MoM'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveMoM}
                disabled={isSavingMoM}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingMoM ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save MoM</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Participants Modal / Popover */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full p-5 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Invite Meeting Attendees</h3>
                  <p className="text-[11px] text-zinc-400">Share direct link or dispatch email invitations</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Link Copy Blocks */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  Direct In-App Meeting Link (Zero-Login Guest Access)
                </label>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={directAppMeetingLink}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-purple-300 px-1 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(directAppMeetingLink, setCopiedAppUrl)}
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedAppUrl ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedAppUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">
                  External Jitsi Web Link
                </label>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={directJitsiMeetingLink}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-zinc-400 px-1 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(directJitsiMeetingLink, setCopiedJitsiUrl)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                  >
                    {copiedJitsiUrl ? <Check size={12} /> : <ExternalLink size={12} />}
                    <span>{copiedJitsiUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Email Dispatch Field */}
              {!isGuest && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block font-semibold mb-1 text-zinc-300">
                    Send Email Invite (Gmail, Outlook, Yahoo, Corporate)
                  </label>
                  <form onSubmit={handleSendQuickInvite} className="flex items-center space-x-1.5">
                    <input
                      type="email"
                      value={quickInviteEmail}
                      onChange={(e) => setQuickInviteEmail(e.target.value)}
                      placeholder="e.g. external.auditor@gmail.com"
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={isSendingQuickInvite || !quickInviteEmail.trim()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 transition cursor-pointer disabled:opacity-50"
                    >
                      {isSendingQuickInvite ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      <span>Invite</span>
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white transition cursor-pointer"
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
