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
  Terminal
} from 'lucide-react';
import bahlLogo from './assets/bahl-logo.png';
import ApiStudio from './components/ApiStudio';

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

const getLightColumnStyles = (index) => {
  const styles = [
    { bg: 'bg-blue-50/50', border: 'border-blue-100', divider: 'border-blue-200/30', text: 'text-blue-600', badge: 'bg-blue-100/60 text-blue-700 border border-blue-200/30', lBorder: 'border-l-blue-400' },
    { bg: 'bg-indigo-50/50', border: 'border-indigo-100', divider: 'border-indigo-200/30', text: 'text-indigo-600', badge: 'bg-indigo-100/60 text-indigo-700 border border-indigo-200/30', lBorder: 'border-l-indigo-400' },
    { bg: 'bg-amber-50/50', border: 'border-amber-100', divider: 'border-amber-200/30', text: 'text-amber-600', badge: 'bg-amber-100/60 text-amber-700 border border-amber-200/30', lBorder: 'border-l-amber-400' },
    { bg: 'bg-emerald-50/50', border: 'border-emerald-100', divider: 'border-emerald-200/30', text: 'text-emerald-600', badge: 'bg-emerald-100/60 text-emerald-700 border border-emerald-200/30', lBorder: 'border-l-emerald-400' },
    { bg: 'bg-rose-50/50', border: 'border-rose-100', divider: 'border-rose-200/30', text: 'text-rose-600', badge: 'bg-rose-100/60 text-rose-700 border border-rose-200/30', lBorder: 'border-l-rose-400' },
    { bg: 'bg-purple-50/50', border: 'border-purple-100', divider: 'border-purple-200/30', text: 'text-purple-600', badge: 'bg-purple-100/60 text-purple-700 border border-purple-200/30', lBorder: 'border-l-purple-400' }
  ];
  return styles[index % styles.length];
};

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
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'portfolio'
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
  const [activePhaseId, setActivePhaseId] = useState(null);

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

  const [inlineAddingStatus, setInlineAddingStatus] = useState(null);
  const [inlineCardTitle, setInlineCardTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentBody, setNewCommentBody] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Stage Files & Folders State
  const [activeStageTab, setActiveStageTab] = useState('board'); // 'board' or 'files'
  const [stageFiles, setStageFiles] = useState([]);
  const [stageParentFolderId, setStageParentFolderId] = useState(null);
  const [stageBreadcrumbs, setStageBreadcrumbs] = useState([{ id: null, name: 'Root' }]);
  const [stageFileSearch, setStageFileSearch] = useState('');
  const [isUploadingStageFile, setIsUploadingStageFile] = useState(false);
  const [newStageFolderName, setNewStageFolderName] = useState('');
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
  const [activityFilter, setActivityFilter] = useState('ALL');
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);

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

  // Load project details once project changes
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
    const firstDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Go back to the Sunday of the first week of the month
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
    const token = localStorage.getItem('authToken');
    const url = `${API_BASE}/files/${fileId}/download?token=${encodeURIComponent(token)}${inline ? '&inline=true' : ''}`;
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
    
    // Check if passwords match
    if (authPassword !== authConfirmPassword) {
      showError("Passwords do not match. Please verify.");
      return;
    }
    
    // Client-side regex check for format alphabet.numberid@bankalhabib.com
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
    setAuthConfirmPassword('');
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
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE}/auth/profile/avatar`, {
        headers: { Authorization: `Bearer ${token}` }
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
      const token = localStorage.getItem('authToken');
      let finalAvatarUrl = profileAvatarUrl;

      // 1. Upload new avatar if selected
      if (profileAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', profileAvatarFile);
        const avatarRes = await axios.post(`${API_BASE}/auth/profile/avatar`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        finalAvatarUrl = avatarRes.data.avatar_url;
      }

      // 2. Update user profile
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
        headers: { Authorization: `Bearer ${token}` }
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
      showError(err);
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

  const handleSaveUserEdit = async (userId) => {
    if (!editUserName || !editUserName.trim()) {
      showError("User Name is required.");
      return;
    }
    try {
      const res = await axios.put(`${API_BASE}/admin/users/${userId}`, {
        name: editUserName.trim(),
        department: editUserDepartment,
        role: editUserRole,
        status: editUserStatus
      });
      showSuccess(res.data.message);
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

  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showError("Name and Corporate Email are required.");
      return;
    }
    if (!newUserEmail.toLowerCase().endsWith('@bankalhabib.com')) {
      showError("Corporate email must end with @bankalhabib.com");
      return;
    }
    setIsCreatingUser(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/users`, {
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword.trim() || 'Bank123!',
        department: newUserDepartment,
        role: newUserRole,
        status: newUserStatus
      });
      showSuccess(res.data.message);
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

  const fetchProjectActivities = async (projectId) => {
    if (!projectId) return;
    try {
      setIsActivitiesLoading(true);
      const res = await axios.get(`${API_BASE}/projects/${projectId}/activities?limit=50`);
      setProjectActivities(res.data);
    } catch (err) {
      console.error("Failed to fetch project activities", err);
    } finally {
      setIsActivitiesLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/projects/${projectId}`);
      setProjectDetails(res.data);
      fetchProjectActivities(projectId);
      if (res.data.phases.length > 0) {
        const hasPhase = res.data.phases.find(ph => ph.id === activePhaseId);
        if (!hasPhase) {
          setActivePhaseId(res.data.phases[0].id);
        }
      } else {
        setActivePhaseId(null);
      }
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
      if (created) setCurrentProject(created);
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
    
    // Enforce department-based access check
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

  const handleShiftTask = async (task, direction) => {
    if (!projectDetails || !currentProject) return;
    
    // Enforce department-based access check on the current stage of the task
    if (!canEditTaskItem(task)) {
      showError("Forbidden: You have view-only access to stages outside your department.");
      return;
    }
    
    const statuses = ['To Do', 'In Progress', 'Completed'];
    const currentIdx = statuses.indexOf(task.status || 'To Do');
    if (currentIdx === -1) return;
    
    let targetIdx = direction === 'right' ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= statuses.length) return;
    
    const targetStatus = statuses[targetIdx];
    try {
      await axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${task.id}`, {
        status: targetStatus
      });
      fetchProjectDetails(currentProject.id);
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

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.body);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) {
      showError("Comment body cannot be empty.");
      return;
    }
    try {
      await axios.put(`${API_BASE}/comments/${commentId}`, {
        body: editingCommentText.trim()
      });
      showSuccess("Comment updated successfully.");
      setEditingCommentId(null);
      setEditingCommentText('');
      if (selectedTask) {
        fetchComments(selectedTask.id);
      }
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

  const handleCreateCardInline = async (status) => {
    if (!inlineCardTitle.trim() || !currentProject || !projectDetails) return;
    
    // Choose phase: if activePhaseId is 'ALL', pick the first phase
    const targetPhaseId = activePhaseId === 'ALL' ? projectDetails.phases[0]?.id : activePhaseId;
    if (!targetPhaseId) {
      showError("Please create a phase stage before adding tasks.");
      return;
    }
    
    // Enforce department-based access check
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
        title: inlineCardTitle.trim(),
        description: 'No description provided.',
        priority: 'Medium',
        phase_id: targetPhaseId,
        status: status
      });
      setInlineAddingStatus(null);
      setInlineCardTitle('');
      fetchProjectDetails(currentProject.id);
      fetchProjectActivities(currentProject.id);
      showSuccess(`Card "${inlineCardTitle.trim()}" added to ${status}.`);
    } catch (err) {
      showError(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!currentProject || !projectDetails) return;
    
    // Enforce department-based access check
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

  const resetDB = async () => {
    if (authUser?.role !== 'Admin') {
      showError("Access Denied: Only administrators can execute a factory system reset.");
      return;
    }
    if (!window.confirm("CRITICAL: Drop all tables, reset dynamic phases, and seed admin default?")) return;
    try {
      const res = await axios.post(`${API_BASE}/projects/reset`);
      showSuccess(res.data.message);
      handleLogout();
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

  // RENDER DEDICATED API MANAGEMENT & CHAINED EXECUTION STUDIO PAGE
  if (viewMode === 'api_studio') {
    return (
      <ApiStudio
        onBack={() => setViewMode(token && authUser ? 'board' : 'auth')}
        isDarkMode={isDarkMode}
        authUser={authUser}
      />
    );
  }

  // RENDER AUTHENTICATION VIEW IF NOT SIGNED IN
  if (!token || !authUser) {
    return (
      <div className={`min-h-screen flex flex-col justify-between transition-colors duration-300 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-[#0a0b14] text-zinc-100 selection:bg-purple-600 selection:text-white' 
          : 'bg-[#f8faff] text-slate-900 selection:bg-violet-600 selection:text-white'
      }`}>
        {/* Background Decorative Ambient Radial Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/3" />
        <div className="absolute top-1/2 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <header className={`w-full px-4 sm:px-8 py-4 border-b flex justify-between items-center z-10 ${
          isDarkMode ? 'border-zinc-800/80 bg-[#0e101d]/60 backdrop-blur-md' : 'border-slate-200/80 bg-white/70 backdrop-blur-md'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-1 rounded-2xl border flex items-center justify-center transition shadow-sm ${
              isDarkMode ? 'bg-white/95 border-emerald-500/30 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200'
            }`}>
              <img src={bahlLogo} alt="Bank AL Habib Logo" className="h-9 sm:h-10 w-auto object-contain" />
            </div>
            <div>
              <span className={`font-bold text-xs sm:text-sm tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Bank AL Habib Limited
              </span>
              <p className={`text-[10px] hidden sm:block ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Enterprise Pipeline Management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* <div className={`hidden md:flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-1 rounded-full border ${
              isDarkMode ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Commercial banking company</span>
            </div> */}

            {/* API Management Navigation Button */}
            <button
              onClick={() => setViewMode('api_studio')}
              className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40 border border-purple-400/30' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-violet-500/20'
              }`}
              title="Open Insomnia/Postman-style API Management & Chained Execution Studio"
            >
              <Terminal className="h-3.5 w-3.5 shrink-0" />
              <span>API Management</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#141626] hover:bg-[#1d2036] border-zinc-750 text-amber-400 shadow-sm' 
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 shadow-xs'
              }`}
              title={isDarkMode ? "Switch to Light theme" : "Switch to Dark theme"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Main Content Area: Split 2-Column on large screens */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Brand, Value Props & Fast Demo Access */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase font-mono ${
                  isDarkMode ? 'bg-purple-950/40 border-purple-800/50 text-purple-300' : 'bg-violet-100 border-violet-200 text-violet-700'
                }`}>
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                  <span>Enterprise Banking SDLC v2.5</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                SDLC Project Governance
                </h1>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Engineered for strict stage ownership, automated role gating, and complete audit accountability across core banking release cycles.
                </p>
              </div>

              {/* 3 Core Highlights */}
              <div className="space-y-2.5">
                <div className={`p-3 rounded-xl border flex items-start space-x-3 transition ${
                  isDarkMode ? 'bg-[#121424]/80 border-zinc-800/90' : 'bg-white/80 border-slate-200/90 shadow-xs'
                }`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40' : 'bg-violet-50 text-violet-600 border border-violet-100'}`}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold">Strict Department Stage Ownership</h4>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Mutation controls locked to active stage governing teams with universal view-only visibility.
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start space-x-3 transition ${
                  isDarkMode ? 'bg-[#121424]/80 border-zinc-800/90' : 'bg-white/80 border-slate-200/90 shadow-xs'
                }`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold">Automated Audit Trail & Governance</h4>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Immutable timeline logging user identities, card status transitions, and delegations.
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-start space-x-3 transition ${
                  isDarkMode ? 'bg-[#121424]/80 border-zinc-800/90' : 'bg-white/80 border-slate-200/90 shadow-xs'
                }`}>
                  <div className={`p-2 rounded-lg shrink-0 ${isDarkMode ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold">Corporate Identity Guard Gating</h4>
                    <p className={`text-[11px] leading-normal ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Restricted corporate email verification (`@bankalhabib.com`) with administrator approval gating.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Demo Access Bar */}
              <div className={`p-3.5 rounded-xl border space-y-2 ${
                isDarkMode ? 'bg-purple-950/20 border-purple-900/30' : 'bg-violet-50/70 border-violet-200/80'
              }`}>
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-purple-300' : 'text-violet-700'}`}>
                    <Sparkles className="h-3.5 w-3.5" />
                    Quick Fill Demo Credentials
                  </span>
                  <span className={`text-[9.5px] uppercase font-mono ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Click to load</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition text-center cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#141626] hover:bg-purple-900/40 border-purple-800/40 text-purple-200 shadow-sm' 
                        : 'bg-white hover:bg-violet-100/60 border-violet-200 text-violet-700 shadow-xs'
                    }`}
                    title="Super Admin (admin@bankalhabib.com)"
                  >
                  Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('swe')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition text-center cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#141626] hover:bg-purple-900/40 border-purple-800/40 text-purple-200 shadow-sm' 
                        : 'bg-white hover:bg-violet-100/60 border-violet-200 text-violet-700 shadow-xs'
                    }`}
                    title="Software Engineer (dev.991@bankalhabib.com)"
                  >
                  SWE Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('ba')}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition text-center cursor-pointer ${
                      isDarkMode 
                        ? 'bg-[#141626] hover:bg-purple-900/40 border-purple-800/40 text-purple-200 shadow-sm' 
                        : 'bg-white hover:bg-violet-100/60 border-violet-200 text-violet-700 shadow-xs'
                    }`}
                    title="Business Analyst (analyst.992@bankalhabib.com)"
                  >
                  BA Analyst
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Card Container with Tabs and Forms */}
            <div className="lg:col-span-7">
              <div className={`border rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-[#121422]/95 border-zinc-800/90 shadow-black/60 ring-1 ring-purple-500/20 backdrop-blur-xl' 
                  : 'bg-white/95 border-slate-200/90 shadow-slate-200/80 ring-1 ring-violet-500/10 backdrop-blur-xl'
              }`}>
                
                {/* Segmented Tab Control */}
                <div className={`p-2 border-b flex gap-1.5 ${isDarkMode ? 'border-zinc-800/80 bg-[#0e101a]/70' : 'border-slate-100 bg-slate-50/70'}`}>
                  <button
                    type="button"
                    onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                      isLoginTab 
                        ? (isDarkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/20')
                        : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50')
                    }`}
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                      !isLoginTab 
                        ? (isDarkMode ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-500/20')
                        : (isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50')
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Request Account</span>
                  </button>
                </div>

                {/* Form Body */}
                <div className="p-6 sm:p-7 space-y-4">
                  {/* Messages */}
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 flex items-start space-x-2.5 animate-fadeIn">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                      <span className="font-medium">{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-400 flex items-start space-x-2.5 animate-fadeIn">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                      <span className="font-medium">{successMsg}</span>
                    </div>
                  )}

                  {isLoginTab ? (
                    /* SIGN IN FORM */
                    <form onSubmit={handleLogin} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center justify-between ${
                          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          <span>Corporate Email Address</span>
                          <span className="text-[9px] font-mono lowercase opacity-70">@bankalhabib.com</span>
                        </label>
                        <div className="relative">
                          <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="e.g. john.12345@bankalhabib.com"
                            className={`w-full border rounded-xl pl-10 pr-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                              isDarkMode 
                                ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className={`font-bold uppercase tracking-wider text-[9px] ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            Security Password
                          </label>
                        </div>
                        <div className="relative">
                          <KeyRound className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <input
                            type={showLoginPassword ? "text" : "password"}
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full border rounded-xl pl-10 pr-10 py-2.5 transition focus:outline-none focus:ring-2 ${
                              isDarkMode 
                                ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                            }`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition cursor-pointer p-1"
                            title={showLoginPassword ? "Hide password" : "Show password"}
                          >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className={`w-full font-extrabold py-3 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50' 
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20'
                        }`}
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Verify Access & Enter Workspace</span>
                      </button>
                    </form>
                  ) : (
                    /* REGISTRATION FORM */
                    <form onSubmit={handleSignup} className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className={`font-bold uppercase tracking-wider text-[9px] ${
                          isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          Full Employee Name
                        </label>
                        <div className="relative">
                          <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <input
                            type="text"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="e.g. Batool Zehra"
                            className={`w-full border rounded-xl pl-10 pr-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                              isDarkMode 
                                ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                            }`}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className={`font-bold uppercase tracking-wider text-[9px] ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            Corporate Email Address
                          </label>
                        </div>
                        <div className="relative">
                          <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="e.g. john.12345@bankalhabib.com"
                            className={`w-full border rounded-xl pl-10 pr-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                              isDarkMode 
                                ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                            }`}
                            required
                          />
                        </div>
                        <p className={`text-[10px] italic ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                          Format: alphabet.numberid@bankalhabib.com (e.g. batool.12345@bankalhabib.com)
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={`font-bold uppercase tracking-wider text-[9px] ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            Password
                          </label>
                          <div className="relative">
                            <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                            <input
                              type={showRegPassword ? "text" : "password"}
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full border rounded-xl pl-9 pr-9 py-2.5 transition focus:outline-none focus:ring-2 ${
                                isDarkMode 
                                  ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                  : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                              }`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition cursor-pointer p-0.5"
                              title={showRegPassword ? "Hide password" : "Show password"}
                            >
                              {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className={`font-bold uppercase tracking-wider text-[9px] ${
                              isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                            }`}>
                              Confirm
                            </label>
                            {authConfirmPassword && (
                              authPassword === authConfirmPassword ? (
                                <span className="text-[8.5px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-0.5">
                                  <Check className="h-2.5 w-2.5" /> Match
                                </span>
                              ) : (
                                <span className="text-[8.5px] text-amber-500 font-bold uppercase tracking-wider">
                                  No Match
                                </span>
                              )
                            )}
                          </div>
                          <div className="relative">
                            <KeyRound className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`} />
                            <input
                              type={showRegConfirmPassword ? "text" : "password"}
                              value={authConfirmPassword}
                              onChange={(e) => setAuthConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full border rounded-xl pl-9 pr-9 py-2.5 transition focus:outline-none focus:ring-2 ${
                                isDarkMode 
                                  ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                  : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                              }`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition cursor-pointer p-0.5"
                              title={showRegConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showRegConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            <Building2 className="h-3 w-3" />
                            <span>Department</span>
                          </label>
                          <select
                            value={authDepartment}
                            onChange={(e) => setAuthDepartment(e.target.value)}
                            className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                              isDarkMode 
                                ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                            }`}
                          >
                            {[
                              'Business Analysis',
                              'Architecture & Design',
                              'Software Engineering',
                              'QA',
                              'Compliance',
                              'Operations & Release'
                            ].map(d => (
                              <option key={d} value={d} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center gap-1 ${
                            isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                          }`}>
                            <ShieldCheck className="h-3 w-3" />
                            <span>Role Hierarchy</span>
                          </label>
                          <select
                            value={authRole}
                            onChange={(e) => setAuthRole(e.target.value)}
                            className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                              isDarkMode 
                                ? 'bg-[#151726] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                                : 'bg-slate-50/80 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
                            }`}
                          >
                            <option value="TEAM_MEMBER" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>Team Member</option>
                            <option value="DEPT_HEAD" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>Department Head</option>
                          </select>
                        </div>
                      </div>

                      <div className={`p-3.5 rounded-xl border text-[11px] space-y-1.5 ${
                        isDarkMode ? 'bg-purple-950/20 border-purple-900/40 text-purple-300' : 'bg-violet-50/80 border-violet-200 text-violet-800'
                      }`}>
                        <div className="font-extrabold uppercase flex items-center gap-1.5 text-[10px] tracking-wider">
                          <Lock className="h-3.5 w-3.5 text-amber-500" />
                          <span>Corporate Verification Protocol</span>
                        </div>
                        <p className={`text-[10.5px] leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                          Account will be provisioned in <span className="font-mono font-bold text-amber-500">PENDING</span> state. Access will be activated upon authorization by the Bank AL Habib IT Systems Administrator.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingAuth}
                        className={`w-full font-extrabold py-3 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50' 
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/20'
                        } ${isSubmittingAuth ? 'opacity-75 cursor-not-allowed' : ''}`}
                      >
                        {isSubmittingAuth ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Submitting Registration...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            <span>Submit Registration for Approval</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className={`w-full py-3.5 px-4 sm:px-8 border-t text-center text-[10.5px] z-10 ${
          isDarkMode ? 'border-zinc-800/60 text-zinc-400 bg-[#090a14]' : 'border-slate-200 text-slate-500 bg-white'
        }`}>
          <span>© {new Date().getFullYear()} Bank AL Habib Limited. All rights reserved. SDLC Governance & Regulatory Pipeline Engine.</span>
        </footer>
      </div>
    );
  }

  // RENDER COMPLETE SDLC ENGINE BOARD DASHBOARD
  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#090a12] text-zinc-100 selection:bg-purple-600 selection:text-white' 
        : 'bg-[#f8fafc] text-slate-900 selection:bg-violet-600 selection:text-white'
    }`}>
      {/* Top Corporate Nav */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-xl px-3 sm:px-6 py-2.5 sm:py-3.5 transition-colors duration-200 ${
        isDarkMode ? 'bg-[#0e0f1a]/90 border-zinc-800/80 shadow-md shadow-black/30' : 'bg-white/90 border-b border-slate-200/90 backdrop-blur-md shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo & Project Selection */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 shrink-0">
              <div className={`p-1 rounded-xl border flex items-center justify-center transition shadow-xs ${
                isDarkMode ? 'bg-white/95 border-emerald-500/30 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200'
              }`}>
                <img 
                  src={bahlLogo} 
                  alt="Bank AL Habib Logo" 
                  className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 hover:scale-105" 
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className={`font-bold tracking-tight text-xs leading-none ${
                  isDarkMode ? 'text-zinc-100' : 'text-slate-900'
                }`}>
                  Bank AL Habib Limited
                </span>
                <span className={`text-[9.5px] font-medium tracking-tight mt-0.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}>
                  Commercial Banking Company
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => {
                  setProjSearchQuery('');
                  setShowProjDirectoryModal(true);
                }}
                className={`text-[11px] sm:text-xs rounded-lg px-2.5 sm:px-3 py-1.5 font-bold border transition flex items-center space-x-1.5 cursor-pointer max-w-[135px] sm:max-w-[260px] md:max-w-[320px] ${
                  isDarkMode 
                    ? 'bg-[#141624] border-zinc-750 text-zinc-100 hover:bg-[#1c1e30] hover:border-purple-500/50 shadow-sm shadow-black/20' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800 shadow-xs hover:border-slate-300'
                }`}
                title="Search and switch projects"
              >
                <Layers className={`h-3.5 w-3.5 shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-violet-600'}`} />
                <span className="truncate">{currentProject ? `[PRJ-${String(currentProject.id).padStart(3, '0')}] ${currentProject.name}` : 'Select Project'}</span>
              </button>
              
              <button
                onClick={() => setShowNewProjModal(true)}
                className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-md shrink-0 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 border border-purple-400/20' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-violet-500/20'
                }`}
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">New Project</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Quick Notifications Center */}
          {(errorMsg || successMsg) && (
            <div className="w-full md:w-auto order-last md:order-none flex-1 max-w-sm text-center mx-auto">
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10.5px] sm:text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5 shadow-sm max-w-full truncate">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold truncate">{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10.5px] sm:text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5 shadow-sm max-w-full truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold truncate">{successMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* User Controls Panel */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0 ml-auto md:ml-0">
            
            {/* Super Admin User Management */}
            {(authUser?.role === 'SUPER_ADMIN' || authUser?.role === 'Admin') && (
              <button
                onClick={() => {
                  setUserFilterStatus('ALL');
                  setUserSearchQuery('');
                  setUserFilterRole('ALL');
                  setUserFilterDept('ALL');
                  setShowCreateUserForm(false);
                  fetchAllUsers();
                  setShowAdminModal(true);
                }}
                className={`text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-md cursor-pointer ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 border border-purple-400/20' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-violet-500/20'
                }`}
                title="Super Admin User Management Console"
              >
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>User Management</span>
                {allUsers.filter(u => u.status === 'PENDING').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" title="Pending Registration Requests" />
                )}
              </button>
            )}

            {/* API Management Navigation Button */}
            <button
              onClick={() => setViewMode('api_studio')}
              className={`text-[10px] sm:text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition shadow-sm cursor-pointer ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40 border border-purple-400/30' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-violet-500/20'
              }`}
              title="Open Insomnia/Postman-style API Management & Chained Execution Studio"
            >
              <Terminal className="h-3.5 w-3.5 shrink-0" />
              <span>API Management</span>
            </button>

            {/* Profile */}
            <button
              onClick={openProfileModal}
              title="Click to manage profile settings"
              className={`flex items-center space-x-1.5 sm:space-x-2.5 px-2 sm:px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer group ${
                isDarkMode 
                  ? 'bg-[#141624] border-zinc-750 text-zinc-100 hover:bg-[#1a1d30] hover:border-purple-500/50 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80 hover:border-violet-300 shadow-xs'
              }`}
            >
              {authUser.avatar_url ? (
                <img 
                  src={`http://127.0.0.1:5000${authUser.avatar_url}`} 
                  alt={authUser.name}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover border border-purple-400/40 ring-1 ring-purple-500/30 shrink-0" 
                />
              ) : (
                <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0 ${
                  isDarkMode ? 'bg-purple-900/60 text-purple-200 border border-purple-500/30' : 'bg-violet-100 text-violet-700 border border-violet-200'
                }`}>
                  {authUser.name ? authUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User className="h-3.5 w-3.5" />}
                </div>
              )}
              <div className="text-left leading-none">
                <div className="font-bold text-[11px] sm:text-xs whitespace-nowrap group-hover:text-purple-400 transition-colors">
                  {authUser.name}
                </div>
                <div className={`text-[8px] sm:text-[8.5px] uppercase font-semibold mt-0.5 whitespace-nowrap ${
                  isDarkMode ? 'text-purple-300/80' : 'text-slate-500'
                }`}>
                  {authUser.role === 'SUPER_ADMIN' || authUser.role === 'Admin' ? 'SUPER ADMIN' : (authUser.role || '').replace(/_/g, ' ')}
                </div>
              </div>
              <Settings className={`h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-50 group-hover:opacity-100 transition-opacity ml-1 shrink-0 ${
                isDarkMode ? 'text-purple-400' : 'text-violet-600'
              }`} />
            </button>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-1.5 sm:p-2 border rounded-lg transition cursor-pointer shrink-0 ${
                isDarkMode 
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-amber-400' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 shadow-xs hover:text-slate-900'
              }`}
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Logout Session"
              className={`p-1.5 sm:p-2 border rounded-lg transition cursor-pointer shrink-0 ${
                isDarkMode 
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-750 text-zinc-400 hover:text-white' 
                  : 'bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 shadow-xs'
              }`}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>

            {/* Reset - Admin Only */}
            {authUser?.role === 'Admin' && (
              <button
                onClick={resetDB}
                title="Factory System Reset (Admin Only)"
                className={`p-1.5 sm:p-2 border rounded-lg transition cursor-pointer shrink-0 ${
                  isDarkMode
                    ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                    : 'bg-slate-50 hover:bg-red-50 border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-600 shadow-xs'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Board Container */}
      {/* Main Board/Portfolio Container */}
      {viewMode === 'portfolio' ? (
        /* PORTFOLIO OVERVIEW VIEW ALL PROJECTS */
        <main className="p-6 space-y-6 max-w-7xl mx-auto">
          <section className={`border rounded-xl p-6 transition-colors duration-200 ${
            isDarkMode ? 'bg-zinc-900/60 border-zinc-900' : 'bg-violet-50/10 border-violet-105 shadow-sm'
          }`}>
            <div className="flex justify-between items-center border-b pb-4 mb-6 border-zinc-900/40">
              <div className="flex items-center space-x-3.5">
                <button
                  onClick={() => setViewMode('board')}
                  className={`p-2 border rounded-lg transition shrink-0 ${
                    isDarkMode 
                      ? 'bg-zinc-905 border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-850 hover:border-zinc-800' 
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 shadow-sm'
                  }`}
                  title="Back to Kanban Board"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider font-mono">
                    <Layers className="h-4.5 w-4.5 text-violet-500" />
                    Corporate Project Portfolio Overview
                  </h2>
                  <p className="text-[11.5px] text-zinc-500 mt-1">Cross-project lifecycle stages, delivery metrics, and task tracking ledger.</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewProjModal(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
                const formattedId = `PRJ-${String(p.id).padStart(3, '0')}`;
                const isActive = currentProject?.id === p.id;
                return (
                  <div key={p.id} className={`border rounded-xl p-5 flex flex-col justify-between space-y-4 transition ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-zinc-900/60 hover:bg-zinc-950/80 hover:border-zinc-805' 
                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md'
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-[10.5px] font-bold text-violet-500 tracking-wider">{formattedId}</span>
                        {isActive && (
                          <span className="bg-violet-600/15 border border-violet-500/25 text-violet-600 text-[8.5px] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">Active</span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-xs leading-snug">{p.name}</h3>
                      <p className="text-zinc-500 text-[11px] line-clamp-2 leading-relaxed">{p.description || 'No project description defined.'}</p>
                    </div>

                    <div className="pt-3 border-t border-zinc-900/30 flex items-center justify-between text-xs text-zinc-400">
                      <div className="flex space-x-4">
                        <div>
                          <span className={`block font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.phase_count}</span>
                          <span className="text-[9.5px] text-zinc-550 uppercase font-mono">Stages</span>
                        </div>
                        <div>
                          <span className={`block font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{p.task_count}</span>
                          <span className="text-[9.5px] text-zinc-550 uppercase font-mono">Tasks</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentProject(p);
                          localStorage.setItem('selectedProjectId', p.id);
                          setViewMode('board');
                        }}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm shadow-violet-500/10 cursor-pointer"
                      >
                        Open Board
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {projects.length === 0 && (
                <div className="col-span-full text-center py-20 text-xs text-zinc-500 italic">
                  No projects found. Use the "New Project" button to get started.
                </div>
              )}
            </div>
          </section>
        </main>
      ) : viewMode === 'planner' && projectDetails ? (
        <main className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
          
          {/* Sub-Header Project Details card */}
          <section className={`border rounded-xl p-5 transition-colors duration-200 ${
            isDarkMode ? 'bg-zinc-900/60 border-zinc-900' : 'bg-violet-50/10 border-violet-100 shadow-sm'
          } flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold">{projectDetails.project.name}</h2>
                <span className="text-[9px] bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Planner Mode
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-4xl">{projectDetails.project.description || 'No description provided.'}</p>
            </div>
            
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  setViewMode('board');
                  setActivePhaseId('ALL');
                }}
                className={`font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition border ${
                  isDarkMode 
                    ? 'bg-zinc-900 hover:bg-zinc-900/80 border-zinc-900 text-zinc-200' 
                    : 'bg-white hover:bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Open Kanban Board</span>
              </button>
            </div>
          </section>

          {/* Planner split panel grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Panel: Unscheduled tasks */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Unscheduled Tasks Box */}
              <div className={`border rounded-xl p-5 space-y-4 transition ${
                isDarkMode ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-mono">Unscheduled Tasks</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {projectDetails.tasks.filter(t => !t.due_date).length} items
                  </span>
                </div>
                
                <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                  {projectDetails.tasks.filter(t => !t.due_date).length === 0 ? (
                    <p className="text-[10px] text-zinc-500 italic text-center py-6">All tasks have due dates!</p>
                  ) : (
                    projectDetails.tasks.filter(t => !t.due_date).map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleOpenTaskDetail(t)}
                        className={`border p-3 rounded-lg cursor-pointer transition space-y-1.5 ${
                          isDarkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-250 hover:bg-white hover:shadow-sm shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          {getPriorityBadge(t.priority)}
                          <span className="text-[9px] text-zinc-500 font-mono">#{t.id}</span>
                        </div>
                        <h5 className="font-bold text-xs leading-snug">{t.title}</h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Quick schedule: set due date to today
                            const todayStr = new Date().toISOString().split('T')[0];
                            axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${t.id}`, {
                              due_date: todayStr
                            }).then(() => {
                              fetchProjectDetails(currentProject.id);
                              showSuccess(`Task scheduled for today.`);
                            });
                          }}
                          className="text-[9px] font-extrabold text-violet-500 hover:text-violet-400 flex items-center space-x-1 pt-1 uppercase"
                        >
                          <Calendar className="h-2.5 w-2.5" />
                          <span>Schedule Today</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Panel: Monthly calendar grid */}
            <div className={`lg:col-span-3 border rounded-xl p-5 space-y-5 transition ${
              isDarkMode ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              
              {/* Calendar control header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800/10 pb-4 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => {
                      const prev = new Date(plannerMonth.getFullYear(), plannerMonth.getMonth() - 1, 1);
                      setPlannerMonth(prev);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-300' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 shadow-sm'
                    }`}
                    title="Previous Month"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <h3 className="font-bold text-sm tracking-wide select-none min-w-[120px] text-center">
                    {plannerMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => {
                      const next = new Date(plannerMonth.getFullYear(), plannerMonth.getMonth() + 1, 1);
                      setPlannerMonth(next);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-300' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 shadow-sm'
                    }`}
                    title="Next Month"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setPlannerMonth(new Date())}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-300' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 shadow-sm'
                    }`}
                  >
                    Today
                  </button>
                </div>

                <div className="text-[10px] text-zinc-505 font-mono">
                  Active Workspace Pipeline: <span className="font-bold text-violet-500">#{currentProject.id}</span>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="space-y-1">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 font-mono py-1 border-b border-zinc-850/5">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                    <div key={d}>
                      <span className="hidden sm:inline">{d}</span>
                      <span className="sm:hidden">{['S','M','T','W','T','F','S'][i]}</span>
                    </div>
                  ))}
                </div>

                {/* Day Slots */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 min-h-[420px] sm:h-[620px]">
                  {getDaysInMonth(plannerMonth).map((day, idx) => {
                    const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                    const dayTasks = projectDetails.tasks.filter(t => t.due_date === day.dateStr);

                    return (
                      <div
                        key={idx}
                        className={`border rounded-lg p-1 sm:p-1.5 flex flex-col justify-between transition min-h-[55px] sm:min-h-[90px] overflow-hidden group ${
                          day.isCurrentMonth 
                            ? (isDarkMode ? 'bg-zinc-950/20 border-zinc-900 hover:border-zinc-800' : 'bg-zinc-50/20 border-zinc-200 hover:border-zinc-300')
                            : (isDarkMode ? 'bg-zinc-950/5 border-zinc-900/40 text-zinc-600 opacity-40' : 'bg-zinc-100/30 border-zinc-200/50 text-zinc-400 opacity-40')
                        } ${
                          isToday ? 'ring-1 sm:ring-2 ring-violet-500 border-violet-500' : ''
                        }`}
                      >
                        {/* Day Header */}
                        <div className="flex justify-between items-center shrink-0">
                          <span className={`text-[8.5px] sm:text-[10px] font-bold font-mono ${isToday ? 'text-violet-500 font-extrabold' : ''}`}>{day.dayNum}</span>
                          
                          {/* Quick Add Button */}
                          {day.isCurrentMonth && (
                            <button
                              onClick={() => {
                                setTaskDueDate(day.dateStr);
                                setTaskPhaseId(projectDetails.phases[0]?.id || '');
                                setShowAddTaskModal(true);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition p-0.5 rounded hover:bg-violet-500/10 text-violet-500 cursor-pointer hidden sm:block"
                              title="Add task on this day"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>

                        {/* Calendar Items Container */}
                        <div className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-1 mt-0.5 sm:mt-1 pr-0.5">
                          {/* Render Tasks */}
                          {dayTasks.map(t => (
                            <div
                              key={t.id}
                              onClick={() => handleOpenTaskDetail(t)}
                              className={`text-[7px] sm:text-[8.5px] p-0.5 sm:p-1 rounded font-medium border truncate transition cursor-pointer flex items-center space-x-1 ${
                                t.status === 'Completed'
                                   ? 'bg-emerald-500/10 text-emerald-550 border-emerald-500/20 hover:bg-emerald-500/15'
                                  : isDarkMode 
                                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300' 
                                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm'
                              }`}
                              title={`[#${t.id}] ${t.title}`}
                            >
                              <span className={`h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full shrink-0 ${
                                t.priority === 'Critical' ? 'bg-red-500 animate-pulse' : t.priority === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                              }`} />
                              <span className="truncate">{t.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </main>
      ) : projectDetails ? (
        <main className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden pb-24">
          
          {/* Sub-Header Project Details card */}
          <section className={`border rounded-2xl p-4 sm:p-5 transition-colors duration-200 ${
            isDarkMode 
              ? 'bg-gradient-to-r from-[#121424]/90 via-[#10121d]/85 to-[#1c1532]/40 border-zinc-800/90 shadow-xl shadow-black/30 backdrop-blur-sm' 
              : 'bg-gradient-to-r from-white via-slate-50/60 to-violet-50/30 border border-slate-200/90 shadow-sm shadow-slate-200/50'
          } flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4`}>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className={`text-sm sm:text-base font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>{projectDetails.project.name}</h2>
                <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider ${
                  isDarkMode 
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                    : 'bg-violet-100/80 text-violet-700 border border-violet-200/80'
                }`}>
                  Active Workspace
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-4xl leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                {projectDetails.project.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
              {stagePermissions.isReadOnly ? (
                <div className="relative group flex-1 sm:flex-initial" title={stagePermissions.readOnlyReason}>
                  <button
                    disabled
                    className={`w-full justify-center font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition opacity-60 cursor-not-allowed border ${
                      isDarkMode 
                        ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400' 
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>+ New Task</span>
                  </button>
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 z-50 whitespace-nowrap bg-zinc-950 text-amber-400 text-[10.5px] font-semibold py-1 px-2.5 rounded-md shadow-xl border border-amber-500/30 pointer-events-none">
                    <Lock className="h-3 w-3" />
                    <span>{stagePermissions.readOnlyReason}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const defaultPhaseId = activePhaseId && activePhaseId !== 'ALL' ? activePhaseId : (projectDetails.phases[0]?.id || '');
                    setTaskPhaseId(defaultPhaseId);
                    setShowAddTaskModal(true);
                  }}
                  className={`flex-1 sm:flex-initial justify-center font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow-md cursor-pointer ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/30 border border-purple-400/20' 
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-sm shadow-violet-500/20'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>New Task</span>
                </button>
              )}

              <button
                onClick={() => setShowAddPhaseModal(true)}
                className={`flex-1 sm:flex-initial justify-center font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition border cursor-pointer ${
                  isDarkMode 
                    ? 'bg-[#141624] hover:bg-[#1c1e30] border-zinc-750 text-zinc-100 shadow-sm shadow-black/20' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-violet-300 text-slate-700 hover:text-violet-700 shadow-xs'
                }`}
              >
                <Layers className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-violet-600'}`} />
                <span>+ Add Stage</span>
              </button>
            </div>
          </section>

          {/* Phase governance selector & View Mode Toggle */}
          <div className={`flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b ${
            isDarkMode ? 'border-zinc-800/80' : 'border-slate-200/80'
          }`}>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2 flex-1 sm:flex-initial">
                <label className={`text-xs font-extrabold uppercase tracking-wider font-mono shrink-0 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                }`}>Stage:</label>
                <select
                  value={activePhaseId || 'ALL'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActivePhaseId(val === 'ALL' ? 'ALL' : parseInt(val));
                    setStageParentFolderId(null);
                    setStageBreadcrumbs([{ id: null, name: 'Root' }]);
                    setInlineAddingStatus(null);
                    setInlineCardTitle('');
                  }}
                  className={`text-xs font-bold rounded-lg border px-3 py-2 transition focus:outline-none focus:ring-2 cursor-pointer flex-1 sm:flex-initial w-full sm:w-auto shadow-xs ${
                    isDarkMode 
                      ? 'bg-[#141624] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20' 
                      : 'bg-white border-slate-200 text-slate-800 focus:border-violet-500 focus:ring-violet-500/15'
                  }`}
                >
                  <option value="ALL" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                    All Stages (Cross-Pipeline View)
                  </option>
                  {projectDetails.phases.map((ph, idx) => (
                    <option key={ph.id} value={ph.id} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                      Stage {idx + 1}: {ph.name.split(':')[1]?.trim() || ph.name} 
                    </option>
                  ))}
                </select>
              </div>

              {activePhaseId !== 'ALL' && (
                <button
                  onClick={() => {
                    const activePhase = projectDetails.phases.find(ph => ph.id === activePhaseId);
                    if (activePhase) {
                      handleDeletePhase(activePhase.id, activePhase.name);
                    }
                  }}
                  className={`p-2 rounded-lg border transition text-red-500 hover:bg-red-500/10 cursor-pointer shrink-0 ${
                    isDarkMode 
                      ? 'bg-[#141624] border-red-500/30 hover:border-red-500/60 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-red-300 text-red-500 hover:bg-red-50 shadow-xs'
                  }`}
                  title="Delete this SDLC stage permanently"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Stage View Toggle: Kanban Board vs Files & Deliverables */}
            <div className={`flex items-center p-1 rounded-xl border text-xs font-bold w-full sm:w-auto justify-center ${
              isDarkMode ? 'bg-[#121422] border-zinc-800 shadow-inner' : 'bg-slate-100/90 border-slate-200/80 shadow-inner'
            }`}>
              <button
                type="button"
                onClick={() => setActiveStageTab('board')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                  activeStageTab === 'board'
                    ? (isDarkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/20' 
                        : 'bg-white text-slate-900 shadow-xs border border-slate-200/60')
                    : isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <Kanban className={`h-3.5 w-3.5 ${activeStageTab === 'board' && !isDarkMode ? 'text-violet-600' : ''}`} />
                <span>Kanban Board</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStageTab('files')}
                className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition cursor-pointer font-bold ${
                  activeStageTab === 'files'
                    ? (isDarkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/20' 
                        : 'bg-white text-slate-900 shadow-xs border border-slate-200/60')
                    : isDarkMode ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                <Folder className="h-3.5 w-3.5 text-amber-500" />
                <span>Stage Files & Folders</span>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-mono font-extrabold ${
                  activeStageTab === 'files'
                    ? (isDarkMode ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800')
                    : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  {stageFiles.length}
                </span>
              </button>
            </div>
          </div>

          {activeStageTab === 'files' ? (
            /* STAGE DELIVERABLES & FILES REPOSITORY VIEW */
            <div className={`border rounded-xl p-6 space-y-6 transition ${
              isDarkMode ? 'bg-zinc-900/30 border-zinc-900' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              
              {/* Top Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5 text-violet-500" />
                    <h3 className="font-bold text-sm">
                      {activePhaseId === 'ALL' 
                        ? 'Cross-Pipeline Deliverables & Files Repository' 
                        : `${projectDetails.phases.find(p => p.id === activePhaseId)?.name || 'Stage'} Deliverables & Files`}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Store and organize stage specifications, compliance sign-offs, architecture diagrams, and audit deliverables.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowNewStageFolderModal(true)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg border flex items-center space-x-1.5 transition cursor-pointer ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900 text-zinc-200' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700 shadow-sm'
                    }`}
                  >
                    <FolderPlus className="h-4 w-4 text-amber-500" />
                    <span>New Folder</span>
                  </button>

                  <label className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition shadow cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>{isUploadingStageFile ? 'Uploading...' : 'Upload Deliverables'}</span>
                    <input
                      type="file"
                      multiple
                      disabled={isUploadingStageFile}
                      onChange={handleUploadStageFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Breadcrumbs & Search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-1 text-xs text-zinc-400 font-mono overflow-x-auto py-1">
                  {stageBreadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-600" />}
                      <button
                        type="button"
                        onClick={() => handleNavigateStageBreadcrumb(idx)}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          idx === stageBreadcrumbs.length - 1 
                            ? 'font-extrabold text-violet-500 bg-violet-500/10' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:underline'
                        }`}
                      >
                        {idx === 0 ? '📁 Root' : crumb.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                <div className="text-xs w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Filter files in this directory..."
                    value={stageFileSearch}
                    onChange={(e) => setStageFileSearch(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none transition ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-850 text-zinc-200 focus:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-zinc-300 shadow-sm'
                    }`}
                  />
                </div>
              </div>

              {/* Inline Create Folder Input */}
              {showNewStageFolderModal && (
                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-3 transition ${
                  isDarkMode ? 'bg-zinc-950 border-violet-500/40' : 'bg-violet-50/40 border-violet-200'
                }`}>
                  <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400">Folder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Architecture Diagrams, Security Audit Reports, BRD Specifications..."
                      value={newStageFolderName}
                      onChange={(e) => setNewStageFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateStageFolder();
                        }
                      }}
                      className={`w-full border rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-900'
                      }`}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4 sm:pt-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={handleCreateStageFolder}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-3 py-2 rounded-lg transition cursor-pointer"
                    >
                      Create Folder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewStageFolderModal(false);
                        setNewStageFolderName('');
                      }}
                      className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Files and Folders Explorer Grid */}
              {(() => {
                const filtered = stageFiles.filter(item => 
                  !stageFileSearch.trim() || item.name.toLowerCase().includes(stageFileSearch.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className={`p-12 rounded-xl border border-dashed text-center space-y-2 ${
                      isDarkMode ? 'border-zinc-850 text-zinc-500 bg-zinc-950/20' : 'border-zinc-300 text-zinc-500 bg-zinc-50/50'
                    }`}>
                      <HardDrive className="h-8 w-8 mx-auto text-zinc-500 opacity-50" />
                      <h4 className="font-bold text-sm text-zinc-400">No deliverables or files in this directory</h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Create folders to organize stage documentation or click "Upload Deliverables" to attach files.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.is_folder) {
                            setStageParentFolderId(item.id);
                            setStageBreadcrumbs([...stageBreadcrumbs, { id: item.id, name: item.name }]);
                            fetchStageFiles(currentProject.id, activePhaseId, item.id);
                          }
                        }}
                        className={`p-3.5 rounded-xl border transition flex items-center justify-between group ${
                          item.is_folder
                            ? (isDarkMode ? 'bg-amber-950/10 border-amber-900/30 hover:border-amber-600/60 hover:bg-amber-950/20 cursor-pointer' : 'bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer')
                            : (isDarkMode ? 'bg-zinc-950/40 border-zinc-850 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm')
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate max-w-[70%]">
                          <div className="shrink-0">{getFileIcon(item.file_type, item.is_folder)}</div>
                          <div className="truncate">
                            <h5 className="font-bold text-xs truncate leading-snug">{item.name}</h5>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              {item.is_folder ? `${item.item_count || 0} items` : formatFileSize(item.file_size)} • {(item.uploaded_by_name || 'User').split(' ')[0]}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {!item.is_folder && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(item.id, true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-400 hover:text-violet-300 transition cursor-pointer"
                                title="View / Preview"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(item.id, false);
                                }}
                                className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-400 hover:text-violet-300 transition cursor-pointer"
                                title="Download File"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStageFile(item.id, item.name, item.is_folder);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <>
              {/* Active Phase governance specifications details card */}
          {(() => {
            const activePhase = projectDetails.phases.find(ph => ph.id === activePhaseId);
            if (!activePhase) return null;
            const govDept = activePhase.governing_department || activePhase.role_access;
            return (
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                isDarkMode 
                  ? 'bg-[#121424]/60 border-purple-900/30 shadow-md shadow-black/20' 
                  : 'bg-white border-slate-200/90 shadow-xs'
              }`}>
                <div>
                  <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${
                    isDarkMode ? 'text-purple-400' : 'text-violet-700'
                  }`}>
                    Active Governance Boundary: {activePhase.name}
                  </h4>
                  <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{activePhase.description || 'No objective details specified.'}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {govDept && (
                    <div className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border uppercase tracking-wider ${
                      isDarkMode ? 'bg-purple-950/20 border-purple-900/40 text-purple-300' : 'bg-violet-50 border-violet-200 text-violet-700'
                    }`}>
                      Governing Dept: {govDept}
                    </div>
                  )}
                  {stagePermissions.isReadOnly ? (
                    <div className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border uppercase tracking-wider flex items-center gap-1.5 ${
                      isDarkMode ? 'bg-amber-950/40 border-amber-800/60 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`} title={stagePermissions.readOnlyReason}>
                      <Lock className="h-3 w-3 text-amber-500" />
                      <span>Read-Only Mode</span>
                    </div>
                  ) : (
                    <div className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border uppercase tracking-wider flex items-center gap-1.5 ${
                      isDarkMode ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      <span>Ownership Active</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Kanban Board Layout */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 w-full">
            {[
              { 
                status: 'To Do', 
                label: 'To Do', 
                color: 'zinc', 
                bg: 'bg-slate-50/75', 
                border: 'border-slate-200/90 shadow-xs', 
                divider: 'border-slate-200/80', 
                text: 'text-slate-700', 
                badge: 'bg-slate-200/80 text-slate-700 border border-slate-300/60', 
                hover: 'hover:border-slate-300',
                darkBg: 'bg-[#11121d]/85 border-zinc-800/90 shadow-xl shadow-black/20',
                darkDivider: 'border-zinc-800/80',
                darkText: 'text-zinc-200',
                darkBadge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                dot: isDarkMode ? 'bg-zinc-400 ring-2 ring-zinc-400/20' : 'bg-slate-400 ring-2 ring-slate-300/50'
              },
              { 
                status: 'In Progress', 
                label: 'In Progress', 
                color: 'blue', 
                bg: 'bg-blue-50/30', 
                border: 'border-blue-200/70 shadow-xs', 
                divider: 'border-blue-200/70', 
                text: 'text-blue-700', 
                badge: 'bg-blue-100 text-blue-800 border border-blue-200', 
                hover: 'hover:border-blue-300',
                darkBg: 'bg-[#0e1628]/75 border-blue-900/40 shadow-xl shadow-blue-950/20',
                darkDivider: 'border-blue-900/40',
                darkText: 'text-blue-400',
                darkBadge: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
                dot: isDarkMode ? 'bg-blue-400 ring-2 ring-blue-400/30 animate-pulse' : 'bg-blue-500 ring-2 ring-blue-200 animate-pulse'
              },
              { 
                status: 'Completed', 
                label: 'Completed', 
                color: 'emerald', 
                bg: 'bg-emerald-50/30', 
                border: 'border-emerald-200/70 shadow-xs', 
                divider: 'border-emerald-200/70', 
                text: 'text-emerald-700', 
                badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
                hover: 'hover:border-emerald-300',
                darkBg: 'bg-[#0b1c18]/75 border-emerald-900/40 shadow-xl shadow-emerald-950/20',
                darkDivider: 'border-emerald-900/40',
                darkText: 'text-emerald-400',
                darkBadge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
                dot: isDarkMode ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-emerald-500 ring-2 ring-emerald-200'
              }
            ].map((col) => {
              const colTasks = projectDetails.tasks.filter(t => {
                const matchPhase = activePhaseId === 'ALL' || t.phase_id === activePhaseId;
                const matchStatus = (t.status || 'To Do') === col.status;
                return matchPhase && matchStatus;
              });

              return (
                <div
                  key={col.status}
                  onDragOver={(e) => {
                    if (stagePermissions.isReadOnly) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={async (e) => {
                    if (stagePermissions.isReadOnly) return;
                    e.preventDefault();
                    const droppedTaskId = e.dataTransfer.getData('text/plain');
                    if (!droppedTaskId) return;
                    const taskToMove = projectDetails.tasks.find(tk => tk.id === Number(droppedTaskId));
                    if (taskToMove && taskToMove.status !== col.status) {
                      if (!canEditTaskItem(taskToMove)) {
                        showError("Forbidden: You have view-only access to stages outside your department.");
                        return;
                      }
                      try {
                        await axios.put(`${API_BASE}/projects/${currentProject.id}/tasks/${taskToMove.id}`, {
                          status: col.status
                        });
                        fetchProjectDetails(currentProject.id);
                        fetchProjectActivities(currentProject.id);
                        showSuccess(`Task moved to "${col.status}".`);
                      } catch (err) {
                        showError(err);
                      }
                    }
                  }}
                  className={`border rounded-2xl p-3.5 sm:p-4 flex flex-col min-h-[420px] md:h-[calc(100vh-270px)] md:min-h-[500px] transition-all duration-200 ${
                    isDarkMode ? col.darkBg : `${col.bg} ${col.border}`
                  }`}
                >
                  {/* Column Header */}
                  <div className={`flex justify-between items-center border-b pb-3 mb-4 shrink-0 ${
                    isDarkMode ? col.darkDivider : col.divider
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <h3 className={`font-extrabold text-xs uppercase tracking-wider ${isDarkMode ? col.darkText : col.text}`}>
                        {col.label}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                        isDarkMode ? col.darkBadge : col.badge
                      }`}>
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                    {colTasks.map((t) => {
                      const phase = projectDetails.phases.find(ph => ph.id === t.phase_id);
                      const canEdit = canEditTaskItem(t);
                      return (
                        <div
                          key={t.id}
                          draggable={canEdit}
                          onDragStart={(e) => {
                            if (!canEdit) {
                              e.preventDefault();
                              return;
                            }
                            e.dataTransfer.setData('text/plain', String(t.id));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onClick={() => handleOpenTaskDetail(t)}
                          className={`border p-4 rounded-xl transition-all duration-200 flex flex-col justify-between space-y-3 relative group ${
                            canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                          } ${
                            isDarkMode 
                              ? 'bg-[#151724]/95 hover:bg-[#1a1d2e] border-zinc-800/90 hover:border-purple-500/50 shadow-md shadow-black/40 hover:shadow-xl hover:shadow-purple-950/25 hover:-translate-y-0.5' 
                              : 'bg-white hover:bg-white border-slate-200/90 hover:border-violet-300 shadow-xs hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1.5">
                                {getPriorityBadge(t.priority)}
                                {t.due_date && (
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded border font-extrabold uppercase tracking-wider flex items-center space-x-0.5 ${
                                    t.status === 'Completed'
                                      ? (isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                      : isOverdue(t.due_date)
                                        ? (isDarkMode ? 'bg-red-950/60 text-red-400 border-red-800' : 'bg-red-50 text-red-600 border-red-200')
                                        : (isDarkMode ? 'bg-amber-950/60 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200')
                                  }`} title="Task due date">
                                    <Calendar className="h-2.5 w-2.5 mr-0.5" />
                                    <span>{formatDueDate(t.due_date)}</span>
                                  </span>
                                )}
                                {activePhaseId === 'ALL' && phase && (
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                    isDarkMode 
                                      ? 'bg-purple-950/40 text-purple-300 border border-purple-800/50' 
                                      : 'bg-violet-50 text-violet-700 border border-violet-100 shadow-xs'
                                  }`}>
                                    {phase.name.split(' (')[0].split(':')[0]}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[9px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>#{t.id}</span>
                            </div>
                            
                            <h4 className={`font-bold text-xs leading-snug transition ${
                              isDarkMode ? 'text-zinc-100 group-hover:text-purple-300' : 'text-slate-900 group-hover:text-violet-600'
                            }`}>
                              {t.title}
                            </h4>
                            <p className={`text-[11px] line-clamp-2 leading-relaxed ${
                              isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                            }`}>
                              {t.description || 'No description specified.'}
                            </p>
                          </div>

                          {/* Assignee & Action bar */}
                          <div className={`flex justify-between items-center pt-2.5 border-t text-[10.5px] ${
                            isDarkMode ? 'border-zinc-800/80' : 'border-slate-100'
                          }`}>
                            <div className="flex items-center space-x-1.5 text-zinc-400">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                isDarkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-violet-50 border border-violet-200'
                              }`}>
                                <User className={`h-2.5 w-2.5 ${isDarkMode ? 'text-purple-300' : 'text-violet-600'}`} />
                              </div>
                              <span className={`font-semibold truncate max-w-[80px] ${
                                isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                              }`} title={t.assignee_name || 'Unassigned'}>
                                {(t.assignee_name || 'Unassigned').split(' ')[0]}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-zinc-500">
                              {(() => {
                                let chList = [];
                                try {
                                  const parsed = JSON.parse(t.checklist_json || '[]');
                                  chList = Array.isArray(parsed) ? parsed : [];
                                } catch(e) {
                                  chList = [];
                                }
                                if (!chList || chList.length === 0) return null;
                                const doneCount = chList.filter(item => item.done).length;
                                const isAllDone = doneCount === chList.length;
                                return (
                                  <div 
                                    className={`flex items-center space-x-1 border px-1.5 py-0.5 rounded text-[9px] font-extrabold font-mono shrink-0 leading-none ${
                                      isAllDone 
                                        ? (isDarkMode ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-300')
                                        : (isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-100 text-slate-700 border-slate-300 shadow-xs')
                                    }`}
                                    title={`Checklist: ${doneCount} of ${chList.length} completed`}
                                  >
                                    <Check className={`h-2.5 w-2.5 ${isAllDone ? 'text-emerald-400' : isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} />
                                    <span>{doneCount}/{chList.length}</span>
                                  </div>
                                );
                              })()}

                              {t.attachment_count > 0 && (
                                <div className={`flex items-center space-x-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} title={`${t.attachment_count} attached file(s)`}>
                                  <Paperclip className={`h-3 w-3 ${isDarkMode ? 'text-purple-400' : 'text-violet-500'}`} />
                                  <span className="font-bold text-[10px]">{t.attachment_count}</span>
                                </div>
                              )}

                              <div className="flex items-center space-x-1">
                                <MessageSquare className={`h-3.5 w-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`} />
                                <span className={`font-bold text-[10px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>{t.comment_count}</span>
                              </div>

                              {/* Status Navigation arrows or Locked Indicator */}
                              {canEdit ? (
                                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleShiftTask(t, 'left')}
                                    disabled={col.status === 'To Do'}
                                    className={`p-1 rounded border transition ${
                                      col.status === 'To Do' 
                                        ? (isDarkMode ? 'text-zinc-700 border-transparent cursor-not-allowed opacity-30' : 'text-slate-300 border-transparent cursor-not-allowed opacity-30')
                                        : (isDarkMode 
                                            ? 'text-zinc-200 bg-[#1c1e30] border-zinc-750 hover:bg-purple-600 hover:text-white hover:border-purple-500 shadow-sm' 
                                            : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-violet-600 hover:text-white hover:border-violet-600 shadow-xs')
                                    }`}
                                    title="Shift left"
                                  >
                                    <ArrowLeft className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    onClick={() => handleShiftTask(t, 'right')}
                                    disabled={col.status === 'Completed'}
                                    className={`p-1 rounded border transition ${
                                      col.status === 'Completed' 
                                        ? (isDarkMode ? 'text-zinc-700 border-transparent cursor-not-allowed opacity-30' : 'text-slate-300 border-transparent cursor-not-allowed opacity-30')
                                        : (isDarkMode 
                                            ? 'text-zinc-200 bg-[#1c1e30] border-zinc-750 hover:bg-purple-600 hover:text-white hover:border-purple-500 shadow-sm' 
                                            : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-violet-600 hover:text-white hover:border-violet-600 shadow-xs')
                                    }`}
                                    title="Shift right"
                                  >
                                    <ArrowRight className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1 text-zinc-400" title={`Locked: Governed by ${t.governing_department || phase?.governing_department || 'external department'}`} onClick={(e) => e.stopPropagation()}>
                                  <Lock className="h-3 w-3 text-amber-500/80" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && (
                      <div className={`text-center py-16 px-4 text-[11px] rounded-2xl border border-dashed flex flex-col items-center justify-center space-y-1.5 transition ${
                        isDarkMode 
                          ? 'border-zinc-800 text-zinc-500 bg-[#11121d]/40' 
                          : 'border-slate-300/80 text-slate-400 bg-white/60 shadow-xs'
                      }`}>
                        <Clock className="h-5 w-5 opacity-40 mb-1" />
                        <span className="font-semibold">No tasks in {col.label}</span>
                        <span className="text-[10px] text-zinc-400">
                          {stagePermissions.isReadOnly ? 'Stage is view-only' : "Click '+ Add a card' below to create one"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Inline Add Card Form or Read-Only Indicator */}
                  {stagePermissions.isReadOnly ? (
                    <div className={`mt-3 pt-2.5 border-t border-dashed ${isDarkMode ? 'border-zinc-800 text-zinc-500' : 'border-slate-200 text-slate-400'} text-center py-2 text-[10.5px] italic flex items-center justify-center gap-1.5 opacity-80`}>
                      <Lock className="h-3 w-3 text-amber-500/80" />
                      <span>Read-only: Governed by {stagePermissions.governingDept || 'stage department'}</span>
                    </div>
                  ) : inlineAddingStatus === col.status ? (
                    <div className={`space-y-2 mt-3 pt-2.5 border-t ${
                      isDarkMode ? 'border-zinc-800/80' : 'border-slate-200'
                    }`}>
                      <input
                        type="text"
                        placeholder="Enter card title..."
                        value={inlineCardTitle}
                        onChange={(e) => setInlineCardTitle(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            await handleCreateCardInline(col.status);
                          }
                        }}
                        className={`w-full text-xs border rounded-lg px-2.5 py-1.5 focus:outline-none transition ${
                          isDarkMode 
                            ? 'bg-[#141624] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 shadow-xs'
                        }`}
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCreateCardInline(col.status)}
                          className={`font-bold text-[10.5px] px-3.5 py-1.5 rounded-lg transition shadow-md cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white' 
                              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xs'
                          }`}
                        >
                          Add Card
                        </button>
                        <button
                          onClick={() => {
                            setInlineAddingStatus(null);
                            setInlineCardTitle('');
                          }}
                          className={`text-[10.5px] font-bold px-3.5 py-1.5 rounded-lg border transition cursor-pointer ${
                            isDarkMode ? 'bg-[#141624] border-zinc-750 text-zinc-400 hover:bg-[#1c1e30]' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setInlineAddingStatus(col.status);
                        setInlineCardTitle('');
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-left transition flex items-center space-x-1.5 font-bold mt-3 border border-dashed cursor-pointer ${
                        isDarkMode 
                          ? 'text-zinc-400 bg-[#141624]/60 hover:bg-[#1a1d2e] border-zinc-800 hover:border-purple-500/50 hover:text-purple-300' 
                          : 'text-slate-600 bg-white/80 hover:bg-white border-slate-300 hover:border-violet-400 hover:text-violet-700 shadow-xs'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add a card</span>
                    </button>
                  )}

                </div>
              );
            })}
          </section>

          {/* Activity Feed / Audit Trail Component */}
          <section className={`border rounded-2xl p-4 sm:p-5 transition-colors duration-200 mt-6 ${
            isDarkMode 
              ? 'bg-gradient-to-b from-[#111322]/95 to-[#0d0e19]/95 border-zinc-800/80 shadow-2xl shadow-black/40 backdrop-blur-md' 
              : 'bg-white border border-slate-200/90 shadow-sm shadow-slate-200/50'
          }`}>
            {/* Header & Controls */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3.5 border-b ${
              isDarkMode ? 'border-zinc-800/80' : 'border-slate-200/80'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isDarkMode ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' : 'bg-purple-50 border border-purple-200 text-purple-700 shadow-xs'
                }`}>
                  <History className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-extrabold text-xs sm:text-sm tracking-wide ${
                      isDarkMode ? 'text-zinc-100' : 'text-slate-900'
                    }`}>Activity Feed & Audit Trail</h3>
                    <span className={`flex items-center space-x-1 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isDarkMode 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                        isDarkMode ? 'bg-purple-400' : 'bg-purple-600'
                      }`} />
                      <span>Live</span>
                    </span>
                  </div>
                  <p className={`text-[10.5px] mt-0.5 font-medium ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                  }`}>
                    Real-time log of multi-user task actions, state transitions, and workflow shifts.
                  </p>
                </div>
              </div>

              {/* Refresh Control */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => fetchProjectActivities(currentProject?.id)}
                  title="Refresh activity logs"
                  className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition cursor-pointer font-bold ${
                    isDarkMode 
                      ? 'bg-[#141624] border-zinc-750 text-zinc-300 hover:bg-[#1e2136] hover:text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <RefreshCw className={`h-3 w-3 ${isActivitiesLoading ? 'animate-spin text-purple-400' : isDarkMode ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className="text-[11px]">Refresh</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 pb-3 text-xs">
              {[
                { key: 'ALL', label: 'All Activity', count: projectActivities.length },
                { key: 'STATUS_CHANGE', label: 'Status Shifts', count: projectActivities.filter(a => a.action_type === 'STATUS_CHANGE').length },
                { key: 'STAGE_SHIFT', label: 'Stage Moves', count: projectActivities.filter(a => a.action_type === 'STAGE_SHIFT').length },
                { key: 'CREATE_TASK', label: 'Creations', count: projectActivities.filter(a => a.action_type === 'CREATE_TASK').length },
                { key: 'UPDATE_TASK', label: 'Task Edits', count: projectActivities.filter(a => a.action_type === 'UPDATE_TASK').length },
              ].map(f => {
                const isSelected = activityFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActivityFilter(f.key)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      isSelected
                        ? (isDarkMode 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/20' 
                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs')
                        : isDarkMode
                          ? 'bg-[#121424]/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1c30]'
                          : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[9.5px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Timeline Stream */}
            <div className="mt-1 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {(() => {
                const filteredActivities = projectActivities.filter(a => {
                  if (activityFilter === 'ALL') return true;
                  return a.action_type === activityFilter;
                });

                if (filteredActivities.length === 0) {
                  return (
                    <div className="py-10 text-center space-y-1.5">
                      <Clock className="h-6 w-6 text-purple-400 mx-auto opacity-50 mb-2" />
                      <p className="text-xs text-zinc-500 font-medium">No activity records logged in this filter.</p>
                      <p className="text-[11px] text-zinc-400">Actions performed on tasks (create, status shift, details edit) will appear here in real time.</p>
                    </div>
                  );
                }

                return filteredActivities.map(a => {
                  const initials = (a.user_name || 'User')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  // Find task if still exists
                  const matchedTask = a.task_id && projectDetails?.tasks ? projectDetails.tasks.find(t => t.id === a.task_id) : null;

                  return (
                    <div 
                      key={a.id}
                      className={`p-3 sm:p-3.5 rounded-xl border transition flex items-start space-x-3 group ${
                        isDarkMode 
                          ? 'bg-[#141624]/85 border-zinc-800/80 hover:border-purple-500/40 hover:bg-[#1a1d2e] shadow-md shadow-black/20' 
                          : 'bg-slate-50/60 hover:bg-white border border-slate-200/80 hover:border-violet-300 hover:shadow-xs shadow-xs'
                      }`}
                    >
                      {/* User Avatar with initials */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 shadow-xs ${
                        isDarkMode 
                          ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300' 
                          : 'bg-purple-50 border border-purple-200 text-purple-700'
                      }`}>
                        {initials}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-2">
                            <span className={`font-extrabold text-xs ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                              {a.user_name}
                            </span>
                            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                              isDarkMode 
                                ? 'bg-zinc-900 border-zinc-800 text-purple-300' 
                                : 'bg-purple-50 border border-purple-200 text-purple-700 font-bold'
                            }`}>
                              {a.user_role}
                            </span>
                          </div>

                          <span 
                            className={`text-[10px] font-mono shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400 font-semibold'}`}
                            title={a.created_at ? new Date(a.created_at.endsWith('Z') ? a.created_at : a.created_at + 'Z').toLocaleString() : ''}
                          >
                            {formatTimeAgo(a.created_at)}
                          </span>
                        </div>

                        {/* Action Description */}
                        <p className={`text-xs mt-1 leading-relaxed ${
                          isDarkMode ? 'text-zinc-200' : 'text-slate-700 font-medium'
                        }`}>
                          {a.details}
                        </p>

                        {/* State Transition Badge (if present) */}
                        {a.previous_state && a.new_state && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10.5px]">
                            <span className={`px-2 py-0.5 rounded border font-medium ${
                              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}>
                              {a.previous_state}
                            </span>
                            <ArrowRight className={`h-3 w-3 shrink-0 ${isDarkMode ? 'text-purple-400' : 'text-violet-600'}`} />
                            <span className={`px-2 py-0.5 rounded border font-bold ${
                              a.new_state === 'Completed'
                                ? (isDarkMode ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-300 text-emerald-800')
                                : a.new_state === 'In Progress'
                                  ? (isDarkMode ? 'bg-blue-950/60 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-800')
                                  : (isDarkMode ? 'bg-purple-950/60 border-purple-800 text-purple-300' : 'bg-purple-50 border-purple-300 text-purple-800')
                            }`}>
                              {a.new_state}
                            </span>

                            {matchedTask && (
                              <button
                                type="button"
                                onClick={() => handleOpenTaskDetail(matchedTask)}
                                className={`ml-auto text-[10px] font-bold hover:underline cursor-pointer ${
                                  isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-700 hover:text-purple-900'
                                }`}
                              >
                                View Task #{matchedTask.id} →
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>
            </>
          )}


        </main>
      ) : projects.length === 0 ? (
        <div className={`max-w-md mx-auto my-20 p-8 rounded-xl border text-center space-y-4 transition ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <Layers className="h-10 w-10 text-violet-600 mx-auto" />
          <h3 className="text-sm font-bold">No Projects Registered</h3>
          <p className="text-xs text-zinc-500">Initialize your corporate pipeline by creating a new SDLC project.</p>
          <button
            onClick={() => setShowNewProjModal(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-zinc-500">
          <RefreshCw className="h-6 w-6 text-violet-500 animate-spin mb-3" />
          <span className="text-xs font-semibold">Securing transaction layers...</span>
        </div>
      )}

      {/* USER PROFILE & IDENTITY SETTINGS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-6 transition-all animate-in fade-in duration-200 my-auto ${
            isDarkMode ? 'bg-[#121422] border-zinc-800 text-zinc-100 shadow-black/70' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-purple-950/40 border-purple-800/50 text-purple-400' : 'bg-violet-100 border-violet-200 text-violet-700'
                }`}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">Account & Profile Settings</h3>
                  <p className={`text-[11px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Manage personal information, corporate profile picture, and credentials
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                  isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                }`}
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Profile Photo Section */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 ${
                isDarkMode ? 'bg-[#17192b] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="relative group shrink-0">
                  {profileAvatarPreview ? (
                    <img 
                      src={profileAvatarPreview} 
                      alt="Avatar Preview" 
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-2 border-violet-500 shadow-md ring-2 ring-violet-500/20"
                    />
                  ) : profileAvatarUrl ? (
                    <img 
                      src={`http://127.0.0.1:5000${profileAvatarUrl}`} 
                      alt="Avatar" 
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover border-2 border-violet-500 shadow-md ring-2 ring-violet-500/20"
                    />
                  ) : (
                    <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center font-black text-2xl border-2 shadow-inner ${
                      isDarkMode ? 'bg-gradient-to-br from-purple-900 to-indigo-950 text-purple-200 border-purple-700/50' : 'bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 border-violet-300'
                    }`}>
                      {profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">Profile Photo</h4>
                    <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                      Square image recommended. Supports PNG, JPG, or WEBP up to 5MB.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <label className={`cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                      isDarkMode 
                        ? 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-700/50 text-purple-300' 
                        : 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-700'
                    }`}>
                      <Camera className="h-3.5 w-3.5" />
                      <span>{profileAvatarFile || profileAvatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg, image/webp" 
                        onChange={handleAvatarFileChange} 
                        className="hidden" 
                      />
                    </label>

                    {(profileAvatarFile || profileAvatarUrl) && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isSavingProfile}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                          isDarkMode 
                            ? 'border-rose-800/40 text-rose-400 hover:bg-rose-950/30' 
                            : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-violet-500">
                  <User className="h-3.5 w-3.5" />
                  Personal Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                      isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                    }`}>
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input 
                        type="text"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        placeholder="Your full corporate name"
                        required
                        className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 transition ${
                          isDarkMode 
                            ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:ring-purple-500/30 focus:border-purple-500' 
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-violet-500/20 focus:border-violet-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                      isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                    }`}>
                      Job Title / Designation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <input 
                        type="text"
                        value={profileBio}
                        onChange={e => setProfileBio(e.target.value)}
                        placeholder="e.g. Lead Core Banking Engineer"
                        className={`w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border focus:outline-hidden focus:ring-2 transition ${
                          isDarkMode 
                            ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:ring-purple-500/30 focus:border-purple-500' 
                            : 'bg-white border-slate-200 text-slate-900 focus:ring-violet-500/20 focus:border-violet-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${
                      isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                    }`}>
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
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

      {/* SUPER ADMIN USER MANAGEMENT CONSOLE */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className={`border rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 transition-all animate-in fade-in duration-200 my-auto ${
            isDarkMode ? 'bg-[#121422] border-zinc-800 text-zinc-100 shadow-black/70' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}>
            
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-purple-950/40 border-purple-800/50 text-purple-400' : 'bg-violet-100 border-violet-200 text-violet-700'
                }`}>
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-extrabold tracking-tight">Enterprise User Management</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      Super Admin
                    </span>
                  </div>
                  <p className={`text-[11px] sm:text-xs mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                    Super Admin console to view, register, edit departments/roles, approve, and manage all employee entries
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserForm(!showCreateUserForm)}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    showCreateUserForm
                      ? (isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-300 text-slate-700')
                      : (isDarkMode ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-500 shadow-purple-950/50' : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-600 shadow-violet-500/20')
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>{showCreateUserForm ? 'Close Form' : 'New User Entry'}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setEditingUserId(null);
                    setShowCreateUserForm(false);
                  }}
                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                    isDarkMode ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                  }`}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Metrics Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className={`p-3 rounded-xl border text-xs ${
                isDarkMode ? 'bg-[#151728] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Users</span>
                <span className="text-lg font-black mt-0.5 block">{allUsers.length}</span>
              </div>
              <div className={`p-3 rounded-xl border text-xs ${
                isDarkMode ? 'bg-[#151728] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Approved / Active</span>
                <span className="text-lg font-black text-emerald-500 mt-0.5 block">
                  {allUsers.filter(u => u.status === 'APPROVED').length}
                </span>
              </div>
              <div className={`p-3 rounded-xl border text-xs ${
                isDarkMode ? 'bg-[#151728] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Pending Requests</span>
                <span className={`text-lg font-black mt-0.5 block flex items-center gap-1.5 ${
                  allUsers.filter(u => u.status === 'PENDING').length > 0 ? 'text-amber-400' : 'text-zinc-500'
                }`}>
                  {allUsers.filter(u => u.status === 'PENDING').length}
                  {allUsers.filter(u => u.status === 'PENDING').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </span>
              </div>
              <div className={`p-3 rounded-xl border text-xs ${
                isDarkMode ? 'bg-[#151728] border-zinc-800/80' : 'bg-slate-50 border-slate-200/80'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Departments</span>
                <span className="text-lg font-black text-violet-400 mt-0.5 block">
                  {[...new Set(allUsers.map(u => u.department).filter(Boolean))].length || 6}
                </span>
              </div>
            </div>

            {/* Collapsible New User Creation Form */}
            {showCreateUserForm && (
              <form onSubmit={handleCreateAdminUser} className={`p-4 sm:p-5 rounded-xl border space-y-4 animate-in fade-in duration-200 ${
                isDarkMode ? 'bg-[#16182c] border-purple-500/30 shadow-lg shadow-purple-950/20' : 'bg-violet-50/50 border-violet-200 shadow-md'
              }`}>
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-violet-500">
                    <UserPlus className="h-4 w-4" />
                    <span>Create New Employee Entry</span>
                  </h4>
                  <span className="text-[10px] text-zinc-400">Pre-approved by Super Admin</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Full Name *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Asad Raza"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      required
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                        isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Corporate Email *</label>
                    <input 
                      type="email"
                      placeholder="name.id@bankalhabib.com"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      required
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                        isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Password</label>
                    <input 
                      type="password"
                      placeholder="Default: Bank123!"
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 ${
                        isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Governing Department</label>
                    <select
                      value={newUserDepartment}
                      onChange={e => setNewUserDepartment(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 cursor-pointer ${
                        isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      {['Software Engineering', 'Business Analysis', 'Architecture & Design', 'QA', 'Compliance', 'Operations & Release', 'Executive Management'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Role Authority</label>
                    <select
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 cursor-pointer ${
                        isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="TEAM_MEMBER">TEAM MEMBER</option>
                      <option value="DEPT_HEAD">DEPT HEAD</option>
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider mb-1 text-zinc-400">Initial Status</label>
                    <select
                      value={newUserStatus}
                      onChange={e => setNewUserStatus(e.target.value)}
                      className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-hidden focus:ring-2 cursor-pointer ${
                        isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="APPROVED">APPROVED (Active)</option>
                      <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateUserForm(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      isDarkMode ? 'border-zinc-750 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isCreatingUser ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Save User Entry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Search, Department & Role Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search user name, email, dept..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className={`w-full border rounded-xl pl-3 pr-3 py-2 focus:outline-hidden focus:ring-2 transition text-xs ${
                    isDarkMode 
                      ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:ring-purple-500/30' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:ring-violet-500/20'
                  }`}
                />
              </div>

              <select
                value={userFilterDept}
                onChange={(e) => setUserFilterDept(e.target.value)}
                className={`border rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 transition cursor-pointer text-xs ${
                  isDarkMode ? 'bg-[#151728] border-zinc-750 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">All Departments</option>
                {['Software Engineering', 'Business Analysis', 'Architecture & Design', 'QA', 'Compliance', 'Operations & Release', 'Executive Management'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className={`border rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 transition cursor-pointer text-xs ${
                  isDarkMode ? 'bg-[#151728] border-zinc-750 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="ALL">All Authority Roles</option>
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                <option value="DEPT_HEAD">DEPT HEAD</option>
                <option value="TEAM_MEMBER">TEAM MEMBER</option>
                {['Developer', 'Project Manager', 'Compliance Officer', 'InfoSec Lead', 'QA Lead', 'CAB Committee', 'Admin'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Status Category Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 pb-2 border-b text-xs">
              {[
                { 
                  key: 'ALL', 
                  label: 'All Users', 
                  count: allUsers.length, 
                  activeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' 
                },
                { 
                  key: 'APPROVED', 
                  label: 'Approved / Active', 
                  count: allUsers.filter(u => u.status === 'APPROVED').length, 
                  activeClass: 'bg-emerald-600 text-white shadow-sm' 
                },
                { 
                  key: 'PENDING', 
                  label: 'Pending Approvals', 
                  count: allUsers.filter(u => u.status === 'PENDING').length, 
                  activeClass: 'bg-amber-600 text-white shadow-sm' 
                },
                { 
                  key: 'REJECTED', 
                  label: 'Rejected', 
                  count: allUsers.filter(u => u.status === 'REJECTED').length, 
                  activeClass: 'bg-rose-600 text-white shadow-sm' 
                },
              ].map(tab => {
                const isSelected = userFilterStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setUserFilterStatus(tab.key)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                      isSelected
                        ? tab.activeClass
                        : isDarkMode
                          ? 'bg-[#151728] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                      isSelected
                        ? 'bg-black/25 text-white'
                        : tab.key === 'PENDING' && tab.count > 0
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Users Directory List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {(() => {
                const filteredUsers = allUsers.filter(u => {
                  const searchText = `${u.name} ${u.email} ${u.department || ''}`.toLowerCase();
                  const queryWords = userSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
                  const matchesSearch = queryWords.length === 0 || queryWords.every(word => searchText.includes(word));
                  
                  const matchesStatus = userFilterStatus === 'ALL'
                    ? true
                    : u.status === userFilterStatus;
                  const matchesRole = userFilterRole === 'ALL' || u.role === userFilterRole;
                  const matchesDept = userFilterDept === 'ALL' || (u.department && u.department.toLowerCase() === userFilterDept.toLowerCase());
                  return matchesSearch && matchesStatus && matchesRole && matchesDept;
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div className="text-center py-10 space-y-1.5">
                      <p className="text-xs text-zinc-400 font-semibold">
                        No users match the search/filter criteria.
                      </p>
                    </div>
                  );
                }

                return filteredUsers.map(u => {
                  const isEditing = editingUserId === u.id;
                  
                  return (
                    <div key={u.id} className={`border p-3.5 sm:p-4 rounded-xl text-xs transition ${
                      isDarkMode ? 'bg-[#151728] border-zinc-800/80 hover:border-zinc-700' : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                    }`}>
                      {isEditing ? (
                        /* EDIT MODE USER VIEW */
                        <div className="space-y-3.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Full Name</label>
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                className={`w-full border rounded-lg px-2.5 py-1.5 focus:outline-hidden transition ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Department</label>
                              <select
                                value={editUserDepartment}
                                onChange={(e) => setEditUserDepartment(e.target.value)}
                                className={`w-full border rounded-lg px-2 py-1.5 focus:outline-hidden transition cursor-pointer ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              >
                                {['Software Engineering', 'Business Analysis', 'Architecture & Design', 'QA', 'Compliance', 'Operations & Release', 'Executive Management'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Authority Role</label>
                              <select
                                value={editUserRole}
                                onChange={(e) => setEditUserRole(e.target.value)}
                                className={`w-full border rounded-lg px-2 py-1.5 focus:outline-hidden transition cursor-pointer ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              >
                                <option value="TEAM_MEMBER">TEAM MEMBER</option>
                                <option value="DEPT_HEAD">DEPT HEAD</option>
                                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                {['Developer', 'Project Manager', 'Compliance Officer', 'InfoSec Lead', 'QA Lead', 'CAB Committee', 'Admin'].map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400">Account Status</label>
                              <select
                                value={editUserStatus}
                                onChange={(e) => setEditUserStatus(e.target.value)}
                                disabled={u.email === 'admin@bankalhabib.com'}
                                className={`w-full border rounded-lg px-2 py-1.5 focus:outline-hidden transition cursor-pointer disabled:opacity-55 ${
                                  isDarkMode ? 'bg-[#0f101d] border-zinc-700 text-zinc-100' : 'bg-white border-slate-300 text-slate-900'
                                }`}
                              >
                                <option value="APPROVED">APPROVED</option>
                                <option value="PENDING">PENDING</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2 pt-2 border-t">
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className={`border font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                isDarkMode ? 'border-zinc-750 text-zinc-300 hover:bg-zinc-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveUserEdit(u.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg transition shadow-sm cursor-pointer"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* READ-ONLY / DEFAULT USER ROW VIEW */
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Avatar */}
                            {u.avatar_url ? (
                              <img 
                                src={`http://127.0.0.1:5000${u.avatar_url}`} 
                                alt={u.name} 
                                className="w-9 h-9 rounded-full object-cover border border-purple-500/30 shrink-0" 
                              />
                            ) : (
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                isDarkMode ? 'bg-purple-950/60 text-purple-200 border border-purple-800/40' : 'bg-violet-100 text-violet-700 border border-violet-200'
                              }`}>
                                {u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className="font-bold text-xs truncate">{u.name}</h4>
                                <span className={`text-[8px] sm:text-[8.5px] border px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                                  u.status === 'APPROVED' 
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' 
                                    : u.status === 'REJECTED'
                                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/25'
                                      : 'bg-amber-500/10 text-amber-500 border-amber-500/25 animate-pulse'
                                }`}>
                                  {u.status}
                                </span>
                              </div>

                              <p className="text-zinc-400 font-mono text-[10.5px] truncate">{u.email}</p>

                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded border ${
                                  isDarkMode ? 'bg-[#0f101d] text-zinc-300 border-zinc-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  <Building2 className="h-3 w-3 text-violet-400" />
                                  <span>{u.department || 'Software Engineering'}</span>
                                </span>

                                <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                  u.role === 'SUPER_ADMIN' || u.role === 'Admin'
                                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                                    : u.role === 'DEPT_HEAD'
                                      ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                      : isDarkMode ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {u.role === 'SUPER_ADMIN' || u.role === 'Admin' ? 'SUPER ADMIN' : (u.role || '').replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUserId(u.id);
                                setEditUserName(u.name);
                                setEditUserDepartment(u.department || 'Software Engineering');
                                setEditUserRole(u.role);
                                setEditUserStatus(u.status);
                              }}
                              className={`font-semibold px-2.5 py-1.5 rounded-lg border transition text-xs flex items-center gap-1 cursor-pointer ${
                                isDarkMode 
                                  ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200' 
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs'
                              }`}
                              title="Edit user details"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                            
                            {u.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleUserStatusUpdate(u.id, 'APPROVED')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition shadow-xs cursor-pointer flex items-center gap-1"
                                title="Approve user registration"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve</span>
                              </button>
                            )}
                            
                            {u.status !== 'REJECTED' && u.email !== 'admin@bankalhabib.com' && (
                              <button
                                type="button"
                                onClick={() => handleUserStatusUpdate(u.id, 'REJECTED')}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1 ${
                                  isDarkMode ? 'border-amber-800/40 text-amber-400 hover:bg-amber-950/30' : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                }`}
                                title="Reject user"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject</span>
                              </button>
                            )}

                            {u.email !== 'admin@bankalhabib.com' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                  isDarkMode 
                                    ? 'border-rose-800/40 text-rose-400 hover:bg-rose-950/30' 
                                    : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                }`}
                                title="Delete user entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t text-xs">
              <span className={`text-[11px] ${isDarkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                Bank AL Habib Enterprise SDLC Security Governance
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setEditingUserId(null);
                  setShowCreateUserForm(false);
                }}
                className={`text-xs px-4 py-2 rounded-xl border font-bold transition cursor-pointer ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-750 hover:bg-zinc-700 text-zinc-300' 
                    : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                Close Console
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PORTAL: CORPORATE PROJECT SWITCHER & DIRECTORY */}
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
                  onClick={() => {
                    setViewMode('portfolio');
                    setShowProjDirectoryModal(false);
                  }}
                  className="bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg uppercase tracking-wider transition shadow-sm shadow-violet-500/10"
                  title="View all projects in a unified dashboard"
                >
                  View All
                </button>
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
                  
                  // Split query by whitespace to extract keywords
                  const queryWords = projSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
                  if (queryWords.length === 0) return true;
                  
                  // Verify that all typed keywords match the project details
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
                })
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

      {/* CREATE NEW TASK MODAL */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className={`border rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 transition ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Initialize User Story / Task Entry</h3>
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

      {/* ADD CUSTOM PROJECT PHASE MODAL */}
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

      {/* CREATE NEW PROJECT MODAL */}
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

      {/* TASK DETAIL DRAWER & DISCUSSIONS ENGINE */}
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
                      Assignee: {selectedTask.assignee_name}
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
                      {selectedTask.status || 'To Do'}
                    </div>
                  ) : (
                    <select
                      value={selectedTask.status || 'To Do'}
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
                      <option value="To Do" className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>To Do</option>
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
                          onChange={handleUploadTaskFile}
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
                          {(authUser?.role === 'Admin' || authUser?.id === c.author_id) && (
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
              isDarkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-50 border-zinc-150'
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

      {/* Trello-Style Floating Bottom Navigation Hub */}
      {authUser && (
        <div className={`fixed bottom-3.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 backdrop-blur-xl border rounded-full px-3 sm:px-5 py-1.5 sm:py-2 flex items-center space-x-2 sm:space-x-3.5 transition duration-300 ${
          isDarkMode 
            ? 'bg-[#121320]/95 border-zinc-750/90 shadow-2xl shadow-black/80 ring-1 ring-purple-500/20' 
            : 'bg-white/95 border-slate-200/90 shadow-xl shadow-slate-300/40 ring-1 ring-violet-500/10'
        }`}>
          <button
            onClick={() => {
              setViewMode('board');
              setActivePhaseId('ALL');
            }}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              viewMode === 'board' 
                ? (isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/20' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20')
                : isDarkMode
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            <span>Board</span>
          </button>

          <button
            onClick={() => {
              if (projectDetails) {
                setViewMode('planner');
              } else if (projects.length > 0) {
                setCurrentProject(projects[0]);
                setViewMode('planner');
              } else {
                showError("Please initialize a project first.");
              }
            }}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              viewMode === 'planner' 
                ? (isDarkMode 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/40 border border-purple-400/20' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20')
                : isDarkMode
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Planner</span>
          </button>
        </div>
      )}

    </div>
  );
}
