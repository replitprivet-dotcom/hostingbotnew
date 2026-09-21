import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Upload, 
  RotateCcw, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  CloudUpload, 
  Layers, 
  Code2, 
  ShieldCheck,
  Github
} from 'lucide-react';
import { UserFile, DiagnosisResult } from '../types';

interface ReplitEditorProps {
  files: UserFile[];
  activeFile: UserFile;
  onSelectFile: (file: UserFile) => void;
  onUpdateContent: (content: string) => void;
  onRunCode: () => void;
  onSelfHealAndRun: () => void;
  onUploadToDrive: () => void;
  onSyncGitHub?: () => void;
  onResetOriginal: () => void;
  isRunning: boolean;
  isHealing: boolean;
  lastDiagnosis: DiagnosisResult | null;
}

export const ReplitEditor: React.FC<ReplitEditorProps> = ({
  files,
  activeFile,
  onSelectFile,
  onUpdateContent,
  onRunCode,
  onSelfHealAndRun,
  onUploadToDrive,
  onSyncGitHub,
  onResetOriginal,
  isRunning,
  isHealing,
  lastDiagnosis,
}) => {
  const [showDiff, setShowDiff] = useState(false);
  const [uploadedFileNotice, setUploadedFileNotice] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onUpdateContent(content);
      setUploadedFileNotice(`Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB) into active workspace`);
      setTimeout(() => setUploadedFileNotice(null), 4000);
    };
    reader.readAsText(file);
  };

  const lineCount = activeFile.content.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 16) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* File Tab Bar */}
      <div className="flex items-center justify-between bg-slate-950 px-3 py-2 border-b border-slate-800 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {files.map((file) => {
            const isActive = file.id === activeFile.id;
            return (
              <button
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${file.language === 'python' ? 'text-amber-400' : 'text-yellow-400'}`} />
                <span>{file.name}</span>
                {file.healed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Healed by JARVIS" />
                )}
                {file.hasErrors && !file.healed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" title="Has syntax/runtime error" />
                )}
              </button>
            );
          })}
        </div>

        {/* Upload Custom File */}
        <div className="flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload File</span>
            <input
              type="file"
              accept=".py,.js,.json,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Action Subheader */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Target:</span>
          <span className="font-semibold text-slate-200">{activeFile.name}</span>
          <span className="text-slate-500 font-mono text-[11px]">({activeFile.language.toUpperCase()})</span>

          {activeFile.hasErrors && !activeFile.healed && (
            <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Known Failure Point
            </span>
          )}

          {activeFile.healed && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Healed by JARVIS
            </span>
          )}
        </div>

        {/* Execution Controls */}
        <div className="flex items-center gap-2">
          {activeFile.healed && (
            <button
              onClick={onResetOriginal}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all flex items-center gap-1 border border-slate-700"
              title="Revert to original broken state for re-testing"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Code
            </button>
          )}

          {lastDiagnosis && (
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`px-2.5 py-1.5 rounded-md text-xs transition-all flex items-center gap-1 border ${
                showDiff
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Code2 className="w-3 h-3" />
              {showDiff ? 'Hide Patch Diff' : 'View AI Diff'}
            </button>
          )}

          <button
            onClick={onUploadToDrive}
            className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs transition-all flex items-center gap-1.5 border border-slate-700"
            title="Upload file to Google Drive"
          >
            <CloudUpload className="w-3.5 h-3.5 text-blue-400" />
            Upload Drive
          </button>

          {onSyncGitHub && (
            <button
              onClick={onSyncGitHub}
              className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-indigo-300 text-xs transition-all flex items-center gap-1.5 border border-slate-700"
              title="Push changes to GitHub repository"
            >
              <Github className="w-3.5 h-3.5 text-indigo-400" />
              Sync GitHub
            </button>
          )}

          <button
            onClick={onRunCode}
            disabled={isRunning || isHealing}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs transition-all flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            {isRunning ? 'Running...' : 'Run Sandbox'}
          </button>

          <button
            onClick={onSelfHealAndRun}
            disabled={isRunning || isHealing}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-cyan-500/10 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isHealing ? 'JARVIS Healing...' : 'JARVIS Auto-Heal & Run'}
          </button>
        </div>
      </div>

      {/* Upload Banner Notice */}
      {uploadedFileNotice && (
        <div className="bg-cyan-950/60 border-b border-cyan-800/50 px-4 py-1.5 text-xs text-cyan-300 flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          {uploadedFileNotice}
        </div>
      )}

      {/* Healed Banner */}
      {activeFile.healed && lastDiagnosis && (
        <div className="bg-emerald-950/40 border-b border-emerald-800/50 px-4 py-2 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>JARVIS AI Self-Healing Applied:</strong> Resolved <code>{lastDiagnosis.errorType}</code> using {lastDiagnosis.aiModel}.
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-400/80">Confidence: 99.8%</span>
        </div>
      )}

      {/* Editor & Diff Area */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers */}
        <div className="bg-slate-950/70 select-none py-3 px-3 text-right text-slate-600 border-r border-slate-800/60 w-12 flex-shrink-0 font-mono text-[11px]">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-5 h-5">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area */}
        <div className="flex-1 flex overflow-auto relative">
          <textarea
            value={activeFile.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            spellCheck={false}
            className="w-full h-full bg-slate-950/40 text-slate-100 p-3 leading-5 resize-none outline-none font-mono text-xs whitespace-pre tab-4"
          />

          {/* AI Diff Overlay Drawer if toggled */}
          {showDiff && lastDiagnosis && (
            <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-950/95 border-l border-slate-700 p-4 overflow-y-auto flex flex-col gap-3 shadow-2xl z-10">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  JARVIS Autonomous Patch
                </span>
                <button
                  onClick={() => setShowDiff(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800"
                >
                  Close
                </button>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Diagnosis Analysis</span>
                <p className="mt-1 text-slate-300 text-xs leading-relaxed bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  {lastDiagnosis.explanation}
                </p>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Applied Patches</span>
                <ul className="mt-1 space-y-1">
                  {lastDiagnosis.appliedPatches.map((p, idx) => (
                    <li key={idx} className="text-emerald-400 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
