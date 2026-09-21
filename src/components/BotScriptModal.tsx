import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  FileCode,
  Lock,
  Layers,
  Cloud
} from 'lucide-react';

export const BotScriptModal: React.FC = () => {
  const [scriptContent, setScriptContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bot-source')
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setScriptContent(data.content);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'main.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                SIMRAN HOSTING BOT v3.5 - JARVIS AI EDITION
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Complete production Python bot script with integrated DeepSeek-V3 autonomous background healing, zero-crash sandbox fallback, and Google Drive backups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Source!' : 'Copy Script'}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download (.py)
            </button>
          </div>
        </div>
      </div>

      {/* Root Cause Analysis: Why Users' Files Were Not Running */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Diagnosis: Why Users' Files Were Not Running & How It's Fixed
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              1. Root Privilege Error (os.setuid / useradd)
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Old Bug:</strong> The bot attempted to create system users via <code>useradd</code> and switch user via <code>os.setuid</code>. In standard VPS or containers without root, it threw <code>PermissionError: [Errno 1]</code> and aborted with <em>"Could not create the isolated VPS user"</em>.
            </p>
            <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>JARVIS Fix:</strong> Intelligent sandbox fallback. If non-root, seamlessly assigns a secure user sandbox directory without failing or terminating.</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              2. DeepSeek-V3 Background Auto-Repair Missing
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Old Bug:</strong> If a user's code had a syntax error, unhandled exception, or logic bug, the bot simply marked it <code>status='crashed'</code> and gave up after 3 tries.
            </p>
            <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>JARVIS Fix:</strong> Integrated DeepSeek-V3 API. Automatically intercepts tracebacks, rewrites the code with working syntax, backs up original, and restarts!</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              3. Hardcoded Dependency Map
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Old Bug:</strong> Auto-installer only knew ~20 hardcoded module names. If a user imported anything else (like custom or newer packages), the bot crashed with <code>ModuleNotFoundError</code>.
            </p>
            <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>JARVIS Fix:</strong> Universal AI package extractor that dynamically maps any missing module in the traceback and runs background pip install.</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              4. Google Drive Cloud Backup Missing
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Old Bug:</strong> Users had no way to backup their bots, error logs, or repaired code to Google Drive cloud storage.
            </p>
            <div className="text-emerald-400 flex items-start gap-1.5 pt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>JARVIS Fix:</strong> Built-in <code>/gdrive [BOT_ID]</code> command and cloud sync engine for instant Drive-ready zip bundles.</span>
            </div>
          </div>

        </div>
      </div>

      {/* Code Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-200">
              simran_hosting_bot_v3_jarvis.py
            </span>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              Python 3.8+ Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Full Script'}
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed whitespace-pre">
          {loading ? 'Loading script...' : scriptContent}
        </div>
      </div>

    </div>
  );
};
