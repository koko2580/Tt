export type DownloadItem = {
  id: string;
  url: string;
  downloadUrl?: string;
  title: string;
  thumbnail?: string;
  status: 'downloading' | 'completed' | 'failed';
  progress: number;
  format: 'mp4' | 'mp3';
  quality: string;
  timestamp: number;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'unknown';
  isVaulted: boolean;
  fileSize?: string;
  duration?: string;
};

export type AppSettings = {
  defaultQuality: 'hd' | 'sd' | 'audio';
  autoDownload: boolean;
  darkMode: boolean;
  hapticFeedback: boolean;
  saveToGallery: boolean;
};

export type ToastNotification = {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'error';
};

export type ProcessedUrlHistoryItem = {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'twitter' | 'unknown';
  timestamp: number;
  format: 'mp4' | 'mp3';
  downloadCount: number;
  lastDownloadedAt: number;
};
