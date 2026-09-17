import React, { useRef, useState, useEffect } from 'react';
import {
  FolderOpen,
  FolderPlus,
  FolderUp,
  Folder,
  Upload,
  Search,
  Download,
  Trash2,
  File,
  ChevronRight,
  ChevronDown,
  Plus
} from 'lucide-react';

export default function StageFilesView({
  currentProject,
  projectDetails,
  activePhaseId,
  setActivePhaseId,
  stageFiles = [],
  stageParentFolderId,
  stageBreadcrumbs = [{ id: null, name: 'Root' }],
  onNavigateBreadcrumb,
  stageFileSearch,
  setStageFileSearch,
  onUploadFile,
  onUploadFolder,
  onDownloadFile,
  onDeleteFile,
  onOpenNewFolderModal,
  isUploadingStageFile,
  isDarkMode,
  formatFileSize,
  getFileIcon,
  authUser
}) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const phases = projectDetails?.phases || [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const filteredFiles = stageFiles.filter(f =>
    !stageFileSearch || f.name.toLowerCase().includes(stageFileSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Hidden File and Folder Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          setIsDropdownOpen(false);
          onUploadFile(e);
        }}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={(e) => {
          setIsDropdownOpen(false);
          onUploadFolder(e);
        }}
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
      />

      {/* Header & Controls */}
      <div
        className={`relative z-20 p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-xl backdrop-blur-md'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`p-2.5 rounded-xl border shrink-0 transition-transform hover:scale-105 ${
              isDarkMode
                ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 shadow-md shadow-amber-950/30'
                : 'bg-amber-50 border-amber-200 text-amber-700 shadow-xs'
            }`}
          >
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                Project Documents & Stage Repository
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isDarkMode 
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                  : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                Repository
              </span>
            </div>
            <p className={`text-[11.5px] mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              SDLC requirements specifications, architecture designs, and governance artifacts
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
            <option value="ALL">All Stages Repository</option>
            {phases.map(ph => (
              <option key={ph.id} value={ph.id}>{ph.name}</option>
            ))}
          </select>

          {/* Unified "+ New" Action Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-950/40'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/20'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
              <ChevronDown className={`h-3.5 w-3.5 ml-0.5 opacity-80 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div
                className={`absolute right-0 mt-2 w-52 rounded-xl border shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  isDarkMode
                    ? 'bg-[#16182a] border-zinc-750 text-zinc-200 shadow-black/90'
                    : 'bg-white border-slate-200 text-slate-800 shadow-2xl'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-purple-600/15 hover:text-purple-300' : 'hover:bg-violet-50 hover:text-violet-700'
                  }`}
                >
                  <Upload className="h-4 w-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="leading-none">Upload Files</p>
                    <p className={`text-[10px] font-normal mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>Upload one or more files</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    folderInputRef.current?.click();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-amber-600/15 hover:text-amber-300' : 'hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <FolderUp className="h-4 w-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="leading-none">Upload Folder</p>
                    <p className={`text-[10px] font-normal mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>Upload directory hierarchy</p>
                  </div>
                </button>

                <div className={`my-1 border-t ${isDarkMode ? 'border-zinc-800' : 'border-slate-100'}`} />

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenNewFolderModal();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs font-semibold text-left transition cursor-pointer ${
                    isDarkMode ? 'hover:bg-emerald-600/15 hover:text-emerald-300' : 'hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <FolderPlus className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="leading-none">New Folder</p>
                    <p className={`text-[10px] font-normal mt-0.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-400'}`}>Create an empty subfolder</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumbs & Search Bar */}
      <div
        className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition ${
          isDarkMode ? 'bg-[#0f111e] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Breadcrumb Path */}
        <div className="flex items-center space-x-1.5 text-xs font-bold">
          {stageBreadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
              <button
                type="button"
                onClick={() => onNavigateBreadcrumb(idx)}
                className={`hover:underline cursor-pointer flex items-center space-x-1 ${
                  idx === stageBreadcrumbs.length - 1
                    ? isDarkMode ? 'text-purple-400 font-extrabold' : 'text-violet-700 font-extrabold'
                    : 'text-zinc-400'
                }`}
              >
                {idx === 0 && <FolderOpen className="h-3.5 w-3.5 mr-0.5" />}
                <span>{crumb.name}</span>
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={stageFileSearch}
            onChange={(e) => setStageFileSearch(e.target.value)}
            placeholder="Search documents by name..."
            className={`w-full text-xs pl-8.5 pr-3 py-1.5 rounded-xl border outline-none transition focus:ring-1 ${
              isDarkMode
                ? 'bg-[#151728] border-zinc-750 text-zinc-100 focus:border-purple-500 focus:ring-purple-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500 focus:ring-violet-500/20 shadow-xs'
            }`}
          />
        </div>
      </div>

      {/* File List / Grid */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 shadow-xl transition ${
          isDarkMode ? 'bg-[#0e101d] border-zinc-800/80' : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        {filteredFiles.length === 0 ? (
          <div className="py-16 text-center space-y-3 text-zinc-500">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${
              isDarkMode ? 'bg-zinc-900/60 border-zinc-800 text-zinc-600' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <FolderOpen className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-300">No files or documents in this folder</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Click "+ New" to upload files, upload a folder, or create a new directory.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredFiles.map(f => (
              <div
                key={f.id}
                onClick={() => {
                  if (f.is_folder) {
                    onNavigateBreadcrumb(stageBreadcrumbs.length, f);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between group ${
                  f.is_folder ? 'cursor-pointer' : ''
                } ${
                  isDarkMode
                    ? f.is_folder
                    : 'bg-[#151726]/80 border-zinc-800 hover:border-purple-500/40 hover:bg-[#1a1d30]'
                } ${
                  isDarkMode && f.is_folder ? 'bg-amber-950/10 border-amber-900/30 hover:border-amber-600/60 hover:bg-amber-950/20' : ''
                } ${
                  !isDarkMode
                    ? f.is_folder
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:bg-amber-50/80 shadow-xs'
                      : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-violet-300 shadow-xs'
                    : ''
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="shrink-0 pt-0.5">
                    {getFileIcon ? getFileIcon(f.file_type, f.is_folder) : (
                      f.is_folder ? <Folder className="h-5 w-5 text-amber-500" /> : <File className="h-5 w-5 text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate leading-tight" title={f.name}>{f.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">
                      {f.is_folder ? `${f.item_count || 0} items` : formatFileSize(f.file_size)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 truncate max-w-[90px] font-medium">{f.uploaded_by_name || 'Corporate User'}</span>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    {!f.is_folder && (
                      <button
                        type="button"
                        onClick={() => onDownloadFile(f.id)}
                        className={`p-1 rounded-md transition cursor-pointer ${
                          isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                        title="Download deliverable"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteFile(f.id, f.name, f.is_folder)}
                      className="p-1 rounded-md transition hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400 cursor-pointer"
                      title={`Delete ${f.is_folder ? 'folder' : 'file'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
