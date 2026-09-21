import React, { useState } from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  Key, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  FolderGit2, 
  Lock, 
  Sparkles,
  Zap,
  Code,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
  Settings,
  Check,
  Copy,
  Layers,
  Globe
} from 'lucide-react';
import { 
  getActiveGoogleClientId, 
  setCustomGoogleClientId, 
  DEFAULT_GOOGLE_CLIENT_ID,
  isAuthorizedDirectOrigin,
  getSavedAccounts
} from '../utils/googleDrive';
import { DriveUser } from '../types';

interface DriveLoginViewProps {
  onLogin: () => Promise<void>;
  onDirectTokenLogin: (token: string) => Promise<void>;
  onDemoLogin: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const DriveLoginView: React.FC<DriveLoginViewProps> = ({
  onLogin,
  onDirectTokenLogin,
  onDemoLogin,
  isLoading,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'token' | 'demo'>('google');
  const [directTokenInput, setDirectTokenInput] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [showClientSettings, setShowClientSettings] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(getActiveGoogleClientId());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [savedAccounts] = useState<DriveUser[]>(() => getSavedAccounts());

  const isExternalDomain = !isAuthorizedDirectOrigin();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomGoogleClientId(clientIdInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowClientSettings(false);
    }, 1500);
  };

  const handleResetClientId = () => {
    setClientIdInput(DEFAULT_GOOGLE_CLIENT_ID);
    setCustomGoogleClientId('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setShowClientSettings(false);
    }, 1500);
  };

  const handleDirectTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directTokenInput.trim()) {
      setTokenError('Please paste your Google Drive Access Token');
      return;
    }
    setTokenError(null);
    setTokenLoading(true);
    try {
      await onDirectTokenLogin(directTokenInput.trim());
    } catch (err: any) {
      setTokenError(err.message || 'Invalid or expired token.');
    } finally {
      setTokenLoading(false);
    }
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(currentOrigin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] flex flex-col items-center justify-center p-4 select-none text-slate-800">
      <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Soft top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

        {/* Top right settings button */}
        <button
          onClick={() => setShowClientSettings(true)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Google OAuth Client Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b57d0] shadow-xs">
            <Cloud className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Kaalix Cloud
            </h1>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Private cloud storage with multimedia streaming, developer REST APIs, and instant Telegram/Discord bot access.
            </p>
          </div>
        </div>

        {/* Login Method Tabs */}
        <div className="mt-5 mb-4 grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('token')}
            className={`py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'token'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Token / API Key
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-1 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'demo'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Demo Mode
          </button>
        </div>

        {/* External Domain / Vercel Auto-Bridge Indicator */}
        {isExternalDomain && activeTab === 'google' && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900">Vercel Auto-Bridge Enabled:</span>
                <p className="text-[10px] text-emerald-700">Bypasses origin mismatch directly without Cloud Console setup.</p>
              </div>
            </div>
            <span className="font-extrabold text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded tracking-wider">
              AUTO
            </span>
          </div>
        )}

        {/* TAB 1: GOOGLE 1-CLICK SIGN-IN */}
        {activeTab === 'google' && (
          <div className="space-y-4">
            {/* Error notice if any */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed space-y-2">
                <div className="flex items-start gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setShowTroubleshoot(true)}
                    className="text-xs text-blue-600 underline font-semibold cursor-pointer"
                  >
                    Fix Error 400 / 403 Guide
                  </button>
                  <button
                    onClick={() => setActiveTab('token')}
                    className="text-xs text-emerald-700 font-bold bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md cursor-pointer"
                  >
                    Try Direct Token →
                  </button>
                </div>
              </div>
            )}

            {/* Automatic Drive Authorization Highlight Banner */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>Automatic Google Drive Authorization</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Aap jaise hi Google ke saath sign in karenge, <strong>Google Drive automatically authorize aur enable ho jayega</strong> — koi extra step ya token copy karne ki zaroorat nahi hai.
              </p>
            </div>

            {/* Previous Saved Account 1-Click Reconnect */}
            {savedAccounts.length > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Reconnect
                </div>
                {savedAccounts.slice(0, 1).map((acc) => (
                  <div key={acc.email} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {acc.picture ? (
                        <img
                          src={acc.picture}
                          alt={acc.name}
                          className="w-8 h-8 rounded-full border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {acc.name ? acc.name[0].toUpperCase() : 'G'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{acc.name || 'Google User'}</div>
                        <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={onLogin}
                      disabled={isLoading}
                      className="px-3 py-1.5 bg-[#0b57d0] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors"
                    >
                      {isLoading ? 'Connecting...' : 'Auto Connect'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Google OAuth Login Button */}
            <button
              onClick={onLogin}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-blue-500/30 hover:border-blue-600 text-slate-800 font-semibold text-sm shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-700 font-bold">Authorizing & Enabling Google Drive...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-bold text-slate-900">Sign in with Google & Enable Drive</span>
                </>
              )}
            </button>

            {/* Feature preview bullets */}
            <div className="space-y-2 pt-1 text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs">
                <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Photos, seekable videos, and raw API streaming</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All files stored in your private Google account</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT TOKEN OR DEVELOPER API KEY LOGIN */}
        {activeTab === 'token' && (
          <form onSubmit={handleDirectTokenSubmit} className="space-y-3.5">
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 leading-relaxed space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Google Token (ya29...) or Developer Key (cdk_...):</span>
              </div>
              <p>
                Enter your verified <strong>Google Drive Access Token</strong> or <strong>Kaalix Developer API Key</strong>. The server strictly verifies credentials before granting access.
              </p>
              <div className="pt-1 flex items-center justify-between">
                <a
                  href="https://developers.google.com/oauthplayground/#https://www.googleapis.com/auth/drive"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline text-[11px]"
                >
                  <span>Google OAuth Playground</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[10px] text-amber-700 font-mono bg-amber-100/70 px-2 py-0.5 rounded">
                  Strict Validation Active
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Access Token or API Key</span>
                <span className="text-[10px] text-slate-400 font-normal">ya29... or cdk_...</span>
              </label>
              <textarea
                rows={3}
                value={directTokenInput}
                onChange={(e) => {
                  setDirectTokenInput(e.target.value);
                  if (tokenError) setTokenError(null);
                }}
                placeholder="Paste Access Token (ya29...) or Kaalix Developer Key (cdk_...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {tokenError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div className="leading-snug">{tokenError}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={tokenLoading || !directTokenInput.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-[#0b57d0] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {tokenLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Strictly Validating Credentials...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Verify & Authenticate</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: DEMO STORAGE MODE */}
        {activeTab === 'demo' && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-950 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Explore in Demo Cloud Mode</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test the full interface immediately: browse pre-loaded photos, play video files, test developer REST APIs, and generate API keys without logging into Google.
              </p>
            </div>

            <button
              type="button"
              onClick={onDemoLogin}
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Launch Demo Environment</span>
            </button>
          </div>
        )}

        {/* Bottom Helper Links */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 mt-4 border-t border-slate-100">
          <button
            onClick={() => setShowTroubleshoot(true)}
            className="text-[#0b57d0] hover:underline flex items-center gap-1 cursor-pointer font-medium"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Fix Error 400 (origin_mismatch)</span>
          </button>

          <button
            onClick={() => setShowClientSettings(true)}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Custom Client ID</span>
          </button>
        </div>
      </div>

      {/* TROUBLESHOOT MODAL */}
      {showTroubleshoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">How to Fix "origin_mismatch (Error 400)"</h3>
              </div>
              <button
                onClick={() => setShowTroubleshoot(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-900 space-y-1">
                <div className="font-bold">Error 400: origin_mismatch kyun aata hai?</div>
                <div>
                  Jab aap app ko <strong>Vercel</strong> (jaise <code className="bg-white/80 px-1 py-0.5 rounded font-mono">https://google-drive-chi.vercel.app</code>) par host karte hain, Google OAuth check karta hai ki kya yeh URL Google Cloud Console ke <strong>"Authorized JavaScript origins"</strong> me added hai ya nahi.
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm">3 Aasan Solutions:</div>

                {/* Solution 1 */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                  <div className="font-semibold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                    Automatic Cloud Bridge (Sabse Aasan - No Cloud Setup Needed!):
                  </div>
                  <p className="text-emerald-900">
                    Aapko Google Cloud me kuch karne ki zaroorat nahi hai! Bas Login screen par <strong>"Continue with Google"</strong> dabayein. App automatically secure bridge popup se login karwayega jisme origin check bypass ho jata hai.
                  </p>
                </div>

                {/* Solution 2 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center">2</span>
                    Google OAuth Playground (Direct Token - 100% Works):
                  </div>
                  <p className="text-slate-600">
                    Login screen par <strong>"Direct Token"</strong> tab kholein. Wahan diye gaye Google Playground link par click karke kisi bhi Gmail account se 1 click me access token copy karke paste karein.
                  </p>
                </div>

                {/* Solution 3 */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">3</span>
                    Add Vercel Origin to Google Cloud Console (Optional):
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-600">
                    <li><a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline">console.cloud.google.com/apis/credentials</a> par jayein.</li>
                    <li>Apne OAuth 2.0 Web Client ID par click karein.</li>
                    <li><strong>"Authorized JavaScript origins"</strong> me yeh URL add karein:</li>
                    <div className="flex items-center gap-2 pt-1 pb-1">
                      <code className="bg-slate-200 px-2 py-1 rounded text-slate-800 font-mono text-[11px] select-all">
                        {currentOrigin || 'https://google-drive-chi.vercel.app'}
                      </code>
                      <button
                        onClick={handleCopyOrigin}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold cursor-pointer flex items-center gap-1"
                      >
                        {copiedOrigin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedOrigin ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <li><strong>Save</strong> par click karein.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTroubleshoot(false)}
                className="px-4 py-2 bg-[#0b57d0] text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM GOOGLE CLIENT ID MODAL */}
      {showClientSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleSaveClientId}
            className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#0b57d0]" />
                <h3 className="font-bold text-base text-slate-900">Google OAuth Client ID</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClientSettings(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              If you generated your own OAuth Client in Google Cloud for your Vercel domain, paste it here.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Client ID
              </label>
              <textarea
                rows={2}
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {savedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Client ID updated successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetClientId}
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset to Default
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClientSettings(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0b57d0] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

