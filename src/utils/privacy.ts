// Privacy & Security Suite for Kaalix Cloud

const PRIVACY_MODE_KEY = 'kaalix_privacy_mode';
const PRIVACY_PIN_KEY = 'kaalix_security_pin';
const PRIVACY_BLUR_MEDIA_KEY = 'kaalix_blur_media';
const VAULT_FILE_IDS_KEY = 'kaalix_vault_file_ids';

export function getPrivacyMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PRIVACY_MODE_KEY) === 'true';
}

export const getPrivacyModePref = getPrivacyMode;

export function setPrivacyMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRIVACY_MODE_KEY, enabled ? 'true' : 'false');
}

export function purgeAllUserData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PRIVACY_MODE_KEY);
  localStorage.removeItem(PRIVACY_PIN_KEY);
  localStorage.removeItem(PRIVACY_BLUR_MEDIA_KEY);
  localStorage.removeItem(VAULT_FILE_IDS_KEY);
  localStorage.removeItem('kaalix_drive_token');
  localStorage.removeItem('kaalix_drive_user');
  localStorage.removeItem('kaalix_saved_accounts');
}

export function getSecurityPin(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PRIVACY_PIN_KEY);
}

export function setSecurityPin(pin: string): void {
  if (typeof window === 'undefined') return;
  if (!pin) {
    localStorage.removeItem(PRIVACY_PIN_KEY);
  } else {
    localStorage.setItem(PRIVACY_PIN_KEY, pin);
  }
}

export function removeSecurityPin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PRIVACY_PIN_KEY);
}

export function getBlurMediaPref(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PRIVACY_BLUR_MEDIA_KEY) === 'true';
}

export function setBlurMediaPref(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRIVACY_BLUR_MEDIA_KEY, enabled ? 'true' : 'false');
}

export function getVaultFileIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VAULT_FILE_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleVaultFile(fileId: string): boolean {
  if (typeof window === 'undefined') return false;
  const ids = getVaultFileIds();
  const exists = ids.includes(fileId);
  const updated = exists ? ids.filter((id) => id !== fileId) : [...ids, fileId];
  localStorage.setItem(VAULT_FILE_IDS_KEY, JSON.stringify(updated));
  return !exists;
}

export function isFileInVault(fileId: string): boolean {
  return getVaultFileIds().includes(fileId);
}

/**
 * Mask an email address for privacy:
 * e.g. "xrdpfrre@gmail.com" -> "xr••••••@gmail.com"
 */
export function maskEmail(email: string, active: boolean = true): string {
  if (!active || !email) return email;
  const parts = email.split('@');
  if (parts.length !== 2) return '••••••••';
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name}•••@${domain}`;
  }
  const prefix = name.substring(0, 2);
  const masked = '•'.repeat(Math.min(name.length - 2, 6));
  return `${prefix}${masked}@${domain}`;
}

/**
 * Mask a display name:
 * e.g. "frre xrdp" -> "Shielded User"
 */
export function maskName(name: string, active: boolean = true): string {
  if (!active || !name) return name;
  return 'Shielded User';
}

/**
 * Mask an API key:
 * e.g. "cdk_93hf83hda82" -> "cdk_93h••••••••••••"
 */
export function maskApiKey(key: string, reveal: boolean = false): string {
  if (reveal || !key) return key;
  if (key.length <= 8) return '••••••••';
  return `${key.substring(0, 7)}••••••••••••`;
}
