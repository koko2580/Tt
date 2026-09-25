import React, { useState } from "react";
import {
  History,
  Download,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Search,
  RotateCcw,
  Sparkles,
  Music,
  Video,
  ChevronDown,
  ChevronUp,
  X,
  Share2,
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { ProcessedUrlHistoryItem } from "../../types";
import { triggerDownloadAd } from "../../services/adMobService";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface DownloadHistoryManagerProps {
  onSelectUrl: (url: string) => void;
}

export default function DownloadHistoryManager({
  onSelectUrl,
}: DownloadHistoryManagerProps) {
  const {
    urlHistory,
    removeUrlFromHistory,
    clearUrlHistory,
    addDownload,
    showToast,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Platform badges configuration
  const platformConfig: Record<
    string,
    { label: string; color: string; badge: string; border: string }
  > = {
    tiktok: {
      label: "TikTok",
      color: "text-rose-400 bg-rose-500/15",
      badge: "No Watermark",
      border: "border-rose-500/30",
    },
    youtube: {
      label: "YouTube",
      color: "text-red-400 bg-red-500/15",
      badge: "HD / 4K",
      border: "border-red-500/30",
    },
    facebook: {
      label: "Facebook",
      color: "text-blue-400 bg-blue-500/15",
      badge: "Watch / Reel",
      border: "border-blue-500/30",
    },
    instagram: {
      label: "Instagram",
      color: "text-pink-400 bg-pink-500/15",
      badge: "Reel / Post",
      border: "border-pink-500/30",
    },
    twitter: {
      label: "X / Twitter",
      color: "text-sky-400 bg-sky-500/15",
      badge: "Video",
      border: "border-sky-500/30",
    },
    unknown: {
      label: "Web Video",
      color: "text-zinc-400 bg-zinc-800",
      badge: "Direct",
      border: "border-zinc-700",
    },
  };

  // Filter history items
  const filteredHistory = urlHistory.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform =
      selectedPlatform === "all" || item.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const handleCopyUrl = async (item: ProcessedUrlHistoryItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      showToast("Link Copied", "URL copied to clipboard", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Copy Failed", "Please copy link manually", "error");
    }
  };

  const handleReDownload = (
    item: ProcessedUrlHistoryItem,
    format: "mp4" | "mp3"
  ) => {
    showToast(
      "Re-Downloading",
      `Starting ${format.toUpperCase()} download...`,
      "info"
    );
    triggerDownloadAd(() => {
      addDownload(item.url, format);
    });
  };

  const handleLoadUrl = (item: ProcessedUrlHistoryItem) => {
    onSelectUrl(item.url);
    showToast("URL Loaded", "Ready in the download box above", "success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0A84FF]/15 border border-[#0A84FF]/25 flex items-center justify-center text-[#0A84FF]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Download History
              {urlHistory.length > 0 && (
                <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-white/5">
                  {urlHistory.length}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-zinc-400">
              Quick re-access & 1-tap re-downloading
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {urlHistory.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-[11px] text-zinc-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 transition-colors"
            aria-label="Toggle history visibility"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal / Banner */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center justify-between gap-3">
              <span className="text-xs text-rose-300 font-medium">
                Clear all URL download history?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearUrlHistory();
                    setShowClearConfirm(false);
                  }}
                  className="text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 px-2.5 py-1 rounded-md transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-3.5"
          >
            {/* Search & Filter Controls */}
            {urlHistory.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-1">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history by title or link..."
                    className="w-full bg-[#141416] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#0A84FF]/60 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "tiktok", label: "TikTok" },
                    { id: "youtube", label: "YouTube" },
                    { id: "facebook", label: "Facebook" },
                    { id: "instagram", label: "Instagram" },
                  ].map((tab) => {
                    const isActive = selectedPlatform === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedPlatform(tab.id)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0",
                          isActive
                            ? "bg-[#0A84FF] text-white shadow-sm shadow-[#0A84FF]/20"
                            : "bg-[#141416] text-zinc-400 hover:text-zinc-200 border border-white/5"
                        )}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List of items */}
            {filteredHistory.length > 0 ? (
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredHistory.map((item) => {
                  const plat = platformConfig[item.platform] || platformConfig.unknown;
                  const isCopied = copiedId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#141416]/80 hover:bg-[#141416] border border-white/5 hover:border-white/15 rounded-2xl p-3 flex flex-col gap-2.5 transition-all group"
                    >
                      {/* Top Info Row */}
                      <div className="flex items-start gap-3">
                        {/* Thumbnail / Platform Icon */}
                        <div
                          onClick={() => handleLoadUrl(item)}
                          className="w-13 h-13 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-white/10 relative cursor-pointer group-hover:border-[#0A84FF]/40 transition-colors"
                        >
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500">
                              <Video className="w-5 h-5" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-all">
                            <RotateCcw className="w-3.5 h-3.5 text-white/90" />
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className={cn(
                                "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded border tracking-wider",
                                plat.color,
                                plat.border
                              )}
                            >
                              {plat.label}
                            </span>
                            <span className="text-[10px] text-zinc-500">·</span>
                            <span className="text-[10px] text-zinc-400">
                              {formatTimeAgo(item.timestamp)}
                            </span>
                            {item.downloadCount > 1 && (
                              <>
                                <span className="text-[10px] text-zinc-500">·</span>
                                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1 rounded">
                                  {item.downloadCount}x
                                </span>
                              </>
                            )}
                          </div>

                          <h4
                            onClick={() => handleLoadUrl(item)}
                            className="text-xs font-semibold text-white truncate hover:text-[#0A84FF] cursor-pointer transition-colors"
                            title={item.title}
                          >
                            {item.title}
                          </h4>

                          <p
                            className="text-[11px] text-zinc-500 truncate font-mono mt-0.5"
                            title={item.url}
                          >
                            {item.url.replace(/^https?:\/\/(www\.)?/, "")}
                          </p>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeUrlFromHistory(item.id)}
                          className="text-zinc-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors shrink-0"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-2">
                        {/* Re-download MP4 & MP3 */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReDownload(item, "mp4")}
                            className="flex items-center gap-1 bg-[#0A84FF]/15 hover:bg-[#0A84FF]/25 border border-[#0A84FF]/30 text-[#0A84FF] text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                          >
                            <Download className="w-3 h-3" />
                            Re-download
                          </button>

                          <button
                            onClick={() => handleReDownload(item, "mp3")}
                            className="flex items-center gap-1 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-medium px-2 py-1 rounded-lg transition-colors active:scale-95"
                            title="Extract Audio MP3"
                          >
                            <Music className="w-3 h-3" />
                            MP3
                          </button>
                        </div>

                        {/* Quick Utility Tools: Load into input & Copy */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleLoadUrl(item)}
                            className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                            title="Fill URL into input box"
                          >
                            <RotateCcw className="w-3 h-3 text-[#0A84FF]" />
                            <span>Use</span>
                          </button>

                          <button
                            onClick={() => handleCopyUrl(item)}
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Copy link"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Open original video link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="py-6 px-4 bg-[#141416]/50 rounded-2xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-1">
                  <History className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-zinc-300">
                  {searchQuery
                    ? "No matching URLs found"
                    : "No Download History Yet"}
                </h4>
                <p className="text-[11px] text-zinc-500 max-w-[240px]">
                  {searchQuery
                    ? "Try adjusting your search query or platform filter."
                    : "URLs you paste and download are automatically tracked here for quick 1-tap re-downloading."}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
