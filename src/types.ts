export interface UserFile {
  id: string;
  name: string;
  language: 'python' | 'javascript';
  content: string;
  size: string;
  lastModified: string;
  hasErrors?: boolean;
  errorSnippet?: string;
  healed?: boolean;
  healingAttempts?: number;
}

export interface DiagnosisResult {
  rootCause: string;
  errorType: string;
  explanation: string;
  patchedCode: string;
  packagesToInstall: string[];
  confidence: number;
  aiModel: string;
  appliedPatches: string[];
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  healedDuringRun?: boolean;
  healingIterations?: number;
  diagnosis?: DiagnosisResult;
  autoInstalledPackages?: string[];
}

export interface HealingIncident {
  id: string;
  timestamp: string;
  fileName: string;
  errorType: string;
  summary: string;
  actionTaken: string;
  status: 'resolved' | 'investigating' | 'mitigated';
  aiModel: string;
  recoveryDurationMs: number;
}

export interface SystemTelemetry {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: string;
  usedMemory: string;
  uptime: string;
  stabilityIndex: number;
  activeProcesses: number;
  autonomousRecoveries: number;
  deepSeekStatus: 'online' | 'degraded' | 'offline';
  geminiStatus: 'online' | 'standby';
}

export interface GDriveUploadRecord {
  id: string;
  fileName: string;
  fileSize: string;
  driveFolder: string;
  uploadStatus: 'uploaded' | 'pending' | 'syncing';
  uploadedAt: string;
  webViewLink?: string;
}

export interface GitHubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  connected: boolean;
  repoDetails?: {
    fullName: string;
    isPrivate: boolean;
    defaultBranch: string;
    description?: string;
    htmlUrl: string;
    ownerAvatar?: string;
  };
}

export interface GitHubPushRecord {
  id: string;
  fileName: string;
  filePath: string;
  commitMessage: string;
  commitSha: string;
  commitUrl: string;
  pushedAt: string;
  branch: string;
  repo: string;
  status: 'success' | 'failed';
}

export interface DriveUser {
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  connectedAt: string;
  storageUsage?: {
    limit: string;
    usage: string;
    usageInDrive: string;
    limitBytes?: number;
    usageBytes?: number;
    driveBytes?: number;
    usedPercentage?: number;
    displayUsageText?: string;
  };
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  isFolder: boolean;
  content?: string;
  path?: string;
  starred?: boolean;
}

export interface ApiKeyRecord {
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
  ownerEmail: string;
  permissions: Array<'read' | 'write' | 'delete' | 'all'>;
}

export interface FileCommit {
  id: string;
  message: string;
  author: string;
  timestamp: string;
  fileId: string;
  fileName: string;
  sha: string;
}

export interface MongoCollectionInfo {
  name: string;
  documentCount?: number;
  count?: number;
  sizeBytes: number;
  sizeFormatted: string;
  lastModified: string;
  indexes?: string[];
}

export interface MongoDocument {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

