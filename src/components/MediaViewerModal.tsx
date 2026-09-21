import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Bot, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Copy, 
  Check, 
  FileText, 
  Film, 
  Music, 
  Image as ImageIcon,
  Share2,
  ExternalLink,
  Info
} from 'lucide-react';
import { DriveFileItem } from '../types';

interface MediaViewerModalProps {
  file: DriveFileItem | null;
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  activeApiKey?: string;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  file,
  isOpen,
  onClose,
  accessToken,
  activeApiKey = '',
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');

  useEffect(() => {
    // Reset view states when opening a new file
    setZoom(1);
    setRotation(0);
    setMediaError(false);
    setActiveTab('preview');
  }, [file]);

  if (!isOpen || !file) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const tokenParam = accessToken ? `token=${encodeURIComponent(accessToken)}` : '';
  const keyParam = activeApiKey ? `api_key=${activeApiKey}` : '';
  const queryParams = [tokenParam, keyParam].filter(Boolean).join('&');
  const mediaUrl = `${origin}/api/v1/raw/${file.id}${queryParams ? `?${queryParams}` : ''}`;
  const botDirectUrl = `${origin}/api/v1/raw/${file.id}${keyParam ? `?${keyParam}` : ''}`;
  const downloadUrl = `${origin}/api/v1/files/${file.id}/download${queryParams ? `?${queryParams}` : ''}`;

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const mime = file.mimeType || '';

  const isImage = mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext);
  const isVideo = mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v'].includes(ext);
  const isAudio = mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext);
  const isPdf = mime.includes('pdf') || ext === 'pdf';

  const handleCopyBotUrl = () => {
    navigator.clipboard.writeText(botDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownload = () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isImage ? 'bg-emerald-50 text-emerald-600' :
              isVideo ? 'bg-purple-50 text-purple-600' :
              isAudio ? 'bg-amber-50 text-amber-600' :
              isPdf ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {isImage && <ImageIcon className="w-4 h-4" />}
              {isVideo && <Film className="w-4 h-4" />}
              {isAudio && <Music className="w-4 h-4" />}
              {isPdf && <FileText className="w-4 h-4" />}
              {!isImage && !isVideo && !isAudio && !isPdf && <FileText className="w-4 h-4" />}
            </div>

            <div className="overflow-hidden">
              <h3 className="font-bold text-sm text-slate-900 truncate">{file.name}</h3>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{file.size || 'Calculated'}</span>
                <span>•</span>
                <span className="uppercase font-mono text-[10px] text-slate-500 font-semibold">{ext || 'MEDIA'}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {isImage && (
              <div className="hidden sm:flex items-center bg-slate-100 rounded-full p-0.5 mr-1 border border-slate-200/60">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1 font-semibold text-slate-600">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white cursor-pointer"
                  title="Rotate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleCopyBotUrl}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-50 text-[#0b57d0] hover:bg-blue-100 border border-blue-100'
              }`}
              title="Copy direct stream link for Telegram/Discord bots"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Bot className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied Bot URL' : 'Copy Bot Link'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Download to Device"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Preview Container */}
        <div className="flex-1 bg-[#f8fafd] flex items-center justify-center p-4 overflow-hidden relative">
          {mediaError ? (
            <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-sm space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Media Preview Unavailable</h4>
              <p className="text-xs text-slate-500">
                You can download the file directly or use the bot API stream endpoint.
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-2 bg-[#0b57d0] text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
              >
                Download File
              </button>
            </div>
          ) : isImage ? (
            /* IMAGE VIEWER */
            <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={mediaUrl}
                alt={file.name}
                onError={() => setMediaError(true)}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : isVideo ? (
            /* VIDEO PLAYER */
            <div className="w-full h-full flex flex-col items-center justify-center max-w-3xl">
              <video
                controls
                autoPlay={false}
                playsInline
                src={mediaUrl}
                onError={() => setMediaError(true)}
                className="max-h-full max-w-full rounded-2xl shadow-lg bg-black"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAudio ? (
            /* AUDIO PLAYER */
            <div className="p-8 bg-white rounded-3xl border border-slate-200/90 shadow-md max-w-md w-full text-center space-y-5">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto shadow-inner">
                <Music className="w-10 h-10 animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 truncate">{file.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{file.size || 'Audio Stream'}</p>
              </div>

              <audio
                controls
                src={mediaUrl}
                onError={() => setMediaError(true)}
                className="w-full"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : isPdf ? (
            /* PDF VIEWER */
            <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <iframe
                src={`${mediaUrl}#toolbar=1`}
                title={file.name}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            /* GENERAL / BINARY FILE */
            <div className="text-center p-8 bg-white rounded-3xl border border-slate-200/90 shadow-md max-w-md w-full space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0b57d0] mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 truncate">{file.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{file.mimeType || 'Binary file'}</p>
                <p className="text-xs text-slate-400 font-medium">{file.size || '0 B'}</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 px-4 bg-[#0b57d0] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download File</span>
                </button>

                <button
                  onClick={handleCopyBotUrl}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span>Copy Bot Link</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Bot Integration Snippet */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-3 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-800 flex items-center gap-1 shrink-0">
              <Bot className="w-3.5 h-3.5 text-emerald-600" /> Bot Stream URL:
            </span>
            <span className="font-mono text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60 truncate max-w-sm sm:max-w-md select-all">
              {botDirectUrl}
            </span>
          </div>

          <button
            onClick={handleCopyBotUrl}
            className="text-xs text-[#0b57d0] font-semibold hover:underline shrink-0 cursor-pointer"
          >
            {copiedLink ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
