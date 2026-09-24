import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  RefreshCw,
  Users,
  UserX,
  ShieldCheck,
  ExternalLink,
  Send,
  UserPlus,
  Monitor,
  Radio,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  PhoneOff,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Info,
  Edit3,
  Calendar,
  ListOrdered,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  FileCheck,
  Download,
  Share,
  Link2,
  MessageCircle,
  Globe,
  Smartphone,
  Shield,
  SwitchCamera,
  FlipHorizontal,
  Camera
} from 'lucide-react';
import axios from 'axios';

// Multi-STUN Configuration for WebRTC NAT traversal and LAN connections
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.relay.metered.ca:80' },
    { urls: 'stun:stun.services.mozilla.com' }
  ],
  iceCandidatePoolSize: 10
};

// Subcomponent: Live Remote Participant Video & Audio Player with Avatar Fallback
function RemoteParticipantCard({ remoteUser, stream, isSpeakerMuted }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [hasActiveVideo, setHasActiveVideo] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    if (!stream) {
      setHasActiveVideo(false);
      return;
    }

    const videoEl = videoRef.current;
    const audioEl = audioRef.current;

    if (videoEl && videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
    if (audioEl && audioEl.srcObject !== stream) {
      audioEl.srcObject = stream;
    }

    const checkVideo = () => {
      const vTracks = stream.getVideoTracks ? stream.getVideoTracks() : [];
      const hasLive = vTracks.length > 0 && vTracks.some(t => t.readyState === 'live' && t.enabled);
      setHasActiveVideo(hasLive);
    };

    checkVideo();

    stream.addEventListener('addtrack', checkVideo);
    stream.addEventListener('removetrack', checkVideo);

    const vTracks = stream.getVideoTracks ? stream.getVideoTracks() : [];
    vTracks.forEach(t => {
      t.onmute = checkVideo;
      t.onunmute = checkVideo;
      t.onended = checkVideo;
    });

    const playMedia = async () => {
      if (videoEl) {
        try {
          videoEl.muted = isSpeakerMuted;
          await videoEl.play();
          setAutoplayBlocked(false);
        } catch (e) {
          try {
            videoEl.muted = true;
            await videoEl.play();
          } catch (e2) {}
          setAutoplayBlocked(true);
        }
      }
      if (audioEl) {
        try {
          audioEl.muted = isSpeakerMuted;
          await audioEl.play();
        } catch (e) {
          setAutoplayBlocked(true);
        }
      }
    };

    playMedia();

    const interval = setInterval(checkVideo, 1000);

    return () => {
      clearInterval(interval);
      stream.removeEventListener('addtrack', checkVideo);
      stream.removeEventListener('removetrack', checkVideo);
      vTracks.forEach(t => {
        t.onmute = null;
        t.onunmute = null;
        t.onended = null;
      });
    };
  }, [stream, isSpeakerMuted]);

  const handleUnlockAutoplay = () => {
    if (videoRef.current) {
      videoRef.current.muted = isSpeakerMuted;
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current) {
      audioRef.current.muted = isSpeakerMuted;
      audioRef.current.play().catch(() => {});
    }
    setAutoplayBlocked(false);
  };

  return (
    <div 
      onClick={handleUnlockAutoplay}
      className="w-full h-full min-h-0 min-w-0 rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#141724] to-[#0e1017] flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-2xl group cursor-pointer"
    >
      {/* Hidden dedicated audio element to ensure audio plays even when video is hidden */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={isSpeakerMuted}
        className="hidden"
      />

      {/* Live Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted={isSpeakerMuted}
        className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${
          hasActiveVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Fallback stylized avatar when camera is off */}
      {!hasActiveVideo && (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative w-full h-full p-2 sm:p-4 z-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-700 via-blue-600 to-cyan-500 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-2xl border-2 border-blue-400/40 relative z-10">
            {(remoteUser?.name || 'P').charAt(0)}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium mt-3">Camera is turned off</span>
        </div>
      )}

      {/* Autoplay blocked banner / Tap to Unmute */}
      {autoplayBlocked && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUnlockAutoplay();
            }}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs flex items-center space-x-2 shadow-2xl cursor-pointer"
          >
            <Volume2 size={15} />
            <span>Tap to Unmute Audio</span>
          </button>
        </div>
      )}

      {/* Bottom Name & Mic status badge */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg pointer-events-none">
        <span className={`p-1 rounded-full ${remoteUser?.is_mic_on ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {remoteUser?.is_mic_on ? <Mic size={12} /> : <MicOff size={12} />}
        </span>
        <span className="truncate max-w-[200px]">{remoteUser?.name || 'Remote Participant'}</span>
      </div>
    </div>
  );
}

export default function MeetingRoom({
  meeting,
  onLeave,
  currentProject,
  isDarkMode = true,
  authUser,
  API_BASE = '/api',
  showSuccess,
  showError,
  isGuest = false
}) {
  // Guest Pre-Join Lobby State (Active by default for unauthenticated guests)
  const [isInLobby, setIsInLobby] = useState(isGuest && !authUser);
  const [guestDisplayName, setGuestDisplayName] = useState(() => {
    return localStorage.getItem('guestDisplayName') || '';
  });
  const [guestNameError, setGuestNameError] = useState('');
  const [copiedFullInvite, setCopiedFullInvite] = useState(false);

  // Conference Engine Mode: 'studio' (Native WebRTC) | 'jitsi' (External Iframe)
  const [conferenceMode, setConferenceMode] = useState('studio');
  const [isMoMOpen, setIsMoMOpen] = useState(true);
  const [isMoMExpandedModal, setIsMoMExpandedModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [quickInviteEmail, setQuickInviteEmail] = useState('');
  const [isSendingQuickInvite, setIsSendingQuickInvite] = useState(false);
  const [isSavingMoM, setIsSavingMoM] = useState(false);
  const [isEmailingMoM, setIsEmailingMoM] = useState(false);
  const [jitsiLoading, setJitsiLoading] = useState(false);
  const [jitsiError, setJitsiError] = useState(null);
  const [copyToast, setCopyToast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // WebRTC Media Stream State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('user'); // 'user' (front) | 'environment' (back)
  const [isCameraMirrored, setIsCameraMirrored] = useState(true); // Horizontal selfie mirror
  const [isPipSwapped, setIsPipSwapped] = useState(false); // Mobile Picture-in-Picture swap

  // Dynamic Remote Active Attendees list & WebRTC Streams Dictionary
  const [remoteAttendees, setRemoteAttendees] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [availableDevices, setAvailableDevices] = useState({ videoDevices: [], audioDevices: [] });

  // =========================================================================
  // STRUCTURED MINUTES OF MEETING (MoM) STATE
  // =========================================================================

  // Helper: Format Date to local datetime-local string
  const formatDatetimeLocal = (dateObj) => {
    try {
      const d = dateObj ? new Date(dateObj) : new Date();
      if (isNaN(d.getTime())) return '';
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const roomName = meeting?.room_name || `bahl-sdlc-${meeting?.id || 'room'}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const directAppMeetingLink = `${origin}/meet/${roomName}`;

  const formattedMeetingDate = meeting?.scheduled_at 
    ? new Date(meeting.scheduled_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Live Now';

  const fullInvitationText = `BANK AL HABIB SDLC VIDEO GOVERNANCE MEETING\n---------------------------------------------\nTopic: ${meeting?.title || 'Governance Architecture & Security Review'}\nStage: ${meeting?.phase_name || 'Stage Gate Review'}\nDate & Time: ${formattedMeetingDate}\nJoin Meeting Link: ${directAppMeetingLink}\n\nNote: Anyone can click this link to join directly from Chrome, Edge, Safari, or Mobile (No login required for guests).`;

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullInvitationText)}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent('Meeting Invitation: ' + (meeting?.title || 'SDLC Governance Meeting'))}&body=${encodeURIComponent(fullInvitationText)}`;

  // 1. Basic Information
  const [meetingDateTime, setMeetingDateTime] = useState(() => formatDatetimeLocal(meeting?.scheduled_at));
  const [locationLink, setLocationLink] = useState(() => meeting?.meeting_link || directAppMeetingLink);
  const [timeOfAdjournment, setTimeOfAdjournment] = useState('');
  const [signoffStatus, setSignoffStatus] = useState('PENDING'); // APPROVED | PENDING | REJECTED

  // 2. Attendance (Attendees Present & Absentees)
  const [attendeesList, setAttendeesList] = useState([]);
  const [absenteesList, setAbsenteesList] = useState([]);
  const [newAttendeeInput, setNewAttendeeInput] = useState('');
  const [newAbsenteeInput, setNewAbsenteeInput] = useState('');
  const [editingAttendeeIdx, setEditingAttendeeIdx] = useState(null);
  const [editingAttendeeVal, setEditingAttendeeVal] = useState('');
  const [editingAbsenteeIdx, setEditingAbsenteeIdx] = useState(null);
  const [editingAbsenteeVal, setEditingAbsenteeVal] = useState('');

  // 3. Approval of Previous Meeting Minutes
  const [prevMinutesApproval, setPrevMinutesApproval] = useState('Approved without amendments');
  const [prevMinutesNotes, setPrevMinutesNotes] = useState('');

  // 4. Agenda Items in Order
  const [agendaItems, setAgendaItems] = useState([
    'Review of previous meeting minutes & action items',
    'Stage gate deliverables & compliance review',
    'Architecture blueprint & security validation',
    'Stage sign-off decision & next milestone planning'
  ]);
  const [newAgendaInput, setNewAgendaInput] = useState('');
  const [editingAgendaIdx, setEditingAgendaIdx] = useState(null);
  const [editingAgendaVal, setEditingAgendaVal] = useState('');

  // 5. Brief Summaries of Discussion
  const [discussionSummaries, setDiscussionSummaries] = useState([
    {
      topic: 'Architecture & Governance Review',
      summary: 'Reviewed design patterns and enterprise security controls. All required compliance artifacts were validated.'
    }
  ]);
  const [newDiscussionTopic, setNewDiscussionTopic] = useState('');
  const [newDiscussionSummary, setNewDiscussionSummary] = useState('');
  const [editingDiscussionIdx, setEditingDiscussionIdx] = useState(null);
  const [editingDiscussionTopic, setEditingDiscussionTopic] = useState('');
  const [editingDiscussionSummary, setEditingDiscussionSummary] = useState('');

  // 6. Decisions Made & Voting Results
  const [decisionsList, setDecisionsList] = useState([
    {
      decision: 'Governance sign-off approved for current development milestone.',
      voting_result: 'Unanimous Approval (5-0)'
    }
  ]);
  const [newDecisionText, setNewDecisionText] = useState('');
  const [newDecisionVoting, setNewDecisionVoting] = useState('Unanimous Approval (5-0)');
  const [editingDecisionIdx, setEditingDecisionIdx] = useState(null);
  const [editingDecisionText, setEditingDecisionText] = useState('');
  const [editingDecisionVoting, setEditingDecisionVoting] = useState('');

  // 7. Action Items & Deliverables (Task description, responsible, deadline, status)
  const [actionItemsList, setActionItemsList] = useState([
    {
      description: 'Complete security penetration testing and upload final report',
      assignee: authUser?.email || 'Governance Lead',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'In Progress'
    }
  ]);
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [newActionStatus, setNewActionStatus] = useState('Open');

  // 8. Next Steps & Next Meeting
  const [nextMeetingDateTime, setNextMeetingDateTime] = useState('');
  const [nextStepsNotes, setNextStepsNotes] = useState('');

  // Additional Markdown Discussion Notes
  const [contentMarkdown, setContentMarkdown] = useState('');

  // Container & WebRTC Connection refs
  const mainContainerRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const iceCandidateQueuesRef = useRef({});
  const lastSignalIdRef = useRef(0);

  const myParticipantId = useRef(
    `${authUser?.id ? `user_${authUser.id}` : 'guest'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  ).current;

  const myDisplayName = authUser?.name || guestDisplayName.trim() || 'Guest Attendee';

  // Meeting Duration Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper: Auto-populate attendance from active presence + meeting invitees
  const autoPopulateAttendance = useCallback(() => {
    const selfName = myDisplayName + (authUser?.email ? ` (${authUser.email})` : ' (You)');
    
    const currentActiveNames = [
      selfName,
      ...remoteAttendees.map(r => `${r.name}${r.email ? ` (${r.email})` : ''}`)
    ];

    // Remove duplicates
    const uniqueAttendees = Array.from(new Set(currentActiveNames));
    setAttendeesList(uniqueAttendees);

    // Auto-detect absentees from scheduled invitees who haven't joined
    if (meeting?.attendees && Array.isArray(meeting.attendees)) {
      const activeEmails = [
        authUser?.email?.toLowerCase(),
        ...remoteAttendees.map(r => r.email?.toLowerCase()).filter(Boolean)
      ];

      const absentNames = meeting.attendees
        .filter(inv => inv.email && !activeEmails.includes(inv.email.toLowerCase()))
        .map(inv => `${inv.name || inv.email} (${inv.email})`);

      if (absentNames.length > 0) {
        setAbsenteesList(Array.from(new Set(absentNames)));
      }
    }
  }, [authUser, remoteAttendees, meeting, myDisplayName]);

  // Pre-load existing MoM data or initialize smart defaults
  useEffect(() => {
    if (meeting?.mom) {
      const mom = meeting.mom;
      setContentMarkdown(mom.content_markdown || '');
      setSignoffStatus(mom.signoff_status || 'PENDING');

      // Decisions
      if (mom.decisions && Array.isArray(mom.decisions)) {
        setDecisionsList(
          mom.decisions.map(d =>
            typeof d === 'string'
              ? { decision: d, voting_result: 'Unanimous Approval (5-0)' }
              : { decision: d.decision || '', voting_result: d.voting_result || 'Unanimous Approval (5-0)' }
          )
        );
      }

      // Action Items
      if (mom.action_items && Array.isArray(mom.action_items)) {
        setActionItemsList(
          mom.action_items.map(a =>
            typeof a === 'string'
              ? { description: a, assignee: '', due_date: '', status: 'Open' }
              : {
                  description: a.description || '',
                  assignee: a.assignee || '',
                  due_date: a.due_date || '',
                  status: a.status || 'Open'
                }
          )
        );
      }

      // Structured Data
      let struct = {};
      if (mom.structured_data) {
        struct = typeof mom.structured_data === 'string' ? JSON.parse(mom.structured_data) : mom.structured_data;
      }

      if (struct.meeting_datetime) setMeetingDateTime(struct.meeting_datetime);
      if (struct.location_link) setLocationLink(struct.location_link);
      if (struct.time_of_adjournment) setTimeOfAdjournment(struct.time_of_adjournment);
      if (struct.attendees && Array.isArray(struct.attendees)) setAttendeesList(struct.attendees);
      if (struct.absentees && Array.isArray(struct.absentees)) setAbsenteesList(struct.absentees);
      if (struct.prev_minutes_approval) setPrevMinutesApproval(struct.prev_minutes_approval);
      if (struct.prev_minutes_notes) setPrevMinutesNotes(struct.prev_minutes_notes);
      if (struct.agenda_items && Array.isArray(struct.agenda_items)) setAgendaItems(struct.agenda_items);
      if (struct.discussion_summaries && Array.isArray(struct.discussion_summaries)) setDiscussionSummaries(struct.discussion_summaries);
      if (struct.next_meeting_datetime) setNextMeetingDateTime(struct.next_meeting_datetime);
      if (struct.next_steps) setNextStepsNotes(struct.next_steps);
    } else {
      // Initialize dynamic defaults
      autoPopulateAttendance();
      if (meeting?.agenda) {
        const splitAgenda = meeting.agenda
          .split(/\n|,/)
          .map(s => s.trim())
          .filter(Boolean);
        if (splitAgenda.length > 0) setAgendaItems(splitAgenda);
      }
    }
  }, [meeting, autoPopulateAttendance]);

  // Real-time Active Presence Heartbeat & Sync
  useEffect(() => {
    if (isInLobby && isGuest) return; // Wait until guest joins from lobby
    let isCancelled = false;

    const syncPresence = async () => {
      try {
        const payload = {
          id: myParticipantId,
          name: myDisplayName,
          email: authUser?.email || '',
          role: authUser?.role || (isGuest ? 'Guest Attendee' : 'Corporate Delegate'),
          department: authUser?.department || 'Governance',
          is_mic_on: isMicOn,
          is_cam_on: isCamOn,
          is_screen_sharing: isScreenSharing
        };

        const res = await axios.post(`${API_BASE}/meetings/public/${roomName}/presence`, payload);
        if (!isCancelled && res.data?.participants) {
          const others = res.data.participants.filter(p => String(p.id) !== String(myParticipantId));
          setRemoteAttendees(others);
        }
      } catch (err) {
        // Fallback gracefully
      }
    };

    syncPresence();
    const interval = setInterval(syncPresence, 1500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
      axios.delete(`${API_BASE}/meetings/public/${roomName}/presence/${myParticipantId}`).catch(() => {});
    };
  }, [roomName, myParticipantId, authUser, isGuest, isMicOn, isCamOn, isScreenSharing, API_BASE, isInLobby, myDisplayName]);

  // =========================================================================
  // MULTI-DEVICE CAMERA PERMISSIONS, ENUMERATION & CASCADING FALLBACKS
  // =========================================================================

  const isSecureContextDetected = typeof window !== 'undefined' && (
    window.isSecureContext ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const enumerateMediaDevices = useCallback(async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return { videoDevices: [], audioDevices: [] };
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioDevices = devices.filter(d => d.kind === 'audioinput');
      setAvailableDevices({ videoDevices, audioDevices });
      return { videoDevices, audioDevices };
    } catch (err) {
      console.warn('Device enumeration error:', err);
      return { videoDevices: [], audioDevices: [] };
    }
  }, []);

  const sendSignal = useCallback(async (toId, type, payload) => {
    try {
      await axios.post(`${API_BASE}/meetings/public/${roomName}/signal`, {
        from_id: myParticipantId,
        to_id: toId,
        type,
        payload
      });
    } catch (err) {
      console.warn(`Failed to send signal ${type} to ${toId}:`, err);
    }
  }, [API_BASE, roomName, myParticipantId]);

  const flushIceCandidates = useCallback(async (peerId, pc) => {
    const queue = iceCandidateQueuesRef.current[peerId] || [];
    if (queue.length > 0 && pc.remoteDescription && pc.remoteDescription.type) {
      for (const candidate of queue) {
        try {
          if (candidate && candidate.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.warn('Failed to add queued ICE candidate:', err);
        }
      }
      iceCandidateQueuesRef.current[peerId] = [];
    }
  }, []);

  const syncTracksToPeer = useCallback((pc, stream) => {
    if (!pc || pc.signalingState === 'closed') return;
    try {
      const streamTracks = stream ? stream.getTracks() : [];
      const videoTrack = streamTracks.find(t => t.kind === 'video' && t.readyState === 'live') || null;
      const audioTrack = streamTracks.find(t => t.kind === 'audio' && t.readyState === 'live') || null;

      const transceivers = pc.getTransceivers ? pc.getTransceivers() : [];
      const vTransceiver = transceivers.find(t => t.receiver?.track?.kind === 'video' || t.sender?.track?.kind === 'video');
      const aTransceiver = transceivers.find(t => t.receiver?.track?.kind === 'audio' || t.sender?.track?.kind === 'audio');

      if (vTransceiver) {
        if (videoTrack) {
          vTransceiver.direction = 'sendrecv';
        }
        vTransceiver.sender.replaceTrack(videoTrack).catch(() => {});
      } else if (videoTrack) {
        try { pc.addTrack(videoTrack, stream); } catch (e) {}
      }

      if (aTransceiver) {
        if (audioTrack) {
          aTransceiver.direction = 'sendrecv';
        }
        aTransceiver.sender.replaceTrack(audioTrack).catch(() => {});
      } else if (audioTrack) {
        try { pc.addTrack(audioTrack, stream); } catch (e) {}
      }
    } catch (err) {
      console.warn('syncTracksToPeer error:', err);
    }
  }, []);

  const startLocalMedia = useCallback(async (videoRequested = true, audioRequested = true) => {
    if (!videoRequested && !audioRequested) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      setIsCamOn(false);
      setIsMicOn(false);
      Object.values(peerConnectionsRef.current).forEach(pc => {
        syncTracksToPeer(pc, null);
      });
      return null;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      console.warn('getUserMedia not supported on this browser or origin');
      setIsCamOn(false);
      setIsMicOn(false);
      if (showError) {
        if (!isSecureContextDetected) {
          showError('Mobile Viewer Mode: Mobile browsers require HTTPS to broadcast camera. You can still watch and hear everyone in the room.');
        } else {
          showError('Camera/Microphone access is not available on this browser or device.');
        }
      }
      return null;
    }

    await enumerateMediaDevices();

    let stream = null;

    if (videoRequested && audioRequested) {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          facingMode: "user",
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
        }
      };

      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.warn("Retrying with minimal constraints...", err);
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch (err2) {
          console.warn("Minimal constraints failed, trying single-track fallback...", err2);
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setIsMicOn(false);
          } catch (err3) {
            try {
              stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              setIsCamOn(false);
            } catch (err4) {
              console.error("All media devices failed to open:", err4);
              if (showError) {
                if (err4.name === 'NotAllowedError' || err4.name === 'PermissionDeniedError') {
                  showError('Camera/Microphone permission denied. Please allow access in browser settings.');
                } else if (err4.name === 'NotFoundError' || err4.name === 'DevicesNotFoundError') {
                  showError('No camera or microphone found on this device.');
                } else if (err4.name === 'NotReadableError' || err4.name === 'TrackStartError') {
                  showError('Camera/Microphone is currently in use by another application.');
                } else {
                  showError('Could not access media devices: ' + (err4.message || err4.name));
                }
              }
              return null;
            }
          }
        }
      }
    } else if (videoRequested) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
          }
        });
      } catch (e1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (e2) {
          console.warn('Camera stream fallback failed:', e2);
          if (showError) showError('Camera could not be accessed. Please check device permissions.');
          return null;
        }
      }
    } else if (audioRequested) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
      } catch (e1) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e2) {
          console.warn('Microphone stream fallback failed:', e2);
          if (showError) showError('Microphone could not be accessed. Please check device permissions.');
          return null;
        }
      }
    }

    if (stream) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;
      setIsCamOn(hasVideo);
      setIsMicOn(hasAudio);

      // Sync across active peer connections & send renegotiation
      Object.entries(peerConnectionsRef.current).forEach(async ([peerId, pc]) => {
        syncTracksToPeer(pc, stream);
        try {
          if (pc.signalingState === 'stable') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal(peerId, 'offer', offer);
          }
        } catch (e) {
          console.warn('Renegotiation offer error:', e);
        }
      });
    }

    return stream;
  }, [cameraFacingMode, enumerateMediaDevices, isSecureContextDetected, showError, syncTracksToPeer, sendSignal]);

  // Switch Front / Back Camera (Mobile & Multi-camera devices)
  const switchCameraFacing = async () => {
    const nextFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextFacing);
    setIsCameraMirrored(nextFacing === 'user');
    if (isCamOn) {
      await startLocalMedia(true, isMicOn, nextFacing);
      if (showSuccess) showSuccess(`Switched to ${nextFacing === 'user' ? 'Front' : 'Back'} Camera`);
    } else {
      if (showSuccess) showSuccess(`Camera set to ${nextFacing === 'user' ? 'Front' : 'Back'}`);
    }
  };

  // Toggle Camera Mirror (Flip horizontally)
  const toggleCameraMirror = () => {
    setIsCameraMirrored(prev => !prev);
    if (showSuccess) showSuccess(!isCameraMirrored ? 'Camera mirror enabled' : 'Camera mirror disabled');
  };

  // Ensure local video element always attaches active local stream across Lobby & In-Call transitions
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [isInLobby, isCamOn]);

  // Toggle Camera
  const toggleCamera = async () => {
    const nextState = !isCamOn;
    setIsCamOn(nextState);
    if (nextState) {
      await startLocalMedia(true, isMicOn, cameraFacingMode);
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => t.stop());
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      Object.entries(peerConnectionsRef.current).forEach(async ([peerId, pc]) => {
        syncTracksToPeer(pc, localStreamRef.current);
        try {
          if (pc.signalingState === 'stable') {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sendSignal(peerId, 'offer', offer);
          }
        } catch (e) {}
      });
    }
  };

  // Toggle Microphone
  const toggleMicrophone = async () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(t => {
          t.enabled = nextState;
        });
      } else if (nextState) {
        await startLocalMedia(isCamOn, true);
      }
    } else if (nextState) {
      await startLocalMedia(isCamOn, true);
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  // Toggle Speaker / Output Audio
  const toggleSpeaker = () => {
    const nextState = !isSpeakerMuted;
    setIsSpeakerMuted(nextState);
    try {
      const mediaElements = document.querySelectorAll('video, audio');
      mediaElements.forEach(el => {
        if (el !== localVideoRef.current) {
          el.muted = nextState;
        }
      });
      if (showSuccess) showSuccess(nextState ? 'Speaker output muted' : 'Speaker output active');
    } catch (err) {
      console.warn('Speaker toggle error:', err);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // =========================================================================
  // WebRTC BI-DIRECTIONAL SIGNALING & PEER CONNECTION LIFECYCLE
  // =========================================================================

  const createPeerConnection = useCallback((remotePeerId) => {
    if (peerConnectionsRef.current[remotePeerId]) {
      const existing = peerConnectionsRef.current[remotePeerId];
      if (existing.signalingState !== 'closed') return existing;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current[remotePeerId] = pc;
    iceCandidateQueuesRef.current[remotePeerId] = [];

    // 1. Attach Local Tracks if stream is running
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current);
        } catch (e) {
          console.warn('Error adding initial track to peer:', e);
        }
      });
    }

    // Pre-allocate audio & video transceivers so SDP negotiation always establishes full media pipes
    try {
      const existingTransceivers = pc.getTransceivers ? pc.getTransceivers() : [];
      const hasAudio = existingTransceivers.some(t => t.receiver?.track?.kind === 'audio' || (t.sender?.track && t.sender.track.kind === 'audio'));
      const hasVideo = existingTransceivers.some(t => t.receiver?.track?.kind === 'video' || (t.sender?.track && t.sender.track.kind === 'video'));

      if (!hasAudio && pc.addTransceiver) {
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      }
      if (!hasVideo && pc.addTransceiver) {
        pc.addTransceiver('video', { direction: 'sendrecv' });
      }
    } catch (err) {
      console.warn('Transceiver pre-allocation warning:', err);
    }

    // 2. Dynamic Track Handler (Audio & Video)
    pc.ontrack = (event) => {
      console.log(`[WebRTC] Incoming remote track: ${event.track.kind} from ${remotePeerId}`);
      const incomingStream = (event.streams && event.streams[0]) ? event.streams[0] : null;
      setRemoteStreams(prev => {
        const existing = prev[remotePeerId];
        if (incomingStream) {
          return { ...prev, [remotePeerId]: incomingStream };
        }
        if (existing) {
          if (!existing.getTracks().some(t => t.id === event.track.id)) {
            existing.addTrack(event.track);
          }
          return { ...prev, [remotePeerId]: existing };
        }
        return { ...prev, [remotePeerId]: new MediaStream([event.track]) };
      });
    };

    // 3. ICE Candidate Emission
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal(remotePeerId, 'candidate', event.candidate.toJSON ? event.candidate.toJSON() : event.candidate);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        console.log(`[WebRTC] Peer ${remotePeerId} connected`);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn(`[WebRTC] Peer ${remotePeerId} connectionState: ${pc.connectionState}`);
      }
    };

    return pc;
  }, [sendSignal]);

  // Offer generation when remote attendees arrive
  useEffect(() => {
    if (isInLobby && isGuest) return;

    remoteAttendees.forEach(async (remoteUser) => {
      const peerId = remoteUser.id;
      if (!peerConnectionsRef.current[peerId] || peerConnectionsRef.current[peerId].signalingState === 'closed') {
        const pc = createPeerConnection(peerId);

        // Deterministic initiator: lexicographically higher ID sends the initial offer
        const isInitiator = myParticipantId.localeCompare(peerId) > 0;
        if (isInitiator) {
          try {
            const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
            await pc.setLocalDescription(offer);
            await sendSignal(peerId, 'offer', offer);
          } catch (err) {
            console.warn(`Error creating WebRTC offer for ${peerId}:`, err);
          }
        }
      }
    });

    // Cleanup disconnected attendees
    const activeIds = new Set(remoteAttendees.map(r => r.id));
    Object.keys(peerConnectionsRef.current).forEach(peerId => {
      if (!activeIds.has(peerId)) {
        try {
          peerConnectionsRef.current[peerId].close();
        } catch (e) {}
        delete peerConnectionsRef.current[peerId];
        delete iceCandidateQueuesRef.current[peerId];
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      }
    });
  }, [remoteAttendees, isInLobby, isGuest, myParticipantId, createPeerConnection, sendSignal]);

  // Signaling Polling Effect
  useEffect(() => {
    if (isInLobby && isGuest) return;
    let isCancelled = false;

    const pollSignals = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/meetings/public/${roomName}/signal/poll/${myParticipantId}?last_id=${lastSignalIdRef.current}`
        );
        if (isCancelled || !res.data?.signals) return;

        const signals = res.data.signals;
        if (signals.length > 0) {
          lastSignalIdRef.current = res.data.max_id || lastSignalIdRef.current;

          for (const sig of signals) {
            const fromPeerId = sig.from_id;
            const pc = createPeerConnection(fromPeerId);

            if (sig.type === 'offer') {
              try {
                await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                await flushIceCandidates(fromPeerId, pc);
                
                // Sync local tracks
                if (localStreamRef.current) {
                  syncTracksToPeer(pc, localStreamRef.current);
                }

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await sendSignal(fromPeerId, 'answer', answer);
              } catch (err) {
                console.warn(`Error handling offer from ${fromPeerId}:`, err);
              }
            } else if (sig.type === 'answer') {
              try {
                if (pc.signalingState === 'have-local-offer') {
                  await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
                  await flushIceCandidates(fromPeerId, pc);

                  // Sync local tracks
                  if (localStreamRef.current) {
                    syncTracksToPeer(pc, localStreamRef.current);
                  }
                }
              } catch (err) {
                console.warn(`Error handling answer from ${fromPeerId}:`, err);
              }
            } else if (sig.type === 'candidate' && sig.payload) {
              try {
                if (pc.remoteDescription && pc.remoteDescription.type) {
                  await pc.addIceCandidate(new RTCIceCandidate(sig.payload));
                } else {
                  iceCandidateQueuesRef.current[fromPeerId] = iceCandidateQueuesRef.current[fromPeerId] || [];
                  iceCandidateQueuesRef.current[fromPeerId].push(sig.payload);
                }
              } catch (err) {
                console.warn(`Error adding ICE candidate from ${fromPeerId}:`, err);
              }
            }
          }
        }
      } catch (err) {
        // Network catch
      }
    };

    const interval = setInterval(pollSignals, 350);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [roomName, myParticipantId, API_BASE, isInLobby, isGuest, createPeerConnection, flushIceCandidates, sendSignal, syncTracksToPeer]);

  // Media Device change listener
  useEffect(() => {
    if (navigator?.mediaDevices?.addEventListener) {
      const handleDeviceChange = () => {
        enumerateMediaDevices();
      };
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [enumerateMediaDevices]);

  // Clean unmount cleanup
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peerConnectionsRef.current).forEach(pc => {
        try { pc.close(); } catch (e) {}
      });
    };
  }, []);

  // Jitsi Cloud Iframe Loader
  useEffect(() => {
    if (conferenceMode !== 'jitsi') {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (e) {}
        jitsiApiRef.current = null;
      }
      return;
    }

    let isMounted = true;
    setJitsiLoading(true);
    setJitsiError(null);

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
        script.onerror = () => reject(new Error('External Jitsi script failed to load'));
        document.body.appendChild(script);
      });
    };

    loadJitsiScript()
      .then((JitsiAPI) => {
        if (!isMounted || !jitsiContainerRef.current) return;
        jitsiContainerRef.current.innerHTML = '';

        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          configOverwrite: {
            startWithAudioMuted: !isMicOn,
            startWithVideoMuted: !isCamOn,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            disableDeepLinking: true
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false
          },
          userInfo: {
            displayName: authUser?.name || 'Corporate Delegate',
            email: authUser?.email || ''
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

        setTimeout(() => {
          if (isMounted) setJitsiLoading(false);
        }, 2500);
      })
      .catch(() => {
        if (isMounted) {
          setJitsiLoading(false);
          setJitsiError('Jitsi cloud stream unavailable. Using In-App WebRTC Studio.');
          setConferenceMode('studio');
        }
      });

    return () => {
      isMounted = false;
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch (e) {}
        jitsiApiRef.current = null;
      }
    };
  }, [conferenceMode, roomName, authUser, onLeave, isMicOn, isCamOn]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Clipboard copy helper
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
      if (showSuccess) showSuccess('Copied to clipboard!');
      setTimeout(() => {
        if (setCopiedState) setCopiedState(false);
        setCopyToast(false);
      }, 2500);
    }
  };

  // =========================================================================
  // MoM SECTION HANDLERS (FILL / EDIT / DELETE)
  // =========================================================================

  // 1. Basic Info Actions
  const handleSetAdjournmentNow = () => {
    const now = new Date();
    const formatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setTimeOfAdjournment(formatted);
  };

  // 2. Attendance Actions (Attendees)
  const handleAddAttendee = () => {
    const val = newAttendeeInput.trim();
    if (val && !attendeesList.includes(val)) {
      setAttendeesList([...attendeesList, val]);
      setNewAttendeeInput('');
    }
  };

  const handleUpdateAttendee = (idx, val) => {
    if (!val.trim()) return;
    const updated = [...attendeesList];
    updated[idx] = val.trim();
    setAttendeesList(updated);
    setEditingAttendeeIdx(null);
  };

  const handleRemoveAttendee = (idx) => {
    setAttendeesList(attendeesList.filter((_, i) => i !== idx));
  };

  // Real-Time Email Invitation Dispatch
  const handleSendQuickInvite = async (e) => {
    if (e) e.preventDefault();
    const emailToInvite = quickInviteEmail.trim().toLowerCase();
    const emailRegex = /^[\w.-]+@[\w.-]+\.\w+$/;
    if (!emailToInvite || !emailRegex.test(emailToInvite)) {
      if (showError) showError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSendingQuickInvite(true);
      const url = meeting?.id
        ? `${API_BASE}/meetings/${meeting.id}/invite`
        : `${API_BASE}/meetings/public/${roomName}/invite`;
        
      const res = await axios.post(url, {
        email: emailToInvite,
        meeting_link: directAppMeetingLink,
        meeting_title: meeting?.title || 'Corporate Video Governance Meeting'
      });

      if (showSuccess) showSuccess(res.data?.message || `Real-time invitation dispatched to ${emailToInvite}`);
      setQuickInviteEmail('');
      
      const newEntry = `${emailToInvite} (Invited)`;
      if (!attendeesList.includes(newEntry) && !attendeesList.includes(emailToInvite)) {
        setAttendeesList(prev => [...prev, newEntry]);
      }
    } catch (err) {
      if (showError) showError(err.response?.data?.error || err.message || 'Failed to dispatch email');
    } finally {
      setIsSendingQuickInvite(false);
    }
  };

  // Attendance Actions (Absentees)
  const handleAddAbsentee = () => {
    const val = newAbsenteeInput.trim();
    if (val && !absenteesList.includes(val)) {
      setAbsenteesList([...absenteesList, val]);
      setNewAbsenteeInput('');
    }
  };

  const handleUpdateAbsentee = (idx, val) => {
    if (!val.trim()) return;
    const updated = [...absenteesList];
    updated[idx] = val.trim();
    setAbsenteesList(updated);
    setEditingAbsenteeIdx(null);
  };

  const handleRemoveAbsentee = (idx) => {
    setAbsenteesList(absenteesList.filter((_, i) => i !== idx));
  };

  // 3. Agenda Items Actions (Add / Edit / Move / Delete)
  const handleAddAgendaItem = () => {
    const val = newAgendaInput.trim();
    if (val) {
      setAgendaItems([...agendaItems, val]);
      setNewAgendaInput('');
    }
  };

  const handleUpdateAgendaItem = (idx, val) => {
    if (!val.trim()) return;
    const updated = [...agendaItems];
    updated[idx] = val.trim();
    setAgendaItems(updated);
    setEditingAgendaIdx(null);
  };

  const handleRemoveAgendaItem = (idx) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== idx));
  };

  const handleMoveAgendaItem = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= agendaItems.length) return;
    const updated = [...agendaItems];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setAgendaItems(updated);
  };

  // 4. Discussion Summaries Actions
  const handleAddDiscussionSummary = () => {
    const topic = newDiscussionTopic.trim();
    const summary = newDiscussionSummary.trim();
    if (topic || summary) {
      setDiscussionSummaries([
        ...discussionSummaries,
        { topic: topic || 'Discussion Topic', summary: summary || '' }
      ]);
      setNewDiscussionTopic('');
      setNewDiscussionSummary('');
    }
  };

  const handleUpdateDiscussionSummary = (idx) => {
    const updated = [...discussionSummaries];
    updated[idx] = {
      topic: editingDiscussionTopic.trim() || 'Discussion Topic',
      summary: editingDiscussionSummary.trim()
    };
    setDiscussionSummaries(updated);
    setEditingDiscussionIdx(null);
  };

  const handleRemoveDiscussionSummary = (idx) => {
    setDiscussionSummaries(discussionSummaries.filter((_, i) => i !== idx));
  };

  // 5. Decisions & Voting Results Actions
  const handleAddDecision = () => {
    const dec = newDecisionText.trim();
    if (dec) {
      setDecisionsList([
        ...decisionsList,
        { decision: dec, voting_result: newDecisionVoting || 'Unanimous Approval (5-0)' }
      ]);
      setNewDecisionText('');
    }
  };

  const handleUpdateDecision = (idx) => {
    const updated = [...decisionsList];
    updated[idx] = {
      decision: editingDecisionText.trim() || updated[idx].decision,
      voting_result: editingDecisionVoting || updated[idx].voting_result
    };
    setDecisionsList(updated);
    setEditingDecisionIdx(null);
  };

  const handleRemoveDecision = (idx) => {
    setDecisionsList(decisionsList.filter((_, i) => i !== idx));
  };

  // 6. Action Items Actions
  const handleAddActionItem = () => {
    const desc = newActionDesc.trim();
    if (desc) {
      setActionItemsList([
        ...actionItemsList,
        {
          description: desc,
          assignee: newActionAssignee.trim() || 'Unassigned',
          due_date: newActionDueDate || '',
          status: newActionStatus || 'Open'
        }
      ]);
      setNewActionDesc('');
      setNewActionAssignee('');
      setNewActionDueDate('');
      setNewActionStatus('Open');
    }
  };

  const handleUpdateActionItemField = (idx, field, val) => {
    const updated = [...actionItemsList];
    updated[idx][field] = val;
    setActionItemsList(updated);
  };

  const handleRemoveActionItem = (idx) => {
    setActionItemsList(actionItemsList.filter((_, i) => i !== idx));
  };

  // =========================================================================
  // SAVE & EMAIL MoM API PAYLOAD
  // =========================================================================

  const buildMoMPayload = () => {
    const cleanDecisions = decisionsList.filter(d => d.decision.trim());
    const cleanActions = actionItemsList.filter(a => a.description.trim());

    const structuredData = {
      meeting_datetime: meetingDateTime,
      location_link: locationLink,
      time_of_adjournment: timeOfAdjournment,
      attendees: attendeesList,
      absentees: absenteesList,
      prev_minutes_approval: prevMinutesApproval,
      prev_minutes_notes: prevMinutesNotes,
      agenda_items: agendaItems,
      discussion_summaries: discussionSummaries,
      next_meeting_datetime: nextMeetingDateTime,
      next_steps: nextStepsNotes
    };

    return {
      content_markdown: contentMarkdown,
      decisions: cleanDecisions,
      action_items: cleanActions,
      structured_data: structuredData,
      signoff_status: signoffStatus
    };
  };

  const hasSavedMoMRef = useRef(false);

  // Save MoM
  const handleSaveMoM = async () => {
    if (!meeting?.id || isGuest) return;
    try {
      setIsSavingMoM(true);
      const payload = buildMoMPayload();
      const projectId = currentProject?.id || meeting.project_id;
      
      await axios.post(
        `${API_BASE}/projects/${projectId}/meetings/${meeting.id}/mom`,
        payload
      );
      hasSavedMoMRef.current = true;
      if (showSuccess) showSuccess('Minutes of Meeting (MoM) & Governance decisions saved successfully!');
    } catch (err) {
      if (showError) showError(err);
    } finally {
      setIsSavingMoM(false);
    }
  };

  // Email MoM to all attendees
  const handleEmailMoM = async () => {
    if (!meeting?.id || isGuest) return;
    try {
      setIsEmailingMoM(true);
      // Auto-save first before sending email
      await handleSaveMoM();
      hasSavedMoMRef.current = true;
      
      const projectId = currentProject?.id || meeting.project_id;
      const res = await axios.post(
        `${API_BASE}/projects/${projectId}/meetings/${meeting.id}/mom/email`,
        {}
      );
      if (showSuccess) showSuccess(res.data.message || 'Complete MoM document emailed to all participants!');
    } catch (err) {
      if (showError) showError(err);
    } finally {
      setIsEmailingMoM(false);
    }
  };

  // Handle End Call / Disconnect with smart cleanup of empty instant meetings
  const handleEndCallOrLeave = async () => {
    const isInstant = meeting?.is_instant || (meeting?.title && meeting.title.startsWith('Instant '));
    if (isInstant && !hasSavedMoMRef.current && !meeting?.mom && remoteAttendees.length === 0 && meeting?.id && !isGuest) {
      try {
        await axios.delete(`${API_BASE}/meetings/${meeting.id}`);
      } catch (e) {
        // Silently continue
      }
    }
    if (onLeave) onLeave();
  };

  // Copy Full Markdown MoM Summary
  const handleCopyMoMSummary = () => {
    const text = `# Minutes of Meeting (MoM) - ${meeting.title || 'SDLC Governance Meeting'}
**Date & Time:** ${meetingDateTime || 'N/A'}
**Location / Link:** ${locationLink || 'N/A'}
**Time of Adjournment:** ${timeOfAdjournment || 'N/A'}
**Stage Gate Sign-Off:** ${signoffStatus}
**Previous MoM Approval:** ${prevMinutesApproval} ${prevMinutesNotes ? `(${prevMinutesNotes})` : ''}

## Attendees (Present):
${attendeesList.map(a => `- ${a}`).join('\n') || '- None recorded'}

## Absentees:
${absenteesList.map(a => `- ${a}`).join('\n') || '- None'}

## Agenda Items in Order:
${agendaItems.map((item, idx) => `${idx + 1}. ${item}`).join('\n') || '- None listed'}

## Discussion Summaries:
${discussionSummaries.map(d => `### ${d.topic}\n${d.summary}`).join('\n\n') || '- None'}

## Key Decisions Made & Voting Results:
${decisionsList.map(d => `- **${d.decision}** *(Voting: ${d.voting_result})*`).join('\n') || '- None recorded'}

## Action Items & Deliverables:
| Task Description | Person Responsible | Deadline | Status |
|---|---|---|---|
${actionItemsList.map(a => `| ${a.description} | ${a.assignee} | ${a.due_date || 'N/A'} | ${a.status} |`).join('\n')}

## Next Steps & Future Meeting:
- **Next Meeting Date/Time:** ${nextMeetingDateTime || 'To be determined'}
- **Next Steps:** ${nextStepsNotes || 'None recorded'}
`;
    copyToClipboard(text, null);
  };

  // Total active participants in room
  const totalInRoom = 1 + remoteAttendees.length;

  // =========================================================================
  // RENDER SECTIONS COMPONENT (Used in Drawer & Modal)
  // =========================================================================
  const renderMoMFormSections = () => (
    <div className="space-y-6 text-xs">
      
      {/* SECTION 1: BASIC INFORMATION */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              1. Basic Information
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Governance ID #{meeting?.id || 'NEW'}</span>
        </div>

        {/* Date & Time of Meeting (Automatic fill & Deletable) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-300">Date and Time of Meeting</label>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setMeetingDateTime(formatDatetimeLocal(new Date()))}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/50 cursor-pointer"
              >
                Set to Now
              </button>
              {meetingDateTime && (
                <button
                  type="button"
                  onClick={() => setMeetingDateTime('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 cursor-pointer"
                  title="Clear Date & Time"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <input
            type="datetime-local"
            value={meetingDateTime}
            onChange={(e) => setMeetingDateTime(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-purple-500 font-mono text-xs"
          />
        </div>

        {/* Location or Online Link */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-300">Location or Online Link</label>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setLocationLink(directAppMeetingLink)}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/50 cursor-pointer"
              >
                Auto-fill Link
              </button>
              {locationLink && (
                <button
                  type="button"
                  onClick={() => setLocationLink('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 cursor-pointer"
                  title="Clear link"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={locationLink}
              onChange={(e) => setLocationLink(e.target.value)}
              placeholder="e.g. https://... or Conference Room 4B"
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-purple-500 font-mono text-[11px]"
            />
            {locationLink && (
              <button
                type="button"
                onClick={() => copyToClipboard(locationLink, null)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Copy Link"
              >
                <Copy size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Time of Adjournment & Stage Gate Sign-Off */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-300">Time of Adjournment</label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleSetAdjournmentNow}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 cursor-pointer"
                >
                  Set Now
                </button>
                {timeOfAdjournment && (
                  <button
                    type="button"
                    onClick={() => setTimeOfAdjournment('')}
                    className="text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <input
              type="time"
              value={timeOfAdjournment}
              onChange={(e) => setTimeOfAdjournment(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-purple-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-zinc-300">Stage Gate Decision</label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setSignoffStatus('APPROVED')}
                className={`py-1.5 rounded-xl font-bold border transition text-[10px] cursor-pointer ${
                  signoffStatus === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Approved
              </button>
              <button
                type="button"
                onClick={() => setSignoffStatus('PENDING')}
                className={`py-1.5 rounded-xl font-bold border transition text-[10px] cursor-pointer ${
                  signoffStatus === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setSignoffStatus('REJECTED')}
                className={`py-1.5 rounded-xl font-bold border transition text-[10px] cursor-pointer ${
                  signoffStatus === 'REJECTED'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                    : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ATTENDANCE REGISTRY (ATTENDEES & ABSENTEES) */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              2. Attendance Registry
            </h4>
          </div>
          <button
            type="button"
            onClick={autoPopulateAttendance}
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 cursor-pointer"
            title="Auto-fill from active presence room and scheduled invitees"
          >
            <RefreshCw size={10} />
            <span>Auto-fill from Room</span>
          </button>
        </div>

        {/* 2A. Attendees (Present) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Attendees (Present) ({attendeesList.length})</span>
            </label>
          </div>

          {/* Attendees Interactive Tag List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {attendeesList.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800/80 group"
              >
                {editingAttendeeIdx === idx ? (
                  <div className="flex items-center space-x-1.5 flex-1">
                    <input
                      type="text"
                      value={editingAttendeeVal}
                      onChange={(e) => setEditingAttendeeVal(e.target.value)}
                      className="flex-1 bg-slate-900 border border-purple-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateAttendee(idx, editingAttendeeVal)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAttendeeIdx(null)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-slate-200 truncate flex-1">{att}</span>
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAttendeeIdx(idx);
                          setEditingAttendeeVal(att);
                        }}
                        className="p-1 text-zinc-500 hover:text-purple-300 cursor-pointer"
                        title="Edit attendee"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                        title="Delete attendee"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {attendeesList.length === 0 && (
              <p className="text-[11px] text-zinc-500 italic">No attendees recorded yet. Click auto-fill or add below.</p>
            )}
          </div>

          {/* Add Attendee Input */}
          <div className="flex items-center space-x-1.5 pt-1">
            <input
              type="text"
              value={newAttendeeInput}
              onChange={(e) => setNewAttendeeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAttendee())}
              placeholder="Add attendee name or email..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs"
            />
            <button
              type="button"
              onClick={handleAddAttendee}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* 2B. Absentees */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-rose-300 flex items-center gap-1.5">
              <UserX size={13} className="text-rose-400" />
              <span>Absentees ({absenteesList.length})</span>
            </label>
          </div>

          {/* Absentees List */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {absenteesList.map((abs, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800/80 group"
              >
                {editingAbsenteeIdx === idx ? (
                  <div className="flex items-center space-x-1.5 flex-1">
                    <input
                      type="text"
                      value={editingAbsenteeVal}
                      onChange={(e) => setEditingAbsenteeVal(e.target.value)}
                      className="flex-1 bg-slate-900 border border-purple-500 rounded px-1.5 py-0.5 text-xs text-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdateAbsentee(idx, editingAbsenteeVal)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingAbsenteeIdx(null)}
                      className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs text-rose-200/90 truncate flex-1">{abs}</span>
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAbsenteeIdx(idx);
                          setEditingAbsenteeVal(abs);
                        }}
                        className="p-1 text-zinc-500 hover:text-purple-300 cursor-pointer"
                        title="Edit absentee"
                      >
                        <Edit3 size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAbsentee(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                        title="Delete absentee"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {absenteesList.length === 0 && (
              <p className="text-[11px] text-zinc-500 italic">No absentees recorded.</p>
            )}
          </div>

          {/* Add Absentee Input */}
          <div className="flex items-center space-x-1.5 pt-1">
            <input
              type="text"
              value={newAbsenteeInput}
              onChange={(e) => setNewAbsenteeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAbsentee())}
              placeholder="Add absentee name or email..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-rose-500 text-xs"
            />
            <button
              type="button"
              onClick={handleAddAbsentee}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs flex items-center space-x-1 cursor-pointer border border-slate-700"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: APPROVAL OF PREVIOUS MEETING MINUTES */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileCheck className="h-4 w-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              3. Approval of Previous Meeting Minutes
            </h4>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-semibold text-zinc-300">Previous Minutes Governance Status</label>
          <select
            value={prevMinutesApproval}
            onChange={(e) => setPrevMinutesApproval(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold outline-none focus:border-purple-500 cursor-pointer text-xs"
          >
            <option value="Approved without amendments">Approved without amendments</option>
            <option value="Approved with amendments">Approved with amendments</option>
            <option value="Deferred / Pending Action">Deferred / Pending Action</option>
            <option value="Not Applicable (First Kickoff Session)">Not Applicable (First Kickoff Session)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-zinc-400 text-[11px]">Previous Minutes Notes & Amendments (if any)</label>
          <input
            type="text"
            value={prevMinutesNotes}
            onChange={(e) => setPrevMinutesNotes(e.target.value)}
            placeholder="e.g. Matters arising from last session were verified and closed."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs"
          />
        </div>
      </div>

      {/* SECTION 4: AGENDA ITEMS IN ORDER */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ListOrdered className="h-4 w-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              4. Agenda Items in Order
            </h4>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{agendaItems.length} Topics</span>
        </div>

        {/* Ordered Agenda List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {agendaItems.map((item, idx) => (
            <div
              key={idx}
              className="p-2 px-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-2 group"
            >
              {editingAgendaIdx === idx ? (
                <div className="flex items-center space-x-1.5 flex-1">
                  <input
                    type="text"
                    value={editingAgendaVal}
                    onChange={(e) => setEditingAgendaVal(e.target.value)}
                    className="flex-1 bg-slate-900 border border-purple-500 rounded px-2 py-1 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateAgendaItem(idx, editingAgendaVal)}
                    className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingAgendaIdx(null)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-slate-200 leading-snug">{item}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveAgendaItem(idx, -1)}
                      className="p-1 text-zinc-500 hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === agendaItems.length - 1}
                      onClick={() => handleMoveAgendaItem(idx, 1)}
                      className="p-1 text-zinc-500 hover:text-slate-200 disabled:opacity-20 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAgendaIdx(idx);
                        setEditingAgendaVal(item);
                      }}
                      className="p-1 text-zinc-500 hover:text-purple-300 cursor-pointer"
                      title="Edit agenda item"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAgendaItem(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete agenda item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {agendaItems.length === 0 && (
            <p className="text-[11px] text-zinc-500 italic">No agenda items listed yet.</p>
          )}
        </div>

        {/* Add Agenda Item */}
        <div className="flex items-center space-x-1.5 pt-1">
          <input
            type="text"
            value={newAgendaInput}
            onChange={(e) => setNewAgendaInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAgendaItem())}
            placeholder="Add new ordered agenda topic..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs"
          />
          <button
            type="button"
            onClick={handleAddAgendaItem}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* SECTION 5: BRIEF SUMMARIES OF THE DISCUSSION */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              5. Brief Summaries of Discussion
            </h4>
          </div>
        </div>

        {/* Summaries List */}
        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
          {discussionSummaries.map((disc, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5 relative group"
            >
              {editingDiscussionIdx === idx ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingDiscussionTopic}
                    onChange={(e) => setEditingDiscussionTopic(e.target.value)}
                    placeholder="Discussion topic..."
                    className="w-full bg-slate-900 border border-purple-500 rounded px-2 py-1 text-xs text-white outline-none font-bold"
                  />
                  <textarea
                    rows={2}
                    value={editingDiscussionSummary}
                    onChange={(e) => setEditingDiscussionSummary(e.target.value)}
                    placeholder="Summary of discussion points..."
                    className="w-full bg-slate-900 border border-purple-500 rounded p-2 text-xs text-slate-200 outline-none resize-none"
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingDiscussionIdx(null)}
                      className="px-2 py-0.5 rounded text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateDiscussionSummary(idx)}
                      className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Save Update
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-purple-300 text-xs">{disc.topic}</h5>
                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDiscussionIdx(idx);
                          setEditingDiscussionTopic(disc.topic);
                          setEditingDiscussionSummary(disc.summary);
                        }}
                        className="p-1 text-zinc-500 hover:text-purple-300 cursor-pointer"
                        title="Edit summary"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDiscussionSummary(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                        title="Delete summary"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{disc.summary}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add Discussion Summary */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="block font-bold text-[11px] text-purple-300">Add Discussion Topic & Summary</span>
          <input
            type="text"
            value={newDiscussionTopic}
            onChange={(e) => setNewDiscussionTopic(e.target.value)}
            placeholder="Topic (e.g. Performance Load Testing Results)"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs font-semibold"
          />
          <textarea
            rows={2}
            value={newDiscussionSummary}
            onChange={(e) => setNewDiscussionSummary(e.target.value)}
            placeholder="Brief summary of key arguments, findings, and consensus..."
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs resize-none"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddDiscussionSummary}
              disabled={!newDiscussionTopic.trim() && !newDiscussionSummary.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-40"
            >
              <Plus size={13} />
              <span>Add Discussion Point</span>
            </button>
          </div>
        </div>

        {/* Optional Freeform Markdown Notes */}
        <div className="space-y-1 pt-1">
          <label className="block font-semibold text-zinc-400 text-[11px]">Additional Freeform Meeting Notes</label>
          <textarea
            rows={3}
            value={contentMarkdown}
            onChange={(e) => setContentMarkdown(e.target.value)}
            placeholder="Additional raw transcripts, architectural diagrams notes, or remarks..."
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs resize-none"
          />
        </div>
      </div>

      {/* SECTION 6: DECISIONS MADE AND VOTING RESULTS */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              6. Decisions Made & Voting Results
            </h4>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{decisionsList.length} Recorded</span>
        </div>

        {/* Decisions List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {decisionsList.map((dec, idx) => (
            <div
              key={idx}
              className="p-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800/90 flex items-start justify-between gap-2 group"
            >
              {editingDecisionIdx === idx ? (
                <div className="w-full space-y-2">
                  <input
                    type="text"
                    value={editingDecisionText}
                    onChange={(e) => setEditingDecisionText(e.target.value)}
                    placeholder="Decision text..."
                    className="w-full bg-slate-900 border border-purple-500 rounded px-2 py-1 text-xs text-white outline-none font-bold"
                  />
                  <input
                    type="text"
                    value={editingDecisionVoting}
                    onChange={(e) => setEditingDecisionVoting(e.target.value)}
                    placeholder="Voting result (e.g. Unanimous 5-0, Majority 4-1)..."
                    className="w-full bg-slate-900 border border-purple-500 rounded px-2 py-1 text-xs text-purple-300 outline-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingDecisionIdx(null)}
                      className="px-2 py-0.5 rounded text-[11px] text-zinc-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateDecision(idx)}
                      className="px-3 py-1 rounded bg-purple-600 text-white font-bold text-xs cursor-pointer"
                    >
                      Save Decision
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <p className="font-semibold text-slate-100 text-xs">{dec.decision}</p>
                    </div>
                    {dec.voting_result && (
                      <span className="inline-block text-[10.5px] font-mono px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/50 text-purple-300">
                        Voting Result: {dec.voting_result}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDecisionIdx(idx);
                        setEditingDecisionText(dec.decision);
                        setEditingDecisionVoting(dec.voting_result);
                      }}
                      className="p-1 text-zinc-500 hover:text-purple-300 cursor-pointer"
                      title="Edit decision"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveDecision(idx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer"
                      title="Delete decision"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {decisionsList.length === 0 && (
            <p className="text-[11px] text-zinc-500 italic">No formal decisions recorded yet.</p>
          )}
        </div>

        {/* Add Decision */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="block font-bold text-[11px] text-purple-300">Record New Decision</span>
          <input
            type="text"
            value={newDecisionText}
            onChange={(e) => setNewDecisionText(e.target.value)}
            placeholder="Decision statement (e.g. Microservices v2 architecture ratified)"
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
              value={newDecisionVoting}
              onChange={(e) => setNewDecisionVoting(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 outline-none text-xs font-semibold cursor-pointer"
            >
              <option value="Unanimous Approval (5-0)">Unanimous Approval (5-0)</option>
              <option value="Passed by Consensus">Passed by Consensus</option>
              <option value="Majority Vote (4-1)">Majority Vote (4-1)</option>
              <option value="Majority Vote (3-2)">Majority Vote (3-2)</option>
              <option value="Rejected by Vote (1-4)">Rejected by Vote (1-4)</option>
              <option value="Deferred to Next Stage">Deferred to Next Stage</option>
            </select>
            <button
              type="button"
              onClick={handleAddDecision}
              disabled={!newDecisionText.trim()}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-40"
            >
              <Plus size={13} />
              <span>Add Decision</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 7: TASK DESCRIPTION / PERSON RESPONSIBLE / DEADLINE / STATUS */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 w-4 text-amber-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              7. Action Items & Deliverables
            </h4>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">{actionItemsList.length} Tasks</span>
        </div>

        {/* Action Items Cards */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {actionItemsList.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateActionItemField(idx, 'description', e.target.value)}
                  placeholder="Task description of what needs to be done..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 font-semibold focus:text-purple-300"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveActionItem(idx)}
                  className="p-1 text-zinc-500 hover:text-rose-400 cursor-pointer shrink-0"
                  title="Delete task"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-900">
                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-zinc-400 mb-0.5">Person Responsible</label>
                  <input
                    type="text"
                    value={item.assignee}
                    onChange={(e) => handleUpdateActionItemField(idx, 'assignee', e.target.value)}
                    placeholder="Assignee name/email"
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] outline-none text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-zinc-400 mb-0.5">Deadline</label>
                  <input
                    type="date"
                    value={item.due_date}
                    onChange={(e) => handleUpdateActionItemField(idx, 'due_date', e.target.value)}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] outline-none text-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] uppercase font-bold text-zinc-400 mb-0.5">Status</label>
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateActionItemField(idx, 'status', e.target.value)}
                    className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] outline-none text-amber-300 font-bold cursor-pointer"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
          {actionItemsList.length === 0 && (
            <p className="text-[11px] text-zinc-500 italic">No action items defined yet.</p>
          )}
        </div>

        {/* Add Action Item */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <span className="block font-bold text-[11px] text-amber-300">Add New Action Item</span>
          <input
            type="text"
            value={newActionDesc}
            onChange={(e) => setNewActionDesc(e.target.value)}
            placeholder="Task description of what needs to be done..."
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-amber-500 text-xs"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newActionAssignee}
              onChange={(e) => setNewActionAssignee(e.target.value)}
              placeholder="Person Responsible"
              className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none"
            />
            <input
              type="date"
              value={newActionDueDate}
              onChange={(e) => setNewActionDueDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleAddActionItem}
              disabled={!newActionDesc.trim()}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-40"
            >
              <Plus size={13} />
              <span>Add Action</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 8: NEXT STEPS & NEXT MEETING */}
      <div className="p-4 rounded-2xl bg-[#0e111a] border border-slate-800/90 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-purple-400" />
            <h4 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
              8. Next Steps & Future Meeting
            </h4>
          </div>
        </div>

        {/* Date & Time of Next Meeting */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-300">Date and Time of Next Meeting</label>
            {nextMeetingDateTime && (
              <button
                type="button"
                onClick={() => setNextMeetingDateTime('')}
                className="text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="datetime-local"
            value={nextMeetingDateTime}
            onChange={(e) => setNextMeetingDateTime(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-purple-500 font-mono text-xs"
          />
        </div>

        {/* Next Steps Notes */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-zinc-300">Next Steps & Deliverables</label>
            {nextStepsNotes && (
              <button
                type="button"
                onClick={() => setNextStepsNotes('')}
                className="text-[10px] text-rose-400 hover:text-rose-300 px-1 py-0.5 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={2}
            value={nextStepsNotes}
            onChange={(e) => setNextStepsNotes(e.target.value)}
            placeholder="Key milestones, subsequent stage gating targets, and executive briefings..."
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 outline-none focus:border-purple-500 text-xs resize-none"
          />
        </div>
      </div>

    </div>
  );

  // RENDER PRE-JOIN LOBBY FOR GUESTS
  if (isInLobby && isGuest) {
    return (
      <div className="h-[calc(100vh-80px)] rounded-2xl border border-slate-800 bg-[#090b12] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto">
        <div className="max-w-3xl w-full flex flex-col gap-4">
          
          {/* Mobile Viewer Mode / Insecure Context Notice */}
          {!isSecureContextDetected && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-start space-x-3 shadow-xl">
              <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold text-indigo-300">
                  Mobile Viewer Mode Active
                </p>
                <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                  You can watch the conference video and hear everyone live. (Note: Mobile browsers require HTTPS to transmit your camera).
                </p>
              </div>
            </div>
          )}

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Left: Camera & Microphone Live Preview Box */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full aspect-video rounded-2xl bg-black border border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center group">
              {isCamOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 pb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-2xl border-2 border-purple-400/40">
                    {(guestDisplayName.trim() || 'G').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">Camera is turned off</span>
                </div>
              )}

              {/* Floating Bottom Media Controls */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl z-20">
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  className={`p-2.5 rounded-xl transition cursor-pointer ${
                    isMicOn
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                  title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl transition cursor-pointer ${
                    isCamOn
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-750 text-zinc-300'
                  }`}
                  title={isCamOn ? 'Turn Camera Off' : 'Turn Camera On'}
                >
                  {isCamOn ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
              </div>
            </div>

            {/* Audio Status */}
            <div className="flex items-center space-x-2 text-xs text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isMicOn ? 'Microphone is active' : 'Microphone is muted'}</span>
            </div>
          </div>

          {/* Right: Meeting Details & Join Form */}
          <div className="p-6 rounded-2xl bg-[#111422] border border-slate-800 shadow-2xl space-y-5">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  {meeting.phase_name || 'SDLC Stage Gate'}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Zero-Login Guest Access</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-100 leading-snug">
                {meeting.title || 'Virtual Governance Conference Room'}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                You have been invited to join this virtual session. Enter your name below to enter the meeting.
              </p>
            </div>

            {/* Name Input Form */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-200">
                Your Full Name / Role <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={guestDisplayName}
                onChange={(e) => {
                  setGuestDisplayName(e.target.value);
                  if (guestNameError) setGuestNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (guestDisplayName.trim()) {
                      localStorage.setItem('guestDisplayName', guestDisplayName.trim());
                      setIsInLobby(false);
                    } else {
                      setGuestNameError('Please enter your name to proceed.');
                    }
                  }
                }}
                placeholder="e.g. Dr. Sarah Jenkins (Auditor) or Ahmed Khan"
                autoFocus
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border outline-none text-xs font-semibold text-slate-100 transition ${
                  guestNameError ? 'border-rose-500 focus:ring-1 focus:ring-rose-500' : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30'
                }`}
              />
              {guestNameError && (
                <p className="text-[11px] text-rose-400 font-semibold">{guestNameError}</p>
              )}
            </div>

            {/* Join Action Button */}
            <button
              type="button"
              onClick={() => {
                const trimmed = guestDisplayName.trim();
                if (!trimmed) {
                  setGuestNameError('Please enter your name to join.');
                  return;
                }
                localStorage.setItem('guestDisplayName', trimmed);
                setIsInLobby(false);
              }}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-center space-x-2 transition shadow-xl shadow-purple-950/60 cursor-pointer"
            >
              <Video size={16} />
              <span>{isSecureContextDetected ? 'Join Meeting Now' : 'Join Conference (Watch & Listen)'}</span>
            </button>

            {/* Back / Corporate Login Option */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-zinc-400">
              <button
                type="button"
                onClick={onLeave}
                className="hover:text-zinc-200 transition cursor-pointer"
              >
                Cancel & Exit
              </button>
              <a
                href="/"
                className="text-purple-400 hover:text-purple-300 font-semibold transition"
              >
                Sign in with Corporate Account
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

  return (
    <div
      ref={mainContainerRef}
      className="flex flex-col h-[calc(100vh-80px)] rounded-2xl border overflow-hidden transition-all bg-[#0d0f17] border-slate-800 text-slate-100 shadow-2xl relative select-none"
    >
      {/* Toast Notification */}
      {copyToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 text-emerald-100 backdrop-blur-xl border border-emerald-500/40 text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-semibold">Meeting details copied to clipboard!</span>
        </div>
      )}

      {/* Sleek Minimal Header Bar */}
      <div className="h-12 px-4 bg-[#131622]/95 border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0 backdrop-blur-md z-10">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[240px] sm:max-w-md">
            {meeting.title || 'Governance Video Conference'}
          </h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 shrink-0 hidden md:inline">
            {meeting.phase_name || 'Stage Gate'}
          </span>
        </div>

        {/* Header Right */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs">
          {/* Direct MoM toggle button on header */}
          {!isGuest && (
            <button
              type="button"
              onClick={() => setIsMoMOpen(!isMoMOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center space-x-1.5 cursor-pointer ${
                isMoMOpen
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-slate-900/90 text-purple-300 border-purple-500/30 hover:bg-purple-950/40'
              }`}
              title="Toggle Minutes of Meeting"
            >
              <FileText size={13} />
              <span className="hidden sm:inline">MoM Panel</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 font-mono text-xs">
            <Clock size={13} className="text-emerald-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Main Workspace Area: Video Viewport + MoM Drawer */}
      <div className="flex-1 min-w-0 min-h-0 flex overflow-hidden relative">
        {/* Main Video Viewport (Edge-to-Edge Zoom/Teams Layout) */}
        <div className="flex-1 min-w-0 h-full relative bg-[#090b10] flex flex-col justify-between overflow-hidden">
          
          {/* MODE 1: NATIVE WEBRTC STUDIO */}
          {conferenceMode === 'studio' && (
            <div className="flex-1 min-h-0 min-w-0 p-2 sm:p-3 md:p-4 flex flex-col justify-between overflow-hidden relative">
              
              {/* Mobile Viewer Mode Notice */}
              {!isSecureContextDetected && (
                <div className="mb-2 p-2.5 sm:p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center space-x-2.5 shrink-0 shadow-lg">
                  <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                  <div className="flex-1 text-[11px] text-indigo-200/90 leading-tight">
                    <strong className="text-indigo-300">Mobile Viewer Mode:</strong> Receiving live video and audio from conference host. (Connect via HTTPS to broadcast your camera).
                  </div>
                </div>
              )}

              {/* Screen Share View (if active) */}
              {isScreenSharing && (
                <div className="mb-2 sm:mb-3 flex-1 min-h-0 rounded-2xl bg-black border border-purple-500/40 relative overflow-hidden flex items-center justify-center shadow-2xl">
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-purple-500/30 text-purple-300 font-bold text-[11px] flex items-center space-x-1.5">
                    <Monitor size={13} className="text-purple-400" />
                    <span>Live Screen Share</span>
                  </div>
                </div>
              )}

              {/* Dynamic Responsive Participant Grid (Clean Zoom / Teams Balanced View) */}
              <div className={`flex-1 min-h-0 min-w-0 w-full grid gap-2 sm:gap-3 overflow-hidden ${
                isScreenSharing
                  ? 'grid-cols-2 max-h-44'
                  : totalInRoom === 1
                    ? 'grid-cols-1'
                    : totalInRoom === 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : totalInRoom <= 4
                        ? 'grid-cols-2'
                        : 'grid-cols-2 lg:grid-cols-3'
              }`}>
                
                {/* 1. SELF PARTICIPANT TILE (Automatically Mirrored Selfie View) */}
                <div className="w-full h-full min-h-0 min-w-0 rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#161a29] to-[#0f111a] flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-2xl group">
                  
                  {/* Live Local Video Element */}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                    className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${
                      isCamOn ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />

                  {/* Fallback stylized avatar when camera is off */}
                  {!isCamOn && (
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative w-full h-full p-2 sm:p-4 z-0">
                      {isMicOn && (
                        <div className="absolute w-32 h-32 rounded-full bg-purple-500/10 animate-ping pointer-events-none" />
                      )}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center shadow-2xl border-2 border-purple-400/40 relative z-10">
                        {(authUser?.name || 'C').charAt(0)}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-medium mt-3">Camera is turned off</span>
                    </div>
                  )}

                  {/* Standard Bottom-Left Badge */}
                  <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-semibold text-white shadow-lg">
                    <span className={`p-1 rounded-full ${isMicOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {isMicOn ? <Mic size={12} /> : <MicOff size={12} />}
                    </span>
                    <span className="truncate max-w-[200px]">
                      {authUser?.name || (isGuest ? 'Guest Attendee' : 'Corporate Delegate')} (You)
                    </span>
                  </div>
                </div>

                {/* 2. LIVE REMOTE PARTICIPANTS VIA WEBRTC */}
                {remoteAttendees.map((remoteUser) => (
                  <RemoteParticipantCard
                    key={remoteUser.id}
                    remoteUser={remoteUser}
                    stream={remoteStreams[remoteUser.id]}
                    isSpeakerMuted={isSpeakerMuted}
                  />
                ))}
              </div>

              {/* Waiting Notification Banner */}
              {totalInRoom === 1 && (
                <div className="my-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-zinc-400 text-xs flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <Info size={13} className="text-purple-400 shrink-0" />
                    <span>You are the only person in this meeting. Invite team members to join.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(directAppMeetingLink, setCopiedAppUrl);
                      setShowInviteModal(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Invite</span>
                    <Plus size={12} />
                  </button>
                </div>
              )}

              {/* Fixed Bottom Controls Bar (Clean Zoom / Teams Interface) */}
              <div className="h-16 px-2 sm:px-4 md:px-6 rounded-2xl bg-[#131622]/95 border border-slate-800 flex items-center justify-between shadow-2xl backdrop-blur-2xl shrink-0 mt-2 z-20 overflow-x-auto gap-1 sm:gap-2 md:gap-3">
                {/* Left: Meeting Name */}
                <div className="hidden lg:flex items-center space-x-2 shrink-0">
                  <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[140px]" title={roomName}>
                    {roomName}
                  </span>
                </div>

                {/* Center: Primary Media Controls */}
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-2.5 shrink-0">
                  
                  {/* MUTE / UNMUTE MICROPHONE */}
                  <button
                    type="button"
                    onClick={toggleMicrophone}
                    className={`flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl transition cursor-pointer ${
                      isMicOn
                        ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                    }`}
                    title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {isMicOn ? <Mic size={16} className="text-emerald-400" /> : <MicOff size={16} />}
                    <span className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">
                      {isMicOn ? 'Mic On' : 'Muted'}
                    </span>
                  </button>

                  {/* START / STOP VIDEO CAMERA */}
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl transition cursor-pointer ${
                      isCamOn
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/50'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700'
                    }`}
                    title={isCamOn ? 'Stop Video Camera' : 'Start Video Camera'}
                  >
                    {isCamOn ? <Video size={16} /> : <VideoOff size={16} className="text-rose-400" />}
                    <span className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">
                      {isCamOn ? 'Video On' : 'No Video'}
                    </span>
                  </button>

                  {/* SPEAKER / AUDIO OUTPUT TOGGLE */}
                  <button
                    type="button"
                    onClick={toggleSpeaker}
                    className={`flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl transition cursor-pointer ${
                      isSpeakerMuted
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700'
                    }`}
                    title={isSpeakerMuted ? 'Unmute Speaker Output' : 'Mute Speaker Output'}
                  >
                    {isSpeakerMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-cyan-400" />}
                    <span className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">
                      {isSpeakerMuted ? 'Spkr Off' : 'Speaker'}
                    </span>
                  </button>

                  {/* SHARE SCREEN */}
                  <button
                    type="button"
                    onClick={toggleScreenShare}
                    className={`flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl transition cursor-pointer ${
                      isScreenSharing
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700'
                    }`}
                    title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
                  >
                    <Share2 size={16} className={isScreenSharing ? 'text-white' : 'text-slate-300'} />
                    <span className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">
                      {isScreenSharing ? 'Sharing' : 'Share'}
                    </span>
                  </button>

                  {/* PARTICIPANTS */}
                  <button
                    type="button"
                    onClick={() => setShowParticipantsModal(true)}
                    className="flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 transition cursor-pointer relative"
                    title="View Participants"
                  >
                    <Users size={16} className="text-purple-300" />
                    <span className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">
                      People ({totalInRoom})
                    </span>
                  </button>

                  {/* INVITE */}
                  <button
                    type="button"
                    onClick={() => {
                      copyToClipboard(directAppMeetingLink, setCopiedAppUrl);
                      setShowInviteModal(true);
                    }}
                    className="flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-purple-300 border border-slate-700 transition cursor-pointer"
                    title="Invite Attendees"
                  >
                    <UserPlus size={16} />
                    <span className="text-[8.5px] sm:text-[9px] font-bold mt-0.5 tracking-tight truncate max-w-[48px]">Invite</span>
                  </button>

                  {/* MoM BUTTON (PRIMARY ACTION) */}
                  {!isGuest && (
                    <button
                      type="button"
                      onClick={() => setIsMoMOpen(!isMoMOpen)}
                      className={`flex flex-col items-center justify-center w-11 sm:w-13 md:w-14 h-11 sm:h-12 rounded-xl transition cursor-pointer ${
                        isMoMOpen
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/40 border border-purple-500 ring-2 ring-purple-400/30'
                          : 'bg-slate-800/90 hover:bg-slate-750 text-purple-300 border border-purple-500/30'
                      }`}
                      title={isMoMOpen ? 'Hide MoM Notes' : 'Open MoM Notes'}
                    >
                      <FileText size={16} />
                      <span className="text-[8.5px] sm:text-[9px] font-extrabold mt-0.5 tracking-tight truncate max-w-[48px]">MoM</span>
                    </button>
                  )}
                </div>

                {/* Right: End Call */}
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleEndCallOrLeave}
                    className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 rounded-xl font-extrabold bg-rose-600 hover:bg-rose-500 text-white text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-950/50 cursor-pointer"
                    title="Leave or End Conference"
                  >
                    <PhoneOff size={15} />
                    <span className="hidden sm:inline">End Call</span>
                    <span className="sm:hidden">End</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: JITSI CLOUD */}
          {conferenceMode === 'jitsi' && (
            <div className="flex-1 h-full relative bg-black flex flex-col items-center justify-center">
              {jitsiLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 text-zinc-400 space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
                  <p className="text-xs font-semibold">Connecting to Bank AL Habib Jitsi Channel...</p>
                </div>
              )}
              {jitsiError && (
                <div className="absolute top-4 left-4 right-4 z-20 p-3 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
                  <span>{jitsiError}</span>
                  <button
                    onClick={() => setConferenceMode('studio')}
                    className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px]"
                  >
                    Switch to Studio
                  </button>
                </div>
              )}
              <div ref={jitsiContainerRef} className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Right: Minutes of Meeting (MoM) Side Drawer */}
        {!isGuest && isMoMOpen && (
          <div className="fixed inset-0 sm:inset-y-0 sm:right-0 sm:left-auto w-full sm:w-[420px] md:w-[460px] lg:w-[480px] bg-[#121522] border-l border-slate-800 flex flex-col h-full z-40 animate-in slide-in-from-right duration-200 shadow-2xl">
            
            {/* Drawer Header */}
            <div className="p-3.5 px-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/70">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                    Minutes of Meeting (MoM)
                  </h3>
                  <p className="text-[10px] text-zinc-400">Fill, edit, delete & sign-off</p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Full Modal Expand Button */}
                <button
                  type="button"
                  onClick={() => setIsMoMExpandedModal(true)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Expand to Full Dialog View"
                >
                  <Maximize2 size={14} />
                </button>

                {/* Copy Markdown Summary */}
                <button
                  type="button"
                  onClick={handleCopyMoMSummary}
                  className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Copy formatted MoM text"
                >
                  <Copy size={14} />
                </button>

                {/* Close Drawer */}
                <button
                  type="button"
                  onClick={() => setIsMoMOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable Form) */}
            <div className="flex-1 overflow-y-auto p-4">
              {renderMoMFormSections()}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3.5 px-4 border-t border-slate-800 flex items-center justify-between gap-2 bg-slate-950">
              <button
                type="button"
                onClick={handleEmailMoM}
                disabled={isEmailingMoM}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                title="Email MoM report to all attendees"
              >
                {isEmailingMoM ? <RefreshCw size={13} className="animate-spin" /> : <Mail size={13} />}
                <span>{isEmailingMoM ? 'Sending...' : 'Email MoM'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveMoM}
                disabled={isSavingMoM}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition shadow-lg shadow-purple-950/50 cursor-pointer disabled:opacity-50"
              >
                {isSavingMoM ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                <span>Save MoM</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL EXPANDED MoM MODAL (FOR DEEP EDITING & COMPREHENSIVE REVIEW) */}
      {isMoMExpandedModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="max-w-4xl w-full h-[90vh] rounded-2xl border border-slate-800 bg-[#0f121d] text-slate-100 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Minutes of Meeting (MoM) — Governance Document
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {meeting.title} • Stage Gate Governance Sign-Off
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyMoMSummary}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copy Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMoMExpandedModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderMoMFormSections()}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
              <button
                type="button"
                onClick={() => setIsMoMExpandedModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Close View
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleEmailMoM}
                  disabled={isEmailingMoM}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {isEmailingMoM ? <RefreshCw size={13} className="animate-spin" /> : <Mail size={13} />}
                  <span>Email to Stakeholders</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveMoM();
                    setIsMoMExpandedModal(false);
                  }}
                  disabled={isSavingMoM}
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-500 text-white flex items-center space-x-1.5 transition shadow-lg shadow-purple-950/50 cursor-pointer disabled:opacity-50"
                >
                  {isSavingMoM ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  <span>Save & Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participants List Modal */}
      {showParticipantsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="max-w-sm w-full p-5 rounded-2xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-purple-400" />
                <h3 className="text-sm font-bold">Participants ({totalInRoom})</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    {(authUser?.name || 'C').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100">{authUser?.name || 'Corporate Delegate'} (You)</p>
                    <p className="text-[10px] text-purple-300">{authUser?.role || 'Host'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {isMicOn ? <Mic size={13} className="text-emerald-400" /> : <MicOff size={13} className="text-rose-400" />}
                  {isCamOn ? <Video size={13} className="text-purple-400" /> : <VideoOff size={13} className="text-zinc-500" />}
                </div>
              </div>

              {remoteAttendees.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-zinc-400">{p.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {p.is_mic_on ? <Mic size={13} className="text-emerald-400" /> : <MicOff size={13} className="text-rose-400" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowParticipantsModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Participants Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="max-w-md w-full p-5 sm:p-6 rounded-2xl border border-slate-800 bg-[#111322] text-slate-100 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Invite Meeting Attendees</h3>
                  <p className="text-[11px] text-zinc-400">Share live Room ID or send real-time link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* 1. Real-Time Meeting ID / Room Code Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-purple-950/40 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] uppercase font-bold tracking-wider text-purple-300">
                    Live Meeting ID / Room Code
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Now</span>
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-sm sm:text-base font-extrabold text-white tracking-wide truncate select-all">
                    {roomName}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(roomName, setCopiedRoomId)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shrink-0 shadow-sm"
                    title="Copy Meeting ID"
                  >
                    {copiedRoomId ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                    <span>{copiedRoomId ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-tight">
                  Anyone can enter this ID on the app to join your video session directly.
                </p>
              </div>

              {/* 2. Direct In-App Join Link */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-zinc-300 flex items-center space-x-1.5">
                    <Link2 size={13} className="text-cyan-400" />
                    <span>Direct Join URL (Zero-Login Access)</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-medium">Instant Join</span>
                </div>
                <div className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={directAppMeetingLink}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-purple-300 px-1 truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(directAppMeetingLink, setCopiedAppUrl)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center space-x-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedAppUrl ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                    <span>{copiedAppUrl ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              {/* 3. Send Real-Time Invite via Email */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <label className="font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <Mail size={13} className="text-emerald-400" />
                  <span>Send Real-Time Link via Email</span>
                </label>
                <form onSubmit={handleSendQuickInvite} className="flex items-center space-x-1.5">
                  <input
                    type="email"
                    value={quickInviteEmail}
                    onChange={(e) => setQuickInviteEmail(e.target.value)}
                    placeholder="e.g. colleague@bankalhabib.com or guest@gmail.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500 placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingQuickInvite || !quickInviteEmail.trim()}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {isSendingQuickInvite ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* 4. Instant Share to Apps */}
              <div className="pt-2 border-t border-slate-800/80">
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

            </div>

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
