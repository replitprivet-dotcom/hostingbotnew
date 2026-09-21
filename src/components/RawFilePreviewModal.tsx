import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Code, 
  FileCode, 
  Terminal, 
  Bot,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { DriveFileItem } from '../types';

interface RawFilePreviewModalProps {
  file: DriveFileItem | null;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  activeApiKey?: string;
}

export const RawFilePreviewModal: React.FC<RawFilePreviewModalProps> = ({
  file,
  content,
  isOpen,
  onClose,
  activeApiKey = '',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  if (!isOpen || !file) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const rawUrl = `${origin}/api/v1/raw/${file.id}${activeApiKey ? `?api_key=${activeApiKey}` : ''}`;
  const downloadUrl = `${origin}/api/v1/files/${file.id}/download${activeApiKey ? `?api_key=${activeApiKey}` : ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(rawUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
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

  const lines = content.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b57d0] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 truncate">{file.name}</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Raw Stream
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct raw plain output • {lines.length} lines • {(content.length / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0b57d0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Raw URL for Telegram Bot or curl"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bot className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Bot Raw Link'}</span>
            </button>

            <button
              onClick={handleCopyContent}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Raw Content"
            >
              {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Download file"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bot Raw URL Bar */}
        <div className="px-5 py-2.5 bg-[#f8fafd] border-b border-slate-200/80 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 shrink-0 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-blue-600" /> Raw Endpoint:
          </span>
          <div className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-mono text-[11px] text-slate-800 truncate select-all">
            {rawUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="p-1 hover:text-blue-600 text-slate-400 shrink-0"
            title="Copy URL"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Content viewer */}
        <div className="flex-1 overflow-auto bg-white p-4 font-mono text-xs text-slate-800 leading-relaxed">
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="w-12 pr-4 text-right select-none text-slate-300 font-mono text-[11px] align-top">
                    {idx + 1}
                  </td>
                  <td className="text-slate-800 font-mono whitespace-pre-wrap break-all">
                    {line || '\n'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
