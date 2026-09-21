import React, { useState } from 'react';
import { 
  Terminal, 
  Cpu, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Radio, 
  Activity, 
  Copy, 
  Check 
} from 'lucide-react';
import { ExecutionResult, DiagnosisResult } from '../types';

interface JarvisLiveConsoleProps {
  lastExecution: ExecutionResult | null;
  diagnosis: DiagnosisResult | null;
  isHealing: boolean;
  onClearConsole: () => void;
  onPromptJarvis: (prompt: string) => Promise<string>;
}

export const JarvisLiveConsole: React.FC<JarvisLiveConsoleProps> = ({
  lastExecution,
  diagnosis,
  isHealing,
  onClearConsole,
  onPromptJarvis,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isAskingJarvis, setIsAskingJarvis] = useState(false);
  const [chatResponses, setChatResponses] = useState<Array<{ role: 'user' | 'jarvis'; text: string; time: string }>>([
    {
      role: 'jarvis',
      text: 'Greetings. I am JARVIS, your autonomous systems engineer. I continuously monitor system logs, analyze tracebacks via DeepSeek-V3, and self-deploy patches to guarantee zero-downtime stability.',
      time: 'Ready',
    },
  ]);
  const [copied, setCopied] = useState(false);

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isAskingJarvis) return;

    const userText = promptInput.trim();
    const time = new Date().toLocaleTimeString();
    setPromptInput('');
    setChatResponses((prev) => [...prev, { role: 'user', text: userText, time }]);
    setIsAskingJarvis(true);

    try {
      const response = await onPromptJarvis(userText);
      setChatResponses((prev) => [
        ...prev,
        { role: 'jarvis', text: response, time: new Date().toLocaleTimeString() },
      ]);
    } catch (err: any) {
      setChatResponses((prev) => [
        ...prev,
        { role: 'jarvis', text: `Diagnostic error: ${err.message}`, time: new Date().toLocaleTimeString() },
      ]);
    } finally {
      setIsAskingJarvis(false);
    }
  };

  const handleCopyLogs = () => {
    const text = `STDOUT:\n${lastExecution?.stdout || ''}\n\nSTDERR:\n${lastExecution?.stderr || ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs">
      
      {/* Console Header */}
      <div className="flex items-center justify-between bg-slate-950 px-4 py-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            JARVIS Autonomous Live Terminal
          </span>
          <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
            LIVE TELEMETRY
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastExecution && (
            <button
              onClick={handleCopyLogs}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-all flex items-center gap-1 text-[11px]"
              title="Copy terminal output"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={onClearConsole}
            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-all"
            title="Clear output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal View */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-950/60">
        
        {/* Active Healing Animation */}
        {isHealing && (
          <div className="p-3 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 rounded-lg animate-pulse text-cyan-200">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>JARVIS Autonomous AI Engine Analyzing Logs via DeepSeek-V3...</span>
            </div>
            <p className="text-xs text-cyan-300/90 font-mono">
              [1/3] Parsing stack traceback... [2/3] Generating AST code patch... [3/3] Deploying verified zero-downtime hotfix...
            </p>
          </div>
        )}

        {/* Execution Output */}
        {lastExecution ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5">
                {lastExecution.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                Exit Code: {lastExecution.exitCode} | Duration: {lastExecution.durationMs}ms
              </span>
              {lastExecution.healedDuringRun && (
                <span className="text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                  ⚡ Auto-Healed & Deployed During Run
                </span>
              )}
            </div>

            {lastExecution.stdout && (
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">
                <span className="text-[10px] text-slate-500 block mb-1 font-bold">--- STDOUT ---</span>
                {lastExecution.stdout}
              </div>
            )}

            {lastExecution.stderr && (
              <div className="bg-rose-950/20 p-2.5 rounded border border-rose-900/50 text-rose-300 font-mono whitespace-pre-wrap leading-relaxed">
                <span className="text-[10px] text-rose-400/80 block mb-1 font-bold">--- STDERR / ERROR TRACEBACK ---</span>
                {lastExecution.stderr}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500 py-6 text-center">
            Click <strong>"Run Sandbox"</strong> or <strong>"JARVIS Auto-Heal & Run"</strong> above to execute the code.
          </div>
        )}

        {/* Diagnosis & Healing Summary */}
        {diagnosis && (
          <div className="p-3 bg-slate-900 border border-cyan-500/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                JARVIS AI Diagnosis ({diagnosis.aiModel})
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                Root Cause: {diagnosis.rootCause}
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              {diagnosis.explanation}
            </p>

            {diagnosis.appliedPatches.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Automated Recovery Actions:</span>
                <ul className="mt-1 space-y-1">
                  {diagnosis.appliedPatches.map((patch, i) => (
                    <li key={i} className="text-emerald-400 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      {patch}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Chat / Interactive Diagnostic History */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Direct DeepSeek-V3 / JARVIS Intercom:
          </span>
          {chatResponses.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                msg.role === 'jarvis'
                  ? 'bg-slate-900 border border-slate-800 text-slate-200'
                  : 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                <span className="font-bold text-cyan-400">
                  {msg.role === 'jarvis' ? 'JARVIS AI (DeepSeek-V3)' : 'Operator'}
                </span>
                <span>{msg.time}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Terminal Input Bar */}
      <form onSubmit={handleSendPrompt} className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        <span className="text-cyan-400 font-bold pl-1">&gt;</span>
        <input
          type="text"
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          placeholder="Ask JARVIS to inspect code, explain bugs, or run DeepSeek-V3 prompt..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 outline-none text-xs"
        />
        <button
          type="submit"
          disabled={!promptInput.trim() || isAskingJarvis}
          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-all disabled:opacity-40 flex items-center gap-1"
        >
          <Send className="w-3 h-3" />
          {isAskingJarvis ? 'Querying...' : 'Send'}
        </button>
      </form>

    </div>
  );
};
