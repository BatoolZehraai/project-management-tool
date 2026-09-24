import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  User,
  Building2,
  RefreshCw,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Sun,
  Moon,
  Video,
  Link2
} from 'lucide-react';
import bahlLogo from '../assets/bahl-logo.png';

export default function Auth({
  isLoginTab,
  setIsLoginTab,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authConfirmPassword,
  setAuthConfirmPassword,
  authName,
  setAuthName,
  authDepartment,
  setAuthDepartment,
  authRole,
  setAuthRole,
  isSubmittingAuth,
  errorMsg,
  setErrorMsg,
  successMsg,
  handleLogin,
  handleSignup,
  handleQuickFill,
  isDarkMode,
  toggleTheme
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const departmentsList = [
    'Business Analysis',
    'Architecture & Design',
    'Software Engineering',
    'QA',
    'Compliance',
    'Operations & Release',
    'Executive Management',
    'IT Administration'
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-300 ${
      isDarkMode
        ? 'bg-[#090a14] text-slate-100 selection:bg-purple-600 selection:text-white'
        : 'bg-[#f4f7fb] text-slate-900 selection:bg-violet-600 selection:text-white'
    }`}>
      {/* Background Decorative Ambient Radial Glows */}
      <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -translate-y-1/2 ${
        isDarkMode ? 'bg-purple-600/15' : 'bg-purple-400/10'
      }`} />
      <div className={`absolute bottom-0 right-1/4 w-[30rem] h-[30rem] rounded-full blur-3xl pointer-events-none translate-y-1/3 ${
        isDarkMode ? 'bg-indigo-600/10' : 'bg-indigo-300/15'
      }`} />
      <div className={`absolute top-1/2 right-12 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
        isDarkMode ? 'bg-purple-900/10' : 'bg-violet-300/10'
      }`} />

      {/* Top Navbar */}
      <header className="w-full px-6 sm:px-10 py-4 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <div className={`p-1 rounded-2xl border shadow-md flex items-center justify-center transition ${
            isDarkMode ? 'border-emerald-500/30 bg-white/95' : 'border-slate-200 bg-white'
          }`}>
            <img src={bahlLogo} alt="Bank AL Habib Logo" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <div>
            <span className={`font-extrabold text-xs sm:text-sm tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Bank AL Habib Limited
            </span>
            <p className={`text-[10px] font-semibold tracking-wider uppercase ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              SDLC Governance Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition cursor-pointer shadow-sm ${
              isDarkMode
                ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-amber-400'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-violet-600" />}
          </button>
        </div>
      </header>

      {/* Main Centered Floating Master Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className={`rounded-3xl border shadow-2xl max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden transition-colors duration-300 ${
          isDarkMode
            ? 'border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-purple-950/20'
            : 'border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-slate-300/40'
        }`}>
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Clean Authentication Form (5 cols on large screens)          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Form Header */}
              <div className="space-y-1.5">
                <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wider uppercase font-mono ${
                  isDarkMode
                    ? 'border-purple-500/30 bg-purple-950/40 text-purple-300'
                    : 'border-purple-200 bg-purple-50 text-purple-700'
                }`}>
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>Enterprise SDLC v2.5</span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {isLoginTab ? 'Sign In to Governance' : 'Request Access'}
                </h2>
                <p className={`text-xs leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {isLoginTab
                    ? 'Enter your verified corporate credentials to access active project workspaces.'
                    : 'Submit your employee registration for administrator security review.'}
                </p>
              </div>

              {/* Clean Segmented Tab Pill (2-Way: Sign In | Request Access) */}
              <div className={`p-1 rounded-2xl border flex gap-1 transition ${
                isDarkMode ? 'bg-slate-950/90 border-slate-800/80' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                    isLoginTab
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(false);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 cursor-pointer ${
                    !isLoginTab
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Request</span>
                </button>
              </div>

              {/* Alert Messages */}
              {errorMsg && (
                <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 flex items-start space-x-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-200 flex items-start space-x-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}

              {/* Form Content */}
              {isLoginTab ? (
                /* SIGN IN FORM */
                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  {/* Corporate Email */}
                  <div className="space-y-1.5">
                    <label className={`font-bold uppercase tracking-wider text-[9.5px] flex items-center space-x-1.5 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <Mail className="h-3.5 w-3.5 text-purple-400" />
                      <span>Corporate Email Address</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="name.12345@bankalhabib.com"
                        required
                        className={`w-full border rounded-xl px-3.5 py-2.5 font-medium transition focus:outline-none ${
                          isDarkMode
                            ? 'border-slate-750 bg-slate-950/80 text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xs'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className={`font-bold uppercase tracking-wider text-[9.5px] flex items-center space-x-1.5 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <KeyRound className="h-3.5 w-3.5 text-purple-400" />
                        <span>Account Password</span>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 font-medium transition focus:outline-none ${
                          isDarkMode
                            ? 'border-slate-750 bg-slate-950/80 text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-xs'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition cursor-pointer p-1 ${
                          isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className={`w-full font-extrabold py-3 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/30'
                    }`}
                  >
                    {isSubmittingAuth ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Access & Enter Workspace</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* REGISTRATION FORM */
                <form onSubmit={handleSignup} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <User className="h-3 w-3 text-purple-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Batool Zehra"
                      required
                      className={`w-full border rounded-xl px-3 py-2 font-medium transition focus:outline-none ${
                        isDarkMode
                          ? 'border-slate-750 bg-slate-950/80 text-slate-100 focus:border-purple-500'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-violet-500 shadow-xs'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      <Mail className="h-3 w-3 text-purple-400" />
                      <span>Corporate Email</span>
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. john.12345@bankalhabib.com"
                      required
                      className={`w-full border rounded-xl px-3 py-2 font-medium transition focus:outline-none ${
                        isDarkMode
                          ? 'border-slate-750 bg-slate-950/80 text-slate-100 focus:border-purple-500'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-violet-500 shadow-xs'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className={`font-bold uppercase tracking-wider text-[9px] ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Password</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full border rounded-xl px-3 py-2 font-medium transition focus:outline-none ${
                          isDarkMode
                            ? 'border-slate-750 bg-slate-950/80 text-slate-100 focus:border-purple-500'
                            : 'border-slate-300 bg-white text-slate-900 focus:border-violet-500 shadow-xs'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={`font-bold uppercase tracking-wider text-[9px] ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>Confirm Password</label>
                      <input
                        type="password"
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full border rounded-xl px-3 py-2 font-medium transition focus:outline-none ${
                          isDarkMode
                            ? 'border-slate-750 bg-slate-950/80 text-slate-100 focus:border-purple-500'
                            : 'border-slate-300 bg-white text-slate-900 focus:border-violet-500 shadow-xs'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <Building2 className="h-3 w-3 text-purple-400" />
                        <span>Department</span>
                      </label>
                      <select
                        value={authDepartment}
                        onChange={(e) => setAuthDepartment(e.target.value)}
                        className={`w-full border rounded-xl px-2 py-2 font-medium transition focus:outline-none cursor-pointer ${
                          isDarkMode
                            ? 'border-slate-750 bg-slate-950/80 text-slate-100 focus:border-purple-500'
                            : 'border-slate-300 bg-white text-slate-900 focus:border-violet-500 shadow-xs'
                        }`}
                      >
                        {departmentsList.map(d => (
                          <option key={d} value={d} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className={`font-bold uppercase tracking-wider text-[9px] flex items-center space-x-1 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        <ShieldCheck className="h-3 w-3 text-purple-400" />
                        <span>Role</span>
                      </label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value)}
                        className={`w-full border rounded-xl px-2 py-2 font-medium transition focus:outline-none cursor-pointer ${
                          isDarkMode
                            ? 'border-slate-750 bg-slate-950/80 text-slate-100 focus:border-purple-500'
                            : 'border-slate-300 bg-white text-slate-900 focus:border-violet-500 shadow-xs'
                        }`}
                      >
                        <option value="TEAM_MEMBER" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>TEAM_MEMBER</option>
                        <option value="DEPT_HEAD" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>DEPT_HEAD</option>
                        <option value="SUPER_ADMIN" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>SUPER_ADMIN</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className={`w-full font-extrabold py-3 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-500/30'
                    }`}
                  >
                    {isSubmittingAuth ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Access Request</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Section: Compact Quick Demo Personas */}
            <div className={`pt-4 border-t space-y-2 ${
              isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Quick Demo Personas
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    isDarkMode
                      ? 'border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300'
                      : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700'
                  }`}
                  title="Login as Super Administrator"
                >
                  <ShieldCheck className="h-3 w-3 text-purple-400" />
                  <span>Super Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('swe')}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    isDarkMode
                      ? 'border-blue-500/30 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300'
                      : 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                  title="Login as Software Dev Engineer"
                >
                  <User className="h-3 w-3 text-blue-400" />
                  <span>Software Dev</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('ba')}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                    isDarkMode
                      ? 'border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300'
                      : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                  title="Login as Business Analyst"
                >
                  <Building2 className="h-3 w-3 text-indigo-400" />
                  <span>Business Analyst</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Team Collaboration Visual & Floating Glass Widgets (7 cols) */}
          {/* ========================================================================= */}
          <div className="hidden lg:flex lg:col-span-7 relative p-3 sm:p-4 h-full min-h-[580px]">
            <div className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-inner flex flex-col justify-between p-6 ${
              isDarkMode ? 'border-slate-800/90' : 'border-slate-200'
            }`}>
              {/* High-Resolution Corporate Team Collaboration Image */}
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Bank AL Habib Enterprise SDLC Team Collaboration"
                className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000 pointer-events-none"
              />

              {/* Gradient Darkening Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/20 backdrop-blur-[0.5px]" />

              {/* OVERLAID FLOATING GLASSMORPHISM WIDGETS */}

              {/* Widget 1 (Top-Left Floating): Mini Glass Calendar Widget */}
              <div className="relative z-10 self-start animate-in fade-in slide-in-from-top-3 duration-500 max-w-[280px] w-full">
                <div className="backdrop-blur-md bg-slate-900/65 border border-white/10 shadow-xl rounded-2xl p-3.5 space-y-2 text-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300">
                        <Calendar size={14} />
                      </div>
                      <span className="text-xs font-medium text-slate-200">SDLC Delivery Milestones</span>
                    </div>
                    <span className="text-[10px] text-purple-300/80 font-mono font-medium">Sprint 4</span>
                  </div>

                  {/* Mini Date Strip */}
                  <div className="grid grid-cols-7 gap-1 text-center pt-2 border-t border-white/10">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
                      <span key={i} className="text-[9.5px] font-medium text-slate-400">{d}</span>
                    ))}
                    {[22, 23, 24, 25, 26, 27, 28].map((day) => {
                      const isMilestone = day === 25;
                      return (
                        <div
                          key={day}
                          className={`py-1 rounded-md text-[11px] transition flex items-center justify-center ${
                            isMilestone
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-sm shadow-purple-500/50 ring-1 ring-purple-400/50'
                              : 'text-slate-300 hover:bg-white/5 font-normal'
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Widget 2 (Middle-Right Floating Card): Audit Trail Ledger */}
              <div className="relative z-10 my-auto self-end max-w-xs w-full animate-in fade-in slide-in-from-right-3 duration-500">
                <div className="backdrop-blur-xl bg-slate-900/75 border border-white/10 p-4.5 rounded-2xl shadow-2xl space-y-2 text-left">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-inner">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs text-white">
                        Audit Trail Ledger
                      </h4>
                      <p className="text-[10px] text-emerald-300/80 font-mono">
                        ISO 20022 Compliance Ready
                      </p>
                    </div>
                  </div>
                  <p className="text-[11.5px] font-normal text-slate-300 leading-relaxed pt-0.5">
                    Phase shifts, code deployments, and stage deliverables permanently logged.
                  </p>
                </div>
              </div>

              {/* Widget 3 (Bottom-Left Floating): Department Boundary Chip */}
              <div className="relative z-10 self-start">
                <div className="backdrop-blur-md bg-slate-900/75 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-200 flex items-center space-x-2 shadow-xl">
                  <Lock size={13} className="text-purple-400" />
                  <span>Department Boundary: <span className="text-purple-300 font-semibold">Active & Enforced</span></span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Clean Footer */}
      <footer className={`w-full py-3.5 px-6 sm:px-10 border-t text-center text-[10.5px] z-10 ${
        isDarkMode ? 'border-slate-900/80 text-slate-500' : 'border-slate-200 text-slate-500 bg-white/60'
      }`}>
        <span>© {new Date().getFullYear()} Bank AL Habib Limited. All rights reserved. SDLC Governance & Regulatory Pipeline Engine.</span>
      </footer>
    </div>
  );
}

