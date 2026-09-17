import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStagePermissions } from './useStagePermissions';
import {
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  RefreshCw,
  UserCheck,
  History,
  Activity,
  Clock,
  ArrowRightLeft,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  User,
  LogOut,
  AlertCircle,
  Layers,
  Sun,
  Moon,
  Info,
  Eye,
  EyeOff,
  Calendar,
  Kanban,
  Lock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Folder,
  FolderPlus,
  FolderOpen,
  File,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  Paperclip,
  Upload,
  Download,
  ExternalLink,
  HardDrive,
  Pencil,
  Mail,
  KeyRound,
  Building2,
  Sparkles,
  LogIn,
  UserPlus,
  ShieldCheck,
  Settings,
  Camera,
  Phone,
  Briefcase,
  Users,
  Terminal,
  Bug,
  ChevronDown,
  ChevronUp,
  Archive,
  Filter
} from 'lucide-react';
import bahlLogo from './assets/bahl-logo.png';

// Modular Workspace Views
import Sidebar from './components/Sidebar';
import OverviewMetrics from './components/OverviewMetrics';
import KanbanBoard from './components/KanbanBoard';
import TimelinePlanner from './components/TimelinePlanner';
import StageFilesView from './components/StageFilesView';
import TeamApprovalsView from './components/TeamApprovalsView';
import AuditTrailView from './components/AuditTrailView';
import ApiStudio from './components/ApiStudio';
import BugTracker from './components/BugTracker';
import MeetingsView from './components/MeetingsView';
import MeetingRoom from './components/MeetingRoom';
import Auth from './components/Auth';
import UploadConfirmModal from './components/UploadConfirmModal';

const API_BASE = 'http://127.0.0.1:5000/api';

// Configure Axios authorization interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function App() {
  // Theme State (Defaulting to Dark)
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') !== 'light');

  // Session State
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [authUser, setAuthUser] = useState(null);
  
  // Auth Form State
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authDepartment, setAuthDepartment] = useState('Software Engineering');
  const [authRole, setAuthRole] = useState('TEAM_MEMBER');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Active Workspace Tab Navigation
  // Options: 'overview' | 'board' | 'planner' | 'stage_files' | 'bug_tracker' | 'api_studio' | 'meetings' | 'team_approvals' | 'audit_trail'
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [directMeetRoomId, setDirectMeetRoomId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname;
    if (pathname.startsWith('/meet/')) {
      const room = pathname.replace(/^\/meet\/?/, '').trim();
      return room || null;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get('meet')) {
      return params.get('meet').trim();
    }
    return null;
  });
  const [directMeetingData, setDirectMeetingData] = useState(null);

  // Business State
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [approvedUsers, setApprovedUsers] = useState([]);
  
  // Modals & Panels State
  const [showAdminModal, setShowAdminModal] = useState(false);
  
  // Profile Settings Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(null);
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showProfilePwd, setShowProfilePwd] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState('ALL');
  const [userFilterRole, setUserFilterRole] = useState('ALL');
  const [userFilterDept, setUserFilterDept] = useState('ALL');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserDepartment, setEditUserDepartment] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserStatus, setEditUserStatus] = useState('');
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('Software Engineering');
  const [newUserRole, setNewUserRole] = useState('TEAM_MEMBER');
  const [newUserStatus, setNewUserStatus] = useState('APPROVED');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showProjDirectoryModal, setShowProjDirectoryModal] = useState(false);
  const [projSearchQuery, setProjSearchQuery] = useState('');
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDesc, setNewPhaseDesc] = useState('');
  const [newPhaseRole, setNewPhaseRole] = useState('Developer');
  
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskPhaseId, setTaskPhaseId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [plannerMonth, setPlannerMonth] = useState(new Date());
  
  const [showNewProjModal, setShowNewProjModal] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDefaults, setNewProjDefaults] = useState(true);

  // Active Task Detail State
  const [selectedTask, setSelectedTask] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activePhaseId, setActivePhaseId] = useState('ALL');

  // Stage Ownership & RBAC Hook
  const activeStageObj = activePhaseId === 'ALL' ? 'ALL' : (projectDetails?.phases?.find(ph => ph.id === activePhaseId) || null);
  const stagePermissions = useStagePermissions(authUser, activeStageObj);

  const canEditTaskItem = (task) => {
    if (!task) return false;
    if (!authUser) return false;
    if (authUser.role === 'SUPER_ADMIN' || authUser.role === 'Admin') return true;
    const taskPhase = projectDetails?.phases?.find(p => p.id === task.phase_id);
    const govDept = task.governing_department || taskPhase?.governing_department || taskPhase?.role_access;
    return Boolean(authUser.department && govDept && authUser.department.trim().toLowerCase() === govDept.trim().toLowerCase());
  };

  const [comments, setComments] = useState([]);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Stage Files & Folders State
  const [stageFiles, setStageFiles] = useState([]);
  const [stageParentFolderId, setStageParentFolderId] = useState(null);
  const [stageBreadcrumbs, setStageBreadcrumbs] = useState([{ id: null, name: 'Root' }]);
  const [stageFileSearch, setStageFileSearch] = useState('');
  const [isUploadingStageFile, setIsUploadingStageFile] = useState(false);
  const [newStageFolderName, setNewStageFolderName] = useState('');
  const [pendingUpload, setPendingUpload] = useState(null);
  const [isConfirmUploading, setIsConfirmUploading] = useState(false);
  const [showNewStageFolderModal, setShowNewStageFolderModal] = useState(false);

  // Task Files & Attachments State
  const [taskFiles, setTaskFiles] = useState([]);
  const [taskParentFolderId, setTaskParentFolderId] = useState(null);
  const [taskBreadcrumbs, setTaskBreadcrumbs] = useState([{ id: null, name: 'Root' }]);
  const [isUploadingTaskFile, setIsUploadingTaskFile] = useState(false);
  const [newTaskFolderName, setNewTaskFolderName] = useState('');
  const [showNewTaskFolderModal, setShowNewTaskFolderModal] = useState(false);

  // Activity Feed & Audit Trail State
  const [projectActivities, setProjectActivities] = useState([]);
  const [activityPagination, setActivityPagination] = useState({
    total: 0,
    has_more: false,
    current_page: 1,
    limit: 10,
    total_pages: 1
  });
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [activityTimeframe, setActivityTimeframe] = useState('7_days');
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [isActivitiesLoadingMore, setIsActivitiesLoadingMore] = useState(false);
  const [isArchivingActivities, setIsArchivingActivities] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    today: false,
    yesterday: false,
    earlier: true
  });

  // Notifications
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
  }, [token]);

  // Handle Direct Meeting Navigation (/meet/:roomId or ?meet=:roomId)
  useEffect(() => {
    if (!directMeetRoomId) return;
    const fetchDirectMeeting = async () => {
      try {
        const res = await axios.get(`${API_BASE}/meetings/public/${directMeetRoomId}`);
        setDirectMeetingData(res.data);
        if (token && authUser) {
          setActiveMeeting(res.data);
        }
      } catch (err) {
        console.warn('Direct meeting public fetch fallback:', err);
        const fallbackMeeting = {
          room_name: directMeetRoomId,
          title: 'Corporate Video Governance Meeting',
          phase_name: 'Governance Review',
          id: null
        };
        setDirectMeetingData(fallbackMeeting);
        if (token && authUser) {
          setActiveMeeting(fallbackMeeting);
        }
      }
    };
    fetchDirectMeeting();
  }, [directMeetRoomId, token, authUser]);

  // Load project details once current project changes
  useEffect(() => {
    if (authUser && currentProject) {
      fetchProjectDetails(currentProject.id);
    }
  }, [authUser, currentProject]);

  // Load stage files when project, active phase or folder changes
  useEffect(() => {
    if (authUser && currentProject) {
      fetchStageFiles(currentProject.id, activePhaseId, stageParentFolderId);
    }
  }, [authUser, currentProject, activePhaseId, stageParentFolderId]);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    const startGridDate = new Date(year, month, 1 - firstDayOfWeek);
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const current = new Date(startGridDate);
      current.setDate(startGridDate.getDate() + i);
      
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const d = String(current.getDate()).padStart(2, '0');
      
      days.push({
        dayNum: current.getDate(),
        dateStr: `${y}-${m}-${d}`,
        isCurrentMonth: current.getMonth() === month,
        dayOfWeek: current.getDay()
      });
    }
    return days;
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d < new Date().setHours(0,0,0,0);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const showError = (msg) => {
    let errorStr = msg?.response?.data?.error || msg?.message || 'An error occurred.';
    if (errorStr === 'Network Error') {
      errorStr = 'Network Connection Error: Unable to reach the SDLC API server. Please verify that the Flask backend is running on http://127.0.0.1:5000.';
    }
    setErrorMsg(errorStr);
    setSuccessMsg('');
    setTimeout(() => setErrorMsg(''), 6000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType, isFolder) => {
    if (isFolder) return <Folder className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
    const ext = (fileType || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return <FileImage className="h-4.5 w-4.5 text-pink-500 shrink-0" />;
    }
    if (['pdf'].includes(ext)) {
      return <FileText className="h-4.5 w-4.5 text-red-500 shrink-0" />;
    }
    if (['js', 'jsx', 'ts', 'tsx', 'py', 'json', 'html', 'css', 'sql', 'yaml', 'yml', 'md'].includes(ext)) {
      return <FileCode className="h-4.5 w-4.5 text-blue-500 shrink-0" />;
    }
    if (['csv', 'xls', 'xlsx'].includes(ext)) {
      return <FileSpreadsheet className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
    }
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
      return <FileArchive className="h-4.5 w-4.5 text-amber-600 shrink-0" />;
    }
    return <File className="h-4.5 w-4.5 text-zinc-400 shrink-0" />;
  };

  const fetchStageFiles = async (projectId, phaseId, parentId = null) => {
    try {
      let url = `${API_BASE}/files?project_id=${projectId}`;
      if (phaseId && phaseId !== 'ALL') {
        url += `&phase_id=${phaseId}`;
      }
      if (parentId) {
        url += `&parent_id=${parentId}`;
      } else {
        url += `&parent_id=root`;
      }
      const res = await axios.get(url);
      setStageFiles(res.data);
    } catch (err) {
      console.error("Failed to load stage files:", err);
    }
  };

  const fetchTaskFiles = async (taskId, parentId = null) => {
    try {
      let url = `${API_BASE}/files?task_id=${taskId}`;
      if (parentId) {
        url += `&parent_id=${parentId}`;
      } else {
        url += `&parent_id=root`;
      }
      const res = await axios.get(url);
      setTaskFiles(res.data);
    } catch (err) {
      console.error("Failed to load task files:", err);
    }
  };

    const handleSelectStageFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !currentProject) return;

    const stageName = activePhaseId === 'ALL'
      ? 'All Stages Repository'
      : (projectDetails?.phases?.find(p => p.id === activePhaseId)?.name || 'Stage Deliverables');
    
    const folderPath = stageBreadcrumbs.map(b => b.name).join(' / ');
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    setPendingUpload({
      isOpen: true,
      type: 'stage_files',
      files: files,
      targetProject: currentProject.name,
      targetStage: stageName,
      targetFolder: folderPath,
      totalSize: totalSize,
      rawInput: e.target
    });
  };

  const handleSelectStageFolder = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !currentProject) return;

    const rootFolder = files[0]?.webkitRelativePath?.split('/')[0] || 'Uploaded Folder';
    const stageName = activePhaseId === 'ALL'
      ? 'All Stages Repository'
      : (projectDetails?.phases?.find(p => p.id === activePhaseId)?.name || 'Stage Deliverables');
    
    const folderPath = stageBreadcrumbs.map(b => b.name).join(' / ');
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    setPendingUpload({
      isOpen: true,
      type: 'stage_folder',
      files: files,
      folderName: rootFolder,
      targetProject: currentProject.name,
      targetStage: stageName,
      targetFolder: folderPath,
      totalSize: totalSize,
      rawInput: e.target
    });
  };

  const handleSelectTaskFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedTask) return;

    const stageName = projectDetails?.phases?.find(p => p.id === selectedTask.phase_id)?.name || 'General Stage';
    const folderPath = taskBreadcrumbs.map(b => b.name).join(' / ');
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    setPendingUpload({
      isOpen: true,
      type: 'task_files',
      files: files,
      targetProject: currentProject?.name || 'Current Project',
      targetStage: stageName,
      targetTask: selectedTask.title,
      targetFolder: folderPath,
      totalSize: totalSize,
      rawInput: e.target
    });
  };

  const handleConfirmUpload = async (customFiles) => {
    const filesToUpload = customFiles || pendingUpload?.files || [];
    if (!pendingUpload || filesToUpload.length === 0) return;
    setIsConfirmUploading(true);

    try {
      if (pendingUpload.type === 'stage_files') {
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('project_id', currentProject.id);
          if (activePhaseId && activePhaseId !== 'ALL') {
            formData.append('phase_id', activePhaseId);
          }
          if (stageParentFolderId) {
            formData.append('parent_id', stageParentFolderId);
          }
          await axios.post(`${API_BASE}/files/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        showSuccess(`Uploaded ${filesToUpload.length} deliverable(s) successfully!`);
        fetchStageFiles(currentProject.id, activePhaseId, stageParentFolderId);
        fetchProjectDetails(currentProject.id);
      } else if (pendingUpload.type === 'stage_folder') {
        // 1. Create root folder on backend
        const folderRes = await axios.post(`${API_BASE}/files/folder`, {
          name: pendingUpload.folderName,
          project_id: currentProject.id,
          phase_id: activePhaseId !== 'ALL' ? activePhaseId : null,
          parent_id: stageParentFolderId
        });
        const newFolderId = folderRes.data.id;

        // 2. Upload all files into this folder
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('project_id', currentProject.id);
          if (activePhaseId && activePhaseId !== 'ALL') {
            formData.append('phase_id', activePhaseId);
          }
          formData.append('parent_id', newFolderId);
          await axios.post(`${API_BASE}/files/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        showSuccess(`Folder "${pendingUpload.folderName}" with ${filesToUpload.length} file(s) uploaded successfully!`);
        fetchStageFiles(currentProject.id, activePhaseId, stageParentFolderId);
        fetchProjectDetails(currentProject.id);
      } else if (pendingUpload.type === 'task_files') {
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('project_id', currentProject.id);
          formData.append('task_id', selectedTask.id);
          if (taskParentFolderId) {
            formData.append('parent_id', taskParentFolderId);
          }
          await axios.post(`${API_BASE}/files/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        showSuccess(`Uploaded ${filesToUpload.length} task attachment(s) successfully!`);
        fetchTaskFiles(selectedTask.id, taskParentFolderId);
        fetchProjectDetails(currentProject.id);
      }

      if (pendingUpload.rawInput) {
        pendingUpload.rawInput.value = '';
      }
      setPendingUpload(null);
    } catch (err) {
      showError(err);
    } finally {
      setIsConfirmUploading(false);
    }
  };

  const handleCancelUpload = () => {
    if (pendingUpload?.rawInput) {
      pendingUpload.rawInput.value = '';
    }
    setPendingUpload(null);
  };

  const handleUploadStageFile = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentProject) return;
    setIsUploadingStageFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', currentProject.id);
        if (activePhaseId && activePhaseId !== 'ALL') {
          formData.append('phase_id', activePhaseId);
        }
        if (stageParentFolderId) {
          formData.append('parent_id', stageParentFolderId);
        }
        await axios.post(`${API_BASE}/files/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      showSuccess("Deliverable uploaded successfully!");
      fetchStageFiles(currentProject.id, activePhaseId, stageParentFolderId);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    } finally {
      setIsUploadingStageFile(false);
      e.target.value = '';
    }
  };

  const handleCreateStageFolder = async () => {
    if (!newStageFolderName.trim() || !currentProject) {
      showError("Please enter a folder name.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/files/folder`, {
        name: newStageFolderName.trim(),
        project_id: currentProject.id,
        phase_id: activePhaseId !== 'ALL' ? activePhaseId : null,
        parent_id: stageParentFolderId
      });
      setNewStageFolderName('');
      setShowNewStageFolderModal(false);
      showSuccess(`Folder "${newStageFolderName.trim()}" created.`);
      fetchStageFiles(currentProject.id, activePhaseId, stageParentFolderId);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteStageFile = async (fileId, name, isFolder) => {
    if (!window.confirm(`Are you sure you want to delete ${isFolder ? 'folder' : 'file'} "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/files/${fileId}`);
      showSuccess(`${isFolder ? 'Folder' : 'File'} deleted successfully.`);
      fetchStageFiles(currentProject.id, activePhaseId, stageParentFolderId);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleNavigateStageBreadcrumb = (index) => {
    const target = stageBreadcrumbs[index];
    const newCrumbs = stageBreadcrumbs.slice(0, index + 1);
    setStageBreadcrumbs(newCrumbs);
    setStageParentFolderId(target.id);
    if (currentProject) {
      fetchStageFiles(currentProject.id, activePhaseId, target.id);
    }
  };

  const handleUploadTaskFile = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedTask) return;
    setIsUploadingTaskFile(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', currentProject.id);
        formData.append('task_id', selectedTask.id);
        if (taskParentFolderId) {
          formData.append('parent_id', taskParentFolderId);
        }
        await axios.post(`${API_BASE}/files/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      showSuccess("Task attachment uploaded!");
      fetchTaskFiles(selectedTask.id, taskParentFolderId);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    } finally {
      setIsUploadingTaskFile(false);
      e.target.value = '';
    }
  };

  const handleCreateTaskFolder = async () => {
    if (!newTaskFolderName.trim() || !selectedTask) {
      showError("Please enter a folder name.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/files/folder`, {
        name: newTaskFolderName.trim(),
        project_id: currentProject.id,
        task_id: selectedTask.id,
        parent_id: taskParentFolderId
      });
      setNewTaskFolderName('');
      setShowNewTaskFolderModal(false);
      showSuccess(`Task folder "${newTaskFolderName.trim()}" created.`);
      fetchTaskFiles(selectedTask.id, taskParentFolderId);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteTaskFile = async (fileId, name, isFolder) => {
    if (!window.confirm(`Are you sure you want to delete ${isFolder ? 'folder' : 'file'} "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/files/${fileId}`);
      showSuccess(`${isFolder ? 'Folder' : 'File'} deleted.`);
      fetchTaskFiles(selectedTask.id, taskParentFolderId);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleNavigateTaskBreadcrumb = (index) => {
    const target = taskBreadcrumbs[index];
    const newCrumbs = taskBreadcrumbs.slice(0, index + 1);
    setTaskBreadcrumbs(newCrumbs);
    setTaskParentFolderId(target.id);
    if (selectedTask) {
      fetchTaskFiles(selectedTask.id, target.id);
    }
  };

  const handleDownloadFile = (fileId, inline = false) => {
    const currentToken = localStorage.getItem('authToken');
    const url = `${API_BASE}/files/${fileId}/download?token=${encodeURIComponent(currentToken)}${inline ? '&inline=true' : ''}`;
    if (inline) {
      window.open(url, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Auth Operations
  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      setAuthUser(res.data);
      fetchProjects();
      fetchApprovedUsers();
      fetchAllUsers();
    } catch (err) {
      handleLogout();
    }
  };

  const handleQuickFill = (type) => {
    setIsLoginTab(true);
    setErrorMsg('');
    if (type === 'admin') {
      setAuthEmail('admin@bankalhabib.com');
      setAuthPassword('Admin123!');
    } else if (type === 'swe') {
      setAuthEmail('dev.991@bankalhabib.com');
      setAuthPassword('Password123!');
    } else if (type === 'ba') {
      setAuthEmail('analyst.992@bankalhabib.com');
      setAuthPassword('Password123!');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setIsSubmittingAuth(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: authEmail,
        password: authPassword
      });
      localStorage.setItem('authToken', res.data.token);
      setToken(res.data.token);
      setAuthUser(res.data.user);
      showSuccess(`Welcome back, ${res.data.user.name}!`);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      showError(err);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword || !authConfirmPassword || !authName) return;
    
    if (authPassword !== authConfirmPassword) {
      showError("Passwords do not match. Please verify.");
      return;
    }
    
    const emailRegex = /^[a-zA-Z]+\.[0-9]+@bankalhabib\.com$/;
    if (!emailRegex.test(authEmail)) {
      showError("Corporate email must follow format 'alphabet.numberid@bankalhabib.com' (e.g. john.12345@bankalhabib.com).");
      return;
    }
    
    setIsSubmittingAuth(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, {
        name: authName,
        email: authEmail,
        password: authPassword,
        department: authDepartment,
        role: authRole
      });
      showSuccess(res.data.message);
      setIsLoginTab(true);
      setAuthName('');
      setAuthPassword('');
      setAuthConfirmPassword('');
    } catch (err) {
      showError(err);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setToken('');
    setAuthUser(null);
    setProjects([]);
    setCurrentProject(null);
    setProjectDetails(null);
    setApprovedUsers([]);
    setAllUsers([]);
    setActiveTab('overview');
  };

  // Profile Settings Handlers
  const openProfileModal = () => {
    if (!authUser) return;
    setProfileName(authUser.name || '');
    setProfileBio(authUser.bio || '');
    setProfilePhone(authUser.phone || '');
    setProfileAvatarUrl(authUser.avatar_url || null);
    setProfileAvatarFile(null);
    setProfileAvatarPreview(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowProfilePwd(false);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    setShowProfileModal(true);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileErrorMsg('Profile photo must be under 5MB');
        return;
      }
      setProfileAvatarFile(file);
      setProfileAvatarPreview(URL.createObjectURL(file));
      setProfileErrorMsg('');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsSavingProfile(true);
      const currentToken = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE}/auth/profile/avatar`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setProfileAvatarUrl(null);
      setProfileAvatarFile(null);
      setProfileAvatarPreview(null);
      setAuthUser(prev => ({ ...prev, avatar_url: null }));
      setProfileSuccessMsg('Profile picture removed.');
    } catch (err) {
      setProfileErrorMsg(err.response?.data?.error || 'Failed to remove picture');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!profileName.trim()) {
      setProfileErrorMsg('Full Name cannot be empty.');
      return;
    }

    if (showProfilePwd && (currentPassword || newPassword || confirmNewPassword)) {
      if (!currentPassword) {
        setProfileErrorMsg('Please enter your current password.');
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setProfileErrorMsg('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setProfileErrorMsg('New passwords do not match.');
        return;
      }
    }

    setIsSavingProfile(true);
    try {
      const currentToken = localStorage.getItem('authToken');
      let finalAvatarUrl = profileAvatarUrl;

      if (profileAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', profileAvatarFile);
        const avatarRes = await axios.post(`${API_BASE}/auth/profile/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${currentToken}`
          }
        });
        finalAvatarUrl = avatarRes.data.avatar_url;
      }

      const payload = {
        name: profileName.trim(),
        bio: profileBio.trim(),
        phone: profilePhone.trim()
      };
      if (showProfilePwd && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      const res = await axios.put(`${API_BASE}/auth/profile`, payload, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      const updatedUser = {
        ...res.data.user,
        avatar_url: finalAvatarUrl
      };

      setAuthUser(updatedUser);
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setShowProfileModal(false);
      }, 1000);
    } catch (err) {
      setProfileErrorMsg(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Admin approvals and User Directory Management
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/users`);
      setAllUsers(res.data);
    } catch (err) {
      // Non-admins may receive 403, safely ignore
    }
  };

  const handleUserStatusUpdate = async (userId, status) => {
    try {
      const res = await axios.post(`${API_BASE}/admin/approve-user/${userId}`, { status });
      if (status === 'REJECTED') {
        showSuccess("User rejected, removed from screen, and stored in Rejected.");
      } else {
        showSuccess(res.data.message);
      }
      fetchAllUsers();
      fetchApprovedUsers();
    } catch (err) {
      showError(err);
    }
  };

  // Non-Admin Route Guard for Team & Approvals
  useEffect(() => {
    if (!authUser) return;
    const isAdmin = authUser.role === 'SUPER_ADMIN' || authUser.role === 'Admin' || authUser.role === 'ADMIN';
    if (activeTab === 'team_approvals' && !isAdmin) {
      setActiveTab('overview');
    }
  }, [activeTab, authUser]);

  const handleSaveUserEdit = async (userId, customPayload) => {
    const payload = customPayload || {
      name: editUserName?.trim(),
      department: editUserDepartment,
      role: editUserRole,
      status: editUserStatus
    };
    if (!payload.name || !payload.name.trim()) {
      showError("User Name is required.");
      return;
    }
    try {
      const res = await axios.put(`${API_BASE}/admin/users/${userId}`, payload);
      showSuccess(res.data.message || "User details updated successfully.");
      setEditingUserId(null);
      fetchAllUsers();
      fetchApprovedUsers();
      if (authUser && userId === authUser.id) {
        setAuthUser(res.data.user);
      }
    } catch (err) {
      showError(err);
    }
  };

  const handleCreateAdminUser = async (e, customData) => {
    if (e && e.preventDefault) e.preventDefault();
    const dataToCreate = customData || {
      name: newUserName?.trim(),
      email: newUserEmail?.trim()?.toLowerCase(),
      password: newUserPassword?.trim() || 'Bank123!',
      department: newUserDepartment,
      role: newUserRole,
      status: newUserStatus
    };
    if (!dataToCreate.name || !dataToCreate.email) {
      showError("Name and Corporate Email are required.");
      return;
    }
    if (!dataToCreate.email.toLowerCase().endsWith('@bankalhabib.com')) {
      showError("Corporate email must end with @bankalhabib.com");
      return;
    }
    setIsCreatingUser(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/users`, dataToCreate);
      showSuccess(res.data.message || "Corporate user provisioned successfully.");
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setShowCreateUserForm(false);
      fetchAllUsers();
      fetchApprovedUsers();
    } catch (err) {
      showError(err);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (authUser && userId === authUser.id) {
      showError("You cannot delete your own Super Admin account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user entry '${userName}'? This action is irreversible.`)) return;
    try {
      const res = await axios.delete(`${API_BASE}/admin/users/${userId}`);
      showSuccess(res.data.message);
      fetchAllUsers();
      fetchApprovedUsers();
    } catch (err) {
      showError(err);
    }
  };

  // Projects / Phases operations
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`);
      setProjects(res.data);
      if (res.data.length > 0) {
        const savedId = localStorage.getItem('selectedProjectId');
        const matched = savedId ? res.data.find(p => p.id === parseInt(savedId)) : null;
        const target = matched || (currentProject && res.data.find(p => p.id === currentProject.id)) || res.data[0];
        setCurrentProject(target);
        localStorage.setItem('selectedProjectId', target.id);
      } else {
        setCurrentProject(null);
        setProjectDetails(null);
      }
    } catch (err) {
      showError(err);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    try {
      const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
      const date = new Date(utcStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (isNaN(diffSec) || diffSec < 5) return 'just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`;
      const diffDay = Math.floor(diffHr / 24);
      if (diffDay < 7) return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const fetchProjectActivities = async (
    projectId = currentProject?.id,
    page = 1,
    append = false,
    timeframe = activityTimeframe,
    filterType = activityFilter
  ) => {
    if (!projectId) return;
    try {
      if (append) {
        setIsActivitiesLoadingMore(true);
      } else {
        setIsActivitiesLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        timeframe: timeframe,
        filter_type: filterType,
        include_archived: timeframe === 'all_time' ? 'true' : 'false'
      });

      const res = await axios.get(`${API_BASE}/projects/${projectId}/activities?${params.toString()}`);
      const data = res.data;
      
      const items = Array.isArray(data) ? data : (data.items || []);
      const total = data.total !== undefined ? data.total : items.length;
      const hasMore = data.has_more !== undefined ? data.has_more : false;
      const currentPage = data.current_page !== undefined ? data.current_page : page;
      const totalPages = data.total_pages !== undefined ? data.total_pages : 1;

      if (append) {
        setProjectActivities(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newItems = items.filter(a => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
      } else {
        setProjectActivities(items);
      }

      setActivityPagination({
        total,
        has_more: hasMore,
        current_page: currentPage,
        limit: 10,
        total_pages: totalPages
      });
    } catch (err) {
      console.error("Failed to fetch project activities", err);
    } finally {
      setIsActivitiesLoading(false);
      setIsActivitiesLoadingMore(false);
    }
  };

  const handleLoadMoreActivities = () => {
    if (activityPagination.has_more && !isActivitiesLoadingMore && currentProject) {
      const nextPage = activityPagination.current_page + 1;
      fetchProjectActivities(currentProject.id, nextPage, true, activityTimeframe, activityFilter);
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setActivityTimeframe(newTimeframe);
    fetchProjectActivities(currentProject?.id, 1, false, newTimeframe, activityFilter);
  };

  const handleFilterTypeChange = (newFilter) => {
    setActivityFilter(newFilter);
    fetchProjectActivities(currentProject?.id, 1, false, activityTimeframe, newFilter);
  };

  const handleArchiveOlderActivities = async () => {
    if (!currentProject) return;
    if (!window.confirm("Archive activity logs older than 30 days? All records remain 100% saved in the database for regulatory compliance and audit readiness, and can still be viewed under 'All Time (Archive)'.")) {
      return;
    }
    setIsArchivingActivities(true);
    try {
      const res = await axios.post(`${API_BASE}/projects/${currentProject.id}/activities/archive`, { days: 30 });
      showSuccess(res.data.message || "Archival completed.");
      fetchProjectActivities(currentProject.id, 1, false, activityTimeframe, activityFilter);
    } catch (err) {
      showError(err);
    } finally {
      setIsArchivingActivities(false);
    }
  };

  const toggleSectionCollapse = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const groupActivitiesByDate = (activities) => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestYear = yesterday.getFullYear();
    const yestMonth = yesterday.getMonth();
    const yestDate = yesterday.getDate();

    const groups = {
      today: [],
      yesterday: [],
      earlier: []
    };

    activities.forEach(item => {
      if (!item.created_at) {
        groups.earlier.push(item);
        return;
      }
      try {
        const utcStr = item.created_at.endsWith('Z') ? item.created_at : item.created_at + 'Z';
        const d = new Date(utcStr);
        if (d.getFullYear() === todayYear && d.getMonth() === todayMonth && d.getDate() === todayDate) {
          groups.today.push(item);
        } else if (d.getFullYear() === yestYear && d.getMonth() === yestMonth && d.getDate() === yestDate) {
          groups.yesterday.push(item);
        } else {
          groups.earlier.push(item);
        }
      } catch (e) {
        groups.earlier.push(item);
      }
    });

    return groups;
  };

  const fetchProjectDetails = async (projectId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/projects/${projectId}`);
      setProjectDetails(res.data);
      fetchProjectActivities(projectId);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/approved`);
      setApprovedUsers(res.data);
    } catch (err) {
      showError(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjName) return;
    try {
      const res = await axios.post(`${API_BASE}/projects`, {
        name: newProjName,
        description: newProjDesc,
        load_defaults: newProjDefaults
      });
      showSuccess(`Project "${res.data.name}" initialized.`);
      setShowNewProjModal(false);
      setNewProjName('');
      setNewProjDesc('');
      setNewProjDefaults(true);
      
      const pRes = await axios.get(`${API_BASE}/projects`);
      setProjects(pRes.data);
      const created = pRes.data.find(p => p.id === res.data.id);
      if (created) {
        setCurrentProject(created);
        localStorage.setItem('selectedProjectId', created.id);
      }
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete the project "${projectName}"?\n\nThis will permanently delete all associated phases, sprint tasks, and collaboration comments. This action is irreversible.`)) {
      return;
    }
    
    try {
      const res = await axios.delete(`${API_BASE}/projects/${projectId}`);
      showSuccess(res.data.message);
      
      const pRes = await axios.get(`${API_BASE}/projects`);
      setProjects(pRes.data);
      
      if (pRes.data.length > 0) {
        setCurrentProject(pRes.data[0]);
        localStorage.setItem('selectedProjectId', pRes.data[0].id);
      } else {
        setCurrentProject(null);
        setProjectDetails(null);
      }
    } catch (err) {
      showError(err);
    }
  };

  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhaseName || !currentProject) return;
    try {
      await axios.post(`${API_BASE}/projects/${currentProject.id}/phases`, {
        name: newPhaseName,
        description: newPhaseDesc,
        role_access: newPhaseRole
      });
      showSuccess(`Phase "${newPhaseName}" successfully appended.`);
      setShowAddPhaseModal(false);
      setNewPhaseName('');
      setNewPhaseDesc('');
      setNewPhaseRole('Developer');
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeletePhase = async (phaseId, phaseName) => {
    if (!currentProject) return;
    if (!window.confirm(`WARNING: Deleting Phase "${phaseName}" will delete all tasks mapped under it. Proceed?`)) return;
    try {
      await axios.delete(`${API_BASE}/projects/${currentProject.id}/phases/${phaseId}`);
      showSuccess(`Phase "${phaseName}" deleted.`);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  // Task & Comments operations
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !taskPhaseId || !currentProject || !projectDetails) return;
    
    const targetPhase = projectDetails.phases.find(p => p.id === parseInt(taskPhaseId));
    const govDept = targetPhase?.governing_department || targetPhase?.role_access;
    const isSuperAdmin = authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'Admin';
    const isDeptMember = Boolean(authUser?.department && govDept && authUser.department.trim().toLowerCase() === govDept.trim().toLowerCase());
    if (!isSuperAdmin && !isDeptMember) {
      showError("Forbidden: You have view-only access to stages outside your department.");
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/projects/${currentProject.id}/tasks`, {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        phase_id: taskPhaseId,
        assignee_id: taskAssigneeId || null,
        due_date: taskDueDate || null
      });
      showSuccess("Task created successfully.");
      setShowAddTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('Medium');
      setTaskAssigneeId('');
      setTaskDueDate('');
      fetchProjectDetails(currentProject.id);
      fetchProjectActivities(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleShiftTask = async (taskOrId, targetStatusOrDirection) => {
    if (!projectDetails || !currentProject) return;
    
    // Resolve task object from ID or object
    const task = typeof taskOrId === 'object' && taskOrId !== null
      ? taskOrId
      : (projectDetails.tasks || []).find(t => t.id === taskOrId);

    if (!task) {
      console.warn("Task not found for status shift:", taskOrId);
      return;
    }
    
    if (!canEditTaskItem(task)) {
      showError("Forbidden: You have view-only access to stages outside your department.");
      return;
    }
    
    const statuses = ['Planned', 'In Progress', 'Completed'];
    const currentStatus = (task.status === 'To Do' || task.status === 'Todo' || task.status === 'Backlog')
      ? 'Planned'
      : (task.status || 'Planned');
    const currentIdx = statuses.indexOf(currentStatus);
    
    let targetStatus = targetStatusOrDirection;
    if (targetStatusOrDirection === 'left') {
      targetStatus = currentIdx > 0 ? statuses[currentIdx - 1] : statuses[0];
    } else if (targetStatusOrDirection === 'right') {
      targetStatus = currentIdx < statuses.length - 1 ? statuses[currentIdx + 1] : statuses[statuses.length - 1];
    }
    
    if (!statuses.includes(targetStatus)) {
      console.warn("Invalid target status:", targetStatus);
      return;
    }
    if (targetStatus === currentStatus) return;
    
    try {
      await axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${task.id}`, {
        status: targetStatus
      });
      showSuccess(`Task moved to "${targetStatus}".`);
      fetchProjectDetails(currentProject.id);
      fetchProjectActivities(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleOpenTaskDetail = async (task) => {
    setSelectedTask(task);
    fetchComments(task.id);
    setTaskParentFolderId(null);
    setTaskBreadcrumbs([{ id: null, name: 'Root' }]);
    fetchTaskFiles(task.id, null);
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await axios.get(`${API_BASE}/tasks/${taskId}/comments`);
      setComments(res.data);
    } catch (err) {
      showError(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentBody.trim() || !selectedTask) return;
    try {
      await axios.post(`${API_BASE}/tasks/${selectedTask.id}/comments`, {
        body: newCommentBody
      });
      setNewCommentBody('');
      fetchComments(selectedTask.id);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      await axios.delete(`${API_BASE}/comments/${commentId}`);
      showSuccess("Comment deleted.");
      if (selectedTask) {
        fetchComments(selectedTask.id);
      }
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleAddChecklistItem = async (text) => {
    if (!text.trim() || !selectedTask) return;
    let checklist = [];
    try {
      checklist = JSON.parse(selectedTask.checklist_json || '[]');
    } catch (e) {
      checklist = [];
    }
    const newItem = {
      id: Date.now(),
      text: text.trim(),
      done: false
    };
    const updatedChecklist = [...checklist, newItem];
    await saveTaskChecklist(selectedTask.id, updatedChecklist);
  };

  const handleToggleChecklistItem = async (itemId) => {
    if (!selectedTask) return;
    let checklist = [];
    try {
      checklist = JSON.parse(selectedTask.checklist_json || '[]');
    } catch (e) {
      checklist = [];
    }
    const updatedChecklist = checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    await saveTaskChecklist(selectedTask.id, updatedChecklist);
  };

  const handleDeleteChecklistItem = async (itemId) => {
    if (!selectedTask) return;
    let checklist = [];
    try {
      checklist = JSON.parse(selectedTask.checklist_json || '[]');
    } catch (e) {
      checklist = [];
    }
    const updatedChecklist = checklist.filter(item => item.id !== itemId);
    await saveTaskChecklist(selectedTask.id, updatedChecklist);
  };

  const saveTaskChecklist = async (taskId, updatedChecklist) => {
    const jsonStr = JSON.stringify(updatedChecklist);
    try {
      const res = await axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${taskId}`, {
        checklist_json: jsonStr
      });
      setSelectedTask(res.data);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  const handleCreateCardInline = async (status, title) => {
    if (!title?.trim() || !currentProject || !projectDetails) return;
    
    const targetPhaseId = activePhaseId === 'ALL' ? projectDetails.phases[0]?.id : activePhaseId;
    if (!targetPhaseId) {
      showError("Please create a phase stage before adding tasks.");
      return;
    }
    
    const targetPhase = projectDetails.phases.find(p => p.id === targetPhaseId);
    const govDept = targetPhase?.governing_department || targetPhase?.role_access;
    const isSuperAdmin = authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'Admin';
    const isDeptMember = Boolean(authUser?.department && govDept && authUser.department.trim().toLowerCase() === govDept.trim().toLowerCase());
    if (!isSuperAdmin && !isDeptMember) {
      showError("Forbidden: You have view-only access to stages outside your department.");
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/projects/${currentProject.id}/tasks`, {
        title: title.trim(),
        description: 'No description provided.',
        priority: 'Medium',
        phase_id: targetPhaseId,
        status: status
      });
      fetchProjectDetails(currentProject.id);
      fetchProjectActivities(currentProject.id);
      showSuccess(`Card "${title.trim()}" added to ${status}.`);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!currentProject || !projectDetails) return;
    
    const task = projectDetails.tasks.find(t => t.id === taskId);
    if (task && !canEditTaskItem(task)) {
      showError("Forbidden: You have view-only access to stages outside your department.");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API_BASE}/projects/${currentProject.id}/tasks/${taskId}`);
      showSuccess("Task deleted successfully.");
      setSelectedTask(null);
      fetchProjectDetails(currentProject.id);
    } catch (err) {
      showError(err);
    }
  };

  // Modern priority dots & colors
  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical': 
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            <span>Critical</span>
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            <span>High</span>
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>Medium</span>
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
            <span>Low</span>
          </span>
        );
    }
  };

  // Badge counters for sidebar
  const pendingUserCount = allUsers.filter(u => u.status === 'PENDING').length;
  const bugCount = (projectDetails?.bugs || []).filter(
    b => b.status !== 'CLOSED' && b.status !== 'VERIFIED'
  ).length;

  // RENDER GUEST MEETING ROOM IF DIRECT MEETING URL ACCESSED WITHOUT AUTHENTICATION
  if (directMeetRoomId && (!token || !authUser)) {
    return (
      <div className={`h-screen w-screen p-2 sm:p-4 overflow-hidden flex flex-col ${
        isDarkMode ? 'bg-[#090a12] text-zinc-100' : 'bg-[#f8fafc] text-slate-900'
      }`}>
        <MeetingRoom
          meeting={directMeetingData || {
            room_name: directMeetRoomId,
            title: 'Corporate Video Governance Meeting',
            phase_name: 'Governance Review'
          }}
          isGuest={true}
          onLeave={() => {
            window.location.href = '/';
          }}
          isDarkMode={isDarkMode}
          API_BASE={API_BASE}
          showSuccess={showSuccess}
          showError={showError}
        />
      </div>
    );
  }

  // RENDER AUTHENTICATION VIEW IF NOT SIGNED IN
  if (!token || !authUser) {
    return (
      <Auth
        isLoginTab={isLoginTab}
        setIsLoginTab={setIsLoginTab}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        authConfirmPassword={authConfirmPassword}
        setAuthConfirmPassword={setAuthConfirmPassword}
        authName={authName}
        setAuthName={setAuthName}
        authDepartment={authDepartment}
        setAuthDepartment={setAuthDepartment}
        authRole={authRole}
        setAuthRole={setAuthRole}
        isSubmittingAuth={isSubmittingAuth}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        successMsg={successMsg}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        handleQuickFill={handleQuickFill}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    );
  }

  // RENDER COMPLETE WORKSPACE WITH LEFT SIDEBAR LAYOUT
  return (
    <div className={`flex h-screen w-screen overflow-hidden transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#090a12] text-zinc-100 selection:bg-purple-600 selection:text-white' 
        : 'bg-[#f8fafc] text-slate-900 selection:bg-violet-600 selection:text-white'
    }`}>
      {/* Floating Notifications Toast Center */}
      {(errorMsg || successMsg) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-2rem)] pointer-events-none transition-all duration-300">
          {errorMsg && (
            <div className="bg-rose-950/95 text-rose-100 backdrop-blur-xl border border-rose-500/40 text-xs px-4 py-3 rounded-xl shadow-2xl shadow-rose-950/50 flex items-center justify-between pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="font-semibold truncate">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg('')} className="p-1 rounded-md hover:bg-rose-800/50 text-rose-300 hover:text-white transition cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-950/95 text-emerald-100 backdrop-blur-xl border border-emerald-500/40 text-xs px-4 py-3 rounded-xl shadow-2xl shadow-emerald-950/50 flex items-center justify-between pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-semibold truncate">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg('')} className="p-1 rounded-md hover:bg-emerald-800/50 text-emerald-300 hover:text-white transition cursor-pointer">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modern Left Sidebar Navigation Shell */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProject={currentProject}
        projects={projects}
        onOpenProjectDirectory={() => {
          setProjSearchQuery('');
          setShowProjDirectoryModal(true);
        }}
        onOpenNewProject={() => setShowNewProjModal(true)}
        authUser={authUser}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onOpenProfile={openProfileModal}
        onLogout={handleLogout}
        bahlLogo={bahlLogo}
        bugCount={bugCount}
        pendingUserCount={pendingUserCount}
      />

      {/* Main Workspace Area (Scrollable flex-1) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeMeeting ? (
          <div className="flex-1 p-2 sm:p-4 h-full overflow-hidden">
            <MeetingRoom
              meeting={activeMeeting}
              onLeave={() => {
                setActiveMeeting(null);
                setDirectMeetRoomId(null);
                if (typeof window !== 'undefined' && window.history && window.history.pushState) {
                  window.history.pushState({}, '', '/');
                }
              }}
              currentProject={currentProject}
              isDarkMode={isDarkMode}
              authUser={authUser}
              API_BASE={API_BASE}
              showSuccess={showSuccess}
              showError={showError}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {/* TAB 1: OVERVIEW & METRICS (DEFAULT LANDING VIEW) */}
          {activeTab === 'overview' && (
            <OverviewMetrics
              currentProject={currentProject}
              projectDetails={projectDetails}
              isDarkMode={isDarkMode}
              setActiveTab={setActiveTab}
              onOpenAddTask={() => setShowAddTaskModal(true)}
              authUser={authUser}
            />
          )}

          {/* TAB 2: KANBAN BOARD */}
          {activeTab === 'board' && (
            <KanbanBoard
              currentProject={currentProject}
              projectDetails={projectDetails}
              activePhaseId={activePhaseId}
              setActivePhaseId={setActivePhaseId}
              isDarkMode={isDarkMode}
              authUser={authUser}
              stagePermissions={stagePermissions}
              onOpenTaskDetail={handleOpenTaskDetail}
              onOpenAddTask={() => setShowAddTaskModal(true)}
              onOpenAddPhase={() => setShowAddPhaseModal(true)}
              onInlineAddTask={handleCreateCardInline}
              onDeleteTask={handleDeleteTask}
              onMoveTaskStatus={handleShiftTask}
              canEditTaskItem={canEditTaskItem}
              getPriorityBadge={getPriorityBadge}
              formatDueDate={formatDueDate}
              isOverdue={isOverdue}
            />
          )}

          {/* TAB 3: TIMELINE / PLANNER */}
          {activeTab === 'planner' && (
            <TimelinePlanner
              currentProject={currentProject}
              projectDetails={projectDetails}
              isDarkMode={isDarkMode}
              plannerMonth={plannerMonth}
              setPlannerMonth={setPlannerMonth}
              onOpenTaskDetail={handleOpenTaskDetail}
              onOpenAddTask={(dateStr) => {
                if (dateStr) setTaskDueDate(dateStr);
                setShowAddTaskModal(true);
              }}
              getPriorityBadge={getPriorityBadge}
              formatDueDate={formatDueDate}
              isOverdue={isOverdue}
              getDaysInMonth={getDaysInMonth}
              authUser={authUser}
            />
          )}

          {/* TAB 4: STAGE DELIVERABLES & FILES */}
          {activeTab === 'stage_files' && (
            <StageFilesView
              currentProject={currentProject}
              projectDetails={projectDetails}
              activePhaseId={activePhaseId}
              setActivePhaseId={setActivePhaseId}
              stageFiles={stageFiles}
              stageParentFolderId={stageParentFolderId}
              stageBreadcrumbs={stageBreadcrumbs}
              onNavigateBreadcrumb={handleNavigateStageBreadcrumb}
              stageFileSearch={stageFileSearch}
              setStageFileSearch={setStageFileSearch}
              onUploadFile={handleSelectStageFiles}
              onUploadFolder={handleSelectStageFolder}
              onDownloadFile={handleDownloadFile}
              onDeleteFile={handleDeleteStageFile}
              onOpenNewFolderModal={() => setShowNewStageFolderModal(true)}
              isUploadingStageFile={isUploadingStageFile}
              isDarkMode={isDarkMode}
              formatFileSize={formatFileSize}
              getFileIcon={getFileIcon}
              authUser={authUser}
            />
          )}

          {/* TAB 5: DEFECTS & BUGS TRACKER */}
          {activeTab === 'bug_tracker' && (
            <BugTracker
              activeProject={currentProject || projects[0]}
              isDarkMode={isDarkMode}
              authUser={authUser}
              onBack={() => setActiveTab('overview')}
            />
          )}

          {/* TAB 6: API EXECUTION STUDIO */}
          {activeTab === 'api_studio' && (
            <ApiStudio
              activeProject={currentProject || projects[0]}
              projects={projects}
              onSelectProject={(p) => {
                setCurrentProject(p);
                if (p?.id) localStorage.setItem('selectedProjectId', p.id);
              }}
              onBack={() => setActiveTab('overview')}
              isDarkMode={isDarkMode}
              authUser={authUser}
            />
          )}

          {/* TAB 7: CORPORATE MEETINGS & MoM */}
          {activeTab === 'meetings' && (
            <MeetingsView
              currentProject={currentProject}
              projectDetails={projectDetails}
              activePhaseId={activePhaseId}
              setActivePhaseId={setActivePhaseId}
              isDarkMode={isDarkMode}
              authUser={authUser}
              API_BASE={API_BASE}
              showSuccess={showSuccess}
              showError={showError}
              onJoinMeeting={(meeting) => setActiveMeeting(meeting)}
            />
          )}

          {/* TAB 8: TEAM DIRECTORY & ACCOUNT APPROVALS */}
          {activeTab === 'team_approvals' && (
            <TeamApprovalsView
              allUsers={allUsers}
              pendingUsers={pendingUsers}
              userSearchQuery={userSearchQuery}
              setUserSearchQuery={setUserSearchQuery}
              userFilterStatus={userFilterStatus}
              setUserFilterStatus={setUserFilterStatus}
              userFilterRole={userFilterRole}
              setUserFilterRole={setUserFilterRole}
              userFilterDept={userFilterDept}
              setUserFilterDept={setUserFilterDept}
              onUserStatusUpdate={handleUserStatusUpdate}
              onSaveUserEdit={handleSaveUserEdit}
              onDeleteUser={handleDeleteUser}
              onCreateAdminUser={handleCreateAdminUser}
              authUser={authUser}
              isDarkMode={isDarkMode}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {/* TAB 8: AUDIT TRAIL & COMPLIANCE FEED */}
          {activeTab === 'audit_trail' && (
            <AuditTrailView
              currentProject={currentProject}
              projectActivities={projectActivities}
              activityPagination={activityPagination}
              activityFilter={activityFilter}
              activityTimeframe={activityTimeframe}
              isActivitiesLoading={isActivitiesLoading}
              isActivitiesLoadingMore={isActivitiesLoadingMore}
              isArchivingActivities={isArchivingActivities}
              collapsedSections={collapsedSections}
              onTimeframeChange={handleTimeframeChange}
              onFilterTypeChange={handleFilterTypeChange}
              onLoadMore={handleLoadMoreActivities}
              onArchiveOlder={handleArchiveOlderActivities}
              onToggleCollapse={toggleSectionCollapse}
              onRefresh={() => fetchProjectActivities(currentProject?.id, 1, false, activityTimeframe, activityFilter)}
              onOpenTaskDetail={handleOpenTaskDetail}
              projectDetails={projectDetails}
              authUser={authUser}
              isDarkMode={isDarkMode}
              formatTimeAgo={formatTimeAgo}
              groupActivitiesByDate={groupActivitiesByDate}
            />
          )}
        </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* SHARED MODALS & OVERLAYS                                                  */}
      {/* ========================================================================= */}

      {/* 1. TASK DETAIL DRAWER & DISCUSSIONS ENGINE */}
      {selectedTask && (() => {
        const isSelectedTaskReadOnly = !canEditTaskItem(selectedTask);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
            <div className={`h-full max-w-full sm:max-w-lg md:max-w-xl w-full flex flex-col shadow-2xl relative border-l transition ${
              isDarkMode ? 'bg-[#0e0f1b]/98 backdrop-blur-2xl border-zinc-800/90 text-zinc-100 shadow-black' : 'bg-white border-l border-slate-200 text-slate-900 shadow-2xl'
            }`}>
              
              {/* Header */}
              <div className={`p-4 sm:p-6 border-b shrink-0 ${
                isDarkMode ? 'border-zinc-800/80 bg-[#121422]/60' : 'border-b border-slate-200/90 bg-slate-50/70'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5 max-w-[85%]">
                    <span className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>TASK ID: #{selectedTask.id}</span>
                    <h3 className={`text-base font-extrabold leading-snug tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>{selectedTask.title}</h3>
                    
                    <div className="flex items-center space-x-2 pt-1 text-[10px]">
                      {getPriorityBadge(selectedTask.priority)}
                      <span className={`px-2 py-0.5 rounded border font-semibold ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                      }`}>
                        Assignee: {selectedTask.assignee_name || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="text-zinc-500 hover:text-zinc-300 p-1 transition cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {isSelectedTaskReadOnly && (
                  <div className="mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px] text-amber-500 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span>View-Only Mode: Governed by {selectedTask.governing_department || 'external department'}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 font-bold">Read-Only</span>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
                
                {/* Task Status & Priority Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pb-4 border-b border-zinc-850/10">
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold">Task Status</h4>
                    {isSelectedTaskReadOnly ? (
                      <div className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {selectedTask.status || 'Planned'}
                      </div>
                    ) : (
                      <select
                        value={selectedTask.status === 'To Do' ? 'Planned' : (selectedTask.status || 'Planned')}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const res = await axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${selectedTask.id}`, {
                              status: newStatus
                            });
                            setSelectedTask(res.data);
                            fetchProjectDetails(currentProject.id);
                            fetchProjectActivities(currentProject.id);
                            showSuccess(`Task status set to "${newStatus}".`);
                          } catch (err) {
                            showError(err);
                          }
                        }}
                        className={`w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none transition cursor-pointer ${
                          isDarkMode 
                            ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-violet-500' 
                            : 'bg-white border-zinc-300 text-zinc-900 focus:border-violet-500 shadow-sm'
                        }`}
                      >
                        <option value="Planned" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>Planned</option>
                        <option value="In Progress" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>In Progress</option>
                        <option value="Completed" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>Completed</option>
                      </select>
                    )}
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold">Due Date</h4>
                    {isSelectedTaskReadOnly ? (
                      <div className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-mono ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {selectedTask.due_date ? formatDueDate(selectedTask.due_date) : 'No due date'}
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={selectedTask.due_date || ''}
                        onChange={async (e) => {
                          const newDate = e.target.value || null;
                          try {
                            const res = await axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${selectedTask.id}`, {
                              due_date: newDate
                            });
                            setSelectedTask(res.data);
                            fetchProjectDetails(currentProject.id);
                            fetchProjectActivities(currentProject.id);
                            showSuccess(`Task due date updated.`);
                          } catch (err) {
                            showError(err);
                          }
                        }}
                        className={`w-full border rounded-lg px-2 py-1 text-xs focus:outline-none transition ${
                          isDarkMode 
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-150 focus:border-zinc-700' 
                            : 'bg-white border-zinc-200 text-zinc-850 focus:border-zinc-300 shadow-sm'
                        }`}
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold block">Risk Priority</h4>
                    <div className="pt-1">{getPriorityBadge(selectedTask.priority)}</div>
                  </div>
                </div>

                {/* Task Details Specifications */}
                <div className="space-y-2">
                  <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold">Description / Acceptance Criteria</h4>
                  <p className={`border p-4 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-850 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-855'
                  }`}>
                    {selectedTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* Checklist Section */}
                {(() => {
                  let listItems = [];
                  try {
                    const parsed = JSON.parse(selectedTask.checklist_json || '[]');
                    listItems = Array.isArray(parsed) ? parsed : [];
                  } catch(e) {
                    listItems = [];
                  }
                  const doneCount = listItems.filter(item => item.done).length;
                  const totalCount = listItems.length;
                  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
                  
                  return (
                    <div className="space-y-3 pt-4 border-t border-zinc-850/10">
                      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-emerald-500" />
                          Checklist progression
                        </span>
                        <span className="text-violet-500 font-extrabold">{doneCount}/{totalCount} ({percent}%)</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className={`w-full rounded-full h-1.5 overflow-hidden border ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-200 border-zinc-300/40'
                      }`}>
                        <div 
                          className="bg-violet-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      
                      {/* Checklist Items list */}
                      <div className="space-y-1.5 pt-1 max-h-40 overflow-y-auto pr-1">
                        {listItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between group">
                            <label className={`flex items-center space-x-2.5 text-xs select-none ${isSelectedTaskReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                              <input
                                type="checkbox"
                                disabled={isSelectedTaskReadOnly}
                                checked={item.done}
                                onChange={() => !isSelectedTaskReadOnly && handleToggleChecklistItem(item.id)}
                                className={`rounded focus:ring-violet-500 h-3.5 w-3.5 transition text-violet-600 ${
                                  isSelectedTaskReadOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                } ${
                                  isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-300'
                                }`}
                              />
                              <span className={`${item.done ? 'line-through text-zinc-500' : isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                {item.text}
                              </span>
                            </label>
                            
                            {!isSelectedTaskReadOnly && (
                              <button
                                onClick={() => handleDeleteChecklistItem(item.id)}
                                className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-0.5"
                                title="Remove item"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Item form */}
                      {!isSelectedTaskReadOnly && (
                        <div className="flex gap-2 pt-1.5">
                          <input
                            type="text"
                            placeholder="Add a checklist item..."
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddChecklistItem(newChecklistItem);
                                setNewChecklistItem('');
                              }
                            }}
                            className={`flex-1 border text-xs rounded-lg px-3 py-1.5 focus:outline-none transition ${
                              isDarkMode 
                                ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              handleAddChecklistItem(newChecklistItem);
                              setNewChecklistItem('');
                            }}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                              isDarkMode 
                                ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-800 text-zinc-300' 
                                : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-250 text-zinc-700'
                            }`}
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Task Attachments & Files Section */}
                <div className="space-y-3 pt-4 border-t border-zinc-850/10">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1.5 font-extrabold text-violet-500">
                      <Paperclip className="h-3.5 w-3.5" />
                      Attachments & Files ({taskFiles.length})
                    </span>
                    
                    {!isSelectedTaskReadOnly && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowNewTaskFolderModal(true)}
                          className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center space-x-1 transition ${
                            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
                          }`}
                          title="Create subfolder in this task"
                        >
                          <FolderPlus className="h-3 w-3 text-amber-500" />
                          <span>+ Folder</span>
                        </button>

                        <label
                          className="text-[10px] font-bold px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white flex items-center space-x-1 transition cursor-pointer shadow-sm"
                          title="Upload attachment to this task"
                        >
                          <Upload className="h-3 w-3" />
                          <span>{isUploadingTaskFile ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            multiple
                            disabled={isUploadingTaskFile}
                            onChange={handleSelectTaskFiles}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Subfolder Breadcrumbs */}
                  {taskBreadcrumbs.length > 1 && (
                    <div className="flex items-center space-x-1 text-[10px] text-zinc-400 font-mono overflow-x-auto py-1">
                      {taskBreadcrumbs.map((crumb, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <ChevronRight className="h-2.5 w-2.5 text-zinc-600" />}
                          <button
                            type="button"
                            onClick={() => handleNavigateTaskBreadcrumb(idx)}
                            className={`hover:underline ${idx === taskBreadcrumbs.length - 1 ? 'font-bold text-violet-400' : 'text-zinc-500'}`}
                          >
                            {crumb.name}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Inline New Task Folder Input */}
                  {showNewTaskFolderModal && (
                    <div className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${
                      isDarkMode ? 'bg-zinc-950 border-violet-500/30' : 'bg-violet-50/40 border-violet-200'
                    }`}>
                      <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Folder name (e.g. Logs, Screenshots)..."
                        value={newTaskFolderName}
                        onChange={(e) => setNewTaskFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateTaskFolder();
                          }
                        }}
                        className={`flex-1 bg-transparent text-xs outline-none border-b py-0.5 ${
                          isDarkMode ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-900'
                        }`}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateTaskFolder}
                        className="bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold px-2.5 py-1 rounded transition"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTaskFolderModal(false);
                          setNewTaskFolderName('');
                        }}
                        className="text-zinc-500 hover:text-zinc-300 text-[10px] p-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Task Files and Folders List */}
                  {taskFiles.length === 0 ? (
                    <div className={`p-4 rounded-lg border border-dashed text-center text-xs space-y-1 ${
                      isDarkMode ? 'border-zinc-850 text-zinc-500' : 'border-zinc-300 text-zinc-500 bg-zinc-50/50'
                    }`}>
                      <HardDrive className="h-5 w-5 mx-auto text-zinc-500 opacity-60" />
                      <p className="font-semibold text-[11px]">No attachments uploaded yet</p>
                      <p className="text-[9px] text-zinc-500">Attach screenshots, test reports, logs, or technical specs.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {taskFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border transition group text-xs ${
                            file.is_folder 
                              ? (isDarkMode ? 'bg-amber-950/10 border-amber-900/30 hover:border-amber-700/50 cursor-pointer' : 'bg-amber-50/40 border-amber-200 hover:border-amber-300 cursor-pointer')
                              : (isDarkMode ? 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-750' : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-sm')
                          }`}
                          onClick={() => {
                            if (file.is_folder) {
                              setTaskParentFolderId(file.id);
                              setTaskBreadcrumbs([...taskBreadcrumbs, { id: file.id, name: file.name }]);
                              fetchTaskFiles(selectedTask.id, file.id);
                            }
                          }}
                        >
                          <div className="flex items-center space-x-2.5 truncate max-w-[70%]">
                            <div className="shrink-0">{getFileIcon(file.file_type, file.is_folder)}</div>
                            <div className="truncate">
                              <p className="font-semibold truncate leading-snug">{file.name}</p>
                              <p className="text-[9px] text-zinc-500 font-mono">
                                {file.is_folder ? `${file.item_count || 0} items` : formatFileSize(file.file_size)} • {(file.uploaded_by_name || 'User').split(' ')[0]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            {!file.is_folder && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadFile(file.id, true);
                                  }}
                                  className="p-1 rounded hover:bg-violet-500/10 text-violet-400 hover:text-violet-300 transition"
                                  title="View / Preview"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadFile(file.id, false);
                                  }}
                                  className="p-1 rounded hover:bg-violet-500/10 text-violet-400 hover:text-violet-300 transition"
                                  title="Download"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            {!isSelectedTaskReadOnly && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTaskFile(file.id, file.name, file.is_folder);
                                }}
                                className="p-1 rounded hover:bg-red-500/10 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Collaborative Comments Engine */}
                <div className="space-y-4 pt-4 border-t border-zinc-850/10">
                  <h4 className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-violet-500" />
                    Collaborative Discussion Thread ({comments.length})
                  </h4>

                  {/* Submit comment form */}
                  <form onSubmit={handlePostComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newCommentBody}
                      onChange={(e) => setNewCommentBody(e.target.value)}
                      placeholder="Ask questions or type audit sign-off feedback..."
                      className={`flex-1 border text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 ${
                        isDarkMode 
                          ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                      }`}
                      required
                    />
                    <button
                      type="submit"
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 rounded-lg shadow transition"
                    >
                      Post
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {comments.map(c => (
                      <div key={c.id} className={`border p-3.5 rounded-lg text-xs space-y-1.5 group relative transition ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-50 border-zinc-200'
                      }`}>
                        <div className="flex justify-between items-center text-[10px] text-zinc-500">
                          <span className="font-extrabold text-violet-500">{c.author_name}</span>
                          <div className="flex items-center space-x-2">
                            <span>{new Date(c.created_at).toLocaleString()}</span>
                            {(authUser?.role === 'Admin' || authUser?.role === 'SUPER_ADMIN' || authUser?.id === c.author_id) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(c.id)}
                                className="text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-0.5 cursor-pointer"
                                title="Delete Comment"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className={isDarkMode ? 'text-zinc-300' : 'text-zinc-800'}>{c.body}</p>
                      </div>
                    ))}
                    
                    {comments.length === 0 && (
                      <p className="text-[11px] text-zinc-500 italic text-center py-8">No discussions yet. Type above to collaborate.</p>
                    )}
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className={`p-4 border-t flex ${isSelectedTaskReadOnly ? 'justify-end' : 'justify-between'} shrink-0 ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-150'
              }`}>
                {!isSelectedTaskReadOnly && (
                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-bold px-3 py-2 rounded-lg transition"
                  >
                    Delete Task
                  </button>
                )}

                <button
                  onClick={() => setSelectedTask(null)}
                  className={`text-xs font-bold px-4 py-2 rounded-lg border transition ${
                    isDarkMode 
                      ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-800 text-zinc-300' 
                      : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700'
                  }`}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. CREATE NEW TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Initialize Task / Deliverable</h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Implement ledger audit validation"
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Acceptance Criteria / Description</label>
                <textarea
                  rows="3"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Detailed specifications or compliance objectives..."
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Workflow Phase Assignment</label>
                  <select
                    value={taskPhaseId}
                    onChange={(e) => setTaskPhaseId(e.target.value)}
                    className={`w-full border rounded-lg px-2 py-2 transition focus:outline-none focus:ring-1 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-violet-500 focus:ring-violet-500' 
                        : 'bg-white border-zinc-300 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm'
                    }`}
                    required
                  >
                    <option value="" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>Select Phase...</option>
                    {projectDetails?.phases.map(p => (
                      <option key={p.id} value={p.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>{p.name.split(' (')[0]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Assignee (Stage Department)</label>
                  <select
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className={`w-full border rounded-lg px-2 py-2 transition focus:outline-none focus:ring-1 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-violet-500 focus:ring-violet-500' 
                        : 'bg-white border-zinc-300 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm'
                    }`}
                  >
                    <option value="" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>Unassigned</option>
                    {(() => {
                      const chosenPhase = projectDetails?.phases?.find(p => p.id === Number(taskPhaseId));
                      const stageDept = (chosenPhase?.governing_department || chosenPhase?.role_access || '').trim().toLowerCase();
                      const eligibleUsers = approvedUsers.filter(u => {
                        if (u.role === 'SUPER_ADMIN' || u.role === 'Admin') return true;
                        return u.department && u.department.trim().toLowerCase() === stageDept;
                      });
                      if (eligibleUsers.length === 0) {
                        return <option disabled className="text-zinc-500">No active members in {chosenPhase?.governing_department || 'this stage'}</option>;
                      }
                      return eligibleUsers.map(u => (
                        <option key={u.id} value={u.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                          {u.name} ({u.department})
                        </option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] block">Risk Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className={`w-full border rounded-lg px-2 py-2 transition focus:outline-none focus:ring-1 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-violet-500 focus:ring-violet-500' 
                        : 'bg-white border-zinc-300 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm'
                    }`}
                  >
                    {['Low', 'Medium', 'High', 'Critical'].map(p => (
                      <option key={p} value={p} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>{p} Risk</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] block">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className={`w-full border rounded-lg px-2.5 py-1.5 transition focus:outline-none focus:ring-1 ${
                      isDarkMode 
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg transition uppercase tracking-wider text-xs shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Place on Board
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 3. ADD CUSTOM PHASE MODAL */}
      {showAddPhaseModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Add Custom Workflow Phase</h3>
              <button 
                onClick={() => setShowAddPhaseModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhase} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Phase Label / Name</label>
                <input
                  type="text"
                  value={newPhaseName}
                  onChange={(e) => setNewPhaseName(e.target.value)}
                  placeholder="e.g. Threat Modeling & Risk Review"
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Description</label>
                <textarea
                  rows="2"
                  value={newPhaseDesc}
                  onChange={(e) => setNewPhaseDesc(e.target.value)}
                  placeholder="Objectives to check during sign-off..."
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Role Access / Department</label>
                <select
                  value={newPhaseRole}
                  onChange={(e) => setNewPhaseRole(e.target.value)}
                  className={`w-full border rounded-lg px-2 py-2 transition focus:outline-none focus:ring-1 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-violet-500 focus:ring-violet-500' 
                      : 'bg-white border-zinc-300 text-zinc-900 focus:border-violet-500 focus:ring-violet-500 shadow-sm'
                  }`}
                >
                  {['Developer', 'Project Manager', 'Compliance Officer', 'InfoSec Lead', 'QA Lead', 'CAB Committee'].map(r => (
                    <option key={r} value={r} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>{r}</option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-550 italic mt-0.5">Limits task creation, shifting, and deletion to users carrying this corporate role.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg transition uppercase tracking-wider text-xs shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Append Workflow Phase
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 4. INITIALIZE NEW PROJECT MODAL */}
      {showNewProjModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Initialize New Project</h3>
              <button 
                onClick={() => setShowNewProjModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Project Name</label>
                <input
                  type="text"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Retail Mortgage Application Backend"
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                  }`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Project Objective</label>
                <textarea
                  rows="3"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  placeholder="Summarize target microservices and regulatory bounds..."
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700 focus:ring-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 focus:ring-zinc-300'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="defaults-checkbox"
                  checked={newProjDefaults}
                  onChange={(e) => setNewProjDefaults(e.target.checked)}
                  className="bg-zinc-950 border-zinc-800 text-violet-500 rounded focus:ring-violet-500 cursor-pointer"
                />
                <label htmlFor="defaults-checkbox" className="font-bold text-zinc-400 cursor-pointer select-none">
                  Pre-load default recommended stages
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 rounded-lg transition uppercase tracking-wider text-xs shadow-md shadow-violet-500/10 cursor-pointer"
              >
                Initialize Pipeline
              </button>

            </form>
          </div>
        </div>
      )}

      {/* 5. PROJECT SWITCHER & DIRECTORY MODAL */}
      {showProjDirectoryModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 transition ${
            isDarkMode ? 'bg-zinc-900 border-zinc-900 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 text-purple-400 font-mono">
                <Layers className="h-4.5 w-4.5" />
                Corporate Project Directory
              </h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowProjDirectoryModal(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="text-xs">
              <input
                type="text"
                placeholder="Search projects by ID, Name or Description..."
                value={projSearchQuery}
                onChange={(e) => setProjSearchQuery(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition ${
                  isDarkMode 
                    ? 'bg-zinc-950 border-zinc-900 text-zinc-100 focus:border-zinc-800' 
                    : 'bg-zinc-50 border-zinc-200 text-zinc-850 focus:border-zinc-300 shadow-sm'
                }`}
              />
            </div>

            {/* Scrollable projects list */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                const filteredProjects = projects.filter(p => {
                  const idString = `PRJ-${String(p.id).padStart(3, '0')}`;
                  const rawIdString = `#${p.id}`;
                  const searchText = `${p.name} ${p.description || ''} ${idString} ${rawIdString}`.toLowerCase();
                  
                  const queryWords = projSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
                  if (queryWords.length === 0) return true;
                  
                  return queryWords.every(word => searchText.includes(word));
                });

                if (filteredProjects.length === 0) {
                  return <p className="text-xs text-zinc-500 italic text-center py-10">No projects found matching the criteria.</p>;
                }

                return filteredProjects.map(p => {
                  const isActive = currentProject?.id === p.id;
                  const formattedId = `PRJ-${String(p.id).padStart(3, '0')}`;
                  
                  return (
                    <div key={p.id} className={`border p-3.5 rounded-lg flex items-center justify-between gap-4 text-xs transition ${
                      isActive 
                        ? (isDarkMode ? 'bg-violet-950/20 border-violet-850' : 'bg-violet-50/50 border-violet-200')
                        : (isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-zinc-50 border-zinc-200 shadow-sm')
                    }`}>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-violet-500 text-[10.5px] tracking-wider shrink-0">{formattedId}</span>
                          <h4 className="font-bold truncate text-xs">{p.name}</h4>
                          {isActive && (
                            <span className="bg-violet-600/15 border border-violet-500/25 text-violet-500 text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">Active</span>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-zinc-500 line-clamp-2 text-[10.5px] leading-normal">{p.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 shrink-0">
                        {!isActive ? (
                          <button
                            onClick={() => {
                              setCurrentProject(p);
                              localStorage.setItem('selectedProjectId', p.id);
                              setShowProjDirectoryModal(false);
                            }}
                            className={`font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                              isDarkMode 
                                ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                                : 'bg-white border-zinc-200 hover:bg-zinc-100 text-zinc-650 shadow-sm'
                            }`}
                          >
                            Switch Workspace
                          </button>
                        ) : (
                          <span className="text-zinc-500 text-[10.5px] font-semibold italic px-2">Current</span>
                        )}
                        
                        <button
                          onClick={() => {
                            handleDeleteProject(p.id, p.name);
                          }}
                          className={`p-1.5 rounded-lg border transition text-red-500 ${
                            isDarkMode 
                              ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                              : 'bg-white border-red-100 hover:bg-red-50 shadow-sm'
                          }`}
                          title="Delete this project permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="text-right pt-2.5 border-t border-zinc-900/40">
              <button
                onClick={() => setShowProjDirectoryModal(false)}
                className={`text-xs px-4 py-2 rounded-lg border font-bold transition ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-800 hover:bg-zinc-700 text-zinc-300' 
                    : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700 shadow-sm'
                }`}
              >
                Close Directory
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. PROFILE SETTINGS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-5 transition animate-in fade-in duration-200 my-auto ${
            isDarkMode ? 'bg-[#121422] border-zinc-800 text-zinc-100 shadow-black/80' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className={`p-2 rounded-xl border ${
                  isDarkMode ? 'bg-purple-950/40 border-purple-800/50 text-purple-400' : 'bg-violet-100 border-violet-200 text-violet-700'
                }`}>
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">Account Profile & Settings</h3>
                  <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Manage personal avatar, credentials & security</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Profile Photo Section */}
              <div className={`flex items-center space-x-4 p-3.5 rounded-xl border transition ${
                isDarkMode ? 'bg-[#151728] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="relative group shrink-0">
                  {profileAvatarPreview || profileAvatarUrl ? (
                    <img 
                      src={profileAvatarPreview || `http://127.0.0.1:5000${profileAvatarUrl}`} 
                      alt="Avatar preview" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-md"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                      isDarkMode ? 'bg-purple-950/60 text-purple-300 border-purple-700' : 'bg-violet-100 text-violet-700 border-violet-300'
                    }`}>
                      {profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}
                  <label 
                    htmlFor="avatar-upload"
                    className="absolute inset-0 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                    title="Change picture"
                  >
                    <Camera className="h-4 w-4" />
                  </label>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    onChange={handleAvatarFileChange} 
                    className="hidden" 
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="font-bold text-xs block">Profile Picture</span>
                  <p className={`text-[10.5px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    PNG, JPG or WebP up to 5MB.
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <label 
                      htmlFor="avatar-upload" 
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200' : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-xs'
                      }`}
                    >
                      Upload New
                    </label>
                    {(profileAvatarUrl || profileAvatarFile) && (
                      <button 
                        type="button" 
                        onClick={handleRemoveAvatar}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                    <input 
                      type="text"
                      value={profileName}
                      onChange={e => setProfileName(e.target.value)}
                      placeholder="e.g. Asad Raza"
                      required
                      className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 transition ${
                        isDarkMode 
                          ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:ring-purple-500/30 focus:border-purple-500' 
                          : 'bg-white border-slate-200 text-slate-900 focus:ring-violet-500/20 focus:border-violet-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">Bio / Professional Headline</label>
                  <textarea 
                    rows={2}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="e.g. Senior Software Architect specializing in Core Banking API Gateways..."
                    className={`w-full text-xs px-3 py-2 rounded-xl border focus:outline-hidden focus:ring-2 transition ${
                      isDarkMode 
                        ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:ring-purple-500/30 focus:border-purple-500' 
                        : 'bg-white border-slate-200 text-slate-900 focus:ring-violet-500/20 focus:border-violet-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">Contact Number</label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                      <input 
                        type="tel"
                        value={profilePhone}
                        onChange={e => setProfilePhone(e.target.value)}
                        placeholder="e.g. +92-21-111-014-014"
                        className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 transition ${
                          isDarkMode 
                            ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:ring-purple-500/30 focus:border-purple-500' 
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-violet-500/20 focus:border-violet-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Corporate Governance Metadata (Locked) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-400">
                    <Building2 className="h-3.5 w-3.5" />
                    Corporate Governance Profile
                  </h4>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Managed by Admin
                  </span>
                </div>

                <div className={`grid grid-cols-2 gap-2.5 p-3 rounded-xl border text-xs ${
                  isDarkMode ? 'bg-[#0f101d] border-zinc-800/80' : 'bg-slate-100/70 border-slate-200/80'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Corporate Email</span>
                    <span className="font-mono text-[11px] font-semibold truncate block mt-0.5" title={authUser.email}>{authUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Department</span>
                    <span className="font-semibold text-[11px] truncate block mt-0.5">{authUser.department}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Role Hierarchy</span>
                    <span className="font-bold text-[11px] text-purple-400 block mt-0.5">
                      {authUser.role === 'SUPER_ADMIN' || authUser.role === 'Admin' ? 'SUPER ADMIN' : (authUser.role || '').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Account Status</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" /> {authUser.status || 'APPROVED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Password Section */}
              <div className={`rounded-xl border transition overflow-hidden ${
                isDarkMode ? 'border-zinc-800 bg-[#151728]' : 'border-slate-200 bg-slate-50'
              }`}>
                <button
                  type="button"
                  onClick={() => setShowProfilePwd(!showProfilePwd)}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-violet-500" />
                    <span>Change Security Password</span>
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {showProfilePwd ? 'Collapse' : 'Expand'}
                  </span>
                </button>

                {showProfilePwd && (
                  <div className="p-4 pt-1 border-t border-zinc-800/50 space-y-3">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        Current Password
                      </label>
                      <input 
                        type="password"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                          isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          New Password
                        </label>
                        <input 
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                            isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Confirm New Password
                        </label>
                        <input 
                          type="password"
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                            isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback messages */}
              {profileErrorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}
              {profileSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-750 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40' 
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20'
                  } ${isSavingProfile ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* 8. UPLOAD CONFIRMATION MODAL */}
      <UploadConfirmModal
        isOpen={Boolean(pendingUpload?.isOpen)}
        onClose={handleCancelUpload}
        onConfirm={handleConfirmUpload}
        uploadData={pendingUpload}
        isUploading={isConfirmUploading}
        isDarkMode={isDarkMode}
        formatFileSize={formatFileSize}
        getFileIcon={getFileIcon}
      />

      {/* 7. NEW STAGE FOLDER MODAL */}
      {showNewStageFolderModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-xl max-w-sm w-full p-4 sm:p-6 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                <FolderPlus className="h-4 w-4 text-amber-500" />
                New Folder
              </h3>
              <button 
                onClick={() => {
                  setShowNewStageFolderModal(false);
                  setNewStageFolderName('');
                }}
                className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Folder Name</label>
                <input
                  type="text"
                  value={newStageFolderName}
                  onChange={(e) => setNewStageFolderName(e.target.value)}
                  placeholder="e.g. Architecture Diagrams, Security Audit"
                  className={`w-full border rounded-lg px-3 py-2 transition focus:outline-none focus:ring-1 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-zinc-700' 
                      : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300'
                  }`}
                  autoFocus
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewStageFolderModal(false);
                    setNewStageFolderName('');
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    isDarkMode ? 'border-zinc-750 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateStageFolder}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition shadow-xs"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
