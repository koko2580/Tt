import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DownloadItem, AppSettings, ToastNotification, ProcessedUrlHistoryItem } from '../types';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { extractMedia, detectPlatform } from '../services/videoExtractor';

interface AppContextType {
  downloads: DownloadItem[];
  favorites: string[];
  settings: AppSettings;
  toast: ToastNotification | null;
  activePreviewItem: DownloadItem | null;
  urlHistory: ProcessedUrlHistoryItem[];
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  setActivePreviewItem: (item: DownloadItem | null) => void;
  addDownload: (url: string, format: 'mp4' | 'mp3', quality?: string) => Promise<void>;
  retryDownload: (id: string) => Promise<void>;
  removeDownload: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleVault: (id: string) => void;
  clearAllDownloads: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addOrUpdateUrlHistory: (item: {
    url: string;
    title?: string;
    thumbnail?: string;
    platform?: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'twitter' | 'unknown';
    format?: 'mp4' | 'mp3';
  }) => void;
  removeUrlFromHistory: (id: string) => void;
  clearUrlHistory: () => void;
}

const defaultSettings: AppSettings = {
  defaultQuality: 'hd',
  autoDownload: false,
  darkMode: true,
  hapticFeedback: true,
  saveToGallery: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<DownloadItem | null>(null);
  const [urlHistory, setUrlHistory] = useState<ProcessedUrlHistoryItem[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const savedDownloads = localStorage.getItem('toksave_downloads');
      if (savedDownloads) setDownloads(JSON.parse(savedDownloads));

      const savedFavorites = localStorage.getItem('toksave_favorites');
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      const savedSettings = localStorage.getItem('toksave_settings');
      if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });

      const savedHistory = localStorage.getItem('toksave_url_history');
      if (savedHistory) {
        setUrlHistory(JSON.parse(savedHistory));
      } else {
        setUrlHistory([
          {
            id: 'hist-1',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'Rick Astley - Never Gonna Give You Up (Official 4K Remaster)',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            platform: 'youtube',
            timestamp: Date.now() - 1000 * 60 * 25,
            lastDownloadedAt: Date.now() - 1000 * 60 * 25,
            format: 'mp4',
            downloadCount: 2,
          },
          {
            id: 'hist-2',
            url: 'https://www.facebook.com/watch?v=10153231379946729',
            title: 'Facebook Trending Video - HD Direct Stream',
            thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=400&auto=format&fit=crop',
            platform: 'facebook',
            timestamp: Date.now() - 1000 * 60 * 95,
            lastDownloadedAt: Date.now() - 1000 * 60 * 95,
            format: 'mp4',
            downloadCount: 1,
          },
          {
            id: 'hist-3',
            url: 'https://www.tiktok.com/@tiktok/video/7106594312292453678',
            title: 'TikTok Viral Reel - High Quality No Watermark',
            thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop',
            platform: 'tiktok',
            timestamp: Date.now() - 1000 * 60 * 60 * 20,
            lastDownloadedAt: Date.now() - 1000 * 60 * 60 * 20,
            format: 'mp4',
            downloadCount: 3,
          },
        ]);
      }
    } catch (e) {
      console.error("Storage load error", e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('toksave_downloads', JSON.stringify(downloads));
  }, [downloads]);

  useEffect(() => {
    localStorage.setItem('toksave_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('toksave_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('toksave_url_history', JSON.stringify(urlHistory));
  }, [urlHistory]);

  const showToast = (title: string, description?: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({
      id: Date.now().toString(),
      title,
      description,
      type,
    });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const detectPlatform = (url: string): DownloadItem['platform'] => {
    const lower = url.toLowerCase();
    if (lower.includes('tiktok.com')) return 'tiktok';
    if (lower.includes('instagram.com')) return 'instagram';
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
    if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return 'facebook';
    return 'unknown';
  };

  const addDownload = async (url: string, format: 'mp4' | 'mp3', quality = settings.defaultQuality) => {
    const platform = detectPlatform(url);
    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      url,
      title: 'Connecting & Fetching...',
      status: 'downloading',
      progress: 5,
      format,
      quality,
      timestamp: Date.now(),
      platform,
      isVaulted: false,
    };

    setDownloads(prev => [newDownload, ...prev]);
    addOrUpdateUrlHistory({ url, platform, format });
    showToast('Download Started', `Fetching high-speed ${format.toUpperCase()} stream...`, 'info');

    // Process actual download
    await processDownload(newDownload.id, url, format);
  };

  const processDownload = async (id: string, url: string, format: 'mp4' | 'mp3') => {
    let animInterval: any = null;
    try {
      // 1. Universal Media Extraction (Direct standalone client APIs for Android & Web)
      const extractData = await extractMedia(url, format);

      setDownloads(prev => prev.map(d => d.id === id ? {
        ...d,
        title: extractData.title || `Media_${Date.now()}`,
        thumbnail: extractData.thumbnail || d.thumbnail,
        downloadUrl: extractData.url,
        fileSize: extractData.fileSize || '14.2 MB',
        duration: extractData.duration || '0:30',
        progress: 30
      } : d));

      addOrUpdateUrlHistory({
        url,
        title: extractData.title,
        thumbnail: extractData.thumbnail,
        platform: extractData.platform,
        format: format as any,
      });

      if (!extractData.url) {
        throw new Error('No playable stream URL found for this video.');
      }

      // Progress animation simulation
      let animProgress = 30;
      animInterval = setInterval(() => {
        animProgress += Math.floor(Math.random() * 8) + 4;
        if (animProgress > 90) animProgress = 90;
        setDownloads(prev => prev.map(d => d.id === id && d.status === 'downloading' ? { ...d, progress: animProgress } : d));
      }, 350);

      const downloadDest = `TokSave_${Date.now()}.${format}`;
      const isCapacitorNative =
        (window as any).Capacitor &&
        (window as any).Capacitor.getPlatform() !== 'web';

      let finalDownloadUrl = extractData.url;

      if (isCapacitorNative) {
        // Native Android saving with permissions
        try {
          const permStatus = await Filesystem.checkPermissions();
          if (permStatus.publicStorage !== 'granted') {
            await Filesystem.requestPermissions();
          }
        } catch (permErr) {
          console.warn('Storage permission check warning:', permErr);
        }

        try {
          // Native Filesystem download
          await Filesystem.downloadFile({
            url: extractData.url,
            path: downloadDest,
            directory: Directory.Documents,
            recursive: true,
          });

          const uriRes = await Filesystem.getUri({
            directory: Directory.Documents,
            path: downloadDest,
          });
          if (uriRes?.uri) {
            finalDownloadUrl = uriRes.uri;
          }
        } catch (nativeDownloadErr) {
          console.warn('Filesystem.downloadFile fallback to blob fetch:', nativeDownloadErr);
          // Fallback: Fetch blob directly using Capacitor native networking
          const resp = await fetch(extractData.url);
          if (!resp.ok) throw new Error('Could not stream media file');
          const blob = await resp.blob();

          // Convert to base64
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const resStr = reader.result as string;
              resolve(resStr.includes(',') ? resStr.split(',')[1] : resStr);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          await Filesystem.writeFile({
            path: downloadDest,
            data: base64Data,
            directory: Directory.Documents,
            recursive: true,
          });

          const uriRes = await Filesystem.getUri({
            directory: Directory.Documents,
            path: downloadDest,
          });
          if (uriRes?.uri) {
            finalDownloadUrl = uriRes.uri;
          }
        }
      } else {
        // Web browser environment download
        let blob: Blob | null = null;
        try {
          const directRes = await fetch(extractData.url, { mode: 'cors' });
          if (directRes.ok) {
            blob = await directRes.blob();
          }
        } catch (corsErr) {
          console.warn('Direct blob fetch failed, falling back to proxy:', corsErr);
        }

        if (!blob) {
          try {
            const proxyUrl = `/api/download-blob?url=${encodeURIComponent(extractData.url)}`;
            const proxyRes = await fetch(proxyUrl);
            if (proxyRes.ok) {
              blob = await proxyRes.blob();
            }
          } catch (proxyErr) {
            console.warn('Proxy blob fetch failed:', proxyErr);
          }
        }

        if (blob) {
          const objectUrl = window.URL.createObjectURL(blob);
          finalDownloadUrl = objectUrl;
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = downloadDest;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
        } else {
          // Direct link fallback
          window.open(extractData.url, '_blank');
        }
      }

      if (animInterval) clearInterval(animInterval);

      setDownloads(prev => prev.map(d => d.id === id ? {
        ...d,
        status: 'completed',
        progress: 100,
        downloadUrl: finalDownloadUrl,
      } : d));

      showToast('Download Completed!', extractData.title?.slice(0, 30) || 'Saved successfully', 'success');

    } catch (e: any) {
      if (animInterval) clearInterval(animInterval);
      console.error('Download error:', e);
      setDownloads(prev => prev.map(d => d.id === id ? {
        ...d,
        status: 'failed',
        title: d.title && d.title !== 'Connecting & Fetching...' ? d.title : 'Download Failed'
      } : d));
      showToast('Download Failed', e.message || 'Could not fetch video. Check link and retry.', 'error');
    }
  };

  const retryDownload = async (id: string) => {
    const item = downloads.find(d => d.id === id);
    if (!item) return;
    setDownloads(prev => prev.map(d => d.id === id ? {
      ...d,
      status: 'downloading',
      progress: 10,
      title: 'Connecting & Fetching...'
    } : d));
    showToast('Retrying Download', `Re-fetching ${item.format.toUpperCase()}...`, 'info');
    await processDownload(id, item.url, item.format);
  };

  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
    setFavorites(prev => prev.filter(fId => fId !== id));
    showToast('Deleted', 'Item removed from library', 'info');
  };

  const toggleFavorite = (id: string) => {
    const isFav = favorites.includes(id);
    setFavorites(prev => 
      isFav ? prev.filter(fId => fId !== id) : [...prev, id]
    );
    showToast(isFav ? 'Removed from Favorites' : 'Added to Favorites', undefined, 'success');
  };

  const toggleVault = (id: string) => {
    let nowVaulted = false;
    setDownloads(prev => prev.map(d => {
      if (d.id === id) {
        nowVaulted = !d.isVaulted;
        return { ...d, isVaulted: nowVaulted };
      }
      return d;
    }));
    showToast(nowVaulted ? 'Moved to Private Vault' : 'Restored to Library', undefined, 'info');
  };

  const clearAllDownloads = () => {
    setDownloads([]);
    setFavorites([]);
    showToast('Library Cleared', 'All download history removed', 'info');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Settings Saved', undefined, 'success');
  };

  const addOrUpdateUrlHistory = (item: {
    url: string;
    title?: string;
    thumbnail?: string;
    platform?: 'tiktok' | 'instagram' | 'youtube' | 'facebook' | 'twitter' | 'unknown';
    format?: 'mp4' | 'mp3';
  }) => {
    const cleanUrl = item.url.trim();
    if (!cleanUrl) return;

    setUrlHistory(prev => {
      const existingIndex = prev.findIndex(h => h.url.toLowerCase() === cleanUrl.toLowerCase());
      const detectedPlat = item.platform || (detectPlatform(cleanUrl) as any) || 'unknown';
      const now = Date.now();

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const updated: ProcessedUrlHistoryItem = {
          ...existing,
          title: item.title && !item.title.startsWith("Connecting") ? item.title : existing.title,
          thumbnail: item.thumbnail || existing.thumbnail,
          platform: detectedPlat,
          format: item.format || existing.format,
          timestamp: now,
          lastDownloadedAt: now,
          downloadCount: (existing.downloadCount || 1) + 1,
        };
        const rest = prev.filter((_, idx) => idx !== existingIndex);
        return [updated, ...rest];
      } else {
        const newHist: ProcessedUrlHistoryItem = {
          id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          url: cleanUrl,
          title: item.title || `${detectedPlat.toUpperCase()} Video`,
          thumbnail: item.thumbnail,
          platform: detectedPlat,
          timestamp: now,
          lastDownloadedAt: now,
          format: item.format || 'mp4',
          downloadCount: 1,
        };
        return [newHist, ...prev];
      }
    });
  };

  const removeUrlFromHistory = (id: string) => {
    setUrlHistory(prev => prev.filter(h => h.id !== id));
    showToast('Removed from History', 'URL removed from quick-access list', 'info');
  };

  const clearUrlHistory = () => {
    setUrlHistory([]);
    localStorage.removeItem('toksave_url_history');
    showToast('History Cleared', 'All processed URLs removed', 'info');
  };

  return (
    <AppContext.Provider value={{
      downloads,
      favorites,
      settings,
      toast,
      activePreviewItem,
      urlHistory,
      showToast,
      hideToast,
      setActivePreviewItem,
      addDownload,
      retryDownload,
      removeDownload,
      toggleFavorite,
      toggleVault,
      clearAllDownloads,
      updateSettings,
      addOrUpdateUrlHistory,
      removeUrlFromHistory,
      clearUrlHistory
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
