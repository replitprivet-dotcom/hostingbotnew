// Google Drive API & OAuth Integration via Google Identity Services (GIS)
import { DriveFileItem, DriveUser } from '../types';
import firebaseAppletConfig from '../../firebase-applet-config.json';

export const DEFAULT_GOOGLE_CLIENT_ID =
  firebaseAppletConfig.oAuthClientId ||
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '349812161908-4ue1gfria6d01biv4tg17cj7ncnufui0.apps.googleusercontent.com';

export const CLOUD_OAUTH_BRIDGE_URL =
  import.meta.env.VITE_OAUTH_BRIDGE_URL ||
  (typeof window !== 'undefined' ? `${window.location.origin}/oauth-bridge.html` : '/oauth-bridge.html');

export function isAuthorizedDirectOrigin(): boolean {
  if (typeof window === 'undefined') return true;
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  return (
    origin.includes('run.app') ||
    origin.includes('ai.studio') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    Boolean(localStorage.getItem('kaalix_custom_client_id'))
  );
}

export function getActiveGoogleClientId(): string {
  try {
    const custom = localStorage.getItem('kaalix_custom_client_id');
    // If user has old non-working client ID cached, purge it
    if (custom && custom.includes('148790012602')) {
      localStorage.removeItem('kaalix_custom_client_id');
      return DEFAULT_GOOGLE_CLIENT_ID;
    }
    if (custom && custom.trim()) return custom.trim();
  } catch (e) {
    // ignore
  }
  return DEFAULT_GOOGLE_CLIENT_ID;
}

export function setCustomGoogleClientId(id: string) {
  try {
    if (id && id.trim()) {
      localStorage.setItem('kaalix_custom_client_id', id.trim());
    } else {
      localStorage.removeItem('kaalix_custom_client_id');
    }
    tokenClientInstance = null;
  } catch (e) {
    // ignore
  }
}

export const GOOGLE_CLIENT_ID = getActiveGoogleClientId();

// Full access to Google Drive files for browsing, creating, editing, and deleting
const SCOPES = 'https://www.googleapis.com/auth/drive';

declare global {
  interface Window {
    google?: any;
  }
}

let cachedAccessToken: string | null = null;
let tokenClientInstance: any = null;

export function getCachedToken(): string | null {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    const saved = localStorage.getItem('gdrive_token');
    if (saved) {
      cachedAccessToken = saved;
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function setCachedToken(token: string | null) {
  cachedAccessToken = token;
  if (token) {
    try {
      localStorage.setItem('gdrive_token', token);
    } catch (e) {
      // ignore
    }
  } else {
    try {
      localStorage.removeItem('gdrive_token');
    } catch (e) {
      // ignore
    }
  }
}

export function getSavedAccounts(): DriveUser[] {
  try {
    const raw = localStorage.getItem('kaalix_saved_accounts');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return [];
}

export function saveUserAccount(user: DriveUser) {
  try {
    const accounts = getSavedAccounts();
    const existingIndex = accounts.findIndex((a) => a.email === user.email);
    if (existingIndex !== -1) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...user };
    } else {
      accounts.push(user);
    }
    localStorage.setItem('kaalix_saved_accounts', JSON.stringify(accounts));
  } catch (e) {
    // ignore
  }
}

export function removeSavedAccount(email: string) {
  try {
    const accounts = getSavedAccounts().filter((a) => a.email !== email);
    localStorage.setItem('kaalix_saved_accounts', JSON.stringify(accounts));
  } catch (e) {
    // ignore
  }
}

export function ensureGoogleIdentityServicesLoaded(timeoutMs = 8000): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }
    if (window.google?.accounts?.oauth2) {
      resolve(window.google.accounts.oauth2);
      return;
    }
    const startTime = Date.now();
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve(window.google.accounts.oauth2);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        reject(
          new Error(
            'Google Identity Services is loading. Please check your internet connection or try again in a moment.'
          )
        );
      }
    }, 100);
  });
}

export async function requestDriveAccessToken(forceSelectAccount: boolean = false): Promise<string> {
  if (!forceSelectAccount && cachedAccessToken) {
    return cachedAccessToken;
  }

  if (forceSelectAccount) {
    setCachedToken(null);
  }

  // AUTOMATIC CLOUD BRIDGE:
  // If the app is accessed from Vercel or an external origin, route through authorized Cloud Run bridge
  if (!isAuthorizedDirectOrigin()) {
    return new Promise((resolve, reject) => {
      const width = 500;
      const height = 660;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let bridgeUrlStr = CLOUD_OAUTH_BRIDGE_URL;
      try {
        const u = new URL(CLOUD_OAUTH_BRIDGE_URL);
        u.searchParams.set('origin', window.location.origin);
        if (forceSelectAccount) {
          u.searchParams.set('select_account', 'true');
        }
        bridgeUrlStr = u.toString();
      } catch (err) {
        bridgeUrlStr = `${CLOUD_OAUTH_BRIDGE_URL}?origin=${encodeURIComponent(window.location.origin)}&select_account=${forceSelectAccount}`;
      }

      const popup = window.open(
        bridgeUrlStr,
        'KaalixCloudGoogleAuthBridge',
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        reject(
          new Error(
            'Browser blocked Google Sign-In popup. Please allow popups for this site or use the "Direct Access Token" tab.'
          )
        );
        return;
      }

      let timeoutId: any = null;
      let checkInterval: any = null;

      const messageListener = (event: MessageEvent) => {
        if (event.data && event.data.type === 'KAALIX_OAUTH_TOKEN' && event.data.token) {
          cleanup();
          const token = event.data.token;
          setCachedToken(token);
          resolve(token);
        }
      };

      const cleanup = () => {
        window.removeEventListener('message', messageListener);
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutId) clearTimeout(timeoutId);
      };

      window.addEventListener('message', messageListener);

      checkInterval = setInterval(() => {
        if (popup.closed) {
          cleanup();
          const maybeToken = getCachedToken();
          if (maybeToken) {
            resolve(maybeToken);
          } else {
            reject(
              new Error(
                'Google popup closed before completion. You can also paste an access token directly.'
              )
            );
          }
        }
      }, 700);

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Sign-In timed out. Please try again.'));
      }, 180000);
    });
  }

  // Direct in-origin Google Identity Services - ensure library is loaded
  await ensureGoogleIdentityServicesLoaded();

  return new Promise((resolve, reject) => {
    try {
      const clientId = getActiveGoogleClientId();
      tokenClientInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(`OAuth error: ${response.error}`));
            return;
          }
          if (response.access_token) {
            setCachedToken(response.access_token);
            resolve(response.access_token);
          } else {
            reject(new Error('No access token received from Google'));
          }
        },
      });

      // Automatic Drive authorization: request drive scope without forced redundant consent screens
      tokenClientInstance.requestAccessToken({
        prompt: forceSelectAccount ? 'select_account' : '',
      });
    } catch (err: any) {
      reject(new Error(`Failed to initialize Google token client: ${err.message}`));
    }
  });
}

/**
 * Connect using a direct Access Token (e.g. from Google OAuth Playground) or Kaalix API Key
 */
export async function connectWithDirectToken(token: string): Promise<DriveUser> {
  const cleaned = token.trim();
  if (!cleaned) throw new Error('Please enter a valid Google Access Token or Kaalix API Key (cdk_...)');

  // Verify FIRST before touching local cache
  try {
    const user = await fetchDriveUserProfile(cleaned);
    setCachedToken(cleaned);
    saveUserAccount(user);
    return user;
  } catch (err: any) {
    // Ensure bad credentials do not poison cache
    setCachedToken(null);
    throw err;
  }
}

export function createDemoUser(): DriveUser {
  return {
    name: 'Kaalix Demo User',
    email: 'demo@kaalixcloud.local',
    picture: '',
    accessToken: 'demo_token_' + Date.now(),
    connectedAt: new Date().toISOString(),
  };
}

export function getDemoFiles(): DriveFileItem[] {
  return [
    {
      id: 'demo-1',
      name: 'Kaalix_Cloud_Architecture.pdf',
      mimeType: 'application/pdf',
      size: '2411720',
      modifiedTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdTime: new Date(Date.now() - 86400000).toISOString(),
      isFolder: false,
      starred: true,
    },
    {
      id: 'demo-2',
      name: 'Sunset_Scenic_4K.jpg',
      mimeType: 'image/jpeg',
      size: '4194304',
      modifiedTime: new Date(Date.now() - 3600000 * 5).toISOString(),
      createdTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      isFolder: false,
    },
    {
      id: 'demo-3',
      name: 'Simran_Bot_Telemetry.py',
      mimeType: 'text/x-python',
      size: '15840',
      modifiedTime: new Date(Date.now() - 3600000 * 12).toISOString(),
      createdTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      isFolder: false,
    },
    {
      id: 'demo-4',
      name: 'Sample_Drone_Footage.mp4',
      mimeType: 'video/mp4',
      size: '28420000',
      modifiedTime: new Date(Date.now() - 3600000 * 24).toISOString(),
      createdTime: new Date(Date.now() - 86400000 * 4).toISOString(),
      isFolder: false,
    },
    {
      id: 'demo-folder-1',
      name: 'Projects & Bot Backups',
      mimeType: 'application/vnd.google-apps.folder',
      modifiedTime: new Date(Date.now() - 3600000 * 48).toISOString(),
      createdTime: new Date(Date.now() - 86400000 * 6).toISOString(),
      isFolder: true,
    },
  ];
}

/**
 * Fetch authenticated user info using access token or Kaalix API Key
 */
export async function fetchDriveUserProfile(token: string): Promise<DriveUser> {
  const cleanToken = token.trim();

  // 1. If it's a Kaalix API Key (starts with cdk_)
  if (cleanToken.startsWith('cdk_')) {
    try {
      const verifyRes = await fetch('/api/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: cleanToken }),
      });
      const data = await verifyRes.json();
      if (!verifyRes.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or revoked Kaalix API Key.');
      }

      const email = data.ownerEmail || 'developer@kaalixcloud.local';
      const name = data.name || email.split('@')[0];
      const effectiveDriveToken = data.driveToken || cleanToken;

      return {
        email,
        name,
        picture: '',
        accessToken: effectiveDriveToken,
        connectedAt: new Date().toLocaleTimeString(),
        storageUsage: {
          limit: '50.0 GB',
          usage: '128 MB',
          usageInDrive: '128 MB',
          limitBytes: 50 * 1024 * 1024 * 1024,
          usageBytes: 134217728,
          driveBytes: 134217728,
          usedPercentage: 0.25,
          displayUsageText: 'Kaalix Developer Cloud & MongoDB Store active',
        },
      };
    } catch (err: any) {
      throw new Error(`API Key Authentication Failed: ${err.message}`);
    }
  }

  // 2. Otherwise it must be a valid Google OAuth Access Token
  let email = '';
  let name = '';
  let picture = '';
  let userInfoSuccess = false;
  let aboutSuccess = false;

  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${cleanToken}` },
    });
    if (userRes.ok) {
      const uData = await userRes.json();
      email = uData.email || '';
      name = uData.name || (email ? email.split('@')[0] : '');
      picture = uData.picture || '';
      userInfoSuccess = true;
    }
  } catch (e) {
    console.warn('UserInfo fetch error:', e);
  }

  // 3. Fetch Drive storage quota
  let storageUsage = {
    limit: '15.0 GB',
    usage: '0 B',
    usageInDrive: '0 B',
    limitBytes: 15 * 1024 * 1024 * 1024,
    usageBytes: 0,
    driveBytes: 0,
    usedPercentage: 0,
    displayUsageText: '0 B of 15.0 GB used',
  };

  try {
    const aboutRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user,storageQuota', {
      headers: { Authorization: `Bearer ${cleanToken}` },
    });
    if (aboutRes.ok) {
      const aData = await aboutRes.json();
      if (aData.user?.displayName) name = aData.user.displayName;
      if (aData.user?.emailAddress) email = aData.user.emailAddress;
      if (aData.user?.photoLink) picture = aData.user.photoLink;
      aboutSuccess = true;

      const quota = aData.storageQuota;
      if (quota) {
        const limitBytes = parseInt(quota.limit || '0', 10) || (15 * 1024 * 1024 * 1024);
        const usageBytes = parseInt(quota.usage || '0', 10);
        const driveBytes = parseInt(quota.usageInDrive || '0', 10);
        const effectiveUsage = usageBytes > 0 ? usageBytes : driveBytes;
        const usedPct = limitBytes > 0 ? parseFloat(((effectiveUsage / limitBytes) * 100).toFixed(2)) : 0;

        const limitStr = formatFileSize(limitBytes);
        const usageStr = formatFileSize(effectiveUsage);
        const driveStr = formatFileSize(driveBytes > 0 ? driveBytes : effectiveUsage);

        storageUsage = {
          limit: limitStr,
          usage: usageStr,
          usageInDrive: driveStr,
          limitBytes,
          usageBytes,
          driveBytes,
          usedPercentage: usedPct,
          displayUsageText: `${usageStr} of ${limitStr} used (${usedPct < 0.1 && effectiveUsage > 0 ? '<0.1%' : `${usedPct}%`})`,
        };
      }
    }
  } catch (e) {
    console.warn('Drive about quota error:', e);
  }

  // CRITICAL STRICT CHECK: If both Google userinfo and about returned failure, the token is invalid!
  if (!userInfoSuccess && !aboutSuccess) {
    throw new Error(
      'Authentication Failed: The provided credential is invalid or expired. Google rejected this token (HTTP 401 Unauthorized). Please provide a valid Google Access Token or Kaalix Developer API Key (cdk_...).'
    );
  }

  return {
    email: email || 'user@gmail.com',
    name: name || (email ? email.split('@')[0] : 'Drive Connected User'),
    picture,
    accessToken: cleanToken,
    connectedAt: new Date().toLocaleTimeString(),
    storageUsage,
  };
}

/**
 * List files and folders in a Google Drive folder
 */
export async function listDriveFiles(
  folderId: string = 'root',
  token?: string
): Promise<DriveFileItem[]> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const query = `'${folderId}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,webContentLink,iconLink,thumbnailLink,starred,parents)&orderBy=folder,name`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${effectiveToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to list Google Drive files (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const files: DriveFileItem[] = (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? formatFileSize(parseInt(f.size, 10)) : (f.mimeType === 'application/vnd.google-apps.folder' ? '--' : '0 B'),
    modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleString() : 'Recently',
    createdTime: f.createdTime,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    webContentLink: f.webContentLink,
    iconLink: f.iconLink,
    thumbnailLink: f.thumbnailLink,
    starred: !!f.starred,
    parents: f.parents,
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
  }));

  return files;
}

/**
 * Get file content (text)
 */
export async function getDriveFileContent(fileId: string, token?: string): Promise<string> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${effectiveToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to read file content (${res.status}): ${err}`);
  }

  return await res.text();
}

/**
 * Create a new empty file or folder
 */
export async function createDriveItem(
  name: string,
  isFolder: boolean,
  parentId: string = 'root',
  initialContent: string = '',
  token?: string
): Promise<DriveFileItem> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());

  if (isFolder) {
    const metadata = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId !== 'root' ? [parentId] : undefined,
    };

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,mimeType,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      throw new Error(`Failed to create folder: ${await res.text()}`);
    }
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      mimeType: data.mimeType,
      isFolder: true,
      size: '--',
      modifiedTime: 'Just now',
      webViewLink: data.webViewLink,
    };
  }

  // Create text file
  const mimeType = getMimeTypeFromFilename(name);
  const metadata = {
    name,
    mimeType,
    parents: parentId !== 'root' ? [parentId] : undefined,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    initialContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to create file: ${await res.text()}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    isFolder: false,
    size: formatFileSize(initialContent.length),
    modifiedTime: 'Just now',
    webViewLink: data.webViewLink,
    content: initialContent,
  };
}

/**
 * Update existing file content in Google Drive
 */
export async function updateDriveFileContent(
  fileId: string,
  content: string,
  token?: string
): Promise<void> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${effectiveToken}`,
      'Content-Type': 'text/plain; charset=UTF-8',
    },
    body: content,
  });

  if (!res.ok) {
    throw new Error(`Failed to update file: ${await res.text()}`);
  }
}

/**
 * Delete a file or folder permanently from Google Drive
 */
export async function deleteDriveItem(fileId: string, token?: string): Promise<void> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${effectiveToken}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete item: ${await res.text()}`);
  }
}

/**
 * Helper to upload a binary or text file to Drive
 */
export async function uploadFileToGoogleDrive(
  fileName: string,
  content: string | Blob,
  mimeType: string = 'text/plain',
  parentId: string = 'root',
  token?: string
): Promise<{ id: string; name: string; webViewLink?: string; size?: string }> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());

  const metadata = {
    name: fileName,
    mimeType,
    parents: parentId !== 'root' ? [parentId] : undefined,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let body: any;
  if (typeof content === 'string') {
    body =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;
  } else {
    // For Blob / binary upload
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const formData = new FormData();
    formData.append('metadata', metadataBlob);
    formData.append('file', content, fileName);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size', {
      method: 'POST',
      headers: { Authorization: `Bearer ${effectiveToken}` },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      webViewLink: data.webViewLink,
      size: data.size ? formatFileSize(parseInt(data.size, 10)) : '--',
    };
  }

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    webViewLink: data.webViewLink,
    size: typeof content === 'string' ? formatFileSize(content.length) : '--',
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Star or unstar a Google Drive item
 */
export async function toggleStarDriveItem(fileId: string, starred: boolean, token?: string): Promise<boolean> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,starred`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${effectiveToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ starred }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return !!data.starred;
}

/**
 * Rename a Google Drive item
 */
export async function renameDriveItem(fileId: string, newName: string, token?: string): Promise<string> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${effectiveToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.name;
}

/**
 * Copy a file
 */
export async function copyDriveItem(fileId: string, newName?: string, token?: string): Promise<DriveFileItem> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/copy?fields=id,name,mimeType,size,modifiedTime,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${effectiveToken}`,
      'Content-Type': 'application/json',
    },
    body: newName ? JSON.stringify({ name: newName }) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    isFolder: false,
    size: data.size ? formatFileSize(parseInt(data.size, 10)) : '--',
    modifiedTime: 'Just now',
    webViewLink: data.webViewLink,
  };
}

/**
 * List starred items
 */
export async function listStarredFiles(token?: string): Promise<DriveFileItem[]> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const query = `starred = true and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,thumbnailLink,parents,starred)&orderBy=modifiedTime desc`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${effectiveToken}` } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? formatFileSize(parseInt(f.size, 10)) : '--',
    modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
    webViewLink: f.webViewLink,
    thumbnailLink: f.thumbnailLink,
    starred: true,
  }));
}

/**
 * List recent items
 */
export async function listRecentFiles(token?: string): Promise<DriveFileItem[]> {
  const effectiveToken = token || getCachedToken() || (await requestDriveAccessToken());
  const query = `trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&pageSize=50&fields=files(id,name,mimeType,size,modifiedTime,createdTime,webViewLink,thumbnailLink,parents,starred)&orderBy=modifiedTime desc`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${effectiveToken}` } });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? formatFileSize(parseInt(f.size, 10)) : '--',
    modifiedTime: f.modifiedTime ? new Date(f.modifiedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
    isFolder: f.mimeType === 'application/vnd.google-apps.folder',
    webViewLink: f.webViewLink,
    thumbnailLink: f.thumbnailLink,
    starred: !!f.starred,
  }));
}

export function getMimeTypeFromFilename(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    // Images / Photos
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'bmp':
      return 'image/bmp';
    case 'ico':
      return 'image/x-icon';

    // Videos
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    case 'mkv':
      return 'video/x-matroska';
    case 'avi':
      return 'video/x-msvideo';

    // Audio
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    case 'm4a':
      return 'audio/mp4';
    case 'flac':
      return 'audio/flac';

    // Documents & PDFs
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';

    // Code & Scripts
    case 'py':
      return 'text/x-python';
    case 'js':
    case 'jsx':
      return 'application/javascript';
    case 'ts':
    case 'tsx':
      return 'application/typescript';
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'md':
      return 'text/markdown';
    case 'txt':
    case 'env':
    case 'log':
      return 'text/plain';
    case 'zip':
      return 'application/zip';
    case 'tar':
    case 'gz':
      return 'application/gzip';
    default:
      return 'application/octet-stream';
  }
}
