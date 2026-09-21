import React, { useState, useEffect } from 'react';
import { GoogleDriveView } from './components/GoogleDriveView';
import { DriveLoginView } from './components/DriveLoginView';
import { ApiKeyManager } from './components/ApiKeyManager';
import { PrivacyLockOverlay } from './components/PrivacyLockOverlay';
import { MongoStudio } from './components/MongoStudio';
import { 
  DriveUser, 
  DriveFileItem, 
  ApiKeyRecord,
  UserFile
} from './types';
import { 
  getCachedToken, 
  setCachedToken, 
  requestDriveAccessToken, 
  fetchDriveUserProfile, 
  saveUserAccount,
  listDriveFiles, 
  getDriveFileContent, 
  createDriveItem, 
  updateDriveFileContent, 
  deleteDriveItem, 
  uploadFileToGoogleDrive,
  renameDriveItem,
  copyDriveItem,
  toggleStarDriveItem,
  listStarredFiles,
  listRecentFiles,
  connectWithDirectToken,
  createDemoUser,
  getDemoFiles
} from './utils/googleDrive';
import { 
  getPrivacyModePref, 
  getSecurityPin, 
  purgeAllUserData 
} from './utils/privacy';
import { ArrowLeft, Key } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<DriveUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Privacy Suite States
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(() => getPrivacyModePref());
  const [isLocked, setIsLocked] = useState<boolean>(() => !!getSecurityPin());

  // Active View: 'drive' | 'apikeys' | 'mongodb'
  const [currentView, setCurrentView] = useState<'drive' | 'apikeys' | 'mongodb'>('drive');

  // Bottom Navigation tab: 'home' | 'starred' | 'shared' | 'files'
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'starred' | 'shared' | 'files'>('files');

  // Drive Repository State
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string }>>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isSavingFile, setIsSavingFile] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);

  // 1. Check existing token on mount
  useEffect(() => {
    const token = getCachedToken();
    if (token) {
      handleLoadUserWithToken(token);
    }
  }, []);

  const handleLoadUserWithToken = async (token: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const profile = await fetchDriveUserProfile(token);
      setUser(profile);
      saveUserAccount(profile);
      await loadFolderFiles('root', token);
      await loadApiKeys(profile.email);
    } catch (err: any) {
      console.warn('Initial session restore issue:', err.message);
      if (err.message && err.message.includes('401')) {
        setCachedToken(null);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Sign in button trigger
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const token = await requestDriveAccessToken();
      const profile = await fetchDriveUserProfile(token);
      setUser(profile);
      saveUserAccount(profile);
      await loadFolderFiles('root', token);
      await loadApiKeys(profile.email);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setLoginError(err.message || 'Failed to authenticate with Kaalix Cloud.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Direct access token login (Google OAuth Playground token)
  const handleDirectTokenLogin = async (token: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const profile = await connectWithDirectToken(token);
      setUser(profile);
      await loadFolderFiles('root', token);
      await loadApiKeys(profile.email);
    } catch (err: any) {
      console.error('Direct token login error:', err);
      setLoginError(err.message || 'Failed to connect with access token.');
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Instant Demo Sandbox Login
  const handleDemoLogin = () => {
    const demoUser = createDemoUser();
    setUser(demoUser);
    setDriveFiles(getDemoFiles());
    setApiKeys([
      {
        key: 'cdk_demo_sandbox_8f29',
        name: 'Demo Telegram Bot Key',
        createdAt: new Date().toISOString(),
        lastUsed: 'Just now',
        ownerEmail: demoUser.email,
        permissions: ['read', 'all']
      }
    ]);
  };

  // Switch or add another Google account
  const handleSwitchAccount = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const token = await requestDriveAccessToken(true);
      const profile = await fetchDriveUserProfile(token);
      setUser(profile);
      saveUserAccount(profile);
      await loadFolderFiles('root', token);
      await loadApiKeys(profile.email);
    } catch (err: any) {
      console.error('Account switch cancelled or failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCachedToken(null);
    setUser(null);
    setDriveFiles([]);
    setSelectedFile(null);
    setFileContent('');
    setApiKeys([]);
    setCurrentView('drive');
  };

  // 2. Load files for a folder or category
  const loadFolderFiles = async (folderId: string = 'root', token?: string) => {
    setIsLoadingFiles(true);
    try {
      if (activeNavTab === 'starred') {
        const items = await listStarredFiles(token || user?.accessToken);
        setDriveFiles(items);
      } else if (activeNavTab === 'home') {
        const items = await listRecentFiles(token || user?.accessToken);
        setDriveFiles(items);
      } else {
        const items = await listDriveFiles(folderId, token || user?.accessToken);
        setDriveFiles(items);
      }
    } catch (err: any) {
      console.error('Error loading files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Trigger file load when nav tab changes
  useEffect(() => {
    if (user) {
      loadFolderFiles(currentFolderId);
    }
  }, [activeNavTab]);

  // Navigate folder
  const handleNavigateFolder = (folderId: string, folderName?: string) => {
    if (folderId === 'root') {
      setCurrentFolderId('root');
      setBreadcrumbs([]);
      loadFolderFiles('root');
      return;
    }

    const existingIndex = breadcrumbs.findIndex((b) => b.id === folderId);
    if (existingIndex !== -1) {
      setBreadcrumbs((prev) => prev.slice(0, existingIndex + 1));
    } else if (folderName) {
      setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }]);
    }
    setCurrentFolderId(folderId);
    loadFolderFiles(folderId);
  };

  // Select file and fetch content
  const handleSelectFile = async (file: DriveFileItem, token?: string) => {
    setSelectedFile(file);
    try {
      const text = await getDriveFileContent(file.id, token || user?.accessToken);
      setFileContent(text);
    } catch (err: any) {
      setFileContent(`// Could not preview binary/doc format: ${err.message}`);
    }
  };

  // Save / Commit file
  const handleSaveFile = async (newContent: string, commitMessage: string) => {
    if (!selectedFile) return;
    setIsSavingFile(true);
    try {
      await updateDriveFileContent(selectedFile.id, newContent, user?.accessToken);
      setFileContent(newContent);
      // update local list
      setDriveFiles((prev) =>
        prev.map((f) =>
          f.id === selectedFile.id
            ? { ...f, size: `${(newContent.length / 1024).toFixed(1)} KB`, modifiedTime: 'Just now' }
            : f
        )
      );
    } finally {
      setIsSavingFile(false);
    }
  };

  // Create file or folder
  const handleCreateItem = async (name: string, isFolder: boolean, initialContent: string = '') => {
    const newItem = await createDriveItem(
      name,
      isFolder,
      currentFolderId,
      initialContent,
      user?.accessToken
    );
    setDriveFiles((prev) => [newItem, ...prev]);
    if (!isFolder) {
      setSelectedFile(newItem);
      setFileContent(initialContent);
    }
  };

  // Delete file or folder
  const handleDeleteItem = async (item: DriveFileItem) => {
    try {
      await deleteDriveItem(item.id, user?.accessToken);
      setDriveFiles((prev) => prev.filter((f) => f.id !== item.id));
      if (selectedFile?.id === item.id) {
        setSelectedFile(null);
        setFileContent('');
      }
    } catch (err: any) {
      alert(`Could not delete item: ${err.message}`);
    }
  };

  // Rename item
  const handleRenameItem = async (item: DriveFileItem, newName: string) => {
    try {
      const updatedName = await renameDriveItem(item.id, newName, user?.accessToken);
      setDriveFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, name: updatedName } : f))
      );
      if (selectedFile?.id === item.id) {
        setSelectedFile((prev) => prev ? { ...prev, name: updatedName } : null);
      }
    } catch (err: any) {
      alert(`Rename failed: ${err.message}`);
    }
  };

  // Copy item
  const handleCopyItem = async (item: DriveFileItem) => {
    try {
      const copy = await copyDriveItem(item.id, `Copy of ${item.name}`, user?.accessToken);
      setDriveFiles((prev) => [copy, ...prev]);
    } catch (err: any) {
      alert(`Copy failed: ${err.message}`);
    }
  };

  // Toggle Star
  const handleToggleStar = async (item: DriveFileItem) => {
    try {
      const newStarred = await toggleStarDriveItem(item.id, !item.starred, user?.accessToken);
      setDriveFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, starred: newStarred } : f))
      );
    } catch (err: any) {
      alert(`Star failed: ${err.message}`);
    }
  };

  // Upload local file from disk
  const handleUploadLocalFile = async (file: File) => {
    setIsLoadingFiles(true);
    try {
      await uploadFileToGoogleDrive(
        file.name,
        file,
        file.type || 'text/plain',
        currentFolderId,
        user?.accessToken
      );
      await loadFolderFiles(currentFolderId);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // 3. API Key methods
  const loadApiKeys = async (email?: string) => {
    try {
      const targetEmail = email || user?.email;
      const res = await fetch(`/api/keys?email=${encodeURIComponent(targetEmail || '')}`);
      const data = await res.json();
      if (data.keys) {
        setApiKeys(data.keys);
      }
    } catch (err) {
      console.warn('Load API keys failed:', err);
    }
  };

  const handleGenerateKey = async (name: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: user.email,
          driveToken: user.accessToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys((prev) => [data.apiKey, ...prev]);
      }
    } catch (err: any) {
      alert(`Generate Key Error: ${err.message}`);
    }
  };

  const handleRevokeKey = async (key: string) => {
    try {
      const res = await fetch(`/api/keys/${encodeURIComponent(key)}`, { method: 'DELETE' });
      if (!res.ok) {
        // Fallback to POST
        await fetch('/api/keys/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key })
        });
      }
      setApiKeys((prev) => prev.filter((k) => k.key !== key));
    } catch (err: any) {
      alert(`Revoke error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-800 font-sans">
      {/* Privacy App-Wide PIN Lock Overlay */}
      {isLocked && (
        <PrivacyLockOverlay
          isLocked={isLocked}
          onUnlock={() => setIsLocked(false)}
          onResetSession={() => {
            setIsLocked(false);
            handleLogout();
          }}
        />
      )}

      {!user ? (
        <DriveLoginView
          onLogin={handleLogin}
          onDirectTokenLogin={handleDirectTokenLogin}
          onDemoLogin={handleDemoLogin}
          isLoading={isLoggingIn}
          error={loginError}
        />
      ) : currentView === 'apikeys' ? (
        <div className="min-h-screen bg-[#f8fafd] text-slate-800 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('drive')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors text-xs font-semibold shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Files
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('mongodb')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors text-xs font-semibold cursor-pointer"
                >
                  MongoDB Studio
                </button>
              </div>
            </div>
            <ApiKeyManager
              user={user}
              apiKeys={apiKeys}
              onGenerateKey={handleGenerateKey}
              onRevokeKey={handleRevokeKey}
            />
          </div>
        </div>
      ) : currentView === 'mongodb' ? (
        <MongoStudio
          user={user}
          activeApiKey={apiKeys[0]?.key || ''}
          onBackToDrive={() => setCurrentView('drive')}
        />
      ) : (
        <GoogleDriveView
          user={user}
          files={driveFiles}
          currentFolderId={currentFolderId}
          breadcrumbs={breadcrumbs}
          isLoading={isLoadingFiles}
          selectedFile={selectedFile}
          fileContent={fileContent}
          isSavingFile={isSavingFile}
          activeApiKey={apiKeys[0]?.key || ''}
          isPrivacyMode={isPrivacyMode}
          onTogglePrivacyMode={(enabled) => setIsPrivacyMode(enabled)}
          onLockAppNow={() => setIsLocked(true)}
          onPurgeSession={() => {
            purgeAllUserData();
            handleLogout();
          }}
          onNavigateFolder={handleNavigateFolder}
          onSelectFile={handleSelectFile}
          onSaveFile={handleSaveFile}
          onCreateItem={handleCreateItem}
          onDeleteItem={handleDeleteItem}
          onRenameItem={handleRenameItem}
          onCopyItem={handleCopyItem}
          onToggleStar={handleToggleStar}
          onRefresh={() => loadFolderFiles(currentFolderId)}
          onUploadLocalFile={handleUploadLocalFile}
          onOpenApiKeys={() => setCurrentView('apikeys')}
          onOpenMongoStudio={() => setCurrentView('mongodb')}
          onLogout={handleLogout}
          onSwitchAccount={handleSwitchAccount}
          activeNavTab={activeNavTab}
          setActiveNavTab={setActiveNavTab}
        />
      )}
    </div>
  );
}
