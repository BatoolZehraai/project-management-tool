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
  Moon
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-purple-600 selection:text-white font-sans">
      {/* Background Decorative Ambient Radial Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/3" />
      <div className="absolute top-1/2 right-12 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full px-6 sm:px-10 py-4 flex justify-between items-center z-20">
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-2xl border border-emerald-500/30 bg-white/95 shadow-md flex items-center justify-center">
            <img src={bahlLogo} alt="Bank AL Habib Logo" className="h-8 sm:h-9 w-auto object-contain" />
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white">
              Bank AL Habib Limited
            </span>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              SDLC Governance Engine
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-amber-400 transition cursor-pointer shadow-sm"
            title={isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Centered Floating Master Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-2xl shadow-2xl shadow-purple-950/20 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Clean Authentication Form (5 cols on large screens)          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Form Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-[10px] font-bold tracking-wider uppercase font-mono">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                  <span>Enterprise SDLC v2.5</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {isLoginTab ? 'Sign In to Governance' : 'Request Access'}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isLoginTab
                    ? 'Enter your verified corporate credentials to access active project workspaces.'
                    : 'Submit your employee registration for administrator security review.'}
                </p>
              </div>

              {/* Clean Segmented Tab Pill */}
              <div className="p-1 rounded-2xl bg-slate-950/90 border border-slate-800/80 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginTab(true);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isLoginTab
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
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
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    !isLoginTab
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Request Account</span>
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
                    <label className="font-bold uppercase tracking-wider text-[9.5px] text-slate-300 flex items-center space-x-1.5">
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
                        className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-3.5 py-2.5 font-medium transition focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="font-bold uppercase tracking-wider text-[9.5px] text-slate-300 flex items-center space-x-1.5">
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
                        className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl pl-3.5 pr-10 py-2.5 font-medium transition focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition cursor-pointer p-1"
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
                    className="w-full font-extrabold py-3 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <label className="font-bold uppercase tracking-wider text-[9px] text-slate-300 flex items-center space-x-1">
                      <User className="h-3 w-3 text-purple-400" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Batool Zehra"
                      required
                      className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-3 py-2 font-medium transition focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wider text-[9px] text-slate-300 flex items-center space-x-1">
                      <Mail className="h-3 w-3 text-purple-400" />
                      <span>Corporate Email</span>
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="e.g. john.12345@bankalhabib.com"
                      required
                      className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-3 py-2 font-medium transition focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[9px] text-slate-300">Password</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-3 py-2 font-medium transition focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[9px] text-slate-300">Confirm Password</label>
                      <input
                        type="password"
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-3 py-2 font-medium transition focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[9px] text-slate-300 flex items-center space-x-1">
                        <Building2 className="h-3 w-3 text-purple-400" />
                        <span>Department</span>
                      </label>
                      <select
                        value={authDepartment}
                        onChange={(e) => setAuthDepartment(e.target.value)}
                        className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-2 py-2 font-medium transition focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        {departmentsList.map(d => (
                          <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-[9px] text-slate-300 flex items-center space-x-1">
                        <ShieldCheck className="h-3 w-3 text-purple-400" />
                        <span>Role</span>
                      </label>
                      <select
                        value={authRole}
                        onChange={(e) => setAuthRole(e.target.value)}
                        className="w-full border border-slate-750 bg-slate-950/80 text-slate-100 rounded-xl px-2 py-2 font-medium transition focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value="TEAM_MEMBER" className="bg-slate-900 text-white">TEAM_MEMBER</option>
                        <option value="DEPT_HEAD" className="bg-slate-900 text-white">DEPT_HEAD</option>
                        <option value="SUPER_ADMIN" className="bg-slate-900 text-white">SUPER_ADMIN</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full font-extrabold py-3 rounded-xl transition uppercase tracking-wider text-xs flex items-center justify-center space-x-2 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Demo Personas
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  className="px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 text-[11px] font-bold transition cursor-pointer flex items-center space-x-1.5"
                  title="Login as Super Administrator"
                >
                  <ShieldCheck className="h-3 w-3 text-purple-400" />
                  <span>Super Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('swe')}
                  className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-950/30 hover:bg-blue-900/40 text-blue-300 text-[11px] font-bold transition cursor-pointer flex items-center space-x-1.5"
                  title="Login as Software Dev Engineer"
                >
                  <User className="h-3 w-3 text-blue-400" />
                  <span>Software Dev</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('ba')}
                  className="px-2.5 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 text-[11px] font-bold transition cursor-pointer flex items-center space-x-1.5"
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
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800/90 shadow-inner flex flex-col justify-between p-6">
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
      <footer className="w-full py-3.5 px-6 sm:px-10 border-t border-slate-900/80 text-center text-[10.5px] text-slate-400 z-10">
        <span>© {new Date().getFullYear()} Bank AL Habib Limited. All rights reserved. SDLC Governance & Regulatory Pipeline Engine.</span>
      </footer>
    </div>
  );
}
