import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  RefreshCw
} from 'lucide-react';

export default function UploadConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  uploadData,
  isUploading,
  isDarkMode = true,
  formatFileSize
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (uploadData?.files) {
      setSelectedFiles(Array.from(uploadData.files));
    } else {
      setSelectedFiles([]);
    }
  }, [uploadData]);

  if (!isOpen || !uploadData) return null;

  const handleRemoveFile = (indexToRemove) => {
    const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updated);
    if (updated.length === 0) {
      onClose();
    }
  };

  const formatSize = (bytes) => {
    if (formatFileSize) return formatFileSize(bytes);
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isFolderUpload = uploadData.type === 'stage_folder';
  const title = isFolderUpload
    ? 'Upload Folder'
    : uploadData.type === 'task_files'
      ? 'Upload Attachments'
      : 'Upload Deliverables';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`max-w-md w-full p-5 rounded-2xl border shadow-xl transition my-auto ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-lg'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-inherit">
          <div className="flex items-center space-x-2.5">
            <h3 className="text-sm font-bold tracking-tight">
              {title}
            </h3>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isDarkMode
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                  : 'bg-violet-50 text-violet-700 border-violet-200'
              }`}
            >
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Selected Files List */}
        <div className="py-3.5">
          {selectedFiles.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No files selected
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                    isDarkMode
                      ? 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                    <FileText size={16} className="text-purple-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate text-xs" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isUploading}
                    className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    title={`Remove ${file.name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-inherit">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer disabled:opacity-50 font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(selectedFiles)}
            disabled={isUploading || selectedFiles.length === 0}
            className="px-4 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                <span>Upload ({selectedFiles.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
