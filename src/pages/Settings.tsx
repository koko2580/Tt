import Screen from "../components/layout/Screen";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../lib/utils";
import {
  Download,
  FolderDown,
  Sparkles,
  Smartphone,
  Trash2,
  Shield,
  Info,
  ChevronRight,
  Check,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function Settings() {
  const { settings, updateSettings, showToast, clearAllDownloads } = useAppStore();
  const [clearingCache, setClearingCache] = useState(false);

  const handleClearCache = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      showToast("Cache Cleared", "Temporary cache purged successfully", "success");
    }, 600);
  };

  return (
    <Screen title="Settings" subtitle="System & Preferences">
      <div className="flex flex-col gap-6 pt-2 pb-6">
        {/* Section 1: Download Preferences */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Download Options
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            {/* Auto Download Switch */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-[#0A84FF] flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Auto-Detect Clipboard</h4>
                  <p className="text-[11px] text-zinc-400">Detect copied video URLs automatically</p>
                </div>
              </div>

              {/* iOS Switch */}
              <button
                type="button"
                onClick={() => updateSettings({ autoDownload: !settings.autoDownload })}
                className={cn(
                  "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative select-none",
                  settings.autoDownload ? "bg-[#30D158]" : "bg-zinc-700"
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-md",
                    settings.autoDownload ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>

            {/* Save to Camera Roll Switch */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#30D158] flex items-center justify-center">
                  <FolderDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct Document Save</h4>
                  <p className="text-[11px] text-zinc-400">Save directly to system storage</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ saveToGallery: !settings.saveToGallery })}
                className={cn(
                  "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative select-none",
                  settings.saveToGallery ? "bg-[#30D158]" : "bg-zinc-700"
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-md",
                    settings.saveToGallery ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>

            {/* Haptic Feedback Switch */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Smooth Gestures & Haptics</h4>
                  <p className="text-[11px] text-zinc-400">Fluid tactile UI response</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSettings({ hapticFeedback: !settings.hapticFeedback })}
                className={cn(
                  "w-12 h-7 rounded-full p-0.5 transition-colors duration-200 relative select-none",
                  settings.hapticFeedback ? "bg-[#30D158]" : "bg-zinc-700"
                )}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={cn(
                    "w-6 h-6 rounded-full bg-white shadow-md",
                    settings.hapticFeedback ? "ml-auto" : "ml-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Default Quality */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Preferred Quality
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl p-1.5 flex gap-1.5">
            {[
              { id: "hd", label: "Full HD (1080p)" },
              { id: "sd", label: "Standard (720p)" },
              { id: "audio", label: "Audio (320kbps)" },
            ].map((q) => {
              const active = settings.defaultQuality === q.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => updateSettings({ defaultQuality: q.id as any })}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-xl relative transition-all duration-200 text-center",
                    active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="qualityPill"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-[#2c2c2e] rounded-xl shadow border border-white/10"
                    />
                  )}
                  <span className="relative z-10">{q.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Storage & Maintenance */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            Storage & Performance
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            {/* Storage path */}
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Default Path</h4>
                  <p className="text-[11px] text-zinc-400">/Documents/TokSave</p>
                </div>
              </div>
              <span className="text-xs text-zinc-500">Internal</span>
            </div>

            {/* Clear Temporary Cache */}
            <button
              type="button"
              onClick={handleClearCache}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Clear Temporary Cache</h4>
                  <p className="text-[11px] text-zinc-400">Free memory & thumbnail buffer</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </button>
          </div>
        </div>

        {/* Section 4: About & Version */}
        <div>
          <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2 block">
            About TokSave
          </span>
          <div className="bg-[#1c1c1e] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">TokSave AI Engine</h4>
                  <p className="text-[11px] text-zinc-400">Watermark remover & stream downloader</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#0A84FF]">v2.2.0</span>
            </div>

            <div className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Privacy Guarantee</h4>
                  <p className="text-[11px] text-zinc-400">No account required · Zero data tracking</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}
