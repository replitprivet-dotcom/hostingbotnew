import React from 'react';
import { 
  Cloud, 
  Key, 
  FolderGit2, 
  LogOut, 
  Server, 
  ExternalLink, 
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { DriveUser } from '../types';

interface DriveHeaderProps {
  user: DriveUser | null;
  activeTab: 'repo' | 'apikeys' | 'deploy';
  setActiveTab: (tab: 'repo' | 'apikeys' | 'deploy') => void;
  onLogout: () => void;
}

export const DriveHeader: React.FC<DriveHeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                CloudDrive <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">REPO MANAGER</span>
              </h1>
              {user && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Drive Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              GitHub-style file repo, text/code editor & REST API Key access for VPS & Railway
            </p>
          </div>
        </div>

        {/* Tab switchers if logged in */}
        {user && (
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('repo')}
              className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'repo'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              File Repository
            </button>

            <button
              onClick={() => setActiveTab('apikeys')}
              className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'apikeys'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              API Keys (VPS / cURL)
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'deploy'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              VPS / Railway Deploy Guide
            </button>
          </div>
        )}

        {/* User Account / Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{user.email}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
              title="Disconnect Google Drive"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
