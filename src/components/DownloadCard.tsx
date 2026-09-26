import React from "react";
import { DownloadItem } from "../types";
import { Play, Trash2, Heart, Share2, Shield, ShieldCheck, Film, Music, CheckCircle2, RotateCcw } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

export default function DownloadCard({ item }: { item: DownloadItem; key?: React.Key }) {
  const { removeDownload, toggleFavorite, favorites, toggleVault, setActivePreviewItem, showToast, retryDownload } = useAppStore();
  const isFav = favorites.includes(item.id);

  const handleShare = async () => {
    if (navigator.share && item.downloadUrl) {
      try {
        await navigator.share({
          title: item.title,
          url: item.downloadUrl || item.url,
        });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(item.downloadUrl || item.url);
      showToast("Link Copied to Clipboard", undefined, "success");
    }
  };

  const handlePlay = () => {
    if (item.status === "completed") {
      setActivePreviewItem(item);
    }
  };

  const isAudio = item.format === "mp3";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#1c1c1e] border border-white/[0.08] hover:border-white/20 rounded-2xl p-3.5 shadow-sm transition-all"
    >
      <div className="flex gap-3.5">
        {/* Media Thumbnail */}
        <div
          onClick={handlePlay}
          className={cn(
            "w-20 h-24 rounded-xl overflow-hidden bg-zinc-900 relative shrink-0 border border-white/5 select-none",
            item.status === "completed" && "cursor-pointer group"
          )}
        >
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
              {isAudio ? <Music className="w-7 h-7" /> : <Film className="w-7 h-7" />}
            </div>
          )}

          {/* Completed Play Overlay */}
          {item.status === "completed" && (
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
              <div className="w-8 h-8 rounded-full bg-white/90 group-hover:bg-white text-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              </div>
            </div>
          )}

          {/* Downloading Progress Bar */}
          {item.status === "downloading" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-2 gap-1.5">
              <span className="text-xs font-bold text-[#0A84FF]">{item.progress}%</span>
              <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0A84FF] transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Format Badge */}
          <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-200">
            {item.format}
          </div>
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h4
              onClick={handlePlay}
              className={cn(
                "text-sm font-semibold text-white tracking-tight truncate leading-snug",
                item.status === "completed" && "cursor-pointer hover:text-[#0A84FF]"
              )}
            >
              {item.title}
            </h4>

            {/* Unboxed metadata per frontend design rules */}
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
              <span className="font-medium text-[#0A84FF] uppercase">{item.platform}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{item.fileSize || "12 MB"}</span>
              {item.status === "completed" && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                </>
              )}
              {item.status === "failed" && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <button
                    onClick={() => retryDownload(item.id)}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded text-[10px] border border-amber-500/20 active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Retry
                  </button>
                </>
              )}
            </div>
          </div>

          {/* iOS Quick Action Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
            <div className="flex items-center gap-1">
              {/* Retry button for failed item */}
              {item.status === "failed" && (
                <button
                  type="button"
                  onClick={() => retryDownload(item.id)}
                  title="Retry Download"
                  className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 active:scale-90 transition-all flex items-center gap-1 px-2 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Retry</span>
                </button>
              )}

              {/* Play button */}
              {item.status === "completed" && (
                <button
                  type="button"
                  onClick={handlePlay}
                  title="Play Preview"
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white active:scale-90 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Favorite Button */}
              <button
                type="button"
                onClick={() => toggleFavorite(item.id)}
                title="Favorite"
                className={cn(
                  "p-1.5 rounded-lg transition-all active:scale-90",
                  isFav
                    ? "bg-rose-500/15 text-rose-500"
                    : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200"
                )}
              >
                <Heart className={cn("w-3.5 h-3.5", isFav && "fill-current")} />
              </button>

              {/* Vault Button */}
              <button
                type="button"
                onClick={() => toggleVault(item.id)}
                title={item.isVaulted ? "Vaulted" : "Move to Vault"}
                className={cn(
                  "p-1.5 rounded-lg transition-all active:scale-90",
                  item.isVaulted
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-purple-400"
                )}
              >
                {item.isVaulted ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Shield className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                title="Share link"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white active:scale-90 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => removeDownload(item.id)}
              title="Delete item"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/15 text-zinc-400 hover:text-rose-400 active:scale-90 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
