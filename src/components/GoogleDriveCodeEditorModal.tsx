import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Check, 
  Copy, 
  FileCode, 
  GitCommit, 
  Download,
  AlertCircle,
  Eye,
  Bot
} from 'lucide-react';
import { DriveFileItem } from '../types';

interface GoogleDriveCodeEditorModalProps {
  file: DriveFileItem | null;
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  onSave: (content: string, commitMessage: string) => Promise<void>;
  isSaving: boolean;
  onViewRaw?: (file: DriveFileItem, content: string) => void;
}

export const GoogleDriveCodeEditorModal: React.FC<GoogleDriveCodeEditorModalProps> = ({
  file,
  isOpen,
  onClose,
  initialContent,
  onSave,
  isSaving,
  onViewRaw,
}) => {
  const [content, setContent] = useState('');
  const [commitMessage, setCommitMessage] = useState('Update file via Kaalix Cloud Editor');
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCommitBox, setShowCommitBox] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  if (!isOpen || !file) return null;

  const lineCount = content.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(content, commitMessage);
      setSaveSuccess(true);
      setShowCommitBox(false);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: file.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-800">
        {/* Editor Top Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b57d0] shrink-0">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 truncate">{file.name}</h3>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                  {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </span>
                {saveSuccess && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold animate-pulse">
                    <Check className="w-3.5 h-3.5" /> Saved to Kaalix Cloud
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{lineCount} lines</span>
                <span>•</span>
                <span>{(content.length / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onViewRaw && (
              <button
                onClick={() => onViewRaw(file, content)}
                className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
                title="View GitHub-style Raw Stream"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Raw View</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy Content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowCommitBox(!showCommitBox)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0b57d0] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer ml-1"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save File'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Commit message bar */}
        {showCommitBox && (
          <form onSubmit={handleSaveSubmit} className="p-3 bg-[#f8fafd] border-b border-slate-200 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-blue-600 shrink-0" />
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Commit / save summary description..."
              className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1 bg-[#0b57d0] hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Confirm Save'}
            </button>
          </form>
        )}

        {/* Text Area */}
        <div className="flex-1 flex overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-4 bg-white text-slate-900 font-mono text-xs sm:text-sm leading-relaxed border-none focus:outline-none resize-none overflow-auto"
            placeholder="Type or paste your code/file content here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};
