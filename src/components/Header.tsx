import React from 'react';
import { Cpu, ShieldCheck, Zap, Bot, Cloud, Sparkles, Activity, Github } from 'lucide-react';
import { SystemTelemetry } from '../types';

interface HeaderProps {
  telemetry: SystemTelemetry | null;
  activeTab: 'ide' | 'watchdog' | 'bot_script' | 'gdrive' | 'github';
  setActiveTab: (tab: 'ide' | 'watchdog' | 'bot_script' | 'gdrive' | 'github') => void;
  onQuickHeal?: () => void;
  isHealing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  activeTab,
  setActiveTab,
  onQuickHeal,
  isHealing,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & AI Identity */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Bot className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                JARVIS <span className="text-cyan-400 font-mono text-xs px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">AUTONOMOUS CLOUD</span>
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                DeepSeek-V3 Online
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Replit-grade autonomous code repair, log watchdog & Google Drive sync
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ide')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'ide'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Replit IDE & Healer
          </button>
          
          <button
            onClick={() => setActiveTab('watchdog')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'watchdog'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live Watchdog
            <span className="ml-1 text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded-full">
              {telemetry?.autonomousRecoveries || 14}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gdrive')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'gdrive'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Google Drive
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'github'
                ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
            Sync with GitHub
          </button>

          <button
            onClick={() => setActiveTab('bot_script')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'bot_script'
                ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Fixed Bot Source
          </button>
        </div>

        {/* Telemetry Quick Badges */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU: <strong className="text-white">{telemetry?.cpuUsage ?? 14}%</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Stability: <strong className="text-emerald-400">{telemetry?.stabilityIndex ?? 99.98}%</strong></span>
          </div>

          {onQuickHeal && (
            <button
              onClick={onQuickHeal}
              disabled={isHealing}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold rounded-md shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isHealing ? 'JARVIS Healing...' : 'Auto-Heal Active File'}
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
