import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  FileText, 
  Plus, 
  Upload, 
  Trash2, 
  ExternalLink, 
  GitCommit, 
  Save, 
  RefreshCw, 
  ChevronRight, 
  Search, 
  Download, 
  Eye, 
  Clock, 
  HardDrive,
  FilePlus,
  FolderPlus,
  Check,
  AlertCircle
} from 'lucide-react';
import { DriveFileItem, DriveUser } from '../types';
import { getMimeTypeFromFilename } from '../utils/googleDrive';

interface DriveRepoManagerProps {
  user: DriveUser;
  files: DriveFileItem[];
  currentFolderId: string;
  breadcrumbs: Array<{ id: string; name: string }>;
  isLoading: boolean;
  selectedFile: DriveFileItem | null;
  fileContent: string;
  isSavingFile: boolean;
  onNavigateFolder: (folderId: string, folderName?: string) => void;
  onSelectFile: (file: DriveFileItem) => void;
  onChangeContent: (content: string) => void;
  onSaveFile: (commitMessage: string) => Promise<void>;
  onCreateItem: (name: string, isFolder: boolean, content?: string) => Promise<void>;
  onDeleteItem: (item: DriveFileItem) => Promise<void>;
  onRefresh: () => void;
  onUploadLocalFile: (file: File) => Promise<void>;
}

export const DriveRepoManager: React.FC<DriveRepoManagerProps> = ({
  user,
  files,
  currentFolderId,
  breadcrumbs,
  isLoading,
  selectedFile,
  fileContent,
  isSavingFile,
  onNavigateFolder,
  onSelectFile,
  onChangeContent,
  onSaveFile,
  onCreateItem,
  onDeleteItem,
  onRefresh,
  onUploadLocalFile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update file via CloudDrive Repo');
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  // File upload input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !showCreateModal) return;
    setIsCreating(true);
    try {
      await onCreateItem(newItemName.trim(), showCreateModal === 'folder', '');
      setNewItemName('');
      setShowCreateModal(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCommitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    try {
      await onSaveFile(commitMessage);
      setCommitSuccess(true);
      setTimeout(() => {
        setCommitSuccess(false);
        setShowCommitModal(false);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadLocalFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[640px]">
      {/* Top Drive Repo Navbar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-sm overflow-x-auto py-1">
          <button
            onClick={() => onNavigateFolder('root', 'Google Drive Root')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
          >
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>drive-root</span>
          </button>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => onNavigateFolder(crumb.id, crumb.name)}
                className={`px-2 py-0.5 rounded text-xs transition-colors shrink-0 ${
                  idx === breadcrumbs.length - 1
                    ? 'font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-800/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
            title="Upload from computer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setShowCreateModal('file')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New File</span>
          </button>

          <button
            onClick={() => setShowCreateModal('folder')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700/60"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>New Folder</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh repository"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Two-Column File Explorer & Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[560px]">
        {/* Left Column: File Tree list (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/60 flex flex-col">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a file in this folder..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                <span>Loading Google Drive items...</span>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                <span>No files or folders found</span>
              </div>
            ) : (
              filteredFiles.map((item) => {
                const isSelected = selectedFile?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.isFolder) {
                        onNavigateFolder(item.id, item.name);
                      } else {
                        onSelectFile(item);
                      }
                    }}
                    className={`flex items-center justify-between p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-l-2 border-cyan-400 text-white'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {item.isFolder ? (
                        <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{item.modifiedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {item.webViewLink && (
                        <a
                          href={item.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-slate-500 hover:text-cyan-400 transition-colors"
                          title="Open in official Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onDeleteItem(item)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete from Google Drive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Code & Text Editor (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Editor Header */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60">
                    {selectedFile.mimeType}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowCommitModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Commit Changes</span>
                  </button>
                </div>
              </div>

              {/* Code Textarea with line numbers feeling */}
              <div className="flex-1 relative flex">
                <textarea
                  value={fileContent}
                  onChange={(e) => onChangeContent(e.target.value)}
                  placeholder="File content..."
                  spellCheck={false}
                  className="w-full h-full p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed resize-none focus:outline-none selection:bg-cyan-500/20"
                />
              </div>

              {/* Editor Status Footer */}
              <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>Lines: {fileContent.split('\n').length}</span>
                  <span>Chars: {fileContent.length}</span>
                  <span>Encoding: UTF-8</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Check className="w-3 h-3" />
                  <span>Ready to commit</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <FileCode className="w-12 h-12 text-slate-700 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">Select a file to view or edit</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Click any file on the left file explorer tree to open, edit, and commit changes straight to Google Drive.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Commit Changes to Drive */}
      {showCommitModal && selectedFile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GitCommit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Commit changes to Google Drive</h3>
                <p className="text-xs text-slate-400">Target file: {selectedFile.name}</p>
              </div>
            </div>

            <form onSubmit={handleCommitSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Commit Message</label>
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="e.g. Fixed syntax bug, added VPS handler"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {commitSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Changes committed to Google Drive successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCommitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFile}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingFile ? 'Committing...' : 'Commit to Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create File or Folder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                {showCreateModal === 'folder' ? <FolderPlus className="w-5 h-5" /> : <FilePlus className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Create New {showCreateModal === 'folder' ? 'Folder' : 'File'}
                </h3>
                <p className="text-xs text-slate-400">In current directory</p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {showCreateModal === 'folder' ? 'Folder Name' : 'File Name with extension (e.g. script.py, config.json)'}
                </label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={showCreateModal === 'folder' ? 'my-bots-folder' : 'vps_handler.py'}
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newItemName.trim()}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isCreating ? 'Creating...' : 'Create in Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
