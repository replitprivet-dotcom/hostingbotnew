import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Globe, 
  ArrowUpRight, 
  RefreshCw, 
  Send, 
  FileCode, 
  Sparkles, 
  Key, 
  Check, 
  Clock,
  Code2
} from 'lucide-react';
import { UserFile, GitHubRepoConfig, GitHubPushRecord } from '../types';

interface GitHubSyncProps {
  files: UserFile[];
  mainPyContent?: string;
  onRefreshTelemetry?: () => void;
}

export const GitHubSync: React.FC<GitHubSyncProps> = ({
  files,
  mainPyContent,
  onRefreshTelemetry,
}) => {
  // Load saved GitHub config from localStorage
  const [config, setConfig] = useState<GitHubRepoConfig>(() => {
    try {
      const saved = localStorage.getItem('jarvis_github_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      owner: 'replitprivet-dotcom',
      repo: 'hostingbotnew',
      branch: 'main',
      token: '',
      connected: true,
    };
  });

  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  // Push state
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [customPath, setCustomPath] = useState<string>('main.py');
  const [commitMessage, setCommitMessage] = useState<string>(
    'feat(jarvis): deploy autonomous self-healing telegram bot daemon'
  );
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [lastCommitUrl, setLastCommitUrl] = useState<string | null>(null);
  const [lastFileUrl, setLastFileUrl] = useState<string | null>(null);

  // Push History
  const [pushHistory, setPushHistory] = useState<GitHubPushRecord[]>([]);

  // Fetch Push History
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/github/history');
      const data = await res.json();
      if (data.history) {
        setPushHistory(data.history);
      }
    } catch (e) {
      console.warn('Failed to fetch github history:', e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Update selected file & default path
  const handleSelectFile = (fileId: string) => {
    setSelectedFileId(fileId);
    const f = files.find((item) => item.id === fileId);
    if (f) {
      setCustomPath(f.name);
    }
  };

  // Helper to parse repo input if user pastes full URL
  const handleRepoChange = (val: string) => {
    let clean = val.trim();
    if (clean.includes('github.com/')) {
      const parts = clean.split('github.com/')[1].split('/');
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/, '');
        setConfig((prev) => {
          const next = { ...prev, owner, repo, connected: false };
          localStorage.setItem('jarvis_github_config', JSON.stringify(next));
          return next;
        });
        return;
      }
    } else if (clean.includes('/')) {
      const [owner, repo] = clean.split('/');
      setConfig((prev) => {
        const next = { ...prev, owner: owner.trim(), repo: repo.trim(), connected: false };
        localStorage.setItem('jarvis_github_config', JSON.stringify(next));
        return next;
      });
      return;
    }

    setConfig((prev) => {
      const next = { ...prev, repo: clean, connected: false };
      localStorage.setItem('jarvis_github_config', JSON.stringify(next));
      return next;
    });
  };

  // Verify GitHub Connection
  const handleVerifyConnection = async () => {
    if (!config.owner || !config.repo) {
      setVerifyError('Please enter both repository Owner and Repository Name (or GitHub URL).');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);
    setVerifySuccess(null);

    try {
      const res = await fetch('/api/github/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: config.owner,
          repo: config.repo,
          branch: config.branch || 'main',
          token: config.token,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify repository');
      }

      const updatedConfig: GitHubRepoConfig = {
        ...config,
        connected: true,
        repoDetails: data.repoDetails,
      };
      setConfig(updatedConfig);
      localStorage.setItem('jarvis_github_config', JSON.stringify(updatedConfig));
      setVerifySuccess(`Connected to ${data.repoDetails.fullName} on branch [${config.branch || 'main'}]!`);
    } catch (err: any) {
      setVerifyError(err.message);
      setConfig((prev) => ({ ...prev, connected: false }));
    } finally {
      setIsVerifying(false);
    }
  };

  // Push Active Code to GitHub
  const handlePushCode = async (targetFileId?: string, overridePath?: string) => {
    if (!config.owner || !config.repo) {
      setPushError('Please connect a GitHub repository first.');
      return;
    }

    if (!config.token) {
      setPushError('GitHub Personal Access Token is required to push code. Please enter your token with "repo" scope.');
      return;
    }

    const fid = targetFileId || selectedFileId || files[0]?.id;
    const targetFile = files.find((f) => f.id === fid);
    let contentToPush = targetFile?.content || '';

    // If pushing main.py specifically, prefer mainPyContent
    if ((targetFile?.name === 'main.py' || overridePath === 'main.py') && mainPyContent) {
      contentToPush = mainPyContent;
    }

    if (!contentToPush) {
      // Try to fetch latest main.py from disk
      try {
        const res = await fetch('/api/main-py');
        const data = await res.json();
        if (data.content) contentToPush = data.content;
      } catch {
        // fallback
      }
    }

    if (!contentToPush) {
      setPushError('No file content found to push.');
      return;
    }

    const filePath = overridePath || customPath || targetFile?.name || 'main.py';

    setIsPushing(true);
    setPushSuccess(null);
    setPushError(null);
    setLastCommitUrl(null);
    setLastFileUrl(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: config.owner,
          repo: config.repo,
          branch: config.branch || 'main',
          path: filePath,
          content: contentToPush,
          message: commitMessage,
          token: config.token,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to push code to GitHub');
      }

      setPushSuccess(`Pushed "${filePath}" to ${config.owner}/${config.repo} (${config.branch || 'main'})!`);
      if (data.commit?.htmlUrl) setLastCommitUrl(data.commit.htmlUrl);
      if (data.fileUrl) setLastFileUrl(data.fileUrl);

      fetchHistory();
      if (onRefreshTelemetry) onRefreshTelemetry();
    } catch (err: any) {
      setPushError(err.message);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Quick 1-Click Push for main.py */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                GitHub Repository Synchronization
              </span>
            </div>

            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Github className="w-5 h-5 text-indigo-400" />
              Push Autonomous Healed Bot to GitHub
            </h2>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Connect your GitHub repository to directly push <code className="text-cyan-300 font-mono">main.py</code> (featuring DeepSeek-V3 autonomous healing, package auto-installer, and non-root protection) with instant commit tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => handlePushCode(undefined, 'main.py')}
              disabled={isPushing || !config.connected}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-extrabold rounded-lg text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              title={config.connected ? 'Push main.py directly to GitHub' : 'Connect repository below to enable push'}
            >
              <GitCommit className="w-5 h-5" />
              {isPushing ? 'Pushing to GitHub...' : 'Push main.py to GitHub'}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {pushSuccess && (
          <div className="mt-5 p-3.5 bg-emerald-950/70 border border-emerald-600/50 rounded-lg text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{pushSuccess}</span>
            </div>
            <div className="flex items-center gap-3">
              {lastCommitUrl && (
                <a
                  href={lastCommitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 underline flex items-center gap-1 font-bold text-xs"
                >
                  <span>View Commit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {lastFileUrl && (
                <a
                  href={lastFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-300 hover:text-indigo-200 underline flex items-center gap-1 font-bold text-xs"
                >
                  <span>View File</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {pushError && (
          <div className="mt-5 p-3.5 bg-rose-950/70 border border-rose-600/50 rounded-lg text-xs text-rose-200 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{pushError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Connection Configuration & Push Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Repository Connection (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Github className="w-4 h-4 text-indigo-400" />
                Repository Connection
              </h3>
              {config.connected ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Connected
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  Not Connected
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Connect your GitHub repository via Personal Access Token to commit code directly from this studio.
            </p>

            <div className="space-y-3.5">
              {/* Repository Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  GitHub Repository (owner/repo or URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. username/telegram-bot or https://github.com/..."
                    value={config.owner && config.repo ? `${config.owner}/${config.repo}` : config.repo || ''}
                    onChange={(e) => handleRepoChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
              </div>

              {/* Target Branch */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Branch
                  </label>
                  <input
                    type="text"
                    placeholder="main"
                    value={config.branch}
                    onChange={(e) => {
                      const branch = e.target.value;
                      setConfig((prev) => {
                        const next = { ...prev, branch, connected: false };
                        localStorage.setItem('jarvis_github_config', JSON.stringify(next));
                        return next;
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-indigo-400 font-mono"
                  />
                </div>

                <div className="flex items-end gap-1 pb-1">
                  {['main', 'master', 'dev'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setConfig((prev) => {
                          const next = { ...prev, branch: b, connected: false };
                          localStorage.setItem('jarvis_github_config', JSON.stringify(next));
                          return next;
                        });
                      }}
                      className={`text-[11px] px-2 py-1.5 rounded font-mono border transition-colors ${
                        config.branch === b
                          ? 'bg-indigo-950 border-indigo-600 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* GitHub Token Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    Personal Access Token (PAT)
                  </label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=JARVIS_Bot_Hosting_Sync"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                  >
                    <span>Generate token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                    value={config.token}
                    onChange={(e) => {
                      const token = e.target.value;
                      setConfig((prev) => {
                        const next = { ...prev, token, connected: false };
                        localStorage.setItem('jarvis_github_config', JSON.stringify(next));
                        return next;
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 pr-16 text-xs text-slate-100 outline-none focus:border-indigo-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-2 top-2.5 text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded bg-slate-800 font-mono"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Requires <code className="text-slate-400 font-mono">repo</code> scope for private repos or <code className="text-slate-400 font-mono">public_repo</code> for public repos.
                </p>
              </div>

              {/* Verified Repo Card */}
              {config.connected && config.repoDetails && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {config.repoDetails.ownerAvatar && (
                        <img
                          src={config.repoDetails.ownerAvatar}
                          alt="avatar"
                          className="w-5 h-5 rounded-full ring-1 ring-slate-700"
                        />
                      )}
                      <span className="font-mono font-bold text-slate-200">
                        {config.repoDetails.fullName}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {config.repoDetails.isPrivate ? (
                        <>
                          <Lock className="w-3 h-3 text-amber-400" />
                          Private
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-cyan-400" />
                          Public
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {config.repoDetails.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-indigo-400" />
                      Default: <code className="text-indigo-300">{config.repoDetails.defaultBranch}</code>
                    </span>
                    <a
                      href={config.repoDetails.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      <span>Open Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Verify Alerts */}
              {verifyError && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-700 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifySuccess && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{verifySuccess}</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleVerifyConnection}
              disabled={isVerifying}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Testing Connection...' : 'Test & Save GitHub Connection'}
            </button>
          </div>
        </div>

        {/* Right Column: Code Push Configurator (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              Push Code Changes to GitHub
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select which workspace file and target path in the repository to update.
            </p>

            <div className="space-y-4">
              
              {/* File Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Workspace File
                  </label>
                  <select
                    value={selectedFileId}
                    onChange={(e) => handleSelectFile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-cyan-400 font-mono"
                  >
                    {files.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.healed ? '⚡ (JARVIS Healed)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Path in Repository
                  </label>
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    placeholder="e.g. main.py or src/main.py"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {/* Commit Message */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Commit Message
                </label>
                <textarea
                  rows={2}
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 outline-none focus:border-cyan-400 font-mono resize-none"
                />

                {/* Preset Suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-500 self-center mr-1">Quick message:</span>
                  {[
                    'feat(bot): add DeepSeek-V3 autonomous healer',
                    'fix: resolve useradd and permission root crash',
                    'chore: sync main.py with cloud studio',
                  ].map((msg) => (
                    <button
                      key={msg}
                      type="button"
                      onClick={() => setCommitMessage(msg)}
                      className="text-[10px] px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-slate-700 transition-colors"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Details Summary */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="text-slate-200">
                    {config.owner && config.repo ? `${config.owner}/${config.repo}` : 'Not connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Branch:</span>
                  <span className="text-indigo-400">{config.branch || 'main'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target File:</span>
                  <span className="text-cyan-400">{customPath}</span>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Creates Git commit via GitHub Contents API
            </span>

            <button
              onClick={() => handlePushCode()}
              disabled={isPushing || !config.connected}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <GitCommit className="w-4 h-4" />
              {isPushing ? 'Pushing Commit...' : 'Push to GitHub'}
            </button>
          </div>

        </div>

      </div>

      {/* Push History Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-indigo-400" />
            GitHub Commit & Push Activity
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {pushHistory.length} recorded commits
          </span>
        </div>

        <div className="divide-y divide-slate-800">
          {pushHistory.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No commits pushed yet. Connect a repository above to push your first commit!
            </div>
          ) : (
            pushHistory.map((rec) => (
              <div
                key={rec.id}
                className="p-4 hover:bg-slate-950/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="flex items-start md:items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center flex-shrink-0">
                    <GitCommit className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span>{rec.commitMessage}</span>
                      <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800">
                        {rec.commitSha}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Path: <code>{rec.filePath}</code></span>
                      <span>•</span>
                      <span>Branch: <code>{rec.branch}</code></span>
                      <span>•</span>
                      <span>Repo: <code>{rec.repo}</code></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400">
                  <span className="text-[11px]">{rec.pushedAt}</span>
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    PUSHED
                  </span>
                  {rec.commitUrl && (
                    <a
                      href={rec.commitUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                      title="Open commit on GitHub"
                    >
                      <span>Commit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
