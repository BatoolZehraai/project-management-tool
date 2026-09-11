import React from 'react';
import {
  FolderOpen,
  FolderPlus,
  Upload,
  Search,
  Download,
  Trash2,
  File,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  ChevronRight,
  ExternalLink
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
  onDownloadFile,
  onDeleteFile,
  onOpenNewFolderModal,
  isUploadingStageFile,
  isDarkMode,
  formatFileSize,
  getFileIcon,
  authUser
}) {
  const phases = projectDetails?.phases || [];

  const filteredFiles = stageFiles.filter(f =>
    !stageFileSearch || f.name.toLowerCase().includes(stageFileSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div
        className={`p-4 rounded-2xl border transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
          isDarkMode
            ? 'bg-[#111322]/95 border-zinc-800/80 shadow-md'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl border ${
              isDarkMode ? 'bg-amber-950/40 border-amber-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`text-base font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
              Project Documents & Stage Repository
            </h2>
            <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              SDLC requirements specifications, architecture designs, and governance artifacts
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Selector */}
          <select
            value={activePhaseId || 'ALL'}
            onChange={(e) => {
              const val = e.target.value;
              setActivePhaseId(val === 'ALL' ? 'ALL' : parseInt(val));
            }}
            className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
              isDarkMode ? 'bg-[#16182a] border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="ALL">All Stages Repository</option>
            {phases.map(ph => (
              <option key={ph.id} value={ph.id}>{ph.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenNewFolderModal}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-750' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 shadow-xs'
            }`}
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>

          <label
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition shadow-md cursor-pointer ${
              isDarkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-violet-600 hover:bg-violet-700 shadow-xs'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
            <input type="file" onChange={onUploadFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Breadcrumbs & Search Bar */}
      <div
        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode ? 'bg-[#0f111e] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Breadcrumb Path */}
        <div className="flex items-center space-x-1 text-xs font-bold">
          {stageBreadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id || 'root'}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
              <button
                type="button"
                onClick={() => onNavigateBreadcrumb(idx)}
                className={`hover:underline cursor-pointer ${
                  idx === stageBreadcrumbs.length - 1
                    ? isDarkMode ? 'text-purple-400' : 'text-violet-700'
                    : 'text-zinc-400'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={stageFileSearch}
            onChange={(e) => setStageFileSearch(e.target.value)}
            placeholder="Search documents..."
            className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border outline-none ${
              isDarkMode ? 'bg-zinc-900 border-zinc-750 text-zinc-100' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* File List / Grid */}
      <div
        className={`rounded-2xl border p-4 ${
          isDarkMode ? 'bg-[#111322] border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {filteredFiles.length === 0 ? (
          <div className="py-16 text-center space-y-2 text-zinc-500">
            <FolderOpen className="h-8 w-8 mx-auto opacity-40" />
            <p className="text-xs font-medium">No files or documents uploaded in this folder.</p>
            <p className="text-[11px] text-zinc-400">Upload BRDs, architecture diagrams, or security reports.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredFiles.map(f => (
              <div
                key={f.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between group ${
                  isDarkMode
                    ? 'bg-[#151726] border-zinc-800 hover:border-purple-500/40 hover:bg-[#1a1d30]'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-violet-300 shadow-xs'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {getFileIcon(f.file_type, f.is_folder)}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold truncate" title={f.name}>{f.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {f.is_folder ? `${f.item_count || 0} items` : formatFileSize(f.file_size)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 truncate max-w-[90px]">{f.uploaded_by_name || 'Admin'}</span>
                  <div className="flex items-center space-x-1">
                    {!f.is_folder && (
                      <button
                        type="button"
                        onClick={() => onDownloadFile(f.id)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteFile(f.id, f.name, f.is_folder)}
                      className="p-1 rounded hover:bg-rose-950/40 text-zinc-400 hover:text-rose-400"
                      title="Delete"
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
