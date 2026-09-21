import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  FileText, 
  MoreVertical, 
  Plus, 
  Search, 
  Menu, 
  Sparkles, 
  List, 
  LayoutGrid, 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  FolderPlus, 
  Upload, 
  FileCode, 
  Star, 
  Copy, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Camera, 
  Key, 
  Download,
  Eye,
  Bot,
  Terminal,
  Zap,
  HardDrive,
  Info,
  CheckCircle2,
  RefreshCw,
  Home,
  Users,
  Settings,
  ShieldCheck,
  Share2,
  LogOut,
  UserPlus,
  UserCheck,
  Shield,
  Clock,
  Database,
  FolderGit2,
  ArrowRight,
  ExternalLink,
  Film,
  Music,
  Image as ImageIcon,
  Play,
  File,
  Lock,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { DriveFileItem, DriveUser } from '../types';
import { GoogleDriveSideDrawer } from './GoogleDriveSideDrawer';
import { GoogleDriveCodeEditorModal } from './GoogleDriveCodeEditorModal';
import { RawFilePreviewModal } from './RawFilePreviewModal';
import { MediaViewerModal } from './MediaViewerModal';
import { PrivacySecurityModal } from './PrivacySecurityModal';
import { formatFileSize, getSavedAccounts } from '../utils/googleDrive';
import { 
  maskEmail, 
  maskName, 
  getBlurMediaPref, 
  isFileInVault, 
  toggleVaultFile,
  getSecurityPin 
} from '../utils/privacy';

interface GoogleDriveViewProps {
  user: DriveUser;
  files: DriveFileItem[];
  currentFolderId: string;
  breadcrumbs: { id: string; name: string }[];
  isLoading: boolean;
  selectedFile: DriveFileItem | null;
  fileContent: string;
  isSavingFile: boolean;
  activeApiKey?: string;
  isPrivacyMode?: boolean;
  onTogglePrivacyMode?: (enabled: boolean) => void;
  onLockAppNow?: () => void;
  onPurgeSession?: () => void;
  onNavigateFolder: (folderId: string, folderName?: string) => void;
  onSelectFile: (file: DriveFileItem) => Promise<void>;
  onSaveFile: (content: string, commitMessage: string) => Promise<void>;
  onCreateItem: (name: string, isFolder: boolean, content?: string) => Promise<void>;
  onDeleteItem: (item: DriveFileItem) => Promise<void>;
  onRenameItem?: (item: DriveFileItem, newName: string) => Promise<void>;
  onCopyItem?: (item: DriveFileItem) => Promise<void>;
  onToggleStar?: (item: DriveFileItem) => Promise<void>;
  onRefresh: () => void;
  onUploadLocalFile: (file: File) => Promise<void>;
  onOpenApiKeys: () => void;
  onOpenMongoStudio?: () => void;
  onLogout: () => void;
  onSwitchAccount: () => Promise<void>;
  activeNavTab: 'home' | 'starred' | 'shared' | 'files';
  setActiveNavTab: (tab: 'home' | 'starred' | 'shared' | 'files') => void;
}

export const GoogleDriveView: React.FC<GoogleDriveViewProps> = ({
  user,
  files,
  currentFolderId,
  breadcrumbs,
  isLoading,
  selectedFile,
  fileContent,
  isSavingFile,
  activeApiKey = '',
  isPrivacyMode = false,
  onTogglePrivacyMode,
  onLockAppNow,
  onPurgeSession,
  onNavigateFolder,
  onSelectFile,
  onSaveFile,
  onCreateItem,
  onDeleteItem,
  onRenameItem,
  onCopyItem,
  onToggleStar,
  onRefresh,
  onUploadLocalFile,
  onOpenApiKeys,
  onOpenMongoStudio,
  onLogout,
  onSwitchAccount,
  activeNavTab,
  setActiveNavTab,
}) => {
  // Navigation & Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Media Type Filter: 'all' | 'photos' | 'videos' | 'documents' | 'audio' | 'code'
  const [activeMediaFilter, setActiveMediaFilter] = useState<'all' | 'photos' | 'videos' | 'documents' | 'audio' | 'code'>('all');

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [sortField, setSortField] = useState<'name' | 'modified'>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popups
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTopSettingsMenu, setShowTopSettingsMenu] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState<DriveFileItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [itemActionLoading, setItemActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Raw file preview modal (code / text)
  const [rawPreviewFile, setRawPreviewFile] = useState<DriveFileItem | null>(null);
  const [rawPreviewContent, setRawPreviewContent] = useState<string>('');
  const [isRawPreviewOpen, setIsRawPreviewOpen] = useState(false);

  // Media Viewer modal (Photos, Videos, Audio, PDFs, Files)
  const [mediaViewerFile, setMediaViewerFile] = useState<DriveFileItem | null>(null);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);

  // File Details modal
  const [detailsFile, setDetailsFile] = useState<DriveFileItem | null>(null);

  // Saved accounts list
  const [savedAccounts, setSavedAccounts] = useState<DriveUser[]>([]);

  // Privacy & Security Suite States
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [blurMedia, setBlurMedia] = useState<boolean>(() => getBlurMediaPref());
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<DriveFileItem | null>(null);
  const [drawerCategory, setDrawerCategory] = useState<string>('all');

  // File Inputs
  const anyFileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showProfileModal) {
      setSavedAccounts(getSavedAccounts());
    }
  }, [showProfileModal]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close menus on click outside
  useEffect(() => {
    const handleGlobalClick = () => {
      if (showTopSettingsMenu) setShowTopSettingsMenu(false);
      if (activeMenuFileId) setActiveMenuFileId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [showTopSettingsMenu, activeMenuFileId]);

  // Media Helpers
  const isImageFile = (item: DriveFileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    return item.mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
  };

  const isVideoFile = (item: DriveFileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    return item.mimeType?.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'].includes(ext);
  };

  const isAudioFile = (item: DriveFileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    return item.mimeType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext);
  };

  const isPdfFile = (item: DriveFileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    return item.mimeType?.includes('pdf') || ext === 'pdf';
  };

  const isCodeFile = (item: DriveFileItem) => {
    const ext = item.name.split('.').pop()?.toLowerCase() || '';
    const codeExts = ['py', 'js', 'ts', 'jsx', 'tsx', 'json', 'sh', 'env', 'txt', 'html', 'css', 'yaml', 'yml', 'md', 'sql', 'toml', 'xml', 'log'];
    return codeExts.includes(ext) || (!item.isFolder && item.mimeType?.includes('text'));
  };

  // Filter & sort files
  const filteredFiles = files
    .filter((f) => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Vault Isolation Filter
      if (drawerCategory === 'vault') {
        return isFileInVault(f.id);
      }

      // Keep folders visible so directories can always be navigated
      if (f.isFolder) return true;

      if (activeMediaFilter === 'photos') return isImageFile(f);
      if (activeMediaFilter === 'videos') return isVideoFile(f);
      if (activeMediaFilter === 'audio') return isAudioFile(f);
      if (activeMediaFilter === 'documents') return isPdfFile(f) || ['doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'txt'].includes(f.name.split('.').pop()?.toLowerCase() || '');
      if (activeMediaFilter === 'code') return isCodeFile(f);

      return true;
    })
    .sort((a, b) => {
      // Folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      if (sortField === 'name') {
        const comp = a.name.localeCompare(b.name);
        return sortAsc ? comp : -comp;
      }
      return 0;
    });

  // Handling file click: opens player/viewer for media or editor for code
  const handleItemClick = async (item: DriveFileItem) => {
    if (item.isFolder) {
      onNavigateFolder(item.id, item.name);
    } else if (isCodeFile(item)) {
      handleOpenEditor(item);
    } else {
      setMediaViewerFile(item);
      setIsMediaViewerOpen(true);
    }
  };

  const handleOpenEditor = async (file: DriveFileItem) => {
    await onSelectFile(file);
    setIsEditorOpen(true);
  };

  const handleOpenRawPreview = async (file: DriveFileItem) => {
    setActiveMenuFileId(null);
    setRawPreviewFile(file);
    setIsRawPreviewOpen(true);
    setRawPreviewContent('Loading raw stream from Kaalix Cloud...');
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const endpoint = `${origin}/api/v1/raw/${file.id}?token=${encodeURIComponent(user.accessToken)}${activeApiKey ? `&api_key=${activeApiKey}` : ''}`;
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });
      const text = await res.text();
      setRawPreviewContent(text);
    } catch (err: any) {
      setRawPreviewContent(`// Failed to fetch raw file: ${err.message}`);
    }
  };

  const handleCopyBotRawLink = (file: DriveFileItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const keyParam = activeApiKey ? `?api_key=${activeApiKey}` : '';
    const rawUrl = `${origin}/api/v1/raw/${file.id}${keyParam}`;
    navigator.clipboard.writeText(rawUrl);
    setActiveMenuFileId(null);
    showToast(`Bot Direct URL copied for "${file.name}"!`);
  };

  const handleDownloadFile = async (file: DriveFileItem) => {
    setActiveMenuFileId(null);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const downloadUrl = `${origin}/api/v1/files/${file.id}/download?token=${encodeURIComponent(user.accessToken)}${activeApiKey ? `&api_key=${activeApiKey}` : ''}`;
      window.open(downloadUrl, '_blank');
      showToast(`Downloading "${file.name}"...`);
    } catch (err: any) {
      showToast(`Download error: ${err.message}`);
    }
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItemActionLoading(true);
    try {
      await onCreateItem(newItemName, true);
      setNewItemName('');
      setShowNewFolderModal(false);
      showToast('Folder created');
    } finally {
      setItemActionLoading(false);
    }
  };

  const handleCreateFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setItemActionLoading(true);
    try {
      await onCreateItem(newItemName, false, '# New File in Kaalix Cloud\n\n');
      setNewItemName('');
      setShowNewFileModal(false);
      showToast('File created');
    } finally {
      setItemActionLoading(false);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenameModal || !newItemName.trim() || !onRenameItem) return;
    setItemActionLoading(true);
    try {
      await onRenameItem(showRenameModal, newItemName);
      setShowRenameModal(null);
      setNewItemName('');
      showToast('Item renamed');
    } finally {
      setItemActionLoading(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onUploadLocalFile(file);
      showToast(`Uploaded ${file.name}`);
      e.target.value = '';
    }
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const displayName = isPrivacyMode ? maskName(user.name, true) : (user.name || 'Cloud User');
  const displayEmail = isPrivacyMode ? maskEmail(user.email, true) : user.email;

  // Accurate storage calculation: Google Drive limit & usage with fallback to loaded files
  const userUsageBytes = user.storageUsage?.usageBytes || user.storageUsage?.driveBytes || 0;
  const userLimitBytes = user.storageUsage?.limitBytes || (15 * 1024 * 1024 * 1024);

  let computedFileBytes = 0;
  files.forEach((f) => {
    if (f.size && f.size !== '--') {
      const parts = f.size.trim().split(' ');
      if (parts.length === 2) {
        const num = parseFloat(parts[0]);
        const unit = parts[1].toUpperCase();
        if (!isNaN(num)) {
          if (unit === 'KB') computedFileBytes += num * 1024;
          else if (unit === 'MB') computedFileBytes += num * 1024 * 1024;
          else if (unit === 'GB') computedFileBytes += num * 1024 * 1024 * 1024;
          else if (unit === 'B') computedFileBytes += num;
        }
      }
    }
  });

  const activeUsageBytes = userUsageBytes > 0 ? userUsageBytes : computedFileBytes;
  const activeUsageText = formatFileSize(activeUsageBytes);
  const activeLimitText = user.storageUsage?.limit || formatFileSize(userLimitBytes);
  const activePercent = userLimitBytes > 0 ? Math.min(100, (activeUsageBytes / userLimitBytes) * 100) : 0;
  const activePercentFormatted = activePercent > 0 ? (activePercent < 0.1 ? '<0.1%' : `${activePercent.toFixed(1)}%`) : '0%';
  const progressWidth = Math.max(activeUsageBytes > 0 ? 2 : 1, Math.min(100, activePercent));
  const storageSummaryText = `${activeUsageText} of ${activeLimitText} used (${activePercentFormatted})`;

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col relative pb-20 select-none text-slate-800">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={anyFileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        type="file"
        ref={mediaFileInputRef}
        accept="image/*,video/*,audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Side Navigation Drawer */}
      <GoogleDriveSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        storageUsageText={storageSummaryText}
        progressWidth={progressWidth}
        isPrivacyMode={isPrivacyMode}
        onSelectCategory={(cat) => {
          setDrawerCategory(cat);
          if (cat === 'all') {
            setActiveMediaFilter('all');
            onNavigateFolder('root');
          } else if (cat === 'recent') setActiveNavTab('home');
          else if (cat === 'starred') setActiveNavTab('starred');
          else if (cat === 'vault') {
            showToast('Showing Private Vault files');
          } else if (cat === 'trash') {
            showToast('Trash items are isolated. Move items to trash using Delete.');
          }
        }}
        activeCategory={drawerCategory}
        onLogout={onLogout}
        onOpenApiKeys={onOpenApiKeys}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onRefreshStorage={onRefresh}
        onOpenMongoStudio={onOpenMongoStudio}
      />

      {/* Code Editor Modal */}
      <GoogleDriveCodeEditorModal
        file={selectedFile}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialContent={fileContent}
        onSave={onSaveFile}
        isSaving={isSavingFile}
        onViewRaw={(f, content) => {
          setIsEditorOpen(false);
          setRawPreviewFile(f);
          setRawPreviewContent(content);
          setIsRawPreviewOpen(true);
        }}
      />

      {/* Multimedia Viewer Modal (Photos, Videos, Audio, PDF, Files) */}
      <MediaViewerModal
        file={mediaViewerFile}
        isOpen={isMediaViewerOpen}
        onClose={() => setIsMediaViewerOpen(false)}
        accessToken={user.accessToken}
        activeApiKey={activeApiKey}
      />

      {/* Raw File Preview Modal */}
      <RawFilePreviewModal
        file={rawPreviewFile}
        content={rawPreviewContent}
        isOpen={isRawPreviewOpen}
        onClose={() => setIsRawPreviewOpen(false)}
        activeApiKey={activeApiKey}
      />

      {/* PROFILE & ACCOUNT SWITCHER MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div 
            className="bg-white border border-slate-200/90 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: Title & Close */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0b57d0]" />
                <span className="font-bold text-sm text-slate-900 tracking-tight">Kaalix Cloud Account</span>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Avatar & Info Card */}
            <div className="flex flex-col items-center text-center p-4 bg-[#f8fafd] rounded-2xl border border-slate-100 space-y-2">
              <div className="relative">
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover shadow-sm ring-3 ring-blue-500/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0b57d0] text-white text-2xl font-bold flex items-center justify-center shadow-sm ring-3 ring-blue-500/20">
                    {userInitial}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Connected" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">{displayName}</h3>
                <p className="text-xs text-slate-500 font-medium">{displayEmail}</p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-[11px] font-semibold text-slate-600 shadow-2xs">
                <Database className="w-3 h-3 text-[#0b57d0]" />
                <span>Cloud Storage Active</span>
              </div>
            </div>

            {/* Storage Quota Progress */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" /> Storage Quota
                </span>
                <span className="text-[11px] font-bold text-[#0b57d0]">
                  {activeUsageText}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#0b57d0] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{storageSummaryText}</span>
                <span>{activeLimitText}</span>
              </div>
            </div>

            {/* Account Switcher Section */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Account Actions
              </div>

              {/* Saved accounts / current account pill */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <UserCheck className="w-4 h-4 text-[#0b57d0] shrink-0" />
                  <span className="truncate font-medium text-slate-800">{displayEmail}</span>
                </div>
                <span className="text-[10px] bg-[#0b57d0] text-white px-2 py-0.5 rounded-full font-bold">Active</span>
              </div>

              {/* Switch / Add Account Button */}
              <button
                onClick={async () => {
                  setShowProfileModal(false);
                  await onSwitchAccount();
                  showToast('Account switch requested');
                }}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#0b57d0]" />
                <span>Switch or Add Another Account</span>
              </button>
            </div>

            {/* Quick Settings & Logout Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setShowPrivacyModal(true);
                }}
                className="w-full py-2.5 px-3 bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy & Security Vault</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
              </button>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onOpenApiKeys();
                }}
                className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-600" />
                  <span>API Keys & Bot Developer Hub</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  onLogout();
                }}
                className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Sign Out of Kaalix Cloud</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Details & API Endpoints Modal */}
      {detailsFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0b57d0] flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 truncate max-w-[220px]">
                  {detailsFile.name}
                </h3>
              </div>
              <button
                onClick={() => setDetailsFile(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-2.5 bg-[#f8fafd] rounded-xl border border-slate-100 flex justify-between">
                <span className="font-semibold text-slate-700">File ID:</span>
                <span className="font-mono text-slate-900 truncate max-w-[200px]">{detailsFile.id}</span>
              </div>
              <div className="p-2.5 bg-[#f8fafd] rounded-xl border border-slate-100 flex justify-between">
                <span className="font-semibold text-slate-700">Size / Type:</span>
                <span>{detailsFile.size || 'Calculated'} • {detailsFile.isFolder ? 'Folder' : (detailsFile.mimeType || 'File')}</span>
              </div>
              <div className="p-2.5 bg-[#f8fafd] rounded-xl border border-slate-100 flex justify-between">
                <span className="font-semibold text-slate-700">Modified:</span>
                <span>{detailsFile.modifiedTime || 'Recently'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Bot Integration Endpoint
              </span>
              <div className="p-2.5 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto select-all">
                curl -H "x-api-key: {activeApiKey || 'YOUR_KEY'}" "{origin}/api/v1/raw/{detailsFile.id}"
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleCopyBotRawLink(detailsFile);
                  setDetailsFile(null);
                }}
                className="flex-1 py-2 px-3 bg-blue-50 text-[#0b57d0] hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Copy Bot Link</span>
              </button>

              <button
                onClick={() => {
                  const f = detailsFile;
                  setDetailsFile(null);
                  handleItemClick(f);
                }}
                className="flex-1 py-2 px-3 bg-[#0b57d0] text-white hover:bg-blue-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview / Play</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Clean Search Bar */}
      <header className="px-4 pt-3 pb-2 sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-slate-100">
        <div className="max-w-4xl mx-auto">
          {/* Rounded Search Bar */}
          <div className="w-full h-12 bg-[#f0f4f9] hover:bg-[#e9edf4] focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-blue-300 rounded-full flex items-center justify-between px-3 transition-all duration-200">
            {/* Hamburger / Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {/* Search Input */}
            <div className="flex-1 flex items-center px-2 min-w-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search photos, videos & files in Kaalix Cloud..."
                className="w-full bg-transparent border-none text-[15px] text-slate-800 placeholder-slate-500 focus:outline-none truncate"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right icons: Privacy Button, Single 3-Dot Menu & Profile Avatar */}
            <div className="flex items-center gap-1 shrink-0 relative">
              {/* PRIVACY SHIELD QUICK BUTTON */}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isPrivacyMode
                    ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title={isPrivacyMode ? 'Privacy Mode Active (Click to configure)' : 'Configure Privacy & Security Vault'}
              >
                <ShieldCheck className="w-5 h-5" />
              </button>

              {/* 3-DOT MENU BUTTON ON TOP BAR */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTopSettingsMenu(!showTopSettingsMenu);
                }}
                className="p-2 text-slate-700 hover:text-slate-900 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Settings & API Hub"
              >
                <MoreVertical className="w-5 h-5 text-slate-700" />
              </button>

              {/* USER PROFILE AVATAR (Opens Profile / Account Switcher Modal) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileModal(true);
                }}
                className="w-8 h-8 rounded-full bg-[#0b57d0] text-white font-semibold text-xs flex items-center justify-center shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all ml-0.5"
                title={`Account: ${displayEmail}`}
              >
                {user.picture ? (
                  <img src={user.picture} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span>{userInitial}</span>
                )}
              </button>

              {/* TOP 3-DOT DROPDOWN MENU */}
              {showTopSettingsMenu && (
                <div 
                  className="absolute right-0 top-11 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs text-slate-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-slate-100 font-bold text-slate-900 text-[13px] flex items-center justify-between">
                    <span>Kaalix Cloud & API</span>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">v2.5</span>
                  </div>

                  <button
                    onClick={() => {
                      setShowTopSettingsMenu(false);
                      setShowPrivacyModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 text-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-slate-800">Privacy & Security Vault</div>
                        <div className="text-[10px] text-slate-500">PIN lock, stealth mode, media blur</div>
                      </div>
                    </div>
                    {isPrivacyMode && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        ON
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowTopSettingsMenu(false);
                      onOpenApiKeys();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-800 font-semibold"
                  >
                    <Key className="w-4 h-4 text-[#0b57d0]" />
                    <div>
                      <div>API Keys & Bot Developer Hub</div>
                      <div className="text-[10px] font-normal text-slate-500">Bot stream keys & endpoints</div>
                    </div>
                  </button>

                  {onOpenMongoStudio && (
                    <button
                      onClick={() => {
                        setShowTopSettingsMenu(false);
                        onOpenMongoStudio();
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-emerald-50 text-emerald-900 font-semibold"
                    >
                      <Database className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>MongoDB NoSQL Studio</div>
                        <div className="text-[10px] font-normal text-emerald-700">Collections, documents & query console</div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowTopSettingsMenu(false);
                      onOpenApiKeys();
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700"
                  >
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium text-slate-800">Raw Media Directory & cURL</div>
                      <div className="text-[10px] text-slate-500">Direct streaming URLs for Telegram/bots</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowTopSettingsMenu(false);
                      onRefresh();
                      showToast('Cloud storage synchronized');
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700"
                  >
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                    <span>Refresh Storage</span>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      setShowTopSettingsMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <Shield className="w-4 h-4 text-slate-600" />
                    <span>Account & Storage Quota</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MULTIMEDIA CATEGORY CHIPS (Photos, Videos, Audio, Documents, Code, All) */}
        <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2.5 px-1 scrollbar-none">
          <button
            onClick={() => setActiveMediaFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeMediaFilter === 'all'
                ? 'bg-[#0b57d0] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            All Files
          </button>

          <button
            onClick={() => setActiveMediaFilter('photos')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMediaFilter === 'photos'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>

          <button
            onClick={() => setActiveMediaFilter('videos')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMediaFilter === 'videos'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>

          <button
            onClick={() => setActiveMediaFilter('audio')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMediaFilter === 'audio'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Audio</span>
          </button>

          <button
            onClick={() => setActiveMediaFilter('documents')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMediaFilter === 'documents'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => setActiveMediaFilter('code')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeMediaFilter === 'code'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Bot Code</span>
          </button>

          {onOpenMongoStudio && (
            <button
              onClick={onOpenMongoStudio}
              className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
              title="Open MongoDB NoSQL Database Studio"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>MongoDB Studio</span>
            </button>
          )}
        </div>
      </header>

      {/* SUB-TOOLBAR: Breadcrumbs, Sort & View Switcher */}
      <section className="px-4 py-2 border-b border-slate-100 max-w-4xl mx-auto w-full flex items-center justify-between">
        {/* Left: Breadcrumbs or Sort button */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-sm">
          {breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-1 text-xs font-medium text-slate-600">
              <button
                onClick={() => onNavigateFolder('root')}
                className="hover:text-blue-600 flex items-center gap-1 text-slate-800 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Root
              </button>
              <span>/</span>
              <span className="text-slate-900 font-semibold truncate max-w-[150px]">
                {breadcrumbs[breadcrumbs.length - 1].name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                if (sortField === 'name') {
                  setSortAsc(!sortAsc);
                } else {
                  setSortField('name');
                  setSortAsc(true);
                }
              }}
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Name</span>
              {sortAsc ? <ChevronUp className="w-3.5 h-3.5 text-slate-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          )}
        </div>

        {/* Right: View Toggle Pill [List | Grid] & Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className={`p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer ${
              isLoading ? 'animate-spin text-[#0b57d0]' : ''
            }`}
            title="Refresh files"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Toggle pill */}
          <div className="flex items-center bg-[#f0f4f9] rounded-full p-0.5 border border-slate-200/60">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: File & Media Items */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-2 pb-28">
        {isLoading && files.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading media & files from Kaalix Cloud...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Folder className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
            <p className="text-sm font-medium text-slate-600">No {activeMediaFilter !== 'all' ? activeMediaFilter : 'files'} found</p>
            <p className="text-xs text-slate-400">Use the + button below to upload photos, videos, or files.</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ========================================================================= */
          /* LIST VIEW                                                                 */
          /* ========================================================================= */
          <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            {filteredFiles.map((item) => {
              const isImg = isImageFile(item);
              const isVid = isVideoFile(item);
              const isAud = isAudioFile(item);
              const isPdf = isPdfFile(item);
              const isCode = isCodeFile(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center justify-between py-3 px-4 hover:bg-[#f8fafd] cursor-pointer transition-colors group"
                >
                  {/* Left: Icon or Thumbnail & Title */}
                  <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                    {item.isFolder ? (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <Folder className="w-5 h-5 text-slate-700 fill-slate-700" />
                      </div>
                    ) : isImg ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 overflow-hidden flex items-center justify-center shrink-0 relative">
                        <img
                          src={`${origin}/api/v1/raw/${item.id}?token=${encodeURIComponent(user.accessToken)}${activeApiKey ? `&api_key=${activeApiKey}` : ''}`}
                          alt={item.name}
                          loading="lazy"
                          className={`w-full h-full object-cover transition-all ${blurMedia || isPrivacyMode ? 'blur-md hover:blur-none' : ''}`}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <ImageIcon className="w-4 h-4 text-emerald-600 absolute" />
                      </div>
                    ) : isVid ? (
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 relative">
                        <Film className="w-5 h-5" />
                        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-purple-600 rounded-full" />
                      </div>
                    ) : isAud ? (
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                        <Music className="w-5 h-5" />
                      </div>
                    ) : isPdf ? (
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                        <FileText className="w-5 h-5" />
                      </div>
                    ) : isCode ? (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b57d0] flex items-center justify-center shrink-0 border border-blue-100">
                        <FileCode className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-100">
                        <File className="w-5 h-5" />
                      </div>
                    )}

                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </span>
                        {item.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.modifiedTime ? `Modified ${item.modifiedTime}` : 'Recently'}</span>
                        {item.size && <span>• {item.size}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Preview button & 3-Dot Menu */}
                  <div className="flex items-center gap-1">
                    {!item.isFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(item);
                        }}
                        className="px-2.5 py-1 text-slate-500 hover:text-[#0b57d0] hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title={isVid ? 'Play Video' : isImg ? 'View Photo' : isAud ? 'Play Audio' : 'Preview File'}
                      >
                        {isVid ? <Play className="w-3.5 h-3.5 text-purple-600 fill-purple-600" /> : <Eye className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isVid ? 'Play' : isImg ? 'View' : 'Open'}</span>
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuFileId(activeMenuFileId === item.id ? null : item.id);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Item Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* ITEM 3-DOT MENU */}
                      {activeMenuFileId === item.id && (
                        <div
                          className="absolute right-0 top-9 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!item.isFolder && (
                            <>
                              <button
                                onClick={() => {
                                  setActiveMenuFileId(null);
                                  handleItemClick(item);
                                }}
                                className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-800 hover:bg-blue-50 hover:text-blue-700 font-medium cursor-pointer"
                              >
                                {isVid ? <Film className="w-4 h-4 text-purple-600" /> : isImg ? <ImageIcon className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-blue-600" />}
                                <span>{isVid ? 'Play Video Player' : isImg ? 'View High-Res Photo' : isAud ? 'Play Audio Stream' : 'Open Preview'}</span>
                              </button>

                              <button
                                onClick={() => handleCopyBotRawLink(item)}
                                className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-800 hover:bg-blue-50 hover:text-blue-700 font-medium cursor-pointer"
                              >
                                <Bot className="w-4 h-4 text-emerald-600" />
                                <span>Copy Bot Stream Link</span>
                              </button>

                              <button
                                onClick={() => handleDownloadFile(item)}
                                className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <Download className="w-4 h-4 text-slate-600" />
                                <span>Direct Download</span>
                              </button>

                              {isCode && (
                                <button
                                  onClick={() => {
                                    handleOpenEditor(item);
                                    setActiveMenuFileId(null);
                                  }}
                                  className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                  <Edit3 className="w-4 h-4 text-slate-600" />
                                  <span>Open in Kaalix Editor</span>
                                </button>
                              )}

                              <div className="border-t border-slate-100 my-1" />
                            </>
                          )}

                          {onToggleStar && (
                            <button
                              onClick={() => {
                                onToggleStar(item);
                                setActiveMenuFileId(null);
                              }}
                              className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <Star className="w-4 h-4 text-amber-500" />
                              <span>{item.starred ? 'Remove Star' : 'Add to Starred'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setShowRenameModal(item);
                              setNewItemName(item.name);
                              setActiveMenuFileId(null);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 text-slate-600" />
                            <span>Rename</span>
                          </button>

                          {!item.isFolder && onCopyItem && (
                            <button
                              onClick={() => {
                                onCopyItem(item);
                                setActiveMenuFileId(null);
                              }}
                              className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                              <Copy className="w-4 h-4 text-slate-600" />
                              <span>Make a copy</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setDetailsFile(item);
                              setActiveMenuFileId(null);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Info className="w-4 h-4 text-blue-600" />
                            <span>Details & Endpoints</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveMenuFileId(null);
                              const inVault = isFileInVault(item.id);
                              toggleVaultFile(item.id);
                              showToast(inVault ? `Removed "${item.name}" from Vault` : `Moved "${item.name}" to Private Vault`);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-emerald-600" />
                            <span>{isFileInVault(item.id) ? 'Remove from Vault' : 'Move to Private Vault'}</span>
                          </button>

                          <div className="border-t border-slate-100 my-1" />

                          <button
                            onClick={() => {
                              setActiveMenuFileId(null);
                              setDeleteConfirmItem(item);
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 cursor-pointer font-medium"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span>Delete permanently / Trash</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================================= */
          /* GRID VIEW WITH VISUAL MEDIA CARDS                                         */
          /* ========================================================================= */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredFiles.map((item) => {
              const isImg = isImageFile(item);
              const isVid = isVideoFile(item);
              const isAud = isAudioFile(item);
              const isPdf = isPdfFile(item);
              const isCode = isCodeFile(item);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="bg-white hover:bg-[#f8fafd] border border-slate-200/90 rounded-2xl p-3 flex flex-col justify-between h-42 cursor-pointer transition-all hover:shadow-xs group relative overflow-hidden"
                >
                  {/* Top Preview or Visual area */}
                  <div className="flex-1 w-full flex items-center justify-center rounded-xl overflow-hidden mb-2 relative bg-slate-50 border border-slate-100">
                    {item.isFolder ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100">
                        <Folder className="w-10 h-10 text-slate-700 fill-slate-700" />
                      </div>
                    ) : isImg ? (
                      <div className="w-full h-full relative flex items-center justify-center">
                        <img
                          src={`${origin}/api/v1/raw/${item.id}?token=${encodeURIComponent(user.accessToken)}${activeApiKey ? `&api_key=${activeApiKey}` : ''}`}
                          alt={item.name}
                          loading="lazy"
                          className={`w-full h-full object-cover transition-all ${blurMedia || isPrivacyMode ? 'blur-md hover:blur-none' : ''}`}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <ImageIcon className="w-6 h-6 text-emerald-500 absolute" />
                      </div>
                    ) : isVid ? (
                      <div className="w-full h-full bg-purple-50 flex items-center justify-center relative">
                        <Film className="w-8 h-8 text-purple-600" />
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-white/90 text-purple-700 flex items-center justify-center shadow-xs">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : isAud ? (
                      <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                        <Music className="w-8 h-8 text-amber-600" />
                      </div>
                    ) : isPdf ? (
                      <div className="w-full h-full bg-rose-50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-rose-600" />
                      </div>
                    ) : isCode ? (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                        <FileCode className="w-8 h-8 text-[#0b57d0]" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <File className="w-8 h-8 text-slate-600" />
                      </div>
                    )}

                    {/* Quick 3-dot on card corner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuFileId(activeMenuFileId === item.id ? null : item.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-full shadow-xs cursor-pointer z-10"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom title & metadata */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {item.size || (item.isFolder ? 'Folder' : 'File')}
                    </p>
                  </div>

                  {/* Grid Item Dropdown */}
                  {activeMenuFileId === item.id && (
                    <div
                      className="absolute right-2 top-8 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!item.isFolder && (
                        <>
                          <button
                            onClick={() => {
                              setActiveMenuFileId(null);
                              handleItemClick(item);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 text-blue-700 font-medium cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> {isVid ? 'Play Video' : isImg ? 'View Photo' : 'Preview'}
                          </button>
                          <button
                            onClick={() => handleCopyBotRawLink(item)}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-blue-50 text-slate-800 cursor-pointer"
                          >
                            <Bot className="w-3.5 h-3.5 text-emerald-600" /> Copy Bot Link
                          </button>
                          <button
                            onClick={() => handleDownloadFile(item)}
                            className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                          <div className="border-t border-slate-100 my-1" />
                        </>
                      )}
                      <button
                        onClick={() => {
                          setShowRenameModal(item);
                          setNewItemName(item.name);
                          setActiveMenuFileId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button
                        onClick={() => {
                          setDetailsFile(item);
                          setActiveMenuFileId(null);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5 text-blue-600" /> Details & Endpoints
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuFileId(null);
                          const inVault = isFileInVault(item.id);
                          toggleVaultFile(item.id);
                          showToast(inVault ? `Removed "${item.name}" from Vault` : `Moved "${item.name}" to Private Vault`);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-700 cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-emerald-600" /> {isFileInVault(item.id) ? 'Remove from Vault' : 'Move to Vault'}
                      </button>
                      <div className="border-t border-slate-100 my-1" />
                      <button
                        onClick={() => {
                          setActiveMenuFileId(null);
                          setDeleteConfirmItem(item);
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete / Trash
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed bottom-20 right-5 flex flex-col items-center gap-3 z-30">
        {/* Quick Camera photo upload */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="Take Photo with Camera"
        >
          <Camera className="w-5 h-5 text-slate-700" />
        </button>

        {/* Plus: Open Full Create / Upload Sheet */}
        <button
          onClick={() => setShowCreateSheet(true)}
          className="w-14 h-14 rounded-2xl bg-[#0b57d0] hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 transition-transform active:scale-95 cursor-pointer"
          title="Create or Upload"
        >
          <Plus className="w-7 h-7 text-white stroke-[2.5]" />
        </button>
      </div>

      {/* "Create / Upload" Bottom Sheet */}
      {showCreateSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowCreateSheet(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-6 shadow-2xl z-10 max-w-lg mx-auto w-full animate-in slide-in-from-bottom duration-200 border-t border-slate-200">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900 mb-4">Add to Kaalix Cloud</h3>

            <div className="grid grid-cols-4 gap-3 text-center">
              {/* Folder */}
              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  setShowNewFolderModal(true);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Folder</span>
              </button>

              {/* Upload Photos & Videos */}
              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  mediaFileInputRef.current?.click();
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Photos/Videos</span>
              </button>

              {/* Upload Any File */}
              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  anyFileInputRef.current?.click();
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0b57d0] shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Any File</span>
              </button>

              {/* Code File */}
              <button
                onClick={() => {
                  setShowCreateSheet(false);
                  setShowNewFileModal(true);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-2xs">
                  <FileCode className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Code Script</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateFolderSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-200"
          >
            <h3 className="text-base font-bold text-slate-900">New Folder</h3>
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. My Photos, Videos, BotConfigs"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={itemActionLoading || !newItemName.trim()}
                className="px-4 py-2 text-sm font-semibold bg-[#0b57d0] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {itemActionLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Code File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateFileSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-200"
          >
            <h3 className="text-base font-bold text-slate-900">New Code File</h3>
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. main.py, bot_script.js, config.json"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={itemActionLoading || !newItemName.trim()}
                className="px-4 py-2 text-sm font-semibold bg-[#0b57d0] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {itemActionLoading ? 'Creating...' : 'Create & Edit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleRenameSubmit}
            className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-200"
          >
            <h3 className="text-base font-bold text-slate-900">Rename</h3>
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRenameModal(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={itemActionLoading || !newItemName.trim()}
                className="px-4 py-2 text-sm font-semibold bg-[#0b57d0] text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {itemActionLoading ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Privacy & Security Vault Modal */}
      <PrivacySecurityModal
        isOpen={showPrivacyModal}
        onClose={() => {
          setShowPrivacyModal(false);
          setBlurMedia(getBlurMediaPref());
        }}
        user={user}
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacyMode={(enabled) => {
          if (onTogglePrivacyMode) onTogglePrivacyMode(enabled);
        }}
        onLockAppNow={() => {
          setShowPrivacyModal(false);
          if (onLockAppNow) onLockAppNow();
        }}
        onPurgeSession={() => {
          setShowPrivacyModal(false);
          if (onPurgeSession) onPurgeSession();
        }}
      />

      {/* Safe In-App Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 border border-slate-200 animate-in zoom-in-95 duration-150 text-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Delete Item?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to remove <strong className="text-slate-700">"{deleteConfirmItem.name}"</strong>? This will move it to trash in your cloud storage.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = deleteConfirmItem;
                  setDeleteConfirmItem(null);
                  onDeleteItem(target);
                  showToast(`Moved "${target.name}" to trash`);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#f0f4f9] border-t border-slate-200/80 py-2 px-6 flex items-center justify-around z-20">
        <button
          onClick={() => {
            setActiveNavTab('home');
            onRefresh();
          }}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className={`px-4 py-1 rounded-full ${activeNavTab === 'home' ? 'bg-[#c2e7ff] text-[#001d35]' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveNavTab('starred')}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className={`px-4 py-1 rounded-full ${activeNavTab === 'starred' ? 'bg-[#c2e7ff] text-[#001d35]' : ''}`}>
            <Star className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-medium">Starred</span>
        </button>

        <button
          onClick={() => {
            onOpenApiKeys();
          }}
          className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <div className="px-4 py-1 rounded-full">
            <Key className="w-5 h-5 text-[#0b57d0]" />
          </div>
          <span className="text-[11px] font-semibold text-[#0b57d0]">API Hub</span>
        </button>

        <button
          onClick={() => {
            setActiveNavTab('files');
            onNavigateFolder('root');
          }}
          className="flex flex-col items-center gap-1 text-slate-900 transition-colors cursor-pointer"
        >
          <div className={`px-4 py-1 rounded-full ${activeNavTab === 'files' ? 'bg-[#c2e7ff] text-[#001d35]' : ''}`}>
            <Folder className="w-5 h-5 fill-current" />
          </div>
          <span className="text-[11px] font-medium">Files</span>
        </button>
      </nav>
    </div>
  );
};
