import React, { useState } from 'react';
import { 
  Key, 
  Terminal, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Code2, 
  Send,
  Cloud,
  FileCode,
  Download,
  Folder,
  Layers,
  Sparkles,
  Bot,
  ExternalLink,
  Info,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  X
} from 'lucide-react';
import { ApiKeyRecord, DriveUser } from '../types';
import { maskApiKey } from '../utils/privacy';

interface ApiKeyManagerProps {
  user: DriveUser;
  apiKeys: ApiKeyRecord[];
  onGenerateKey: (name: string) => Promise<void>;
  onRevokeKey: (key: string) => Promise<void>;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  user,
  apiKeys,
  onGenerateKey,
  onRevokeKey,
}) => {
  const [keyName, setKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'keys' | 'endpoints' | 'bot_code' | 'playground'>('keys');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyRecord | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Playground state
  const [testEndpoint, setTestEndpoint] = useState('/api/v1/files');
  const [testMethod, setTestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [testBody, setTestBody] = useState('{\n  "name": "bot_test.py",\n  "content": "print(\'Hello from Kaalix Cloud Bot!\')"\n}');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const toggleRevealKey = (key: string) => {
    setRevealedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmRevoke = async () => {
    if (!keyToRevoke) return;
    setIsRevoking(true);
    try {
      await onRevokeKey(keyToRevoke.key);
      setKeyToRevoke(null);
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    setIsGenerating(true);
    try {
      await onGenerateKey(keyName);
      setKeyName('');
    } finally {
      setIsGenerating(false);
    }
  };

  const activeKeyStr = apiKeys[0]?.key || 'cdk_YOUR_API_KEY_HERE';
  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  const handleRunPlayground = async () => {
    if (!apiKeys.length) {
      setTestOutput(JSON.stringify({ error: 'Please generate an API key first above' }, null, 2));
      return;
    }

    setIsTesting(true);
    setTestOutput(null);
    try {
      const activeKey = apiKeys[0].key;
      const options: RequestInit = {
        method: testMethod,
        headers: {
          'x-api-key': activeKey,
          'Content-Type': 'application/json',
        },
      };

      if (['POST', 'PUT'].includes(testMethod) && testBody) {
        options.body = testBody;
      }

      const res = await fetch(testEndpoint, options);
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        setTestOutput(JSON.stringify(json, null, 2));
      } else {
        const text = await res.text();
        setTestOutput(text);
      }
    } catch (err: any) {
      setTestOutput(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  const endpointsList = [
    {
      method: 'GET',
      path: '/api/v1/ping',
      badge: 'Heartbeat & Ping',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Bot Latency & Auth Ping',
      description: 'Quick latency and credentials check for bots, scripts, and health-check cron jobs.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/ping"`,
      queryParamExample: `${originUrl}/api/v1/ping?api_key=${activeKeyStr}`,
    },
    {
      method: 'GET',
      path: '/api/v1/raw/:fileId',
      badge: 'Bot Favorite',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Direct Raw File Stream',
      description: 'Returns plain text or raw binary stream directly (ideal for Telegram bots, python scripts, curl to read files without JSON formatting).',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/raw/<FILE_ID>"`,
      queryParamExample: `${originUrl}/api/v1/raw/<FILE_ID>?api_key=${activeKeyStr}`,
    },
    {
      method: 'GET',
      path: '/api/v1/files/:fileId/stream',
      badge: 'Media Seeking',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      title: 'Byte-Range Media Stream (HTML5 Video/Audio)',
      description: 'Supports HTTP 206 partial content for seeking videos, VLC playback, podcasts, and telegram voice notes.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  -H "Range: bytes=0-1048576" \\\n  "${originUrl}/api/v1/files/<FILE_ID>/stream"`,
      queryParamExample: `${originUrl}/api/v1/files/<FILE_ID>/stream?api_key=${activeKeyStr}`,
    },
    {
      method: 'GET',
      path: '/api/v1/files/:fileId/text',
      badge: 'Script Pipe',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      title: 'Raw Plain Text / Code Extract',
      description: 'Returns UTF-8 plaintext without JSON wrappers. Perfect for pipe into bash: curl -s .../text | python3',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/files/<FILE_ID>/text"`,
    },
    {
      method: 'GET',
      path: '/api/v1/files/:fileId/download',
      badge: 'Direct Download',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Direct File Download with Headers',
      description: 'Downloads the file with attachment headers and exact filename preserving extensions.',
      curl: `curl -O -J -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/files/<FILE_ID>/download"`,
      queryParamExample: `${originUrl}/api/v1/files/<FILE_ID>/download?api_key=${activeKeyStr}`,
    },
    {
      method: 'GET',
      path: '/api/v1/files/:fileId/details',
      badge: 'Metadata & Links',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      title: 'Comprehensive File Information',
      description: 'Returns full metadata including direct raw link, download link, size, and modified timestamp.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/files/<FILE_ID>/details"`,
    },
    {
      method: 'GET',
      path: '/api/v1/files/:fileId/thumbnail',
      badge: 'Images',
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
      title: 'Image Thumbnail / Preview Stream',
      description: 'Instantly redirects or streams the rendered thumbnail image of any photo, pdf, or video.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/files/<FILE_ID>/thumbnail"`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/:fileId/share',
      badge: 'Public Links',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Generate Public Direct Link',
      description: 'Sets anyoneWithLink permissions and generates public streaming & download URLs without needing API keys.',
      curl: `curl -X POST "${originUrl}/api/v1/files/<FILE_ID>/share" \\\n  -H "x-api-key: ${activeKeyStr}"`,
    },
    {
      method: 'DELETE',
      path: '/api/v1/files/:fileId/share',
      badge: 'Revoke Link',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Revoke Public Link',
      description: 'Reverts file sharing back to strictly private mode.',
      curl: `curl -X DELETE "${originUrl}/api/v1/files/<FILE_ID>/share" \\\n  -H "x-api-key: ${activeKeyStr}"`,
    },
    {
      method: 'GET',
      path: '/api/v1/files',
      badge: 'Core',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'List Files & Folders',
      description: 'Returns all files in root or in a specific folder (use ?folderId=<ID>&limit=50).',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/files?folderId=root"`,
    },
    {
      method: 'POST',
      path: '/api/v1/files',
      badge: 'Create / Upload',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Create or Upload New File',
      description: 'Upload a text file, bot configuration, or create a new folder.',
      curl: `curl -X POST "${originUrl}/api/v1/files" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "my_bot_script.py", "content": "print(\\"Kaalix Cloud Bot\\")", "parentId": "root"}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/telegram/upload',
      badge: 'Telegram Bot',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      title: 'Telegram Bot Direct Ingestion Endpoint',
      description: 'Allows Telegram bots to send documents or base64 files straight into Google Drive.',
      curl: `curl -X POST "${originUrl}/api/v1/telegram/upload" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fileName": "bot_log.txt", "content": "Chat log data...", "botId": "@MyHostingBot"}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/upload-url',
      badge: 'Large Uploads',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Resumable Upload Session (GB Files)',
      description: 'Initiates a resumable session URI for high-speed multi-gigabyte client-to-drive file uploads.',
      curl: `curl -X POST "${originUrl}/api/v1/files/upload-url" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "archive.zip", "mimeType": "application/zip"}'`,
    },
    {
      method: 'PUT',
      path: '/api/v1/files/:fileId',
      badge: 'Update',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Update File Content',
      description: 'Overwrite file content with updated text or code.',
      curl: `curl -X PUT "${originUrl}/api/v1/files/<FILE_ID>" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"content": "# Updated code content\\nprint(\\"Bot updated!\\")"}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/batch-delete',
      badge: 'Batch Action',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: 'Bulk Delete Multiple Files',
      description: 'Delete an array of files in a single network request.',
      curl: `curl -X POST "${originUrl}/api/v1/files/batch-delete" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fileIds": ["id1", "id2", "id3"]}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/batch-move',
      badge: 'Batch Action',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      title: 'Bulk Move Multiple Files',
      description: 'Move multiple files into a destination folder in one operation.',
      curl: `curl -X POST "${originUrl}/api/v1/files/batch-move" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fileIds": ["id1", "id2"], "targetFolderId": "<FOLDER_ID>"}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/batch-star',
      badge: 'Batch Action',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      title: 'Bulk Star / Unstar Files',
      description: 'Mark or unmark multiple files as favorites/starred simultaneously.',
      curl: `curl -X POST "${originUrl}/api/v1/files/batch-star" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"fileIds": ["id1", "id2"], "starred": true}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/:fileId/move',
      badge: 'Move',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Move Single File to Folder',
      description: 'Move a file from one directory to another directory.',
      curl: `curl -X POST "${originUrl}/api/v1/files/<FILE_ID>/move" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"targetFolderId": "<FOLDER_ID>"}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/:fileId/rename',
      badge: 'Rename',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Rename File or Folder',
      description: 'Change the display name of any file or folder.',
      curl: `curl -X POST "${originUrl}/api/v1/files/<FILE_ID>/rename" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "new_filename.txt"}'`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/:fileId/copy',
      badge: 'Duplicate',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Duplicate File',
      description: 'Create an instant copy of a file with optional new name.',
      curl: `curl -X POST "${originUrl}/api/v1/files/<FILE_ID>/copy" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name": "copy_of_file.txt"}'`,
    },
    {
      method: 'DELETE',
      path: '/api/v1/files/:fileId',
      badge: 'Delete',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: 'Delete File or Move to Trash',
      description: 'Safely removes file from the cloud repository.',
      curl: `curl -X DELETE "${originUrl}/api/v1/files/<FILE_ID>" \\\n  -H "x-api-key: ${activeKeyStr}"`,
    },
    {
      method: 'GET',
      path: '/api/v1/stats',
      badge: 'Analytics',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
      title: 'Deep Storage Analytics & Breakdown',
      description: 'Returns file categories breakdown (images, videos, documents, code), largest files, and disk quotas.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/stats"`,
    },
    {
      method: 'GET',
      path: '/api/v1/folders/tree',
      badge: 'Directory Tree',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      title: 'Full Hierarchical Folder Tree',
      description: 'Returns nested directory JSON structure of all folders in My Drive.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/folders/tree"`,
    },
    {
      method: 'GET',
      path: '/api/v1/storage',
      badge: 'Quota',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Storage Metrics & Free Space',
      description: 'Check total bytes used, percent used, and available cloud limit.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/storage"`,
    },
    {
      method: 'GET',
      path: '/api/v1/search',
      badge: 'Search',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Search Files by Name or Content',
      description: 'Find files matching a query string.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/search?q=config"`,
    },
    {
      method: 'POST',
      path: '/api/v1/files/search-advanced',
      badge: 'Filter Engine',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      title: 'Advanced Multi-Filter Search',
      description: 'Filter by file type (image, video, code, document), starred status, and parent folder.',
      curl: `curl -X POST "${originUrl}/api/v1/files/search-advanced" \\\n  -H "x-api-key: ${activeKeyStr}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"type": "video", "starred": true, "limit": 20}'`,
    },
    {
      method: 'GET',
      path: '/api/v1/export/:fileId',
      badge: 'Doc Converter',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      title: 'Google Docs / Sheets Export (PDF, CSV, DOCX)',
      description: 'Convert Google Docs to PDF, DOCX, TXT or Sheets to CSV and XLSX on the fly.',
      curl: `curl -H "x-api-key: ${activeKeyStr}" \\\n  "${originUrl}/api/v1/export/<FILE_ID>?format=pdf"`,
    },
    {
      method: 'GET',
      path: '/api/v1/info',
      badge: 'API Index',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      title: 'Self-Describing API Index',
      description: 'JSON list of all available REST endpoints, authentication instructions, and features.',
      curl: `curl "${originUrl}/api/v1/info"`,
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden text-slate-800">
      {/* Top Header Card */}
      <div className="p-6 border-b border-slate-100 bg-[#ffffff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b57d0]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Kaalix Cloud API & Bot Developer Hub
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                  REST v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate API keys for your Telegram bot, Python scripts, curl, or microservices with instant raw file access.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#f0f4f9] p-1 rounded-xl border border-slate-200/70 text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'keys'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              API Keys ({apiKeys.length})
            </button>
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'endpoints'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Endpoints ({endpointsList.length})
            </button>
            <button
              onClick={() => setActiveTab('bot_code')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'bot_code'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bot Code Examples
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'playground'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Tester
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: API KEYS LIST & CREATOR */}
      {activeTab === 'keys' && (
        <div className="p-6 space-y-6">
          {/* Create Key Card */}
          <div className="bg-[#f8fafd] border border-slate-200/80 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800">Generate New Bot API Key</h3>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Telegram Bot Storage Key, Python Worker, Backup Script..."
                className="flex-1 w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={isGenerating || !keyName.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0b57d0] hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Generate API Key</span>
              </button>
            </form>
            <p className="text-[11px] text-slate-500 mt-2">
              Keys provide full programmatic access to upload, download, and stream files from your Kaalix Cloud storage.
            </p>
          </div>

          {/* Active Keys List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                Active API Keys
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {apiKeys.length} active
                </span>
              </h3>
              <span className="text-xs text-slate-500">
                Linked to {user.email}
              </span>
            </div>

            {apiKeys.length === 0 ? (
              <div className="p-8 text-center bg-[#f8fafd] border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Key className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-700">No API keys generated yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Use the box above to generate your first API key for your bot or script integration.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((k) => {
                  const isRevealed = !!revealedKeys[k.key];
                  const displayedKey = maskApiKey(k.key, isRevealed);

                  return (
                    <div
                      key={k.key}
                      className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{k.name}</span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
                          <span>{displayedKey}</span>
                          <button
                            onClick={() => toggleRevealKey(k.key)}
                            className="hover:text-blue-600 transition-colors p-0.5"
                            title={isRevealed ? "Hide Key" : "Reveal Key"}
                          >
                            {isRevealed ? (
                              <EyeOff className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(k.key)}
                            className="hover:text-blue-600 transition-colors p-0.5"
                            title="Copy Real Key"
                          >
                            {copiedKey === k.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Created {new Date(k.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleCopy(k.key)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedKey === k.key ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Key</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setKeyToRevoke(k)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Bot Integration Quickstart Card */}
          <div className="bg-[#f0f4f9] border border-blue-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#0b57d0]" />
              <h4 className="text-sm font-bold text-slate-900">How to use this API Key in your Bot</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pass your key in any HTTP request via the <code className="bg-white px-1.5 py-0.5 rounded font-mono text-slate-800 border border-slate-200">x-api-key: {activeKeyStr}</code> header, or as a query parameter <code className="bg-white px-1.5 py-0.5 rounded font-mono text-slate-800 border border-slate-200">?api_key={activeKeyStr}</code>.
            </p>
            <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <span className="truncate">curl -H "x-api-key: {activeKeyStr}" "{originUrl}/api/v1/files"</span>
              <button
                onClick={() => handleCopy(`curl -H "x-api-key: ${activeKeyStr}" "${originUrl}/api/v1/files"`)}
                className="p-1 hover:text-blue-600 text-slate-400"
                title="Copy Curl Command"
              >
                {copiedKey === `curl -H "x-api-key: ${activeKeyStr}" "${originUrl}/api/v1/files"` ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ENDPOINTS DIRECTORY */}
      {activeTab === 'endpoints' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">REST API Endpoints Directory</h3>
              <p className="text-xs text-slate-500">
                All endpoints accept authentication via <code className="bg-slate-100 px-1 rounded font-mono">x-api-key</code> header or <code className="bg-slate-100 px-1 rounded font-mono">?api_key=</code> parameter.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Host: {originUrl}
            </span>
          </div>

          <div className="space-y-3">
            {endpointsList.map((ep, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#ffffff] border border-slate-200/90 rounded-xl hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        ep.method === 'GET'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : ep.method === 'POST'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ep.method === 'PUT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-800">
                      {ep.path}
                    </span>
                    {ep.badge && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${ep.badgeColor}`}>
                        {ep.badge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopy(ep.curl)}
                    className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    {copiedKey === ep.curl ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copy cURL</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">{ep.title}:</span> {ep.description}
                </p>

                {/* cURL code block */}
                <div className="bg-[#f8fafd] border border-slate-200/80 rounded-lg p-2.5 font-mono text-[11px] text-slate-700 overflow-x-auto">
                  <pre>{ep.curl}</pre>
                </div>

                {ep.queryParamExample && (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700 shrink-0">Direct URL:</span>
                    <span className="font-mono text-blue-600 truncate">{ep.queryParamExample}</span>
                    <button
                      onClick={() => handleCopy(ep.queryParamExample!)}
                      className="ml-auto hover:text-slate-900 p-0.5 shrink-0"
                      title="Copy URL"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOT CODE EXAMPLES (PYTHON TELEGRAM BOT & NODE) */}
      {activeTab === 'bot_code' && (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Bot Integration Snippets</h3>
            <p className="text-xs text-slate-500">
              Copy-paste these tested snippets directly into your Telegram bot or Python backend.
            </p>
          </div>

          {/* Example 1: Telegram Bot / Python Requests */}
          <div className="bg-[#f8fafd] border border-slate-200/90 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Python (Telegram Bot - Upload & Stream Raw File)</h4>
              </div>
              <button
                onClick={() => handleCopy(`# Python Telegram Bot / Script Kaalix Cloud Client
import requests

API_KEY = "${activeKeyStr}"
BASE_URL = "${originUrl}"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# 1. Fetch file raw content
def get_raw_file(file_id):
    url = f"{BASE_URL}/api/v1/raw/{file_id}"
    resp = requests.get(url, headers=headers)
    return resp.text

# 2. Upload file from Telegram bot to Kaalix Cloud
def upload_file_to_cloud(filename, content):
    url = f"{BASE_URL}/api/v1/files"
    data = {
        "name": filename,
        "content": content,
        "parentId": "root"
    }
    resp = requests.post(url, headers=headers, json=data)
    return resp.json()

# 3. List recent files in cloud
def list_cloud_files():
    url = f"{BASE_URL}/api/v1/files"
    resp = requests.get(url, headers=headers)
    return resp.json().get("files", [])
`)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Python Client</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 overflow-x-auto">
              <pre className="text-slate-800 leading-relaxed">{`# Python Telegram Bot / Script Kaalix Cloud Client
import requests

API_KEY = "${activeKeyStr}"
BASE_URL = "${originUrl}"

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

# 1. Fetch raw script or document
def get_raw_file(file_id):
    url = f"{BASE_URL}/api/v1/raw/{file_id}"
    resp = requests.get(url, headers=headers)
    return resp.text

# 2. Upload bot logs or user document to Kaalix Cloud
def upload_file(filename, text_content):
    url = f"{BASE_URL}/api/v1/files"
    payload = {"name": filename, "content": text_content}
    resp = requests.post(url, headers=headers, json=payload)
    return resp.json()

# 3. List all files
files = requests.get(f"{BASE_URL}/api/v1/files", headers=headers).json()
print("Cloud files:", files)`}</pre>
            </div>
          </div>

          {/* Example 2: Node.js / JavaScript Bot */}
          <div className="bg-[#f8fafd] border border-slate-200/90 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Node.js / Express / Telegraf Bot Integration</h4>
              </div>
              <button
                onClick={() => handleCopy(`const API_KEY = "${activeKeyStr}";
const BASE_URL = "${originUrl}";

async function getRawFile(fileId) {
  const res = await fetch(\`\${BASE_URL}/api/v1/raw/\${fileId}\`, {
    headers: { 'x-api-key': API_KEY }
  });
  return await res.text();
}

async function uploadFile(name, content) {
  const res = await fetch(\`\${BASE_URL}/api/v1/files\`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, content })
  });
  return await res.json();
}`)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Node.js Client</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 overflow-x-auto">
              <pre className="text-slate-800 leading-relaxed">{`const API_KEY = "${activeKeyStr}";
const BASE_URL = "${originUrl}";

// Stream raw file for bot execution
async function getRawFile(fileId) {
  const res = await fetch(\`\${BASE_URL}/api/v1/raw/\${fileId}\`, {
    headers: { 'x-api-key': API_KEY }
  });
  return await res.text();
}

// Upload file directly from Node bot
async function uploadFile(name, content) {
  const res = await fetch(\`\${BASE_URL}/api/v1/files\`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content })
  });
  return await res.json();
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE API PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live API Tester & Simulator</h3>
            <p className="text-xs text-slate-500">
              Test your Kaalix Cloud endpoints in real-time using your active API key.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Request Builder */}
            <div className="space-y-4 bg-[#f8fafd] p-4 rounded-xl border border-slate-200">
              {/* Quick Presets */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Quick Endpoint Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('GET');
                      setTestEndpoint('/api/v1/ping');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    ⚡ Ping
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('GET');
                      setTestEndpoint('/api/v1/files');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    📁 List Files
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('GET');
                      setTestEndpoint('/api/v1/stats');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    📊 Storage Analytics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('GET');
                      setTestEndpoint('/api/v1/folders/tree');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    🌳 Folder Tree
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('GET');
                      setTestEndpoint('/api/v1/storage');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    💾 Quota
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('POST');
                      setTestEndpoint('/api/v1/files');
                      setTestBody('{\n  "name": "bot_test_file.txt",\n  "content": "Hello from Kaalix Cloud Bot!\\nTimestamp: ' + new Date().toISOString() + '"\n}');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    ➕ Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('POST');
                      setTestEndpoint('/api/v1/files/search-advanced');
                      setTestBody('{\n  "type": "document",\n  "limit": 10\n}');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    🔍 Advanced Search
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTestMethod('GET');
                      setTestEndpoint('/api/v1/info');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md border border-slate-200 transition-colors"
                  >
                    📖 API Index
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value as any)}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>

                <input
                  type="text"
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value)}
                  placeholder="/api/v1/files"
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {['POST', 'PUT'].includes(testMethod) && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    JSON Payload Body:
                  </label>
                  <textarea
                    rows={6}
                    value={testBody}
                    onChange={(e) => setTestBody(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <button
                onClick={handleRunPlayground}
                disabled={isTesting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0b57d0] hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send API Request</span>
              </button>
            </div>

            {/* Response Viewer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Live Response:</span>
                {testOutput && (
                  <button
                    onClick={() => handleCopy(testOutput)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Output
                  </button>
                )}
              </div>
              <div className="h-64 bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs overflow-auto border border-slate-800">
                {testOutput ? (
                  <pre>{testOutput}</pre>
                ) : (
                  <span className="text-slate-500 italic">
                    Click "Send API Request" to see server response here...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke API Key Confirmation Modal */}
      {keyToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs text-slate-800 animate-in fade-in duration-150">
          <div 
            className="bg-white border border-slate-200/90 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setKeyToRevoke(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900">Revoke API Key?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to revoke <strong className="text-slate-800">{keyToRevoke.name}</strong>? Any Telegram bots, Python automation, or VPS scripts using this key will immediately lose access.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-600 break-all">
              {keyToRevoke.key}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setKeyToRevoke(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Revoke Key</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
