import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Search,
  Check,
  X,
  Trash2,
  Pencil,
  AlertCircle,
  Building2,
  Mail,
  User,
  Save,
  Lock,
  Shield
} from 'lucide-react';

export default function TeamApprovalsView({
  allUsers = [],
  pendingUsers = [],
  userSearchQuery = '',
  setUserSearchQuery,
  userFilterStatus = 'ALL',
  setUserFilterStatus,
  userFilterRole = 'ALL',
  setUserFilterRole,
  userFilterDept = 'ALL',
  setUserFilterDept,
  onUserStatusUpdate,
  onSaveUserEdit,
  onDeleteUser,
  onCreateAdminUser,
  authUser,
  isDarkMode,
  formatTimeAgo
}) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDepartment, setNewUserDepartment] = useState('Software Engineering');
  const [newUserRole, setNewUserRole] = useState('TEAM_MEMBER');
  const [newUserStatus, setNewUserStatus] = useState('APPROVED');
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('Software Engineering');
  const [editRole, setEditRole] = useState('TEAM_MEMBER');
  const [editStatus, setEditStatus] = useState('APPROVED');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const departmentsList = [
    'IT Administration',
    'Software Engineering',
    'Business Analysis',
    'Architecture & Design',
    'QA',
    'Compliance',
    'Operations & Release',
    'Executive Management',
    'Project Management'
  ];

  const rolesList = ['SUPER_ADMIN', 'DEPT_HEAD', 'TEAM_MEMBER'];
  const statusesList = [
    { value: 'APPROVED', label: 'APPROVED' },
    { value: 'PENDING_APPROVAL', label: 'PENDING APPROVAL' },
    { value: 'SUSPENDED', label: 'SUSPENDED' }
  ];

  const filteredUsers = allUsers.filter(u => {
    if (userFilterStatus !== 'ALL' && u.status !== userFilterStatus) return false;
    if (userFilterRole !== 'ALL' && u.role !== userFilterRole) return false;
    if (userFilterDept !== 'ALL' && u.department !== userFilterDept) return false;
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingList = allUsers.filter(u => u.status === 'PENDING');

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditDepartment(user.department || 'Software Engineering');
    setEditRole(user.role || 'TEAM_MEMBER');
    const normStatus = user.status === 'PENDING' ? 'PENDING_APPROVAL' : (user.status === 'REJECTED' ? 'SUSPENDED' : (user.status || 'APPROVED'));
    setEditStatus(normStatus);
    setShowEditModal(true);
  };

  const handleSaveEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim()) return;
    setIsSavingEdit(true);
    try {
      await onSaveUserEdit(editingUser.id, {
        name: editName.trim(),
        department: editDepartment,
        role: editRole,
        status: editStatus
      });
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setIsSubmittingNewUser(true);
    try {
      await onCreateAdminUser(e, {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword || 'Bank123!',
        department: newUserDepartment,
        role: newUserRole,
        status: newUserStatus
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div
        className={`p-5 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-md'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-xl border ${
              isDarkMode ? 'bg-indigo-950/40 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
            }`}
          >
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`text-base sm:text-lg font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              Corporate Team & Access Governance
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              User identity provisioning, role permissions, and corporate email verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddUserModal(true)}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition shadow-md cursor-pointer ${
            isDarkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-violet-600 hover:bg-violet-700 shadow-xs'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Corporate User</span>
        </button>
      </div>

      {/* Pending Authorizations Queue */}
      {pendingList.length > 0 && (
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isDarkMode
              ? 'bg-amber-950/20 border-amber-800/60 shadow-md'
              : 'bg-amber-50/80 border-amber-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-xs font-black tracking-wider uppercase text-amber-400">
                Pending Authorizations ({pendingList.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingList.map(u => (
              <div
                key={u.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 ${
                  isDarkMode ? 'bg-[#141624] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <h4 className="font-bold text-xs">{u.name}</h4>
                  <p className="text-[11px] font-mono text-zinc-400">{u.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 font-bold uppercase">{u.department}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">{u.role}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-inherit">
                  <button
                    type="button"
                    onClick={() => onUserStatusUpdate(u.id, 'APPROVED')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUserStatusUpdate(u.id, 'REJECTED')}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Directory Table */}
      {/* Directory Section: Dual Mobile Cards / Desktop Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDarkMode ? 'bg-[#111322] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="p-3.5 sm:p-4 border-b border-inherit flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search user name or corporate email..."
              className={`w-full text-xs pl-9 pr-3 py-2 rounded-xl border outline-none ${
                isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={userFilterDept}
              onChange={(e) => setUserFilterDept(e.target.value)}
              className={`w-full sm:w-auto text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none cursor-pointer ${
                isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="ALL">All Departments</option>
              {departmentsList.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile View: User Cards Stream */}
        <div className="block md:hidden divide-y divide-inherit">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">No users found matching query</div>
          ) : (
            filteredUsers.map(u => (
              <div key={u.id} className="p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs leading-tight truncate">{u.name}</h4>
                    <p className="text-[11px] font-mono text-zinc-400 truncate">{u.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold shrink-0 ${
                      u.status === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-inherit text-[10.5px]">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {u.role}
                    </span>
                    <span className="text-[9.5px] text-zinc-400">{u.department}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(u)}
                      className="p-1.5 rounded-lg border border-zinc-800 hover:border-purple-500/40 text-zinc-400 hover:text-purple-400 transition cursor-pointer"
                      title={`Edit user ${u.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteUser(u.id, u.name)}
                      className="p-1.5 rounded-lg border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                      title={`Delete user ${u.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Enterprise Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead className={`border-b ${isDarkMode ? 'bg-[#141626] border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="p-3.5 font-bold uppercase text-[10px]">Employee</th>
                <th className="p-3.5 font-bold uppercase text-[10px]">Department</th>
                <th className="p-3.5 font-bold uppercase text-[10px]">Role</th>
                <th className="p-3.5 font-bold uppercase text-[10px]">Status</th>
                <th className="p-3.5 font-bold uppercase text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filteredUsers.map(u => (
                <tr key={u.id} className={`hover:bg-zinc-800/30 ${isDarkMode ? 'text-zinc-200' : 'text-slate-800 hover:bg-slate-50'}`}>
                  <td className="p-3.5">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-[10.5px] font-mono text-zinc-400">{u.email}</div>
                  </td>
                  <td className="p-3.5 font-medium">{u.department}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-purple-500/40 text-zinc-400 hover:text-purple-400 hover:bg-purple-950/20 transition cursor-pointer"
                        title={`Edit user ${u.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition cursor-pointer"
                        title={`Delete user ${u.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT CORPORATE USER MODAL                                                 */}
      {/* ========================================================================= */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 transition ${
              isDarkMode
                ? 'bg-[#111322] border-zinc-800 text-zinc-100 shadow-black'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-inherit pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">
                    Edit Corporate User
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Update corporate identity, department, and role permissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-zinc-500 hover:text-zinc-300 transition p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditSubmit} className="space-y-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                  <User className="h-3 w-3 text-purple-400" />
                  <span>Full Employee Name</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Batool Zehra"
                  required
                  className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                />
              </div>

              {/* Corporate Email (Disabled/Read-only display) */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                  <Mail className="h-3 w-3 text-purple-400" />
                  <span>Corporate Email Address</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={editingUser.email}
                    disabled
                    className={`w-full border rounded-xl px-3 py-2.5 opacity-70 cursor-not-allowed font-mono text-[11px] ${
                      isDarkMode
                        ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                </div>
                <p className="text-[9px] text-zinc-500">Corporate domain restriction enforced: @bankalhabib.com</p>
              </div>

              {/* Department Dropdown */}
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                  <Building2 className="h-3 w-3 text-purple-400" />
                  <span>Governing Department</span>
                </label>
                <select
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                >
                  {departmentsList.map(d => (
                    <option key={d} value={d} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Role Dropdown */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                    <ShieldCheck className="h-3 w-3 text-purple-400" />
                    <span>Role Hierarchy</span>
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                      isDarkMode
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                    }`}
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                    <UserCheck className="h-3 w-3 text-purple-400" />
                    <span>Account Status</span>
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                      isDarkMode
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                    }`}
                  >
                    {statusesList.map(s => (
                      <option key={s.value} value={s.value} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-950/40 cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD CORPORATE USER MODAL                                                  */}
      {/* ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div
            className={`border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 transition ${
              isDarkMode
                ? 'bg-[#111322] border-zinc-800 text-zinc-100 shadow-black'
                : 'bg-white border-slate-200 text-slate-900 shadow-xl'
            }`}
          >
            <div className="flex justify-between items-center border-b border-inherit pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-200">
                    Provision Corporate User
                  </h3>
                  <p className="text-[10px] text-zinc-500">Create active user account with pre-configured access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="text-zinc-500 hover:text-zinc-300 transition p-1 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                  <User className="h-3 w-3 text-purple-400" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Asad Ullah"
                  required
                  className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                  <Mail className="h-3 w-3 text-purple-400" />
                  <span>Corporate Email Address</span>
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. asad.88412@bankalhabib.com"
                  required
                  className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                  <Lock className="h-3 w-3 text-purple-400" />
                  <span>Default Password</span>
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Default: Bank123!"
                  className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                    <Building2 className="h-3 w-3 text-purple-400" />
                    <span>Department</span>
                  </label>
                  <select
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                      isDarkMode
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                    }`}
                  >
                    {departmentsList.map(d => (
                      <option key={d} value={d} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold uppercase tracking-wider text-[9.5px] text-zinc-400 flex items-center space-x-1.5">
                    <ShieldCheck className="h-3 w-3 text-purple-400" />
                    <span>Role Hierarchy</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2.5 transition focus:outline-none focus:ring-2 cursor-pointer ${
                      isDarkMode
                        ? 'bg-zinc-900 border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20'
                    }`}
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r} className={isDarkMode ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-inherit">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewUser}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-lg shadow-purple-950/40 cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{isSubmittingNewUser ? 'Provisioning...' : 'Provision User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

