import { useState } from "react";
import Screen from "../components/layout/Screen";
import DownloadCard from "../components/DownloadCard";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import { Search, Film, Music, ArrowDownToLine, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Downloads() {
  const { downloads, clearAllDownloads } = useAppStore();
  const [filter, setFilter] = useState<"all" | "mp4" | "mp3">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const visibleDownloads = downloads.filter((d) => {
    if (d.isVaulted) return false;
    if (filter !== "all" && d.format !== filter) return false;
    if (searchQuery.trim() && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Screen
      title="Downloads"
      subtitle="Media Manager"
      headerAction={
        downloads.length > 0 ? (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your download history?")) {
                clearAllDownloads();
              }
            }}
            className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full transition-colors active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4 pt-2">
        {/* iOS Search Bar */}
        <div className="relative flex items-center bg-[#1c1c1e] rounded-xl border border-white/10 px-3 py-2.5">
          <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search downloads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* iOS Segmented Filter Control */}
        <div className="bg-[#1c1c1e] p-1 rounded-xl flex border border-white/10 relative">
          {[
            { id: "all", label: "All Items" },
            { id: "mp4", label: "Videos" },
            { id: "mp3", label: "Audio" },
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg relative z-10 transition-colors text-center",
                  isSelected ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="filterSegmentPill"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 bg-[#2c2c2e] rounded-lg shadow-sm border border-white/10"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* List of Downloads */}
        <div className="flex flex-col gap-3 mt-1">
          {visibleDownloads.length === 0 ? (
            <div className="text-center text-zinc-500 mt-16 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-[#1c1c1e] border border-white/10 flex items-center justify-center text-zinc-500 shadow-md">
                <ArrowDownToLine className="w-8 h-8 text-zinc-500" />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm font-semibold text-zinc-300">No Downloads Yet</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Paste a video link on Home to save offline
                </p>
              </div>
              <Link
                to="/"
                className="mt-2 text-xs font-bold text-[#0A84FF] bg-[#0A84FF]/10 px-4 py-2 rounded-xl border border-[#0A84FF]/20 hover:bg-[#0A84FF]/20 active:scale-95 transition-all"
              >
                Go to Downloader
              </Link>
            </div>
          ) : (
            visibleDownloads.map((d) => <DownloadCard key={d.id} item={d} />)
          )}
        </div>
      </div>
    </Screen>
  );
}
