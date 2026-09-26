/**
 * Universal Video Extraction Engine
 * Works standalone client-side (for Android APK & Web) and supports fallback backend.
 */

export interface ExtractedMedia {
  title: string;
  thumbnail?: string;
  url: string;
  platform: 'tiktok' | 'youtube' | 'facebook' | 'instagram' | 'twitter' | 'unknown';
  fileSize?: string;
  duration?: string;
  author?: string;
}

export function detectPlatform(url: string): ExtractedMedia['platform'] {
  const lower = url.toLowerCase();
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) return 'facebook';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter';
  return 'unknown';
}

/**
 * Clean and unescape URL strings returned by scrapers
 */
function cleanUrl(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\u0026/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"');
}

/**
 * 1. TikTok Extractor (Ultra-fast direct API)
 */
async function extractTikTok(url: string, format: 'mp4' | 'mp3'): Promise<ExtractedMedia | null> {
  const apis = [
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
    `https://api.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
  ];

  for (const apiUrl of apis) {
    try {
      const response = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json' },
      });
      if (!response.ok) continue;
      const res = await response.json();

      if (res && res.code === 0 && res.data) {
        const streamUrl =
          format === 'mp3'
            ? res.data.music || res.data.play
            : res.data.play || res.data.wmplay;

        if (streamUrl) {
          return {
            title: (res.data.title || 'TikTok Video').slice(0, 60),
            thumbnail: res.data.cover || res.data.origin_cover,
            url: streamUrl,
            platform: 'tiktok',
            duration: res.data.duration
              ? `${Math.floor(res.data.duration / 60)}:${(res.data.duration % 60).toString().padStart(2, '0')}`
              : '0:30',
            fileSize: res.data.size
              ? `${(res.data.size / (1024 * 1024)).toFixed(1)} MB`
              : '12.5 MB',
            author: res.data.author?.nickname || res.data.author?.unique_id,
          };
        }
      }
    } catch (e) {
      console.warn(`TikTok fetch attempt failed on ${apiUrl}:`, e);
    }
  }
  return null;
}

/**
 * 2. YouTube Extractor (Shorts & Videos)
 */
async function extractYouTube(url: string, format: 'mp4' | 'mp3'): Promise<ExtractedMedia | null> {
  // Strategy A: Direct public endpoint
  try {
    const res = await fetch(`https://backend1.tioo.eu.org/youtube?url=${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'btch/6.0.28',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status) {
        const streamUrl = format === 'mp3' ? data.mp3 || data.mp4 : data.mp4 || data.mp3;
        if (streamUrl) {
          return {
            title: (data.title || 'YouTube Video').slice(0, 60),
            thumbnail: data.thumbnail,
            url: streamUrl,
            platform: 'youtube',
            author: data.author,
            fileSize: '15.0 MB',
          };
        }
      }
    }
  } catch (e) {
    console.warn('YouTube strategy A failed:', e);
  }

  // Strategy B: Invidious Instances
  const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1];
    const instances = ['https://inv.nadeko.net', 'https://invidious.nerdvpn.de', 'https://vid.puffyan.us'];
    for (const inst of instances) {
      try {
        const res = await fetch(`${inst}/api/v1/videos/${videoId}`);
        if (!res.ok) continue;
        const info = await res.json();
        if (info && info.formatStreams && info.formatStreams.length > 0) {
          const chosen = info.formatStreams[0];
          return {
            title: (info.title || 'YouTube Video').slice(0, 60),
            thumbnail: info.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            url: chosen.url,
            platform: 'youtube',
            duration: info.lengthSeconds
              ? `${Math.floor(info.lengthSeconds / 60)}:${(info.lengthSeconds % 60).toString().padStart(2, '0')}`
              : undefined,
            fileSize: '18.4 MB',
          };
        }
      } catch (err) {
        console.warn(`Invidious instance ${inst} failed:`, err);
      }
    }
  }

  return null;
}

/**
 * 3. Facebook Extractor (Reels & Watch)
 */
async function extractFacebook(url: string, format: 'mp4' | 'mp3'): Promise<ExtractedMedia | null> {
  // Strategy A: Direct public endpoint
  try {
    const res = await fetch(`https://backend1.tioo.eu.org/fbdown?url=${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'btch/6.0.28',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status && (data.HD || data.Normal_video)) {
        const streamUrl = format === 'mp4' ? data.HD || data.Normal_video : data.Normal_video || data.HD;
        if (streamUrl) {
          return {
            title: 'Facebook Video',
            url: cleanUrl(streamUrl),
            platform: 'facebook',
            fileSize: '16.8 MB',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Facebook strategy A failed:', e);
  }

  // Strategy B: Direct client-side HTML regex scrape (runs cleanly in Android Capacitor)
  try {
    const pageRes = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const hdMatch =
        html.match(/browser_native_hd_url[\"\\:]+([^\"&]+(?:\\u0026[^\"&]+)*)/) ||
        html.match(/playable_url_quality_hd[\"\\:]+([^\"&]+(?:\\u0026[^\"&]+)*)/);
      const sdMatch =
        html.match(/browser_native_sd_url[\"\\:]+([^\"&]+(?:\\u0026[^\"&]+)*)/) ||
        html.match(/playable_url[\"\\:]+([^\"&]+(?:\\u0026[^\"&]+)*)/) ||
        html.match(/<meta property="og:video" content="([^"]+)"/);

      const titleMatch =
        html.match(/<title id="pageTitle">([^<]+)<\/title>/) ||
        html.match(/<meta property="og:title" content="([^"]+)"/);
      const thumbMatch =
        html.match(/<meta property="og:image" content="([^"]+)"/);

      const foundUrl = hdMatch ? hdMatch[1] : sdMatch ? sdMatch[1] : null;
      if (foundUrl) {
        return {
          title: titleMatch ? titleMatch[1].replace(/ \| Facebook/g, '').slice(0, 60) : 'Facebook Video',
          thumbnail: thumbMatch ? cleanUrl(thumbMatch[1]) : undefined,
          url: cleanUrl(foundUrl),
          platform: 'facebook',
          fileSize: '14.5 MB',
        };
      }
    }
  } catch (err) {
    console.warn('Facebook direct scrape failed:', err);
  }

  return null;
}

/**
 * 4. Instagram Extractor
 */
async function extractInstagram(url: string, format: 'mp4' | 'mp3'): Promise<ExtractedMedia | null> {
  try {
    const res = await fetch(`https://backend1.tioo.eu.org/igdl?url=${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'btch/6.0.28',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status && data.url) {
        const streamUrl = Array.isArray(data.url) ? data.url[0] : data.url;
        if (streamUrl) {
          return {
            title: 'Instagram Video',
            url: cleanUrl(streamUrl),
            platform: 'instagram',
            fileSize: '10.2 MB',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Instagram strategy failed:', e);
  }

  return null;
}

/**
 * 5. Twitter / X Extractor
 */
async function extractTwitter(url: string, format: 'mp4' | 'mp3'): Promise<ExtractedMedia | null> {
  try {
    const res = await fetch(`https://backend1.tioo.eu.org/twitter?url=${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'btch/6.0.28',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.status && data.url) {
        const streamUrl = Array.isArray(data.url) ? data.url[0]?.hd || data.url[0]?.sd || data.url[0] : data.url;
        if (streamUrl) {
          return {
            title: (data.title || 'Twitter / X Video').slice(0, 60),
            url: cleanUrl(streamUrl),
            platform: 'twitter',
            fileSize: '9.8 MB',
          };
        }
      }
    }
  } catch (e) {
    console.warn('Twitter strategy failed:', e);
  }

  return null;
}

/**
 * Universal Master Extractor
 */
export async function extractMedia(
  url: string,
  format: 'mp4' | 'mp3' = 'mp4',
  customBackendUrl?: string
): Promise<ExtractedMedia> {
  const platform = detectPlatform(url);
  let extracted: ExtractedMedia | null = null;

  // 1. Direct platform-specific extractors (fastest & works inside APK standalone)
  switch (platform) {
    case 'tiktok':
      extracted = await extractTikTok(url, format);
      break;
    case 'youtube':
      extracted = await extractYouTube(url, format);
      break;
    case 'facebook':
      extracted = await extractFacebook(url, format);
      break;
    case 'instagram':
      extracted = await extractInstagram(url, format);
      break;
    case 'twitter':
      extracted = await extractTwitter(url, format);
      break;
  }

  if (extracted && extracted.url) {
    return extracted;
  }

  // 2. Fallback to backend /api/extract (when running on web or if custom backend URL provided)
  const isCapacitor =
    (window as any).Capacitor && (window as any).Capacitor.getPlatform() !== 'web';
  const backendBase = customBackendUrl || (isCapacitor ? '' : '');

  if (backendBase || !isCapacitor) {
    try {
      const res = await fetch(`${backendBase}/api/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          return {
            title: data.title || `${platform.toUpperCase()} Video`,
            thumbnail: data.thumbnail,
            url: data.url,
            platform: data.platform || platform,
            duration: data.duration,
            fileSize: data.fileSize || '14.0 MB',
          };
        }
      }
    } catch (e) {
      console.warn('Backend /api/extract fallback failed:', e);
    }
  }

  // 3. Fallback for TikTok if not yet extracted
  if (platform === 'tiktok' && !extracted) {
    extracted = await extractTikTok(url, format);
    if (extracted) return extracted;
  }

  throw new Error(`Could not extract media for this ${platform} link. Please check if the link is valid and public.`);
}
