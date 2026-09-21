import React, { useState } from 'react';
import { 
  Clock, 
  Trash2, 
  Settings, 
  Cloud, 
  X, 
  LogOut, 
  Key, 
  FileCode,
  HardDrive,
  Layers,
  Sparkles,
  CheckCircle2,
  Folder,
  Star,
  RefreshCw,
  Bot,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Database,
  FolderGit2
} from 'lucide-react';
import { DriveUser } from '../types';
import { maskEmail, maskName } from '../utils/privacy';

interface GoogleDriveSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: DriveUser | null;
  storageUsageText?: string;
  progressWidth?: number;
  isPrivacyMode?: boolean;
  onSelectCategory: (category: string) => void;
  activeCategory: string;
  onLogout: () => void;
  onOpenApiKeys: () => void;
  onOpenPrivacy?: () => void;
  onRefreshStorage?: () => void;
  onOpenMongoStudio?: () => void;
  onOpenGitHubSync?: () => void;
}

export const GoogleDriveSideDrawer: React.FC<GoogleDriveSideDrawerProps> = ({
  isOpen,
  onClose,
  user,
  storageUsageText = 'Calculating storage...',
  progressWidth = 1,
  isPrivacyMode = false,
  onSelectCategory,
  activeCategory,
  onLogout,
  onOpenApiKeys,
  onOpenPrivacy,
  onRefreshStorage,
  onOpenMongoStudio,
  onOpenGitHubSync,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  if (!isOpen) return null;

  const displayName = user ? (isPrivacyMode ? maskName(user.name, true) : user.name) : '';
  const displayEmail = user ? (isPrivacyMode ? maskEmail(user.email, true) : user.email) : '';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-76 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 text-slate-800">
        {/* Brand header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b57d0]">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[17px] font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Kaalix</span>
                <span className="text-[#0b57d0]">Cloud</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Private Storage & API Hub</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu items list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 text-[14px]">
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-50 text-[#0b57d0] font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Folder className="w-5 h-5 text-slate-600" />
            <span>My Storage Files</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('recent');
              onClose();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeCategory === 'recent'
                ? 'bg-blue-50 text-[#0b57d0] font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-5 h-5 text-slate-600" />
            <span>Recent Files</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('starred');
              onClose();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeCategory === 'starred'
                ? 'bg-blue-50 text-[#0b57d0] font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Star className="w-5 h-5 text-amber-500" />
            <span>Starred Items</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('trash');
              onClose();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeCategory === 'trash'
                ? 'bg-blue-50 text-[#0b57d0] font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-5 h-5 text-slate-600" />
            <span>Trash Bin</span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('vault');
              onClose();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeCategory === 'vault'
                ? 'bg-purple-50 text-purple-700 font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-5 h-5 text-purple-600" />
            <span>Private Vault</span>
          </button>

          <div className="pt-2 pb-1">
            <div className="border-t border-slate-100" />
          </div>

          {/* Privacy & Security Center Button */}
          {onOpenPrivacy && (
            <button
              onClick={() => {
                onOpenPrivacy();
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 transition-colors font-medium text-[13px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Privacy & Security</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isPrivacyMode 
                  ? 'bg-emerald-200 text-emerald-900' 
                  : 'bg-slate-200/80 text-slate-700'
              }`}>
                {isPrivacyMode ? 'STEALTH ON' : 'ACTIVE'}
              </span>
            </button>
          )}

          {/* API & Bot Developer Hub Button */}
          <button
            onClick={() => {
              onOpenApiKeys();
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 transition-colors font-medium text-[13px] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-4 h-4 text-[#0b57d0]" />
              <span className="font-semibold">API & Bot Hub</span>
            </div>
            <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full font-bold">
              KEYS & RAW
            </span>
          </button>

          {/* MongoDB NoSQL Studio */}
          {onOpenMongoStudio && (
            <button
              onClick={() => {
                onOpenMongoStudio();
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 transition-colors font-medium text-[13px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">MongoDB NoSQL Studio</span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                STORE
              </span>
            </button>
          )}

          {/* GitHub Sync */}
          {onOpenGitHubSync && (
            <button
              onClick={() => {
                onOpenGitHubSync();
                onClose();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-800 bg-slate-50 hover:bg-slate-100 transition-colors font-medium text-[13px] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FolderGit2 className="w-4 h-4 text-slate-700" />
                <span className="font-semibold">GitHub Repository Sync</span>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                PUSH
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setShowSettingsModal(true);
            }}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Settings className="w-5 h-5 text-slate-600" />
            <span>Storage & Settings</span>
          </button>

          {/* Storage Section */}
          <div className="pt-3 pb-2">
            <div className="border-t border-slate-100" />
          </div>

          <div className="px-4 py-2.5 space-y-2 bg-[#f8fafd] rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-700 font-semibold text-xs">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#0b57d0]" />
                <span>Cloud Storage</span>
              </div>
              {onRefreshStorage && (
                <button
                  onClick={onRefreshStorage}
                  className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
                  title="Refresh Quota"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Storage Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#0b57d0] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(1, progressWidth))}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 font-medium">
              {storageUsageText}
            </p>
          </div>
        </div>

        {/* Footer with user info & logout */}
        {user && (
          <div className="p-3 border-t border-slate-100 bg-[#f8fafd] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user.picture ? (
                <img src={user.picture} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#0b57d0] text-white font-bold text-xs flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-slate-900 truncate">{displayName}</div>
                <div className="text-[11px] text-slate-500 truncate">{displayEmail}</div>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* In-App Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0b57d0]" />
                <h3 className="font-bold text-base text-slate-900">Kaalix Cloud Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-[#f8fafd] rounded-xl border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800">Connected Storage Account</span>
                <p className="text-slate-500">{user?.email || 'Authenticated'}</p>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800">REST API Version</span>
                <p className="text-slate-500">v2.0 (Direct Raw Streaming & Download)</p>
              </div>

              <div className="p-3 bg-[#f8fafd] rounded-xl border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-800">Storage Health</span>
                <p className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized & Online
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSettingsModal(false);
                onOpenApiKeys();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#0b57d0] hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Manage API Keys & Endpoints</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
