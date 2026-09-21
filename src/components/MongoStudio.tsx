import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  RefreshCw,
  Download,
  Upload,
  Code,
  Cloud,
  FileJson,
  Play,
  Filter,
  Sparkles,
  Check,
  Copy,
  AlertCircle,
  Table,
  Eye,
  ArrowRight,
  FolderGit2
} from 'lucide-react';
import { DriveUser, ApiKeyRecord, MongoCollectionInfo, MongoDocument } from '../types';

interface MongoStudioProps {
  user: DriveUser;
  activeApiKey: string;
  onBackToDrive: () => void;
}

export function MongoStudio({
  user,
  activeApiKey,
  onBackToDrive
}: MongoStudioProps) {
  // Collections state
  const [collections, setCollections] = useState<MongoCollectionInfo[]>([]);
  const [activeCollection, setActiveCollection] = useState<string>('');
  const [isLoadingCols, setIsLoadingCols] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<MongoDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docCount, setDocCount] = useState<number>(0);

  // Query / Filter state
  const [queryInput, setQueryInput] = useState<string>('{}');
  const [sortInput, setSortInput] = useState<string>('{"_createdAt": -1}');
  const [queryError, setQueryError] = useState<string | null>(null);

  // Active Document Modal / Editor
  const [editingDoc, setEditingDoc] = useState<MongoDocument | null>(null);
  const [docJsonInput, setDocJsonInput] = useState<string>('');
  const [isNewDocModal, setIsNewDocModal] = useState<boolean>(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSavingDoc, setIsSavingDoc] = useState(false);

  // Driver Code View ('python' | 'node' | 'curl')
  const [activeSnippetTab, setActiveSnippetTab] = useState<'python' | 'node' | 'curl'>('python');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Drive sync state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Fetch collections on mount
  useEffect(() => {
    loadCollections();
  }, [activeApiKey]);

  // When active collection changes, load documents
  useEffect(() => {
    if (activeCollection) {
      loadDocuments(activeCollection);
    } else {
      setDocuments([]);
      setDocCount(0);
    }
  }, [activeCollection]);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (activeApiKey) {
      headers['x-api-key'] = activeApiKey;
    } else if (user.accessToken) {
      headers['Authorization'] = `Bearer ${user.accessToken}`;
    }
    return headers;
  };

  const loadCollections = async () => {
    setIsLoadingCols(true);
    try {
      const res = await fetch('/api/v1/db', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const list: MongoCollectionInfo[] = data.collections || [];
        setCollections(list);
        if (list.length > 0 && (!activeCollection || !list.find(c => c.name === activeCollection))) {
          setActiveCollection(list[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
    } finally {
      setIsLoadingCols(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newColName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!clean) return;

    setIsCreatingCol(true);
    try {
      const res = await fetch('/api/v1/db', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: clean }),
      });
      if (res.ok) {
        setNewColName('');
        await loadCollections();
        setActiveCollection(clean);
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setIsCreatingCol(false);
    }
  };

  const handleDropCollection = async (colName: string) => {
    if (!window.confirm(`Are you sure you want to drop collection "${colName}" and all its documents?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/db/${colName}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        await loadCollections();
        if (activeCollection === colName) {
          setActiveCollection('');
        }
      }
    } catch (err) {
      console.error('Failed to drop collection:', err);
    }
  };

  const loadDocuments = async (colName: string, queryStr?: string, sortStr?: string) => {
    setIsLoadingDocs(true);
    setQueryError(null);
    try {
      let filterObj = {};
      let sortObj = { _createdAt: -1 };

      const qToParse = queryStr !== undefined ? queryStr : queryInput;
      if (qToParse.trim()) {
        try {
          filterObj = JSON.parse(qToParse);
        } catch {
          setQueryError('Invalid JSON filter format');
          setIsLoadingDocs(false);
          return;
        }
      }

      const sToParse = sortStr !== undefined ? sortStr : sortInput;
      if (sToParse.trim()) {
        try {
          sortObj = JSON.parse(sToParse);
        } catch {
          // ignore sort parsing error
        }
      }

      const res = await fetch(`/api/v1/db/${colName}/find`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          query: filterObj,
          sort: sortObj,
          limit: 100,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        setDocCount(data.totalMatched ?? data.count ?? 0);
      } else {
        const errText = await res.text();
        setQueryError(`Query error: ${errText}`);
      }
    } catch (err: any) {
      setQueryError(`Network error: ${err.message}`);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleExecuteQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCollection) {
      loadDocuments(activeCollection, queryInput, sortInput);
    }
  };

  const handleOpenNewDocModal = () => {
    const defaultTemplate = {
      name: 'Sample Item',
      value: 100,
      status: 'active',
      tags: ['bot', 'kaalix'],
      data: { key: 'value' },
    };
    setDocJsonInput(JSON.stringify(defaultTemplate, null, 2));
    setEditingDoc(null);
    setIsNewDocModal(true);
    setJsonError(null);
  };

  const handleOpenEditDocModal = (doc: MongoDocument) => {
    // Exclude system fields from editable body for cleaner UX
    const { _id, _createdAt, _updatedAt, ...editable } = doc;
    setDocJsonInput(JSON.stringify(editable, null, 2));
    setEditingDoc(doc);
    setIsNewDocModal(false);
    setJsonError(null);
  };

  const handleSaveDocument = async () => {
    setJsonError(null);
    let parsed: any;
    try {
      parsed = JSON.parse(docJsonInput);
    } catch {
      setJsonError('Invalid JSON format. Please check brackets and quotes.');
      return;
    }

    setIsSavingDoc(true);
    try {
      if (editingDoc) {
        // Update existing document via PUT
        const res = await fetch(`/api/v1/db/${activeCollection}/${editingDoc._id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(parsed),
        });
        if (res.ok) {
          setEditingDoc(null);
          loadDocuments(activeCollection);
        } else {
          const err = await res.json();
          setJsonError(err.error || 'Failed to update document');
        }
      } else {
        // Insert new document via POST
        const res = await fetch(`/api/v1/db/${activeCollection}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(parsed),
        });
        if (res.ok) {
          setIsNewDocModal(false);
          loadDocuments(activeCollection);
          loadCollections();
        } else {
          const err = await res.json();
          setJsonError(err.error || 'Failed to insert document');
        }
      }
    } catch (err: any) {
      setJsonError(err.message || 'Network error while saving document');
    } finally {
      setIsSavingDoc(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm('Delete this document from collection?')) return;
    try {
      const res = await fetch(`/api/v1/db/${activeCollection}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        loadDocuments(activeCollection);
        loadCollections();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleBackupToDrive = async () => {
    setIsBackingUp(true);
    setBackupMessage(null);
    try {
      const res = await fetch('/api/v1/db/backup-to-drive', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMessage(`Synced! Backed up ${data.collectionsCount} collections to Google Drive.`);
      } else {
        setBackupMessage(`Backup failed: ${data.error || 'Could not sync'}`);
      }
    } catch (err: any) {
      setBackupMessage(`Error: ${err.message}`);
    } finally {
      setIsBackingUp(false);
      setTimeout(() => setBackupMessage(null), 5000);
    }
  };

  const handleExportJson = () => {
    if (!activeCollection || documents.length === 0) return;
    const blob = new Blob([JSON.stringify(documents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCollection}_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate code snippets
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kaalix-cloud.local';
  const effectiveKey = activeApiKey || 'YOUR_KAALIX_API_KEY';
  const effectiveCol = activeCollection || 'users';

  const pythonSnippet = `# Python 3 (Requests) - Connect & Query Kaalix NoSQL MongoDB
import requests

BASE_URL = "${baseUrl}/api/v1/db"
API_KEY = "${effectiveKey}"
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}

# 1. Insert Document
doc = {"username": "simran_bot", "credits": 500, "status": "active"}
res = requests.post(f"{BASE_URL}/${effectiveCol}", headers=HEADERS, json=doc)
print("Inserted:", res.json())

# 2. Query with MongoDB operators ($gte, $in, $regex)
query = {
    "query": {"credits": {"$gte": 100}, "status": "active"},
    "sort": {"_createdAt": -1},
    "limit": 10
}
search_res = requests.post(f"{BASE_URL}/${effectiveCol}/find", headers=HEADERS, json=query)
print("Documents:", search_res.json()["documents"])
`;

  const nodeSnippet = `// Node.js (Fetch) - Connect & Query Kaalix NoSQL MongoDB
const BASE_URL = "${baseUrl}/api/v1/db";
const API_KEY = "${effectiveKey}";
const HEADERS = { "x-api-key": API_KEY, "Content-Type": "application/json" };

// 1. Insert Document
const insertRes = await fetch(\`\${BASE_URL}/${effectiveCol}\`, {
  method: "POST",
  headers: HEADERS,
  body: JSON.stringify({ userId: 101, plan: "enterprise", status: "online" })
});
console.log(await insertRes.json());

// 2. Query Documents with MongoDB Syntax
const queryRes = await fetch(\`\${BASE_URL}/${effectiveCol}/find\`, {
  method: "POST",
  headers: HEADERS,
  body: JSON.stringify({
    query: { status: "online" },
    limit: 20
  })
});
const data = await queryRes.json();
console.log("Documents:", data.documents);
`;

  const curlSnippet = `# 1. Insert a document
curl -X POST "${baseUrl}/api/v1/db/${effectiveCol}" \\
  -H "x-api-key: ${effectiveKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Jarvis", "role": "admin", "level": 99}'

# 2. Find documents
curl -X POST "${baseUrl}/api/v1/db/${effectiveCol}/find" \\
  -H "x-api-key: ${effectiveKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": {"role": "admin"}, "limit": 10}'
`;

  const getActiveCode = () => {
    if (activeSnippetTab === 'python') return pythonSnippet;
    if (activeSnippetTab === 'node') return nodeSnippet;
    return curlSnippet;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  Kaalix MongoDB Studio
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800">
                  NoSQL Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Embedded document store & REST database for Python, Telegram bots, and backend apps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackupToDrive}
              disabled={isBackingUp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              title="Backup MongoDB database snapshots to your Google Drive"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isBackingUp ? 'Syncing...' : 'Backup to Drive'}</span>
            </button>

            <button
              onClick={onBackToDrive}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              Return to Drive
            </button>
          </div>
        </div>

        {backupMessage && (
          <div className="max-w-7xl mx-auto mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center justify-between">
            <span>{backupMessage}</span>
          </div>
        )}
      </header>

      {/* Main Studio Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Collections Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Collections ({collections.length})
                </h2>
              </div>
              <button
                onClick={loadCollections}
                disabled={isLoadingCols}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Refresh collections"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCols ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Create Collection Form */}
            <form onSubmit={handleCreateCollection} className="flex gap-1.5 mb-3">
              <input
                type="text"
                placeholder="New collection name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isCreatingCol || !newColName.trim()}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                title="Create Collection"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Collections List */}
            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {collections.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No collections yet. Create one to begin storing NoSQL documents.
                </div>
              ) : (
                collections.map((col) => (
                  <div
                    key={col.name}
                    onClick={() => setActiveCollection(col.name)}
                    className={`group flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      activeCollection === col.name
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileJson className={`w-3.5 h-3.5 shrink-0 ${activeCollection === col.name ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="truncate">{col.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 group-hover:bg-white text-slate-500 font-mono">
                        {col.documentCount ?? col.count ?? 0}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDropCollection(col.name);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                        title="Drop collection"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Database Status</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">Collections</span>
                <span className="text-sm font-bold text-slate-800">{collections.length}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">Total Docs</span>
                <span className="text-sm font-bold text-slate-800">
                  {collections.reduce((acc, c) => acc + (c.documentCount ?? c.count ?? 0), 0)}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              Storage: Local JSON files in <code className="text-slate-600">.kaalix_mongodb/</code> with Drive backup.
            </div>
          </div>
        </div>

        {/* Center & Right Column: Document Explorer & Query Console */}
        <div className="lg:col-span-9 space-y-4">
          {/* Query Filter & Action Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Collection:</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                  {activeCollection || 'none selected'}
                </span>
                <span className="text-xs text-slate-500">
                  ({docCount} documents matched)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJson}
                  disabled={!activeCollection || documents.length === 0}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                  title="Export to JSON file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                <button
                  onClick={handleOpenNewDocModal}
                  disabled={!activeCollection}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Document</span>
                </button>
              </div>
            </div>

            {/* MongoDB Query Bar */}
            <form onSubmit={handleExecuteQuery} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-8 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50/50 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-mono text-slate-400 select-none">find(</span>
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder='{"status": "active", "score": {"$gte": 50}}'
                    className="flex-1 bg-transparent text-xs font-mono text-slate-800 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400 select-none">)</span>
                </div>

                <div className="md:col-span-4 flex gap-1.5">
                  <input
                    type="text"
                    value={sortInput}
                    onChange={(e) => setSortInput(e.target.value)}
                    placeholder='sort: {"_createdAt": -1}'
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingDocs || !activeCollection}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {queryError && (
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{queryError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {isLoadingDocs ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading documents from {activeCollection}...
              </div>
            ) : documents.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FileJson className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {activeCollection
                      ? `Collection "${activeCollection}" is currently empty or no documents matched your query.`
                      : 'Select or create a collection on the left to explore documents.'}
                  </p>
                </div>
                {activeCollection && (
                  <button
                    onClick={handleOpenNewDocModal}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert First Document</span>
                  </button>
                )}
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">_id:</span>
                      <code className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {doc._id}
                      </code>
                      <span className="text-[10px] text-slate-400">
                        {doc._createdAt ? new Date(doc._createdAt).toLocaleString() : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDocModal(doc)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Document"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Document Body JSON display */}
                  <pre className="text-xs font-mono bg-slate-50/80 p-3 rounded-xl overflow-x-auto text-slate-800 border border-slate-100">
                    {JSON.stringify(doc, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>

          {/* Integration & Code Snippets Box */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Bot & Python Integration Code (Copy & Paste)
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <div className="flex p-0.5 bg-slate-100 rounded-xl text-xs">
                  <button
                    onClick={() => setActiveSnippetTab('python')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeSnippetTab === 'python' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Python (Requests)
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('node')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeSnippetTab === 'node' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Node.js / TS
                  </button>
                  <button
                    onClick={() => setActiveSnippetTab('curl')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeSnippetTab === 'curl' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    cURL
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer ml-2"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-3.5 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
              {getActiveCode()}
            </pre>
          </div>
        </div>
      </div>

      {/* Insert / Edit Document Modal */}
      {(isNewDocModal || editingDoc) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingDoc ? `Edit Document (${editingDoc._id})` : `Insert into ${activeCollection}`}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNewDocModal(false);
                  setEditingDoc(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Document JSON Body:
              </label>
              <textarea
                rows={10}
                value={docJsonInput}
                onChange={(e) => {
                  setDocJsonInput(e.target.value);
                  if (jsonError) setJsonError(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
              />
              {jsonError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {jsonError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsNewDocModal(false);
                  setEditingDoc(null);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDocument}
                disabled={isSavingDoc}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingDoc ? 'Saving...' : editingDoc ? 'Update Document' : 'Insert Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
