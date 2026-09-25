import { useState, useEffect } from "react";
import {
  Link2,
  Copy,
  DownloadCloud,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  Share2,
  ArrowRight,
  ShieldCheck,
  Video,
  Music,
} from "lucide-react";
import Screen from "../components/layout/Screen";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import { showRewardedVideo, triggerDownloadAd } from "../services/adMobService";
import { motion, AnimatePresence } from "motion/react";
import DownloadHistoryManager from "../components/home/DownloadHistoryManager";

export default function Home() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp4" | "mp3">("mp4");
  const [isProcessing, setIsProcessing] = useState(false);
  const { addDownload, downloads, showToast, setActivePreviewItem } = useAppStore();

  // Detect platform automatically from entered URL
  const detectedPlatform = (() => {
    const l = url.toLowerCase();
    if (l.includes("tiktok.com")) return "tiktok";
    if (l.includes("instagram.com") || l.includes("instagr.am")) return "instagram";
    if (l.includes("youtube.com") || l.includes("youtu.be")) return "youtube";
    if (l.includes("facebook.com") || l.includes("fb.watch") || l.includes("fb.com")) return "facebook";
    if (l.includes("twitter.com") || l.includes("x.com")) return "twitter";
    return null;
  })();

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().startsWith("http")) {
          setUrl(text.trim());
          showToast("Link Pasted", "Ready for high-speed download", "success");
        } else if (text) {
          setUrl(text.trim());
          showToast("Clipboard Pasted", undefined, "info");
        } else {
          showToast("Clipboard is Empty", "Copy a video link first", "info");
        }
      } else {
        showToast("Paste Manually", "Please hold and paste into the box", "info");
      }
    } catch (err) {
      showToast("Clipboard Access", "Please paste the link into the box", "info");
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      showToast("Missing URL", "Please enter or paste a valid link", "error");
      return;
    }

    setIsProcessing(true);
    const targetUrl = url.trim();

    const proceed = () => {
      addDownload(targetUrl, format);
      setUrl("");
      setIsProcessing(false);
    };

    // Trigger Google AdMob ad (Interstitial / Rewarded) before download
    triggerDownloadAd(() => {
      proceed();
    });
  };

  const recentDownloads = downloads.filter((d) => !d.isVaulted).slice(0, 3);

  const platforms = [
    {
      id: "tiktok",
      name: "TikTok",
      color: "from-zinc-900 to-black border-zinc-700/60",
      accent: "text-rose-400",
      badge: "No Watermark",
    },
    {
      id: "instagram",
      name: "Instagram",
      color: "from-purple-900/60 to-pink-900/60 border-pink-500/30",
      accent: "text-pink-400",
      badge: "Reels & Posts",
    },
    {
      id: "youtube",
      name: "Shorts",
      color: "from-red-950/60 to-red-900/50 border-red-500/30",
      accent: "text-red-400",
      badge: "4K / HD",
    },
    {
      id: "facebook",
      name: "Facebook",
      color: "from-blue-950/60 to-blue-900/50 border-blue-500/30",
      accent: "text-blue-400",
      badge: "Watch Video",
    },
  ];

  return (
    <Screen
      title="TokSave"
      subtitle="Universal iOS Downloader"
      headerAction={
        <div className="flex items-center gap-1.5 bg-[#1c1c1e] border border-white/10 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold text-zinc-300">Fast CDN</span>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-2">
        {/* iOS Hero Search & Download Card */}
        <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-5">
          {/* Header prompt */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#0A84FF]" />
              Video or Reel URL
            </span>

            {detectedPlatform && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0A84FF] bg-[#0A84FF]/10 px-2.5 py-0.5 rounded-full border border-[#0A84FF]/20 animate-fade-in">
                {detectedPlatform} detected
              </span>
            )}
          </div>

          {/* Search Input Bar */}
          <div className="relative flex items-center bg-[#2c2c2e]/90 rounded-2xl border border-white/10 focus-within:border-[#0A84FF]/70 focus-within:ring-2 focus-within:ring-[#0A84FF]/20 transition-all">
            <input
              type="url"
              placeholder="Paste TikTok, Reels, Shorts link..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDownload();
              }}
              className="flex-1 bg-transparent border-none outline-none px-4 py-3.5 text-sm text-white placeholder-zinc-500 min-w-0"
            />

            {url ? (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="p-3 text-zinc-400 hover:text-white transition-colors"
                aria-label="Clear input"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-700/80 text-zinc-300 flex items-center justify-center text-xs">
                  ✕
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="m-1.5 px-3 py-2 rounded-xl bg-[#0A84FF]/15 hover:bg-[#0A84FF]/25 text-[#0A84FF] border border-[#0A84FF]/20 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                Paste
              </button>
            )}
          </div>

          {/* iOS Sliding Segmented Control */}
          <div className="bg-[#2c2c2e]/70 p-1 rounded-2xl flex relative border border-white/5">
            <button
              type="button"
              onClick={() => setFormat("mp4")}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 relative z-10 transition-colors",
                format === "mp4" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {format === "mp4" && (
                <motion.div
                  layoutId="formatSegment"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-[#1c1c1e] rounded-xl shadow-sm border border-white/10"
                />
              )}
              <Video className="w-3.5 h-3.5 relative z-10 text-[#0A84FF]" />
              <span className="relative z-10">Video (MP4 HD)</span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("mp3")}
              className={cn(
                "flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 relative z-10 transition-colors",
                format === "mp3" ? "text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              {format === "mp3" && (
                <motion.div
                  layoutId="formatSegment"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  className="absolute inset-0 bg-[#1c1c1e] rounded-xl shadow-sm border border-white/10"
                />
              )}
              <Music className="w-3.5 h-3.5 relative z-10 text-[#30D158]" />
              <span className="relative z-10">Audio (MP3)</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            disabled={!url || isProcessing}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all",
              url && !isProcessing
                ? "bg-gradient-to-r from-[#0A84FF] to-[#0066d6] text-white shadow-[#0A84FF]/25 hover:brightness-110 active:scale-[0.98]"
                : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-white/5"
            )}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Stream...</span>
              </div>
            ) : (
              <>
                <DownloadCloud className="w-5 h-5 stroke-[2.2]" />
                <span>Download Watermark-Free</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Supported Platforms Grid */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Supported Sources
            </span>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Direct HD CDN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {platforms.map((p) => {
              const isSelected = detectedPlatform === p.id;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between",
                    isSelected
                      ? "bg-[#0A84FF]/15 border-[#0A84FF] shadow-md shadow-[#0A84FF]/10 scale-[1.02]"
                      : "bg-[#1c1c1e]/70 border-white/5 hover:border-white/15"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">{p.badge}</span>
                  </div>
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isSelected ? "bg-[#0A84FF] animate-ping" : "bg-zinc-600"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Download History Manager (LocalStorage URL Tracker & Quick Re-Access) */}
        <DownloadHistoryManager onSelectUrl={(selectedUrl) => setUrl(selectedUrl)} />

        {/* Recent Downloads Spotlight */}
        {recentDownloads.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0A84FF]" />
                Recent Downloads
              </span>
              <a
                href="/downloads"
                className="text-xs font-semibold text-[#0A84FF] flex items-center gap-0.5 hover:underline"
              >
                See All
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="flex flex-col gap-2.5">
              {recentDownloads.map((dl) => (
                <div
                  key={dl.id}
                  onClick={() => dl.status === "completed" && setActivePreviewItem(dl)}
                  className="bg-[#1c1c1e]/80 border border-white/5 hover:border-white/15 rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition-all"
                >
                  {/* Thumbnail / Play icon */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 relative shrink-0 border border-white/5">
                    {dl.thumbnail ? (
                      <img
                        src={dl.thumbnail}
                        alt={dl.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Play className="w-5 h-5" />
                      </div>
                    )}

                    {dl.status === "completed" && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white/80 text-black flex items-center justify-center shadow-md">
                          <Play className="w-3 h-3 ml-0.5 fill-current" />
                        </div>
                      </div>
                    )}

                    {dl.status === "downloading" && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#0A84FF]">
                          {dl.progress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title & metadata */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {dl.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold uppercase text-[#0A84FF] bg-[#0A84FF]/10 px-1.5 py-0.5 rounded">
                        {dl.platform}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {dl.format.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-zinc-500">·</span>
                      <span className="text-[10px] text-zinc-400">
                        {dl.status === "completed" ? "Saved" : dl.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}
