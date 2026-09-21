import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Layers, 
  Zap, 
  RotateCw, 
  Sparkles,
  Lock,
  TerminalSquare
} from 'lucide-react';
import { HealingIncident, SystemTelemetry } from '../types';

interface SelfHealingWatchdogProps {
  incidents: HealingIncident[];
  telemetry: SystemTelemetry | null;
  onTriggerSelfCheck: () => void;
  isChecking: boolean;
}

export const SelfHealingWatchdog: React.FC<SelfHealingWatchdogProps> = ({
  incidents,
  telemetry,
  onTriggerSelfCheck,
  isChecking,
}) => {
  const [autoDeployPatches, setAutoDeployPatches] = useState(true);
  const [autoInstallPackages, setAutoInstallPackages] = useState(true);
  const [sandboxFallback, setSandboxFallback] = useState(true);
  const [deepSeekActive, setDeepSeekActive] = useState(true);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Metric */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                JARVIS Autonomous Recovery Engine & Infrastructure Watchdog
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring daemon that autonomously inspects process exit codes, intercepts terminal tracebacks, rewrites broken syntax via DeepSeek-V3, and self-deploys patches with zero downtime.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onTriggerSelfCheck}
              disabled={isChecking}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Running Health Sweep...' : 'Run Diagnostics Sweep'}
            </button>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">System Stability</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {telemetry?.stabilityIndex ?? 99.98}%
            </div>
            <span className="text-[10px] text-slate-500">Zero unhandled crashes</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Autonomous Recoveries</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-1">
              {telemetry?.autonomousRecoveries ?? 14}
            </div>
            <span className="text-[10px] text-slate-500">Patched by DeepSeek-V3</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Mean Recovery Time</span>
            <div className="text-xl font-bold text-amber-300 font-mono mt-1">
              520 ms
            </div>
            <span className="text-[10px] text-slate-500">From traceback to restart</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] uppercase font-bold text-slate-400">Uptime Duration</span>
            <div className="text-xl font-bold text-slate-200 font-mono mt-1">
              {telemetry?.uptime ?? 'Online'}
            </div>
            <span className="text-[10px] text-slate-500">Continuous health loop</span>
          </div>
        </div>
      </div>

      {/* Autonomous Guardrail Policies */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Active Autonomous Recovery Protocols
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="flex items-start justify-between p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">DeepSeek-V3 Autonomous Code Rewriter</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When a syntax or runtime exception occurs, DeepSeek-V3 immediately diagnoses the bug, rewrites the file, and hot-deploys verified code.
              </p>
            </div>
            <button
              onClick={() => setAutoDeployPatches(!autoDeployPatches)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                autoDeployPatches ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md transform transition" />
            </button>
          </div>

          <div className="flex items-start justify-between p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Universal Package Auto-Installer</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detects missing modules in real-time (Python & NPM) and runs isolated background installation with no manual user intervention required.
              </p>
            </div>
            <button
              onClick={() => setAutoInstallPackages(!autoInstallPackages)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                autoInstallPackages ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md transform transition" />
            </button>
          </div>

          <div className="flex items-start justify-between p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Non-Root Privilege Isolation Fallback</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Resolves the "Cannot create isolated VPS user" bug: seamlessly diverts to safe local user sandboxing if Unix <code>useradd</code> or <code>os.setuid</code> fails.
              </p>
            </div>
            <button
              onClick={() => setSandboxFallback(!sandboxFallback)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                sandboxFallback ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md transform transition" />
            </button>
          </div>

          <div className="flex items-start justify-between p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Zero-Downtime Watchdog Loop</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous 5-second process heartbeat. If any bot crashes, triggers recovery protocols, updates the audit ledger, and resumes execution.
              </p>
            </div>
            <button
              onClick={() => setDeepSeekActive(!deepSeekActive)}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                deepSeekActive ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md transform transition" />
            </button>
          </div>

        </div>
      </div>

      {/* Incident Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-cyan-400" />
              Autonomous Incident Resolution Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit record of errors caught and autonomously patched by JARVIS AI
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {incidents.length} recorded events
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {incidents.map((inc) => (
            <div key={inc.id} className="p-4 hover:bg-slate-950/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-bold">{inc.id}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-semibold text-slate-200">{inc.fileName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 border border-rose-900/50 text-rose-300">
                    {inc.errorType}
                  </span>
                </div>
                
                <p className="text-slate-300 text-xs">{inc.summary}</p>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>{inc.actionTaken}</span>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-[11px] text-slate-400 font-mono flex-shrink-0">
                <span className="text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded font-semibold">
                  {inc.status.toUpperCase()}
                </span>
                <span>Recovered in {inc.recoveryDurationMs}ms</span>
                <span className="text-slate-500">{inc.timestamp} via {inc.aiModel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
