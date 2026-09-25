import { motion, AnimatePresence } from "motion/react";
import { X, Share2, Download, ExternalLink, Play, Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useState } from "react";

export default function VideoPlayerModal() {
  const { activePreviewItem, setActivePreviewItem, showToast } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!activePreviewItem) return null;

  const handleShare = async () => {
    if (navigator.share && activePreviewItem.downloadUrl) {
      try {
        await navigator.share({
          title: activePreviewItem.title,
          url: activePreviewItem.downloadUrl || activePreviewItem.url,
        });
        showToast("Shared successfully", undefined, "success");
      } catch (e) {
        // Share cancelled or not supported
      }
    } else {
      await navigator.clipboard.writeText(activePreviewItem.downloadUrl || activePreviewItem.url);
      setCopied(true);
      showToast("Link Copied to Clipboard", undefined, "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenSource = () => {
    window.open(activePreviewItem.url, "_blank");
  };

  const isAudio = activePreviewItem.format === "mp3";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActivePreviewItem(null)}
          className="fixed inset-0 bg-black/75 backdrop-blur-xl"
        />

        {/* iOS Bottom Sheet Container */}
        <motion.div
          initial={{ y: "100%", opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#1c1c1e] border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* iOS Grab Handle */}
          <div className="w-full flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-zinc-600" />
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#0A84FF] bg-[#0A84FF]/10 px-2 py-0.5 rounded-full">
                {activePreviewItem.platform.toUpperCase()}
              </span>
              <span className="text-xs text-zinc-400 font-medium">
                {activePreviewItem.format.toUpperCase()}
              </span>
            </div>

            <button
              onClick={() => setActivePreviewItem(null)}
              className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Media Player Area */}
          <div className="p-4 flex flex-col items-center justify-center bg-black/40">
            {isAudio ? (
              <div className="w-full py-8 flex flex-col items-center justify-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center shadow-lg border border-white/5">
                  <Play className="w-10 h-10 text-[#0A84FF] ml-1" />
                </div>
                <audio
                  controls
                  autoPlay
                  src={activePreviewItem.downloadUrl || activePreviewItem.url}
                  className="w-full mt-2"
                />
              </div>
            ) : (
              <div className="w-full aspect-[9/16] max-h-[50vh] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative flex items-center justify-center">
                <video
                  controls
                  autoPlay
                  playsInline
                  poster={activePreviewItem.thumbnail}
                  src={activePreviewItem.downloadUrl || activePreviewItem.url}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Video Title and Metadata */}
          <div className="p-5 pt-3 flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight line-clamp-2">
                {activePreviewItem.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 truncate">
                {activePreviewItem.url}
              </p>
            </div>

            {/* Quick iOS Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleShare}
                className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-zinc-300" />}
                {copied ? "Link Copied" : "Share"}
              </button>

              <button
                onClick={handleOpenSource}
                className="py-3 px-4 rounded-xl bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white font-medium text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-blue-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                Original Link
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
